"""구간 인덱스 참조 구현. DB 대신 dict를 사용하며 동시성/영속성은 포함하지 않는다.
원본 CRUD와 리프 집계는 호출자가 트랜잭션 안에서 수행한다.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class Stats:
    total: int = 0
    count: int = 0
    maximum: int | None = None

EMPTY = Stats()

def merge(a, b):
    maxima = [x for x in (a.maximum, b.maximum) if x is not None]
    return Stats(a.total + b.total, a.count + b.count,
                 max(maxima) if maxima else None)

class SparseRangeIndex:
    def __init__(self, height=32):
        self.height = height
        self.limit = 1 << height
        self.nodes = {}  # (level, slot) -> Stats. count=0인 노드는 저장하지 않는다.
        self.last_reads = set()
        self.last_writes = set()

    def cover(self, begin, end):
        if not 0 <= begin <= end <= self.limit:
            raise ValueError("range out of bounds")
        result = []
        while begin < end:
            remaining_power = (end - begin).bit_length() - 1
            aligned_power = self.height if begin == 0 else (begin & -begin).bit_length() - 1
            level = min(remaining_power, aligned_power)
            result.append((level, begin >> level))
            begin += 1 << level
        return result

    def query(self, begin, end):
        keys = self.cover(begin, end)
        self.last_reads = set(keys)
        result = EMPTY
        for key in keys:  # 실제 DB에서는 이 키 집합을 일괄 조회한다.
            result = merge(result, self.nodes.get(key, EMPTY))
        return result

    def replace_leaves(self, changes):
        # changes: {second_slot: 새 Stats}。시각 이동은 이전/새 리프를 함께 전달한다.
        if any(not 0 <= key < self.limit for key in changes):
            raise ValueError("slot out of bounds")
        dirty = {(level, key >> level)
                 for key in changes for level in range(self.height + 1)}
        children = {(level - 1, slot * 2 + side)
                    for level, slot in dirty if level > 0 for side in (0, 1)}
        read_keys = children - dirty  # 변경하지 않는 형제만 DB에서 읽는다.
        self.last_reads = read_keys
        states = {key: self.nodes.get(key, EMPTY) for key in read_keys}
        states.update({(0, key): value for key, value in changes.items()})
        for level, slot in sorted(dirty):
            if level:
                states[level, slot] = merge(states[level - 1, slot * 2],
                                            states[level - 1, slot * 2 + 1])
        self.last_writes = dirty
        for key in dirty:
            if states[key].count:
                self.nodes[key] = states[key]
            else:
                self.nodes.pop(key, None)
        # 실제 DB: 위 read_keys를 한 번에 SELECT하고,
        # dirty의 upsert/delete를 원본 변경과 같은 트랜잭션으로 커밋한다.
