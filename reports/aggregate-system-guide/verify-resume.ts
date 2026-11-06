import {bundleToIife,withRenderedPage,inspectPage,assertNoFontPollution,inspectEdgeGeometry,assertEdgeMarkersOriented} from '/Users/centurio/resume/scripts/render-core';
import {readFileSync,writeFileSync} from 'node:fs';
const dir=new URL('.',import.meta.url).pathname;
const js=await bundleToIife(`
import {createRoot} from 'react-dom/client';
import {VisualizationStyleGuideProvider} from '@centurio1987/bbangto-ui-visualization';
import {resumeVizStyleGuide} from '/Users/centurio/resume/design/style-guide/resume.viz';
import * as D from ${JSON.stringify(dir+'resume-diagrams.tsx')};
createRoot(document.getElementById('root')).render(<VisualizationStyleGuideProvider styleGuide={resumeVizStyleGuide} foundationKey="print">{Object.entries(D).map(([name,C])=><div key={name} data-diagram={name}><C/></div>)}</VisualizationStyleGuideProvider>);
`);
const report=await withRenderedPage({js,waitFor:'[data-diagram] svg',css:'[data-diagram]{width:640px}'},async page=>{
 assertNoFontPollution(await inspectPage(page));
 assertEdgeMarkersOriented(await inspectEdgeGeometry(page),'aggregate guide');
 const overflow=await page.evaluate(()=>[...document.querySelectorAll('svg text')].flatMap((t:any)=>{const b=t.getBBox(),v=t.ownerSVGElement.viewBox.baseVal; if(b.x<v.x-1||b.y<v.y-1||b.x+b.width>v.x+v.width+1||b.y+b.height>v.y+v.height+1)return [t.textContent];const group=t.parentElement;const rect=group.querySelector(':scope > rect:nth-of-type(2)');if(rect){const r=rect.getBBox();if(b.x<r.x-1||b.x+b.width>r.x+r.width+1||b.y<r.y-1||b.y+b.height>r.y+r.height+1)return [t.textContent];}return [];}));
 if(overflow.length)throw Error('Text overflow '+JSON.stringify(overflow));
 const pads=await page.locator('[data-rz-pad]').count();
 await page.setContent(readFileSync(dir+'index.html','utf8'),{waitUntil:'load'});
 await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode()));await document.fonts.ready;});
 const results=[];
 for(const width of [1280,390]){await page.setViewportSize({width,height:1000});const r=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,images:document.images.length,loaded:[...document.images].every(i=>i.naturalWidth>0),font:getComputedStyle(document.body).fontFamily}));if(r.overflow||!r.loaded)throw Error(JSON.stringify(r));results.push(r);await page.screenshot({path:dir+`resume-preview-${width}.png`,fullPage:false});}
 return {diagrams:13,svgTextOverflow:overflow,roleBoxes:pads,viewports:results};
});
writeFileSync(dir+'resume-verification.json',JSON.stringify(report,null,2));console.log(report);
