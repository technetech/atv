/* Procedural broadcast installation. No video loops or animation libraries. */
(() => {
  'use strict';
  const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
  const tv=document.querySelector('#world'), field=document.querySelector('#signal-canvas');
  const tc=tv.getContext('2d'), fc=field.getContext('2d');
  const hero=document.querySelector('.hero'), shell=document.querySelector('.television');
  const scene=document.querySelector('.signal-scene');
  const pointer={x:0,y:0,tx:0,ty:0}, fieldPointer={x:0,y:0,tx:0,ty:0};
  let nowTime=0,fieldTime=0,last=0,tvVisible=true,fieldVisible=false,burst=-20,selectedMind=0;
  let width=760,height=410,fw=680,fh=500,dirty=true;
  let seed=294;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
  const dust=Array.from({length:120},()=>({x:random()*2-1,y:random()*2-1,z:random(),r:random()}));
  const particles=Array.from({length:780},(_,i)=>({i,u:random(),v:random(),w:random(),x:0,y:0,z:0}));
  function size(canvas,context,w,h){const d=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);context.setTransform(d,0,0,d,0,0)}
  function resize(){const tr=tv.getBoundingClientRect(),fr=field.getBoundingClientRect();width=Math.max(1,tr.width);height=Math.max(1,tr.height);fw=Math.max(1,fr.width);fh=Math.max(1,fr.height);size(tv,tc,width,height);size(field,fc,fw,fh);dirty=true}
  new ResizeObserver(resize).observe(tv);new ResizeObserver(resize).observe(field);resize();
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.target===tv)tvVisible=e.isIntersecting;else fieldVisible=e.isIntersecting});dirty=true},{rootMargin:'100px'});observer.observe(tv);observer.observe(field);
  function track(el,state,e){const r=el.getBoundingClientRect();state.tx=clamp((e.clientX-r.left)/r.width*2-1,-1,1);state.ty=clamp((e.clientY-r.top)/r.height*2-1,-1,1);dirty=true}
  hero.addEventListener('pointermove',e=>{if(!reduced)track(hero,pointer,e)});hero.addEventListener('pointerleave',()=>{pointer.tx=0;pointer.ty=0;dirty=true});
  scene.addEventListener('pointermove',e=>{if(!reduced)track(scene,fieldPointer,e)});scene.addEventListener('pointerleave',()=>{fieldPointer.tx=fieldPointer.ty=0;dirty=true});
  window.addEventListener('tv-redraw',()=>dirty=true);
  document.querySelector('#frequency').addEventListener('input',()=>dirty=true);
  document.querySelectorAll('.experience-tabs button,#next-experience,#scene-pause').forEach(b=>b.addEventListener('click',()=>dirty=true));
  document.querySelectorAll('[data-agent]').forEach(b=>b.addEventListener('click',()=>{selectedMind=Number(b.dataset.agent);dirty=true}));
  document.querySelector('#send-signal').addEventListener('click',()=>{burst=fieldTime;dirty=true});
  document.querySelector('#wave').addEventListener('click',()=>dirty=true);
  function projection(x,y,z,turn,tilt,scale,cx,cy){const co=Math.cos(turn),si=Math.sin(turn),ct=Math.cos(tilt),st=Math.sin(tilt);const rx=x*co-z*si,rz=x*si+z*co,ry=y*ct-rz*st,d=rz*ct+y*st;const depth=650/(650+d);return{x:cx+rx*depth*scale,y:cy+ry*depth*scale,z:d,k:depth}}
  function path(c,pts,color,lineWidth=1,close=false){if(pts.length<2)return;c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)c.lineTo(pts[i].x,pts[i].y);if(close)c.closePath();c.strokeStyle=color;c.lineWidth=lineWidth;c.stroke()}
  function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
  function dot(c,p,r,color){c.fillStyle=color;c.beginPath();c.arc(p.x,p.y,Math.max(.1,r),0,TAU);c.fill()}
  function tvFrame(){
    tc.fillStyle='#030b09';tc.fillRect(0,0,width,height);
    const s=Math.min(width/660,height/340), cx=width*.51,cy=height*.57;
    const turn=nowTime*.085+pointer.x*.23,tilt=.38+pointer.y*.12;
    const P=(x,y,z)=>projection(x,y,z,turn,tilt,s,cx,cy);
    glow(tc,cx,cy,height*.75,'#294c354d');glow(tc,width*.8,height*.15,height*.48,'#9a57271c');
    dust.forEach(d=>{const p=P(d.x*440,d.y*260,(d.z*750+nowTime*7)%750-350);dot(tc,p,.4+d.r*.5,'#a7c29355')});
    // Architectural ground planes and orbital paths use the same camera.
    for(let ring=1;ring<7;ring++){const pts=[];for(let j=0;j<=100;j++){const a=j/100*TAU;pts.push(P(Math.cos(a)*ring*43,62,Math.sin(a)*ring*43))}path(tc,pts,ring===6?'#8aac7066':'#56704333',.65)}
    for(let k=0;k<16;k++){const a=k/16*TAU;path(tc,[P(30*Math.cos(a),62,30*Math.sin(a)),P(260*Math.cos(a),62,260*Math.sin(a))],'#7a965333',.6)}
    if(channel===0){
      const faces=[];
      for(let n=0;n<30;n++){
        const a=n*2.39996,rad=50+Math.sqrt(n)*30,x=Math.cos(a)*rad,z=Math.sin(a)*rad;
        const cycle=(nowTime*.11+n*.13)%5,build=clamp(cycle/.9,0,1);const h=(30+((n*71)%135))*build;
        const r=10+(n%3)*4;const v=[P(x-r,60,z-r),P(x+r,60,z-r),P(x+r,60,z+r),P(x-r,60,z+r),P(x-r,60-h,z-r),P(x+r,60-h,z-r),P(x+r,60-h,z+r),P(x-r,60-h,z+r)];
        [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((inds,j)=>{const pts=inds.map(i=>v[i]);faces.push({pts,z:pts.reduce((sum,p)=>sum+p.z,0)/4,top:j===4,n})});
        for(let f=1;f<Math.floor(h/16);f++){const yy=60-f*16;path(tc,[P(x-r,yy,z-r),P(x+r,yy,z-r),P(x+r,yy,z+r)],'#b5d29544',.5)}
      }
      faces.sort((a,b)=>b.z-a.z).forEach(face=>{const pts=face.pts;tc.beginPath();tc.moveTo(pts[0].x,pts[0].y);pts.slice(1).forEach(p=>tc.lineTo(p.x,p.y));tc.closePath();tc.fillStyle=face.top?'#647952':'#18271ddd';tc.fill();tc.strokeStyle=face.top?'#d5deaa88':'#88a56a77';tc.lineWidth=.6;tc.stroke()});
      // Agents are moving packets, following distinct arcs through the city.
      for(let a=0;a<7;a++){let pts=[];for(let j=0;j<24;j++){const angle=nowTime*(.25+a*.015)+a*.9-j*.018;pts.push(P(Math.cos(angle)*(105+a*17),-30-a*12+Math.sin(angle*2)*15,Math.sin(angle)*(105+a*17)))}path(tc,pts,a%2?'#cc723a99':'#b6d98ba0',1);dot(tc,pts[0],2.2,'#e7f2c7');glow(tc,pts[0].x,pts[0].y,13,'#c2e79533')}
    }else{
      // Coherent wire surfaces: a folded torus and a living spherical lattice.
      for(let band=0;band<28;band++){
        const pts=[];for(let j=0;j<=95;j++){let a=j/95*TAU,b=band/28*TAU;let x,y,z;
          if(channel===1){const radius=115+35*Math.cos(b+nowTime*.25);x=radius*Math.cos(a);z=radius*Math.sin(a);y=35*Math.sin(b+nowTime*.25)+45*Math.sin(a*3+nowTime*.5)-30}
          else{const phi=(band+.5)/28*Math.PI;const r=145+10*Math.sin(a*5+nowTime+phi*4);x=r*Math.sin(phi)*Math.cos(a);z=r*Math.sin(phi)*Math.sin(a);y=r*Math.cos(phi)-45}
          pts.push(P(x,y,z))}
        path(tc,pts,band%4===0?'#c3dda899':'#68915f44',band%4===0?1:.6);
        const packet=pts[Math.floor((nowTime*12+band*7)%95)];dot(tc,packet,band%3===0?2:1,band%3===0?'#e59a5c':'#c9e8a5');
      }
    }
    if(performance.now()<wavingUntil){const phase=1-(wavingUntil-performance.now())/4500;for(let k=0;k<3;k++){const r=((phase*3+k/3)%1)*310;const pts=[];for(let i=0;i<=90;i++)pts.push(P(Math.cos(i/90*TAU)*r,30,Math.sin(i/90*TAU)*r));path(tc,pts,'#eeb87988',1.5)}}
    // Optical CRT sweep, deliberately low contrast.
    const sweep=(nowTime*19)%height;const gradient=tc.createLinearGradient(0,sweep-30,0,sweep+30);gradient.addColorStop(0,'transparent');gradient.addColorStop(.5,'#d9efb509');gradient.addColorStop(1,'transparent');tc.fillStyle=gradient;tc.fillRect(0,sweep-30,width,60);
  }
  function fieldFrame(){
    fc.fillStyle='#060c09';fc.fillRect(0,0,fw,fh);
    const s=Math.min(fw/580,fh/460),cx=fw*.5,cy=fh*.44;
    const tuning=Number(document.querySelector('#frequency').value)/100;
    const energy=clamp(1-(fieldTime-burst)/3,0,1);
    const turn=fieldTime*.09+fieldPointer.x*.32,tilt=.22+fieldPointer.y*.17;
    const P=(x,y,z)=>projection(x,y,z,turn,tilt,s,cx,cy);
    glow(fc,cx,cy,Math.max(fw,fh)*.43,'#46723a26');
    const positions=[];
    for(const p of particles){
      const phi=Math.acos(1-2*(p.i+.5)/particles.length),a=p.i*2.399963;
      let x,y,z;
      if(experienceMode===0){
        // A disordered spectrum resolves into an inhabited globe as the tuner locks.
        const radius=155+Math.sin(phi*9+fieldTime*.5)*4;
        const scattered=1-tuning;
        x=lerp(Math.sin(p.u*TAU+fieldTime*.07)*260,radius*Math.sin(phi)*Math.cos(a),tuning);
        y=lerp((p.v-.5)*340,radius*Math.cos(phi),tuning);
        z=lerp((p.w-.5)*420,radius*Math.sin(phi)*Math.sin(a),tuning);
        x+=Math.sin(fieldTime*2+p.i)*scattered*5;
      }else if(experienceMode===1){
        // Three minds are independent attractors with visible streams between them.
        const group=p.i%3,ga=group/3*TAU-Math.PI/2;
        const orbit=fieldTime*(.3+group*.07)+a;
        const ring=38+22*Math.sin(phi);
        x=Math.cos(ga)*125+Math.cos(orbit)*ring*Math.sin(phi);
        y=Math.sin(ga)*108+Math.cos(phi)*ring;
        z=Math.sin(orbit)*ring*Math.sin(phi);
      }else{
        // A user impulse spreads across a three-dimensional interference surface.
        const ring=Math.sqrt(p.u)*195,angle=p.v*TAU;
        const wave=Math.sin(ring*.055-fieldTime*2)*13;
        const impulse=Math.sin(ring*.045-(fieldTime-burst)*5)*energy*65;
        x=Math.cos(angle)*ring;y=wave+impulse-10;z=Math.sin(angle)*ring;
        y+=Math.sin(angle*3+fieldTime*.4)*22;
      }
      // Damped interpolation gives continuity when changing concepts.
      const speed=reduced||scenePaused?1:.065;p.x=lerp(p.x,x,speed);p.y=lerp(p.y,y,speed);p.z=lerp(p.z,z,speed);
      const projected=P(p.x,p.y,p.z);positions.push({...projected,i:p.i,group:p.i%3});
    }
    // Sparse topology keeps the underlying geometry readable.
    for(let i=0;i<positions.length;i+=2){const a=positions[i],b=positions[(i+(experienceMode===1?3:21))%positions.length];const distance=Math.hypot(a.x-b.x,a.y-b.y);if(distance<65*s&&distance>5){const alpha=(1-distance/(65*s))*(experienceMode===0?.13:.2);path(fc,[a,b],`rgba(158,195,124,${alpha})`,.6)}}
    positions.sort((a,b)=>b.z-a.z).forEach(p=>{const selected=experienceMode===1&&p.group===selectedMind;const alpha=clamp((p.k-.45)*.7,.12,.85);dot(fc,p,(p.i%17===0?1.7:.7)*p.k,selected?`rgba(240,162,91,${alpha})`:`rgba(193,221,161,${alpha})`)});
    if(experienceMode===1){
      for(let g=0;g<3;g++){const a=g/3*TAU-Math.PI/2,b=(g+1)/3*TAU-Math.PI/2,pts=[];
        for(let j=0;j<=55;j++){const u=j/55;pts.push(P(lerp(Math.cos(a)*125,Math.cos(b)*125,u),lerp(Math.sin(a)*108,Math.sin(b)*108,u)-Math.sin(u*Math.PI)*30,Math.sin(u*Math.PI)*50))}path(fc,pts,'#829a6233',.8);
        const t=(fieldTime*.3+g/3)%1;const at=pts[Math.floor(t*55)];dot(fc,at,2.5,'#f1b77c');glow(fc,at.x,at.y,16,'#ffac642b');
      }
    }
    if(experienceMode===2){
      // A physical connection between the visitor and the signal field.
      const you={x:cx,y:fh*.79};const target=P(0,0,0);path(fc,[you,{x:cx-35*s,y:fh*.68},target],'#b7d18e66',1);
      const t=(fieldTime-burst)/.8;if(t>=0&&t<1){dot(fc,{x:lerp(you.x,target.x,t),y:lerp(you.y,target.y,t)},4,'#ffb86c')}
      fc.strokeStyle='#b6c89155';fc.lineWidth=1;fc.beginPath();fc.arc(you.x,you.y,18,0,TAU);fc.stroke();fc.font='8px monospace';fc.fillStyle='#d9e4bd';fc.textAlign='center';fc.fillText('YOU',you.x,you.y+3);
      if(energy>0){const r=(1-energy)*235;const pts=[];for(let i=0;i<=100;i++)pts.push(P(Math.cos(i/100*TAU)*r,0,Math.sin(i/100*TAU)*r));path(fc,pts,`rgba(246,170,96,${energy})`,2);glow(fc,cx,cy,100,`rgba(224,137,63,${energy*.13})`)}
    }
    // Instrument ticks frame the installation without floating ornaments.
    fc.strokeStyle='#71845a44';fc.lineWidth=1;for(let i=0;i<17;i++){let y=70+i*(fh-140)/16;fc.beginPath();fc.moveTo(9,y);fc.lineTo(i%4===0?17:12,y);fc.stroke();fc.beginPath();fc.moveTo(fw-9,y);fc.lineTo(fw-(i%4===0?17:12),y);fc.stroke()}
  }
  function animate(ms){
    const delta=Math.min((ms-last)/1000,.045);last=ms;
    if(document.hidden){requestAnimationFrame(animate);return}
    pointer.x=lerp(pointer.x,pointer.tx,.04);pointer.y=lerp(pointer.y,pointer.ty,.04);fieldPointer.x=lerp(fieldPointer.x,fieldPointer.tx,.05);fieldPointer.y=lerp(fieldPointer.y,fieldPointer.ty,.05);
    if(!paused)nowTime+=delta;if(!scenePaused&&!paused)fieldTime+=delta;
    if(tvVisible&&(!paused||dirty))tvFrame();if(fieldVisible&&((!scenePaused&&!paused)||dirty))fieldFrame();
    if(!reduced&&!paused&&tvVisible){shell.style.transform=`rotate(${-3+pointer.x*.8}deg) rotateY(${-5+pointer.x*5}deg) rotateX(${-pointer.y*3}deg)`}
    dirty=false;requestAnimationFrame(animate);
  }
  tvFrame();fieldFrame();requestAnimationFrame(animate);
})();
