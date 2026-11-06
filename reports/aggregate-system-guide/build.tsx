import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,writeFileSync} from 'node:fs';
import {Flowchart} from '@centurio1987/bbangto-ui-visualization';
import ProcessSteps from '../../src/lib/viz/ProcessSteps';
import Comparison from '../../src/lib/viz/Comparison';
import VizFigure from '../../src/components/viz/VizFigure';
import {parseVizSpec} from '../../src/lib/viz/schema';
import {defaultViewBox,a11yText,extraProps} from '../../src/lib/viz/layout';
const dir=new URL('.', import.meta.url).pathname;
const components:any={Flowchart,ProcessSteps,Comparison};
const specs:Record<string,any>={};
function process(id:string,caption:string,steps:string[][]){specs[id]={kind:'ProcessSteps',orientation:'vertical',viewBox:'0 0 480 520',caption,data:{steps:steps.map(([title,description])=>({title,description}))}};}
function compare(id:string,caption:string,left:any,right:any){specs[id]={kind:'Comparison',viewBox:'0 0 600 300',caption,data:{left,right}};}
function flow(id:string,caption:string,labels:string[],links:number[][]){specs[id]={kind:'Flowchart',viewBox:'0 0 600 440',caption,data:{nodes:labels.map((label,i)=>({id:String(i),label,x:i%2?330:30,y:25+Math.floor(i/2)*130,width:240,height:70,shape:'rounded'})),edges:links.map(([a,b],i)=>({id:String(i),from:String(a),to:String(b),routing:'straight'}))}};}
flow('architecture','실선은 요청의 진행 방향이다. 집계와 원본은 서로 다른 읽기 경로를 사용한다.',['집계 요청','원본 요청','집계 상태 병합','원본 범위 조회','요약값 응답','페이지·파일 응답'],[[0,2],[2,4],[1,3],[3,5]]);
process('write','원본과 outbox 기록은 하나의 트랜잭션이다. 집계 적용과 체크포인트도 함께 확정한다.',[
['원본 + outbox 커밋','변경 ID·이전값·새값·레코드 버전을 함께 남긴다.'],['변경 전달','재전달을 허용하되 같은 파티션의 순서를 보존한다.'],['집계 상태 반영','리프를 갱신하고 필요한 상위 구간만 재계산한다.'],['상태 + 체크포인트 커밋','실패하면 재시도한다. 중복 반영을 막는다.']]);
compare('consistency','일관성 요구가 배포 구조보다 먼저다.',{label:'즉시 일치',items:['원본·집계를 같은 트랜잭션에 반영','공통 노드 잠금과 충돌 재시도','완료 응답 뒤 최신 집계 조회']},{label:'지연 허용 · 기본안',items:['원본 커밋 뒤 비동기 집계','응답에 반영 체크포인트 표시','최신 원본과 같다고 보장하지 않음']});
process('range','예제: 분 단위 리프 8개에서 [1,7)을 조회한다. 구간끼리는 겹치지 않는다.',[
['범위를 고정','[1,7) · 시계열 A · 동일한 집계 버전'],['구간 분해','[1,2) + [2,4) + [4,6) + [6,7)'],['상태 일괄 읽기','합계 1, 13, 8, 5 · 개수 1, 2, 2, 1'],['상태 병합','sum 27 · count 6 · max 9']]);
process('delete','값 9를 삭제해도 max에서 9를 뺄 수 없다. 살아 있는 하위 상태를 다시 비교한다.',[
['원본 삭제 기록','키 3의 값 9를 삭제한다. 버전을 증가시킨다.'],['리프 재계산','단일 행이면 (0,0,없음). 여러 행이면 해당 버킷을 재집계한다.'],['조상 재계산','[2,4) → [0,4) → [0,8) 순서로 병합한다.'],['변경된 범위 조회','[1,7)의 sum 18 · count 5 · max 6']]);
compare('immutable','행이 불변이어도 늦은 입력이 있으면 과거 집계는 변한다.',{label:'확정된 과거',items:['누적합·누적 개수로 차분 조회','max는 블록별 계층 요약 유지','파일과 캐시를 버전별 재사용']},{label:'수정 가능한 구간',items:['리프와 영향받은 조상 갱신','정정·삭제·늦은 입력 모두 반영','오래된 구간도 새 버전으로 교체']});
process('export','페이지 크기와 전송 청크는 다르다. 느린 소비자의 속도를 DB 읽기까지 전달한다.',[
['스냅샷 확정','작업 ID와 읽기 기준을 생성한다.'],['커서로 배치 읽기','선택 필드만 읽고 결과 전체를 메모리에 쌓지 않는다.'],['직렬화 + 연속 압축','NDJSON 또는 파일 형식으로 인코딩한다.'],['완료 파일 공개','검증 후 ready 상태와 다운로드 위치를 공개한다.']]);
process('rollout','먼저 SQL 기준 결과를 만든다. 트리는 검증된 병목에 한해 도입한다.',[
['원본 조회 기준선','시간 인덱스와 실제 쿼리 계획을 측정한다.'],['버킷 집계 도입','읽은 행 수·쓰기 비용·정확성을 비교한다.'],['계층 요약 도입','긴 범위에서 버킷 스캔이 병목일 때 적용한다.'],['서버 분리','집계 병합·압축 CPU 또는 상주 메모리가 필요할 때 분리한다.']]);
let html=readFileSync(`${dir}/template.html`,'utf8');
for(const [id,raw] of Object.entries(specs)){
 const spec=parseVizSpec(raw);const Component=components[spec.kind];const {title,desc}=a11yText(spec);
 const svg=renderToStaticMarkup(<VizFigure frame="none" caption={spec.caption}><Component data={spec.data} viewBox={defaultViewBox(spec)} accessible="img" title={title} desc={desc} {...extraProps(spec)}/></VizFigure>);
 html=html.replace(`<!-- VIZ:${id} -->`,svg);
}
const tokens=readFileSync('src/styles/tokens.css','utf8');
const shim=readFileSync('src/styles/viz.css','utf8');
html=html.replace('/* PROJECT_VIZ_CSS */',tokens+'\n'+shim);
if(/<!-- VIZ:/.test(html))throw Error('Unrendered diagram');
writeFileSync(`${dir}/index.html`,html);
writeFileSync(`${dir}/viz-specs.json`,JSON.stringify(specs,null,2));
console.log(`Generated standalone HTML with ${Object.keys(specs).length} project-viz diagrams`);
