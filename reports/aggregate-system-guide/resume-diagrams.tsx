// @relation relate
// Architecture uses RoleBox semantics. Other exports: procedural or descriptive panels (exemptions 1/3).
import {Canvas,Edge} from '/Users/centurio/resume/node_modules/@centurio1987/bbangto-ui-visualization';
import {DiagramHeader,RoleBox,roleBoxHeight,Panel,Callout,Cell,Label} from '/Users/centurio/resume/diagrams/_frame';
import specs from './viz-specs.json';
const titles:Record<string,string>={architecture:'원본과 집계의 읽기 경로',write:'원본 기록에서 집계 확정까지',consistency:'즉시 일치와 지연 허용',range:'범위 전체 대신 요약 세 개',delete:'최대값 삭제 후 다시 계산',sparse:'빈 시간은 노드를 만들지 않는다',lookup:'질문마다 다른 주소로 접근',insert:'7초에 값 8을 삽입',move:'두 리프를 한 번에 이동',bulk:'물리 삭제와 논리 삭제의 차이',immutable:'확정된 과거와 변경 가능 구간',export:'고정 스냅샷에서 완료 파일까지',rollout:'병목을 확인하며 단계적으로 도입'};
function wrap(text:string,n=35){const words=text.split(' '),out:string[]=[];let line='';for(const w of words){if((line+' '+w).trim().length>n&&line){out.push(line);line=w;}else line=(line+' '+w).trim();}if(line)out.push(line);return out;}
export function Architecture(){
 const nodes=[
 {x:24,y:100,w:270,role:'container' as const,tag:'AGGREGATE API',name:'집계 요청',note:'범위·필터·반영 버전'},
 {x:346,y:100,w:270,role:'container' as const,tag:'RAW API',name:'원본 요청',note:'범위·필터·읽기 스냅샷'},
 {x:24,y:235,w:270,role:'database' as const,tag:'PROJECTION',name:'구간 집계 상태',note:'sum · count · max'},
 {x:346,y:235,w:270,role:'database' as const,tag:'SOURCE OF TRUTH',name:'원본 데이터',note:'일시·ID·전체 필드'},
 {x:24,y:390,w:270,role:'process' as const,tag:'MERGE',name:'겹치지 않는 구간 병합',note:'요약값 + 반영 시점 응답'},
 {x:346,y:390,w:270,role:'process' as const,tag:'READ',name:'커서로 전체 데이터 읽기',note:'페이지·스트림·완료 파일'},
 ];
 return <Canvas viewBox="0 0 640 585" accessible="img" title={titles.architecture} desc="집계는 투영 저장소를, 원본은 기준 저장소를 읽는다."><DiagramHeader eyebrow="01 / read architecture" title={titles.architecture}/>{nodes.map((n,i)=><RoleBox key={i} {...n}/>)}{[[0,2],[2,4],[1,3],[3,5]].map(([a,b],i)=><Edge key={i} from={{x:nodes[a].x+135,y:nodes[a].y+roleBoxHeight(nodes[a].role,nodes[a])}} to={{x:nodes[b].x+135,y:nodes[b].y}}/>)}<Callout x={24} y={493} width={592} tone="warn" label="기준 시점" lines={['원본과 집계는 한 트랜잭션에서 함께 갱신한다.','비동기화하면 반영 지연을 별도로 표시한다.']}/></Canvas>;
}
function Steps({id}:{id:string}){const data=(specs as any)[id].data.steps;const chunks=data.map((s:any)=>wrap(s.description));const heights=chunks.map((lines:string[])=>82+lines.length*20);let cursor=98;const ys=heights.map((h:number)=>{const y=cursor;cursor+=h+38;return y;});return <Canvas viewBox={`0 0 640 ${cursor}`} accessible="img" title={titles[id]} desc={(specs as any)[id].caption}><DiagramHeader eyebrow={`PROCESS / ${id}`} title={titles[id]}/>{data.map((s:any,i:number)=><Panel key={i} x={24} y={ys[i]} width={588} height={heights[i]} label={`STEP 0${i+1}`} title={s.title} lines={chunks[i]} tone={i===data.length-1?'solution':'neutral'}/>)}{ys.slice(0,-1).map((y:number,i:number)=><Edge key={i} from={{x:318,y:y+heights[i]+4}} to={{x:318,y:ys[i+1]}}/>)}</Canvas>}
function Compare({id}:{id:string}){const {left,right}=(specs as any)[id].data;const cards=[left,right];const lines=cards.map(c=>c.items.flatMap((s:string)=>wrap('• '+s,38)));return <Canvas viewBox="0 0 640 560" accessible="img" title={titles[id]} desc={(specs as any)[id].caption}><DiagramHeader eyebrow={`COMPARE / ${id}`} title={titles[id]}/>{cards.map((c,i)=><Panel key={i} x={24} y={98+i*220} width={588} height={190} label={i?'OPTION B':'OPTION A'} title={c.label} lines={lines[i]} lineGap={24} tone={i?'info':'solution'}/>)}</Canvas>}
export const Write=()=> <Steps id="write"/>;
export const Consistency=()=> <Compare id="consistency"/>;

export const Delete=()=> <Steps id="delete"/>;
export const Immutable=()=> <Compare id="immutable"/>;
export const Export=()=> <Steps id="export"/>;
export const Rollout=()=> <Steps id="rollout"/>;


export const Lookup=()=> <Steps id="lookup"/>;

export const Move=()=> <Compare id="move"/>;
export const Bulk=()=> <Compare id="bulk"/>;
// Layered interval grids: cells are coordinate intervals, not service roles (exemption 2).
export function Sparse(){
 const occupied=[1,3,10,14];
 return <Canvas viewBox="0 0 640 685" accessible="img" title="빈 구간은 저장하지 않는 14개 노드" desc="초기 데이터의 활성 리프 4개와 그 조상만 저장한다. 흐린 셀은 존재하지 않는 행이다."><DiagramHeader eyebrow="SPARSE / 4 LEAVES" title="31개 가능한 노드 중 14개만 저장"/>{[4,3,2,1,0].map((level,row)=>{const count=2**(4-level),span=16/count;return <g key={level}><Label x={24} y={103+row*83}>{`level ${level} · ${occupied.map(k=>Math.floor(k/span)).filter((v,i,a)=>a.indexOf(v)===i).length}개 저장`}</Label>{Array.from({length:count},(_,slot)=><Cell key={slot} x={24+slot*span*36} y={118+row*83} width={span*36} height={37} filled={occupied.some(k=>Math.floor(k/span)===slot)} tone="solution" label={level===0?String(slot):`[${slot*span},${(slot+1)*span})`}/>)}</g>})}<Callout x={24} y={550} width={588} tone="info" label="큰 도메인에도 같은 규칙" lines={['0~2^32초에서 멀리 떨어진 리프 2개: 저장 노드 65개.','빈 초 30억 개를 순회하거나 할당하지 않는다.','초록: 실제 저장 행 / 흐린 칸: 주소만 있고 행은 없음.']}/></Canvas>;
}
export function Range(){
 const selected=[[1,1],[2,1],[2,2]];
 return <Canvas viewBox="0 0 640 680" accessible="img" title="[2,12)을 세 구간으로 덮는다" desc="[2,4), [4,8), [8,12)을 합치고 범위 밖은 읽지 않는다."><DiagramHeader eyebrow="RANGE / CANONICAL COVER" title="[2,12)을 세 주소로 분해하기"/><Label x={24} y={102}>요청 범위 · 숫자는 초 슬롯</Label>{Array.from({length:16},(_,i)=><Cell key={i} x={24+i*36} y={119} width={36} height={37} filled={i>=2&&i<12} tone="warn" label={String(i)}/>)}{[2,1].map((level,row)=><g key={level}><Label x={24} y={203+row*98}>{`level ${level}에서 선택`}</Label>{Array.from({length:16/(2**level)},(_,slot)=><Cell key={slot} x={24+slot*(2**level)*36} y={222+row*98} width={(2**level)*36} height={40} filled={selected.some(([a,b])=>a===level&&b===slot)} tone="solution" label={`[${slot*2**level},${(slot+1)*2**level})`}/>)}</g>)}<Panel x={24} y={430} width={588} height={152} label="BATCH READ" title="세 키를 한 번에 조회한다" lines={['(1,1) → [2,4)   → 15 / 2 / 9','(2,1) → [4,8)   → 없음: 0 / 0 / null','(2,2) → [8,12) → 11 / 1 / 11']} tone="neutral"/><Label x={24} y={623} bold>병합 결과 26 / 3 / 11 · 겹침 없음 · 원본 payload 조회 없음</Label></Canvas>;
}
export function Insert(){
 const old=['(0,6) · 0 / 0 / null','(1,2) · 0 / 0 / null','(2,0) · 19 / 3 / 9','(3,1) · 16 / 2 / 11'];
 const updated=['(1,3) · 8 / 1 / 8','(2,1) · 8 / 1 / 8','(3,0) · 27 / 4 / 9','(4,0) · 43 / 6 / 11'];
 return <Canvas viewBox="0 0 640 735" accessible="img" title="형제 네 개로 삽입 경로 갱신" desc="7초 값8의 리프를 만들고 변경하지 않는 형제와 병합해 위로 올라간다."><DiagramHeader eyebrow="CREATE / BOTTOM-UP" title="형제는 읽고, 조상 경로만 쓴다"/><Callout x={24} y={91} width={588} label="새 리프 (0,7)" lines={['slot 7에 값 8 삽입 → 8 / 1 / 8']} tone="warn"/>{old.map((t,i)=><g key={i}><Panel x={24} y={205+i*122} width={236} height={80} label="READ SIBLING" title={t} tone="info"/><Panel x={350} y={205+i*122} width={262} height={80} label="WRITE PARENT" title={updated[i]} tone="solution"/><Edge from={{x:264,y:245+i*122}} to={{x:350,y:245+i*122}}/>{i<3&&<Edge from={{x:481,y:289+i*122}} to={{x:481,y:327+i*122}}/>}</g>)}<Label x={24} y={707}>파란 칸: 기존 요약 재사용 / 초록 칸: 새 상태 저장</Label></Canvas>;
}
