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


// Deterministic, viewport-clocked stories. Durations are in seconds.
function conceptCycle(mode,time){
 const duration=[10,12,8][mode],phase=time%duration;
 const ease=x=>x*x*(3-2*x);
 if(mode===0){const tuning=phase<1?0:phase<5?ease((phase-1)/4):phase<7.5?1:1-ease((phase-7.5)/2.5);return{duration,progress:phase/duration,tuning,label:tuning<.25?'SEARCHING':tuning<.95?'TUNING IN':'CONNECTED',message:tuning<.25?'A distant signal.':tuning<.95?'A world comes into focus.':'A connection. A new possibility.'}}
 if(mode===1){const mind=Math.floor(phase/4);return{duration,progress:phase/duration,mind,label:['PLANNING','EXPLORING','COLLABORATING'][mind],message:['An intention becomes a plan.','A new approach takes shape.','Individual ideas become a shared effort.'][mind]}}
 const age=phase-1.5;return{duration,progress:phase/duration,age,label:age<0?'A SPARK':age<.8?'SENDING':age<3?'RESPONDING':'A SHARED IDEA',message:age<0?'Every possibility starts somewhere.':age<.8?'One idea enters the world.':age<3?'The signal reaches the agents.':'A shared idea. And you started it.'};
}
