import random, json
from sparse_tree import SparseRangeIndex, Stats, EMPTY, merge
rng = random.Random(20260914)
tree=SparseRangeIndex(5)
raw={}
checks=0
for operation in range(180):
    changes={}
    for k in rng.sample(range(32),rng.choice([1,2])):
        if rng.random()<.25:
            raw.pop(k,None);changes[k]=EMPTY
        else:
            v=rng.randrange(-20,21);raw[k]=v;changes[k]=Stats(v,1,v)
    tree.replace_leaves(changes)
    for left in range(33):
        for right in range(left,33):
            values=[v for k,v in raw.items() if left<=k<right]
            expected=Stats(sum(values),len(values),max(values) if values else None)
            assert tree.query(left,right)==expected,(operation,left,right)
            checks+=1
wide=SparseRangeIndex(32)
wide.replace_leaves({3:Stats(9,1,9),3_000_000_000:Stats(11,1,11)})
allocated=len(wide.nodes)
wide.replace_leaves({3:Stats(2,1,2)})
assert len(wide.last_reads)==32 and len(wide.last_writes)==33
assert wide.query(0,1<<32)==Stats(13,2,11)
assert len(wide.last_reads)==1
assert len(wide.cover(1,(1<<32)-1))==62
# 다중 원본 리프와 시각 이동 예제
example=SparseRangeIndex(4)
example.replace_leaves({1:Stats(4,1,4),3:Stats(15,2,9),10:Stats(11,1,11),14:Stats(5,1,5)})
assert len(example.nodes)==14
assert example.query(2,12)==Stats(26,3,11)
example.replace_leaves({3:Stats(6,1,6),10:Stats(20,2,11)})
assert len(example.last_reads)==6 and len(example.last_writes)==9
assert example.query(2,12)==Stats(26,3,11)
report={'exhaustive_range_checks':checks,'seed':20260914,'wide_domain_slots':1<<32,'allocated_nodes_for_two_far_leaves':allocated,'point_update_sibling_reads':32,'point_update_node_writes':33,'whole_domain_summary_reads':1,'worst_example_cover_nodes':62,'status':'PASS'}
open('reports/aggregate-system-guide/algorithm-verification.json','w').write(json.dumps(report,indent=2))
print(json.dumps(report))
