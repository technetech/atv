const fs=require('fs'),vm=require('vm'),assert=require('assert');
let frame,intersections,strokes=0,time=0;const timers=[];
const context2d=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})}, {get(o,k){if(k in o)return o[k];return(...args)=>{for(const a of args)if(typeof a==='number')assert(Number.isFinite(a),'Nonfinite canvas coordinate in '+k);if(k==='stroke')strokes++}},set(o,k,v){o[k]=v;return true}});
const nodes=new Map();function node(key){if(!nodes.has(key))nodes.set(key,{id:key.replace('#',''),style:{setProperty(){}},dataset:{},value:'0',hidden:false,disabled:false,textContent:'',innerHTML:'',tabIndex:0,offsetWidth:600,listeners:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getBoundingClientRect:()=>({width:680,height:500,left:0,top:0}),getContext:()=>context2d,addEventListener(event,fn){(this.listeners[event]??=[]).push(fn)},focus(){},scrollIntoView(){},showModal(){},close(){}});return nodes.get(key)}
const pauses=[0,1,2].map(i=>{const n=node('pause'+i);n.dataset.pause=String(i);return n});const agents=[0,1,2].map(i=>{let n=node('agent'+i);n.dataset.agent=String(i);return n});const channels=[0,1,2].map(i=>{let n=node('channel'+i);n.dataset.channel=String(i);return n});
const document={hidden:false,body:node('body'),querySelector:node,querySelectorAll(s){if(s==='[data-channel]')return channels;if(s==='[data-agent]')return agents;if(s==='[data-pause]')return pauses;return[]}};
const window=node('window');window.dispatchEvent=e=>(window.listeners[e.type]||[]).forEach(f=>f(e));
const box={document,window,matchMedia:()=>({matches:false}),devicePixelRatio:1,performance:{now:()=>time},Event:class{constructor(type){this.type=type}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},requestAnimationFrame(fn){frame=fn},ResizeObserver:class{constructor(fn){this.fn=fn}observe(){this.fn()}},IntersectionObserver:class{constructor(fn){intersections=fn}observe(target){this.target=target;intersections([{target,isIntersecting:true}])}},console};
vm.createContext(box);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),box);vm.runInContext(fs.readFileSync('dist/cinema.js','utf8'),box);
function click(n){for(const fn of n.listeners.click||[])fn({})}function tick(count=20){for(let i=0;i<count;i++){time+=16;frame(time)}}
for(let i=0;i<3;i++){click(channels[i]);tick();assert.equal(node('#channel-number').textContent,'CH 00'+(i+1));}
click(node('#send-signal'));assert(node('#send-signal').disabled);tick(80);timers.at(-1)();assert(!node('#send-signal').disabled);
node('#frequency').value='100';for(const fn of node('#frequency').listeners.input)fn();tick();assert.equal(node('#frequency-output').textContent,'100%');
click(agents[2]);assert.equal(node('#agent-role').textContent,'03 / COLLABORATING');
tick(2);click(node('#pause'));tick(2);const frozen=strokes;tick(3);assert.equal(strokes,frozen,'Global pause must freeze both renderers');click(node('#pause'));tick(2);assert(strokes>frozen,'Animation must resume');
click(channels[0]);
for(let i=1;i<=6;i++){click(node('#dial'));tick(2);assert.equal(node('#intermission').hidden,i%2===0);if(i%2)assert(node('#intermission-copy').textContent.length>10)}
click(pauses[1]);assert.equal(vm.runInContext('scenePaused[1]',box),true);assert.equal(vm.runInContext('scenePaused[0]',box),false);click(pauses[1]);
const html=fs.readFileSync('dist/index.html','utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]));assert(!html.includes('A different world.'));assert(!html.includes('class="scene-agent'));
assert.equal((html.match(/class="concept-row"/g)||[]).length,3);assert(!html.includes('role="tab"'));assert(!/[✳✦✧]/.test(html));assert(!html.includes('class="ticker"'));assert(!html.includes('class="under-tv"'));assert(!html.includes('Go To App <'));
console.log('PASS: all channel renderers, conceptual transitions, tuner, participation lifecycle, agent selection, finite geometry, and anchors. Rendered strokes: '+strokes);
