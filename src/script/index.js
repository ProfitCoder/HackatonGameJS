/* Code Runner: un único bucle, coordenadas en píxeles y tiempos en segundos. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const arena = $('arena'), player = $('player'), layer = $('entities'), effects = $('effects');
 const keys = new Set();
 let state = 'ready', score = 0, lives = 3, level = 1, elapsed = 0, combo = 0;
 let x = 0, y = 0, width = 0, height = 0, spawnTimer = .6, rewardTimer = 1.5, shieldTimer = 10;
 let immune = 0, shield = false, entities = [], lastTime = 0, pointer = null, record = 0, sound = false, audio;
 try { record = Math.max(0, Number(localStorage.getItem('codeRunnerRecord')) || 0); } catch (_) { /* El almacenamiento puede estar bloqueado. */ }
 const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
 function resize() { width = arena.clientWidth; height = arena.clientHeight; y = height - 65; x = clamp(x, 5, width - 47); renderPlayer(); }
 function renderPlayer() { player.style.transform = `translate(${x}px,${y}px)`; player.classList.toggle('invulnerable', immune > 0); player.classList.toggle('shielded', shield); }
 function hud() { $('score').textContent = String(score).padStart(5,'0'); $('record').textContent = String(Math.max(record,score)).padStart(5,'0'); $('lives').textContent = '♥ '.repeat(lives) + '♡ '.repeat(3-lives); $('lives').setAttribute('aria-label',`${lives} vidas`); $('level').textContent = String(level).padStart(2,'0'); }
 function announce(message) { $('live').textContent = message; }
 function tone(freq,duration=.08) { if(!sound) return; try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); const o=audio.createOscillator(),g=audio.createGain(); o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.start();o.stop(audio.currentTime+duration); } catch (_) {} }
 function burst(px,py,color,label) { for(let i=0;i<9;i++){const el=document.createElement('i');el.className='particle';el.style.cssText=`left:${px+16}px;top:${py+16}px;background:${color};--dx:${(Math.random()-.5)*110}px;--dy:${(Math.random()-.5)*110}px`;effects.append(el);el.addEventListener('animationend',()=>el.remove(),{once:true});} if(label){const el=document.createElement('span');el.className='float';el.textContent=label;el.style.left=clamp(px,4,width-100)+'px';el.style.top=py+'px';effects.append(el);el.addEventListener('animationend',()=>el.remove(),{once:true});} }
 function spawn(type) { const el=document.createElement('div');el.className=`entity ${type}`;el.textContent=type==='bug'?'×':type==='code'?'</>':'◇';layer.append(el);const e={type,x:10+Math.random()*Math.max(0,width-52),y:-38,speed:(type==='bug'?120:105)+Math.min(150,(level-1)*15),el};entities.push(e); }
 function addScore(amount) { score+=amount;hud(); }
 function saveRecord() { if(score>record){record=score;try{localStorage.setItem('codeRunnerRecord',String(record));}catch(_){}} }
 function overlay(title,message,button,badge) { $('title').textContent=title;$('message').textContent=message;$('start').textContent=button;$('badge').textContent=badge;$('overlay').hidden=false;$('start').focus(); }
 function finish() { state='over';const best=score>record;saveRecord();keys.clear();pointer=null;$('pause').disabled=true;$('status').textContent='CONEXIÓN FINALIZADA';$('summary').hidden=false;$('summary').textContent=`${score} PTS · ${Math.floor(elapsed)} s · NIVEL ${level}`;overlay('Game Over',best?'¡Nuevo récord! Tu próximo deploy puede llegar todavía más lejos.':'Te has quedado sin vidas. Respira, aprende el patrón y vuelve a intentarlo.','Volver a jugar →',best?'NUEVO RÉCORD LOCAL':'DEPLOY INTERRUMPIDO');$('hint').textContent='Enter para reiniciar · Tu récord se conserva';announce(`Game Over. ${score} puntos.`);tone(100,.3);hud(); }
 function start() { state='playing';score=0;lives=3;level=1;elapsed=0;combo=0;immune=0;shield=false;spawnTimer=.6;rewardTimer=1.5;shieldTimer=10;entities=[];layer.replaceChildren();effects.replaceChildren();keys.clear();pointer=null;resize();x=(width-42)/2;renderPlayer();$('overlay').hidden=true;$('summary').hidden=true;$('pause').disabled=false;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pausar partida');$('status').textContent='DEPLOY EN CURSO';$('tip').textContent='Cada bug esquivado cuenta. Cada fragmento te acerca al récord.';arena.focus();hud();announce('Partida iniciada. Tienes 3 vidas.');tone(540); }
 function pause() { if(state==='playing'){state='paused';keys.clear();pointer=null;overlay('Pausa','Tu deploy puede esperar. Recupera el ritmo cuando quieras.','Continuar →','TÓMATE UN RESPIRO');$('summary').hidden=true;$('hint').textContent='P o Escape para continuar';$('pause').textContent='▶';$('pause').setAttribute('aria-label','Continuar partida');$('status').textContent='SISTEMA EN PAUSA';}else if(state==='paused'){state='playing';$('overlay').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pausar partida');$('status').textContent='DEPLOY EN CURSO';arena.focus();} }
 function update(dt) {
  elapsed+=dt; const next=1+Math.floor(elapsed/15);if(next!==level){level=next;announce(`Nivel ${level}`);$('tip').textContent=`Nivel ${level}: los bugs caen más rápido. ¡Mantén la concentración!`;hud();}
  immune=Math.max(0,immune-dt);
  let direction=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0);
  if(pointer!==null)x+=clamp(pointer-21-x,-420*dt,420*dt);else x+=direction*360*dt;
  x=clamp(x,5,width-47);renderPlayer();
  spawnTimer-=dt;rewardTimer-=dt;shieldTimer-=dt;
  if(spawnTimer<=0){spawn('bug');spawnTimer=Math.max(.32,1.05-(level-1)*.075);}
  if(rewardTimer<=0){spawn('code');rewardTimer=1.8+Math.random()*.9;}
  if(shieldTimer<=0){spawn('shield');shieldTimer=14+Math.random()*5;}
  for(let i=entities.length-1;i>=0;i--){const e=entities[i];e.y+=e.speed*dt;e.el.style.transform=`translate(${e.x}px,${e.y}px)`;
   const hit=x+6<e.x+28 && x+36>e.x+4 && y+5<e.y+28 && y+37>e.y+4;
   let remove=false;
   if(hit){remove=true;if(e.type==='code'){combo=Math.min(5,combo+1);const points=50*combo;addScore(points);burst(e.x,e.y,'#9dffbe',`+${points}${combo>1?' ×'+combo:''}`);tone(600+combo*90);}
    else if(e.type==='shield'){shield=true;burst(e.x,e.y,'#8fceff','ESCUDO');tone(850);announce('Escudo activado');}
    else if(immune<=0){if(shield){shield=false;immune=.8;burst(x,y,'#8fceff','BLOQUEADO');tone(260);}else{lives--;combo=0;immune=1.5;burst(x,y,'#ff728b','−1 VIDA');arena.classList.remove('shake');void arena.offsetWidth;arena.classList.add('shake');tone(140,.16);hud();announce(`${lives} vidas`);if(lives<=0){e.el.remove();entities.splice(i,1);finish();return;}}}}
   if(e.y>height+35){remove=true;if(e.type==='bug')addScore(10);else if(e.type==='code')combo=0;}
   if(remove){e.el.remove();entities.splice(i,1);}
  }
 }
 function frame(time){const dt=Math.min(.033,Math.max(0,(time-lastTime)/1000));lastTime=time;if(state==='playing')update(dt);requestAnimationFrame(frame);}
 $('start').addEventListener('click',()=>state==='paused'?pause():start());$('pause').addEventListener('click',pause);
 $('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=`Sonido: ${sound?'ON':'OFF'}`;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Desactivar sonido':'Activar sonido');if(sound){if(audio?.state==='suspended')audio.resume();tone(660);}});
 document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key.toLowerCase();if(['arrowleft','arrowright','a','d','p','escape'].includes(key)){e.preventDefault();if((key==='p'||key==='escape')&&!e.repeat){pause();return;}if(state==='playing')keys.add(key);}if(key==='enter'&&e.target===arena&&(state==='ready'||state==='over'))start();});
 document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 function localPointer(e){return clamp(e.clientX-arena.getBoundingClientRect().left,0,width);}
 arena.addEventListener('pointerdown',e=>{if(state!=='playing'||e.target.closest('button'))return;pointer=localPointer(e);arena.setPointerCapture(e.pointerId);});arena.addEventListener('pointermove',e=>{if(pointer!==null)pointer=localPointer(e);});['pointerup','pointercancel','lostpointercapture'].forEach(event=>arena.addEventListener(event,()=>pointer=null));
 window.addEventListener('resize',resize);window.addEventListener('blur',()=>{keys.clear();if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
 resize();x=(width-42)/2;renderPlayer();hud();requestAnimationFrame(frame);
})();
