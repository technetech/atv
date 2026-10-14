const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let channel=0,paused=reduced,wavingUntil=0;
const canvas=document.querySelector('#world');
const names=['Tomorrow Works','Cosmic Kitchen','Little Planet'];
const types=["THE BUILDERS’ CHANNEL","EXPERIMENTAL DINING, EARTH OPTIONAL","SMALL CREATURES. BIG POSSIBILITIES."];
function draw(){window.dispatchEvent(new Event('tv-redraw'))}
let station=0;
const intermissions=['LESS SCROLLING. MORE WORLDS.','THE FUTURE HAS A CHANNEL.','PLEASE INTERACT WITH YOUR TELEVISION.'];
function tune(n){station=((n%6)+6)%6;channel=Math.floor(station/2);const isMessage=station%2===1;
 document.querySelector('#world-name').textContent=names[channel];document.querySelector('#world-type').textContent=types[channel];document.querySelector('#channel-number').textContent=isMessage?'ATV / ID':'CH 00'+(channel+1);
 canvas.setAttribute('aria-label',isMessage?'Black-and-white station intermission':('Animated concept preview of '+names[channel]));
 document.querySelectorAll('[data-channel]').forEach((b,i)=>{b.classList.toggle('active',i===channel&&!isMessage);b.setAttribute('aria-pressed',i===channel&&!isMessage)});
 document.querySelector('#dial').style.transform='rotate('+station*60+'deg)';document.querySelector('#intermission').hidden=!isMessage;document.querySelector('#intermission-copy').textContent=intermissions[channel];
 const screen=document.querySelector('.screen');screen.classList.toggle('is-intermission',isMessage);screen.classList.remove('tuning');void screen.offsetWidth;screen.classList.add('tuning');draw();
}
document.querySelectorAll('[data-channel]').forEach(b=>b.addEventListener('click',()=>tune(+b.dataset.channel*2)));
document.querySelector('#dial').addEventListener('click',()=>tune(station+1));
const pause=document.querySelector('#pause');function syncPause(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Play animation':'Pause animation');document.body.classList.toggle('paused',paused)}syncPause();pause.addEventListener('click',()=>{paused=!paused;syncPause()});
const dialog=document.querySelector('#app-dialog');document.querySelectorAll('[data-app]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());document.querySelector('#back-demo').addEventListener('click',()=>{dialog.close();document.querySelector('#broadcast').scrollIntoView({behavior:reduced?'instant':'smooth'})});dialog.addEventListener('click',e=>{if(e.target===dialog){let r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});tune(0);


// All three concepts remain visible in the document; controls enrich each scene.
const scenePaused=[reduced,reduced,reduced];
const agentNotes=[['01 / PLANNING','An intention becomes a plan. Watch an agent break a possibility into its next steps.'],['02 / EXPLORING','Agents explore possibilities, try different approaches, and discover what their environment allows.'],['03 / COLLABORATING','Individual actions become a shared effort. Agents exchange ideas and work toward something together.']];
function updateFrequency(){const value=Number(document.querySelector('#frequency').value);document.querySelector('#frequency-output').textContent=value+'%';document.querySelector('#frequency').setAttribute('aria-valuetext',value+' percent connected');document.querySelector('#scene-message-0').textContent=value<35?'Bring a new world into focus.':value<80?'There’s life on the other side.':'You found a connection.'}
document.querySelector('#frequency').addEventListener('input',updateFrequency);updateFrequency();
document.querySelectorAll('[data-agent]').forEach(b=>b.addEventListener('click',()=>{const note=agentNotes[Number(b.dataset.agent)];document.querySelectorAll('[data-agent]').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));document.querySelector('#agent-role').textContent=note[0];document.querySelector('#agent-detail').textContent=note[1]}));
document.querySelector('#send-signal').addEventListener('click',()=>{const b=document.querySelector('#send-signal');b.disabled=true;document.querySelector('#scene-message-2').textContent='Your spark reached the agents.';document.querySelector('#signal-hint').textContent='SIGNAL RECEIVED → EXPLORING TOGETHER';setTimeout(()=>{b.disabled=false;b.innerHTML='Send another spark <span>↗</span>';document.querySelector('#scene-message-2').textContent='A shared idea. And you started it.'},3000)});
document.querySelectorAll('[data-pause]').forEach(b=>{const i=Number(b.dataset.pause);function sync(){b.textContent=scenePaused[i]?'▶':'Ⅱ';b.setAttribute('aria-label',(scenePaused[i]?'Play ':'Pause ')+['frequency','collaboration','participation'][i]+' animation')}b.addEventListener('click',()=>{scenePaused[i]=!scenePaused[i];sync()});sync()});
