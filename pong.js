const c=document.getElementById('canvas'),g=c.getContext('2d');
const portada=document.getElementById('portada'),menu=document.getElementById('menu'),juego=document.getElementById('juego'),fin=document.getElementById('fin');
const p1e=document.getElementById('pt1'),p2e=document.getElementById('pt2'),modoTxt=document.getElementById('modoTxt');
let keys={},modo=1,run=false,pausa=false,score1=0,score2=0,rally=0,target=7;
let p1,p2,ball,AC;

function audio(){AC??=new (window.AudioContext||window.webkitAudioContext)();AC.resume()}
function beep(freq=440,d=.05,type='square',vol=.025,delay=0){audio();let o=AC.createOscillator(),ga=AC.createGain();o.type=type;o.frequency.value=freq;ga.gain.value=vol;o.connect(ga);ga.connect(AC.destination);let t=AC.currentTime+delay;o.start(t);ga.gain.exponentialRampToValueAtTime(.001,t+d);o.stop(t+d)}
function hitSound(){beep(540,.035);beep(760,.025,'square',.015,.018)}
function wallSound(){beep(260,.035)}
function pointSound(){beep(520,.06);beep(700,.06,'square',.025,.06);beep(900,.08,'square',.025,.12)}
function victorySong(who){
 let notes=who===1?[659,784,988,1318,988,1175,1318,1568]:[523,659,784,659,880,784,659,1046];
 notes.forEach((n,i)=>beep(n,.11,'square',.03,i*.115));
 beep(notes[notes.length-1]*1.25,.3,'square',.03,notes.length*.115);
}
function resetBall(dir=1){
 ball={x:480,y:300,r:8,vx:5.3*dir,vy:(Math.random()*4-2)||2};
 rally=0;
}
function start(m){
 modo=m;score1=score2=0;p1e.textContent=0;p2e.textContent=0;
 p1={x:35,y:240,w:16,h:120,s:8};p2={x:909,y:240,w:16,h:120,s:8};
 resetBall(Math.random()<.5?-1:1);run=true;pausa=false;fin.classList.add('oculto');
 portada.classList.add('oculto');menu.classList.add('oculto');juego.classList.remove('oculto');
 modoTxt.textContent=modo===1?'1 JUGADOR — VALEN CPU':'2 JUGADORES';
 requestAnimationFrame(loop);
}
function cpu(){
 let center=p2.y+p2.h/2;
 let aim=ball.y;
 // reacción imperfecta: sólo corrige si la pelota está bastante lejos
 if(Math.abs(aim-center)>18){
   let max=5.4+Math.min(score1,6)*.15;
   p2.y += Math.sign(aim-center)*max;
 }
 // error intencional pequeño
 if(Math.random()<.015)p2.y += (Math.random()-.5)*18;
}
function move(){
 if(keys.KeyW)p1.y-=p1.s;if(keys.KeyS)p1.y+=p1.s;
 if(modo===1){
   if(keys.ArrowUp)p1.y-=p1.s;if(keys.ArrowDown)p1.y+=p1.s;cpu();
 }else{
   if(keys.ArrowUp)p2.y-=p2.s;if(keys.ArrowDown)p2.y+=p2.s;
 }
 p1.y=Math.max(0,Math.min(600-p1.h,p1.y));p2.y=Math.max(0,Math.min(600-p2.h,p2.y));
}
function paddleHit(p,leftSide){
 return ball.x+ball.r>p.x&&ball.x-ball.r<p.x+p.w&&ball.y+ball.r>p.y&&ball.y-ball.r<p.y+p.h &&
   ((leftSide&&ball.vx<0)||(!leftSide&&ball.vx>0));
}
function physics(){
 move();ball.x+=ball.vx;ball.y+=ball.vy;
 if(ball.y-ball.r<=0||ball.y+ball.r>=600){ball.vy*=-1;ball.y=Math.max(ball.r,Math.min(600-ball.r,ball.y));wallSound()}
 if(paddleHit(p1,true)){ball.x=p1.x+p1.w+ball.r;let rel=(ball.y-(p1.y+p1.h/2))/(p1.h/2);ball.vx=Math.abs(ball.vx)*1.045;ball.vy=rel*7.2;rally++;hitSound()}
 if(paddleHit(p2,false)){ball.x=p2.x-ball.r;let rel=(ball.y-(p2.y+p2.h/2))/(p2.h/2);ball.vx=-Math.abs(ball.vx)*1.045;ball.vy=rel*7.2;rally++;hitSound()}
 // tope de velocidad
 let max=13.5;if(Math.abs(ball.vx)>max)ball.vx=Math.sign(ball.vx)*max;
 if(ball.x<-20){
   score2++;
   p2e.textContent=score2;
   pointSound();
   checkWin(2);
 } else if(ball.x>980){
   score1++;
   p1e.textContent=score1;
   pointSound();
   checkWin(1);
 }
}
function checkWin(last){
 let a=score1,b=score2;

 if(a>=target||b>=target){
   end(a>b?1:2);
   return;
 }

 // Igual que en Pong Mercante:
 // una pelota perdida = UN punto y la siguiente pelota sale inmediatamente.
 resetBall(last===1?-1:1);
}
function end(who){
 run=false;victorySong(who);
 let txt=who===1?'🏆 ¡TOMY GANA! 🏆':'🧸 ¡VALEN GANA! 🧸';
 fin.innerHTML=`<strong>${txt}</strong><br><br>${score1} - ${score2}<br><br><button id="rev">REVANCHA</button><button id="men">VOLVER AL MENÚ</button>`;
 fin.classList.remove('oculto');
 document.getElementById('rev').onclick=()=>start(modo);
 document.getElementById('men').onclick=showMenu;
}
function draw(){
 // fondo retro colorido
 let grd=g.createLinearGradient(0,0,960,600);grd.addColorStop(0,'#071c36');grd.addColorStop(1,'#2a092d');g.fillStyle=grd;g.fillRect(0,0,960,600);
 // cuadricula
 g.strokeStyle='#ffffff0e';g.lineWidth=1;for(let x=0;x<960;x+=24){g.beginPath();g.moveTo(x,0);g.lineTo(x,600);g.stroke()}for(let y=0;y<600;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(960,y);g.stroke()}
 // línea y red
 g.strokeStyle='#ffffff66';g.setLineDash([12,12]);g.lineWidth=4;g.beginPath();g.moveTo(480,0);g.lineTo(480,600);g.stroke();g.setLineDash([]);
 // paletas
 g.shadowBlur=18;g.shadowColor='#2de0ff';g.fillStyle='#2de0ff';g.fillRect(p1.x,p1.y,p1.w,p1.h);
 g.shadowColor='#ff4fa3';g.fillStyle='#ff4fa3';g.fillRect(p2.x,p2.y,p2.w,p2.h);g.shadowBlur=0;
 // pelota con estela
 for(let i=5;i>=1;i--){g.fillStyle=`rgba(255,228,93,${0.08*i})`;g.beginPath();g.arc(ball.x-ball.vx*i*1.5,ball.y-ball.vy*i*1.5,ball.r*(i/6),0,Math.PI*2);g.fill()}
 g.fillStyle='#ffe45d';g.beginPath();g.arc(ball.x,ball.y,ball.r,0,Math.PI*2);g.fill();
 // nombres
 g.font='bold 18px Consolas';g.fillStyle='#2de0ff';g.fillText('TOMY',25,28);g.fillStyle='#ff4fa3';g.fillText('VALEN',875,28);
 if(pausa){g.fillStyle='#000b';g.fillRect(0,0,960,600);g.fillStyle='#ffe45d';g.font='bold 52px Consolas';g.textAlign='center';g.fillText('PAUSA',480,310);g.textAlign='left'}
}
function loop(){if(!run)return;if(!pausa)physics();draw();requestAnimationFrame(loop)}
function showMenu(){run=false;juego.classList.add('oculto');fin.classList.add('oculto');menu.classList.remove('oculto')}
document.addEventListener('keydown',e=>{
 if(!portada.classList.contains('oculto')&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();portada.classList.add('oculto');menu.classList.remove('oculto');return}
 keys[e.code]=true;
 if(e.code==='KeyP'&&run){pausa=!pausa;draw()}
 if(e.code==='Escape'){if(!juego.classList.contains('oculto'))showMenu();else if(!menu.classList.contains('oculto')){menu.classList.add('oculto');portada.classList.remove('oculto')}}
});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.querySelectorAll('[data-modo]').forEach(b=>b.onclick=()=>start(+b.dataset.modo));