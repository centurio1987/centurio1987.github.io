import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {inlineFontCss} from '/Users/centurio/resume/scripts/render-core';
import * as T from '/Users/centurio/resume/design/style-guide/tokens';
const dir=new URL('.',import.meta.url).pathname;
const names={architecture:'Architecture',write:'Write',consistency:'Consistency',range:'Range',delete:'Delete',immutable:'Immutable',export:'Export',rollout:'Rollout',sparse:'Sparse',lookup:'Lookup',insert:'Insert',move:'Move',bulk:'Bulk'};
const specs=JSON.parse(readFileSync(dir+'viz-specs.json','utf8'));
const shell=readFileSync(dir+'template.html','utf8').split('<header>')[0];
let html=shell+readFileSync(dir+'article-body.html','utf8')+'</main></body></html>';
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
html=html.replace('<!-- CODE:SPARSE -->','<pre><code>'+esc(readFileSync(dir+'sparse_tree.py','utf8'))+'</code></pre>');
for(const [id,name] of Object.entries(names)){
 if(!process.argv.includes('--reuse')) execFileSync('bun',['/Users/centurio/resume/scripts/render-viz.ts','--module',dir+'resume-diagrams.tsx','--name',name,'--preset','print','--out',dir+`resume-${id}.png`,'--width','960'],{cwd:'/Users/centurio/resume',stdio:'inherit'});
 const b64=readFileSync(dir+`resume-${id}.png`).toString('base64');
 const caption=specs[id].caption;
 html=html.replace(`<!-- VIZ:${id} -->`,`<figure class="resume-viz"><img src="data:image/png;base64,${b64}" alt="${caption}" width="1920" loading="lazy"><figcaption>${caption}</figcaption></figure>`);
}
html=html.replace('/* PROJECT_VIZ_CSS */',await inlineFontCss());
const palette:Record<string,string>={'#F3EEE4':T.CANVAS,'#20264A':T.INK,'#3E6B6B':T.BLUE_DEEP,'#cbc4b6':T.KHAKI_LINE,'#38558b':T.BLUE_DEEP,'#D8A33F':T.YELLOW,'#F8F3E8':T.SURFACE,'#e9e3d7':T.SURFACE_DEEP};
for(const [old,color]of Object.entries(palette))html=html.replaceAll(old,color);
html=html.replaceAll('system-ui,sans-serif',T.FONT_SANS).replaceAll('ui-monospace,monospace',T.FONT_MONO).replaceAll('border-radius:8px','border-radius:0');
html=html.replace('</style>',`.resume-viz{max-width:736px;margin:28px auto}.resume-viz img{display:block;width:100%;height:auto}.resume-viz figcaption{font-size:14px;line-height:1.6;color:${T.INK_MUTED};margin-top:12px}.note{border:2px solid ${T.INK};box-shadow:4px 4px 0 ${T.INK}}header .eyebrow{font-family:${T.FONT_MONO}}@media(max-width:600px){.resume-viz{overflow-x:auto}.resume-viz img{min-width:560px}.resume-viz figcaption{min-width:0}}\n</style>`);
html=html.replace('도식 8개는 프로젝트의 bbangto-ui viz 컴포넌트와 블로그 스타일 가이드로 생성했다. HTML에 도식과 스타일을 포함해 외부 스크립트 없이 읽을 수 있다.','도식 8개는 ~/resume의 RoleBox·Panel·Canvas와 resume-cream-ink-viz-01 스타일 가이드를 사용하고, scripts/render-viz.ts로 실제 브라우저에서 렌더했다. IBM Plex 서체·이미지·스타일을 HTML에 포함해 오프라인에서도 읽을 수 있다. 모바일에서 넓은 도식은 가로로 이동해 읽는다.');
if(/<!-- (VIZ|CODE):/.test(html)) throw Error('Unresolved placeholder');
writeFileSync(dir+'index.html',html);
console.log('Resume viz guide generated: '+dir+'index.html');
