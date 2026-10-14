const fs=require('fs'),vm=require('vm'),assert=require('assert');
let frame,intersections,strokes=0,time=0;const timers=[];
const context2d=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})}, {get(o,k){if(k in o)return o[k];return(...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'Nonfinite canvas coordinate in '+k);if(k==='stroke')strokes++}},set(o,k,v){o[k]=v;return true}});
const nodes=new Map();function node(key){if(!nodes.has(key))nodes.set(key,{id:key.replace('#',''),style:{setProperty(){}},dataset:{},value:'0',hidden:false,disabled:false,textContent:'',innerHTML:'',tabIndex:0,offsetWidth:600,listeners:{},classList:{add(){},remove(){},toggle(){}},querySelector(s){return node(key+' '+s)},setAttribute(){},getBoundingClientRect:()=>({width:680,height:500,left:0,top:0}),getContext:()=>context2d,addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)},focus(){},scrollIntoView(){},showModal(){},close(){}});return nodes.get(key)}
const pauses=[0,1,2].map(i=>{const n=node('pause'+i);n.dataset.pause=String(i);return n});const agents=[0,1,2].map(i=>{let n=node('agent'+i);n.dataset.agent=String(i);return n});const channels=[0,1,2].map(i=>{let n=node('channel'+i);n.dataset.channel=String(i);return n});
const document={hidden:false,body:node('body'),querySelector:node,querySelectorAll(s){if(s==='[data-channel]')return channels;if(s==='[data-agent]')return agents;if(s==='[data-pause]')return pauses;return[]}};
const window=node('window');window.dispatchEvent=e=>(window.listeners[e.type]||[]).forEach(f=>f(e));
const box={document,window,matchMedia:()=>({matches:false}),devicePixelRatio:1,performance:{now:()=>time},Event:class{constructor(type){this.type=type}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},requestAnimationFrame(fn){frame=fn},ResizeObserver:class{constructor(fn){this.fn=fn}observe(){this.fn()}},IntersectionObserver:class{constructor(fn){intersections=fn}observe(target){this.target=target;intersections([{target,isIntersecting:true}])}},console};
vm.createContext(box);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),box);vm.runInContext(fs.readFileSync('dist/cinema.js','utf8'),box);
function click(n){for(const fn of n.listeners.click||[])fn({})}function tick(count=20){for(let i=0;i<count;i++){time+=16;frame(time)}}
for(let i=0;i<3;i++){click(channels[i]);tick();assert.equal(node('#channel-number').textContent,'CH 00'+(i+1));}
for(let mode=0;mode<3;mode++){
 const duration=[10,12,8][mode];
 for(const t of [0,2,4,6]){const a=vm.runInContext('conceptCycle('+mode+','+t+')',box),b=vm.runInContext('conceptCycle('+mode+','+(t+duration)+')',box);assert.equal(JSON.stringify(a),JSON.stringify(b),'Cycle must repeat exactly')}
}
assert.equal(vm.runInContext('conceptCycle(0,0).tuning',box),0);assert.equal(vm.runInContext('conceptCycle(0,6).tuning',box),1);
assert.equal(vm.runInContext('conceptCycle(1,0).mind',box),0);assert.equal(vm.runInContext('conceptCycle(1,4).mind',box),1);assert.equal(vm.runInContext('conceptCycle(1,8).mind',box),2);
assert(vm.runInContext('conceptCycle(2,1).age',box)<0);assert(vm.runInContext('conceptCycle(2,2).age',box)>0);
document.hidden=true;const frozen=strokes;tick(3);assert.equal(strokes,frozen);document.hidden=false;tick(2);assert(strokes>frozen);
click(channels[0]);
for(let i=1;i<=6;i++){click(node('#dial'));tick(2);assert.equal(node('#intermission').hidden,i%2===0);if(i%2)assert(node('#intermission-copy').textContent.length>10)}
const html=fs.readFileSync('dist/index.html','utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]));assert(!html.includes('A different world.'));assert(!html.includes('class="scene-agent'));
assert.equal((html.match(/class="concept-row"/g)||[]).length,3);assert(!html.includes('role="tab"'));assert(!/[✳✦✧]/.test(html));assert(!html.includes('class="ticker"'));assert(!html.includes('class="under-tv"'));assert(!html.includes('Go To App <'));
assert(!html.includes('data-pause='));assert(!html.includes('id="send-signal"'));assert(!html.includes('type="range"'));
console.log('PASS: all channel renderers, automatic cycle timing and repetition, visibility suspension, finite geometry, and anchors. Rendered strokes: '+strokes);
