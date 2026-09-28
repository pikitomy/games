const c=document.querySelector("#game"),g=c.getContext("2d"),intro=document.querySelector("#intro"),wrap=document.querySelector("#wrap"),S=document.querySelector("#score"),L=document.querySelector("#lives"),LEV=document.querySelector("#level"),M=document.querySelector("#msg"),T=24,C=21,R=27;

const MAZES=[
["#####################","#.........#.........#","#.###.###.#.###.###.#","#o###.###.#.###.###o#","#...................#","#.###.#.#####.#.###.#","#.....#...#...#.....#","#####.### # ###.#####","    #.#       #.#    ","#####.# ##### #.#####","     .         .     ","#####.# ##### #.#####","    #.#       #.#    ","#####.# ##### #.#####","#.........#.........#","#.###.###.#.###.###.#","#o..#...........#..o#","###.#.#.#####.#.#.###","#.....#...#...#.....#","#.#######.#.#######.#","#...................#","#.###.###.#.###.###.#","#...#.....#.....#...#","###.#.#.#####.#.#.###","#.....#...#...#.....#","#.........#.........#","#####################"],
["#####################","#o.......#.#.......o#","#.#####..#.#..#####.#","#.......#...#.......#","###.###.#####.###.###","#...#...........#...#","#.#.#.###.#.###.#.#.#","#.#.....#.#.#.....#.#","#.#####.#.#.#.#####.#","#.......#...#.......#","###.###.#####.###.###","#.....#.......#.....#","#.###.#.#####.#.###.#","......#.......#......","#.###.#.#####.#.###.#","#.....#.......#.....#","###.###.#####.###.###","#.......#...#.......#","#.#####.#.#.#.#####.#","#.#.....#.#.#.....#.#","#.#.###.#.#.#.###.#.#","#...#...........#...#","###.###.#####.###.###","#.......#...#.......#","#.#####..#.#..#####.#","#o.......#.#.......o#","#####################"],
["#####################","#o....#.......#....o#","#.###.#.#####.#.###.#","#.....#...#...#.....#","#.#######.#.#######.#","#.........#.........#","###.#####.#.#####.###","#...#.....#.....#...#","#.#.#.###.#.###.#.#.#","#.#.....#...#.....#.#","#.#####.#####.#####.#","#...................#","#####.#.#####.#.#####","......#.......#......","#####.#.#####.#.#####","#...................#","#.#####.#####.#####.#","#.#.....#...#.....#.#","#.#.###.#.#.#.###.#.#","#...#.....#.....#...#","###.#####.#.#####.###","#.........#.........#","#.#######.#.#######.#","#.....#...#...#.....#","#.###.#.#####.#.###.#","#o....#.......#....o#","#####################"]
];
const COLORS=[["#174cff","#07153d"],["#b22cff","#3a0c52"],["#00b982","#063c31"],["#ff6b22","#59200a"],["#ef3e7a","#54152d"]];
let map,v,ws,run=false,pause=false,score=0,lives=3,power=0,keys={},level=1,dying=false,deathTick=0;
const info=[["BLONDIE","#ffe05b"],["RED","#e74646"],["BLACKY","#594a40"],["SHADES","#d7ad86"]];
const OFFICE={x1:8,y1:11,x2:12,y2:13,doorX:10,doorY:14};
const WORKER_HOME=[[9,12],[10,12],[11,12],[10,11]];
let burger=null,burgerTimer=0,burgerNext=900;
let nextExtraLife=5000;
let checkpointScore=0,checkpointLevel=1;
const MAX_LIVES=5;



function loadLevel(){
 map=MAZES[(level-1)%MAZES.length].map(x=>x.split(""));
 LEV.textContent=level;
 v={x:10,y:16,dx:0,dy:0,wx:0,wy:0};
 ws=WORKER_HOME.map((q,i)=>({x:q[0],y:q[1],dx:i%2?1:-1,dy:0,n:info[i][0],col:info[i][1],eatCooldown:35+i*22,officeDelay:45+i*18}));
 power=0;dying=false;deathTick=0;wrap.classList.remove("power");
}
function wall(x,y){return y<0||y>=R?true:(x<0||x>=C?false:map[y][x]==="#")}
function reset(){
 score=0;lives=3;level=1;nextExtraLife=5000;checkpointScore=0;checkpointLevel=1;
 burger=null;burgerTimer=0;burgerNext=700;
 S.textContent=0;L.textContent=3;loadLevel();run=true;pause=false;M.classList.add("hide");requestAnimationFrame(loop)
}
function dir(dx,dy){if(dying)return;v.wx=dx;v.wy=dy}



// ===== PORTADA + MOBILE =====
const workersCover=document.getElementById("workersCover");
let coverOpen=true,touchX=0,touchY=0,touchMoved=false;
function closeWorkersCover(){
 if(!coverOpen)return;
 coverOpen=false;workersCover.style.display="none";
 if(audioOn){AC();startMusic()}
}
workersCover?.addEventListener("pointerdown",e=>{
 if(e.pointerType==="touch"){e.preventDefault();closeWorkersCover()}
});
document.addEventListener("keydown",e=>{
 if(coverOpen){
   if(e.code==="Space"||e.code==="Enter"){e.preventDefault();closeWorkersCover()}
   else if(e.code==="Escape"){e.preventDefault();location.href="index.html"}
 }
},{capture:true});

// Global swipe: starts even outside canvas. Buttons remain clickable.
document.addEventListener("touchstart",e=>{
 if(coverOpen||e.target.closest("button"))return;
 if(e.touches.length!==1)return;
 touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;touchMoved=false;
},{passive:false});
document.addEventListener("touchmove",e=>{
 if(coverOpen||e.target.closest("button")||e.touches.length!==1)return;
 const dx=e.touches[0].clientX-touchX,dy=e.touches[0].clientY-touchY;
 if(Math.hypot(dx,dy)<22)return;
 e.preventDefault();touchMoved=true;
 if(Math.abs(dx)>Math.abs(dy))dir(dx>0?1:-1,0);else dir(0,dy>0?1:-1);
 touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;
},{passive:false});

// ===== AUDIO 8-BIT (Web Audio API, sin archivos externos) =====
let audioOn=true,audioCtx=null,musicTimer=null,musicStep=0;
const soundBtn=document.getElementById("soundToggle");
function AC(){
 if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
 if(audioCtx.state==="suspended")audioCtx.resume();
 return audioCtx;
}
function tone(freq,dur=.08,type="square",vol=.055,delay=0,endFreq=null){
 if(!audioOn)return;
 const a=AC(),t=a.currentTime+delay,o=a.createOscillator(),gn=a.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,t);
 if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);
 gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+.008);
 gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+dur+.02);
}
function noise(dur=.12,vol=.035){
 if(!audioOn)return;
 const a=AC(),n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const s=a.createBufferSource(),gn=a.createGain();s.buffer=buf;gn.gain.value=vol;s.connect(gn);gn.connect(a.destination);s.start();
}
const sfx={
 eat(){tone(760,.035,"square",.035);tone(980,.035,"square",.025,.035)},
 super(){tone(330,.07,"square",.05);tone(440,.07,"square",.05,.07);tone(660,.10,"square",.06,.14);tone(880,.12,"square",.06,.24)},
 faint(){tone(420,.10,"sawtooth",.045,0,260);tone(250,.18,"square",.04,.09,80);noise(.14,.018)},
 life(){tone(523,.07,"square",.05);tone(659,.07,"square",.05,.08);tone(784,.07,"square",.05,.16);tone(1047,.16,"square",.055,.24)},
 burgerAppear(){tone(392,.055,"triangle",.035);tone(523,.055,"triangle",.035,.07);tone(659,.09,"triangle",.04,.14)},
 burgerEat(){tone(220,.045,"square",.045);tone(330,.045,"square",.045,.045);tone(440,.055,"square",.05,.09);tone(660,.10,"square",.05,.145)}
};
function musicTick(){
 if(!audioOn||!run||pause)return;
 const seq=[196,247,294,247,220,262,330,262,175,220,262,220,196,247,294,330];
 const bass=[98,98,110,110,87,87,98,98];
 tone(seq[musicStep%seq.length],.065,"square",.012);
 if(musicStep%2===0)tone(bass[(musicStep/2)%bass.length],.11,"triangle",.010);
 musicStep++;
}
function startMusic(){
 if(musicTimer)return;
 musicTimer=setInterval(musicTick,180);
}
function setAudio(on){
 audioOn=on;
 if(soundBtn)soundBtn.textContent=on?"🔊 SONIDO":"🔇 SONIDO";
 if(on){AC();startMusic()}
}
soundBtn?.addEventListener("click",e=>{e.stopPropagation();setAudio(!audioOn)});
document.addEventListener("pointerdown",()=>{if(audioOn){AC();startMusic()}},{once:true});

function addScore(points){
 score+=points;
 while(score>=nextExtraLife){
   if(lives<MAX_LIVES){lives++;L.textContent=lives;sfx.life()}
   nextExtraLife+=5000;
 }
 S.textContent=score;
}
function randomFreeTile(){
 const free=[];
 for(let y=1;y<R-1;y++)for(let x=1;x<C-1;x++){
   if(!wall(x,y) && map[y]?.[x]===" " && !(x>=8&&x<=12&&y>=11&&y<=14)) free.push({x,y});
 }
 return free.length?free[Math.floor(Math.random()*free.length)]:null;
}
function updateBurger(){
 if(burger){
   burgerTimer--;
   if(Math.hypot(v.x-burger.x,v.y-burger.y)<.58){
     addScore(500);sfx.burgerEat();burger=null;burgerTimer=0;burgerNext=900+Math.floor(Math.random()*500);
   }else if(burgerTimer<=0){
     burger=null;burgerNext=650+Math.floor(Math.random()*450);
   }
 }else{
   burgerNext--;
   if(burgerNext<=0){
     burger=randomFreeTile();
     if(burger)sfx.burgerAppear();
     burgerTimer=520;
   }
 }
}
function tileOccupied(x,y,self){
 return ws.some(o=>o!==self && Math.round(o.x)===x && Math.round(o.y)===y);
}
function openDirs(x,y){
 return [[1,0],[-1,0],[0,1],[0,-1]].filter(d=>!wall(x+d[0],y+d[1]));
}
function nearestOpen(tx,ty){
 tx=Math.max(0,Math.min(C-1,Math.round(tx)));ty=Math.max(0,Math.min(R-1,Math.round(ty)));
 if(!wall(tx,ty))return {x:tx,y:ty};
 for(let r=1;r<Math.max(C,R);r++){
   for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
     if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
     let x=tx+dx,y=ty+dy;
     if(x>=0&&x<C&&y>=0&&y<R&&!wall(x,y))return {x,y};
   }
 }
 return {x:10,y:16};
}
function distanceMap(tx,ty){
 const target=nearestOpen(tx,ty),dist=Array.from({length:R},()=>Array(C).fill(Infinity));
 const q=[[target.x,target.y]];dist[target.y][target.x]=0;
 for(let h=0;h<q.length;h++){
   const [x,y]=q[h],nd=dist[y][x]+1;
   for(const d of openDirs(x,y)){
     let nx=x+d[0],ny=y+d[1];
     if(nx<0||nx>=C||ny<0||ny>=R)continue;
     if(nd<dist[ny][nx]){dist[ny][nx]=nd;q.push([nx,ny])}
   }
 }
 return dist;
}
function workerTarget(w){
 const i=ws.indexOf(w),vx=Math.round(v.x),vy=Math.round(v.y);
 // Pac-Man-inspired personalities, but all remain focused on Valen.
 if(i===0)return nearestOpen(vx,vy); // BLONDIE: directo al oso.
 if(i===1)return nearestOpen(vx+v.dx*3,vy+v.dy*3); // RED: intenta cortarle el camino.
 if(i===2){ // BLACKY: apunta entre Valen y el lado opuesto del Worker.
   return nearestOpen(vx+(vx-Math.round(w.x)),vy+(vy-Math.round(w.y)));
 }
 // SHADES: cerca rodea; lejos va directo. Nunca se desentiende del oso.
 const dd=Math.hypot(w.x-v.x,w.y-v.y);
 if(dd>5)return nearestOpen(vx,vy);
 return nearestOpen(vx-v.dy*2,vy+v.dx*2);
}
function choose(w){
 const x=Math.round(w.x),y=Math.round(w.y);
 let dirs=openDirs(x,y);

 // No overlap: occupied neighboring tiles are temporarily unavailable.
 let free=dirs.filter(d=>!tileOccupied(x+d[0],y+d[1],w));
 if(free.length)dirs=free;
 if(!dirs.length){w.dx=0;w.dy=0;return}

 // Reversing is allowed when fleeing or if traffic/maze requires it.
 const nonReverse=dirs.filter(d=>!(d[0]===-w.dx&&d[1]===-w.dy));
 if(power<=0 && nonReverse.length)dirs=nonReverse;

 if(power>0){
   // Frightened mode: maximize REAL maze distance from Valen.
   const dm=distanceMap(Math.round(v.x),Math.round(v.y));
   dirs.sort((a,b)=>(dm[y+b[1]]?.[x+b[0]]??-1)-(dm[y+a[1]]?.[x+a[0]]??-1));
 }else{
   // Chase mode: shortest legal path through the maze toward each Worker's target.
   const t=workerTarget(w),dm=distanceMap(t.x,t.y);
   dirs.sort((a,b)=>(dm[y+a[1]]?.[x+a[0]]??9999)-(dm[y+b[1]]?.[x+b[0]]??9999));
 }
 [w.dx,w.dy]=dirs[0];
}
function move(e,sp){
 let x=Math.round(e.x),y=Math.round(e.y);
 const centered=Math.abs(e.x-x)<.055&&Math.abs(e.y-y)<.055;

 if(centered){
   e.x=x;e.y=y;
   if(e===v){
     if(!wall(x+v.wx,y+v.wy)){e.dx=v.wx;e.dy=v.wy}
     if(wall(x+e.dx,y+e.dy)){e.dx=0;e.dy=0}
   }else{
     // Workers make a decision at every tile, so they never "wait for Valen".
     choose(e);
   }
 }

 if(e.dx===0&&e.dy===0)return;

 // Move only along the corridor axis. This eliminates diagonal drift into walls.
 const tx=Math.round(e.x)+(e.dx||0),ty=Math.round(e.y)+(e.dy||0);
 if(e!==v && tileOccupied(tx,ty,e) && centered){e.dx=0;e.dy=0;return}

 if(e.dx){
   const row=Math.round(e.y);
   if(wall(Math.round(e.x+e.dx*.52),row)){e.x=Math.round(e.x);e.dx=0;return}
   e.y=row;e.x+=e.dx*sp;
 }else if(e.dy){
   const col=Math.round(e.x);
   if(wall(col,Math.round(e.y+e.dy*.52))){e.y=Math.round(e.y);e.dy=0;return}
   e.x=col;e.y+=e.dy*sp;
 }
 if(e.x<-.5)e.x=C-.5;
 if(e.x>C-.5)e.x=-.5;
}
function nextLevel(){
 checkpointScore=score;
 checkpointLevel=level+1;
 run=false;
 level++;
 burger=null;burgerTimer=0;burgerNext=700+Math.floor(Math.random()*400);
 M.innerHTML="NIVEL "+level+"<br><small>NUEVO LABERINTO · NUEVO CONFLICTO 😂</small>";
 M.style.display="flex";M.classList.remove("hide");
 setTimeout(()=>{M.classList.add("hide");loadLevel();run=true;startMusic();requestAnimationFrame(loop)},1100);
}
function collect(){
 let x=Math.round(v.x),y=Math.round(v.y),q=map[y]?.[x];
 if(q==="."||q==="o"){
   addScore(q==="o"?50:10);if(q==="o")sfx.super();else sfx.eat();map[y][x]=" ";
   if(q==="o"){power=520;wrap.classList.add("power")}
 }
 for(let w of ws){
   let a=Math.round(w.x),b=Math.round(w.y),q2=map[b]?.[a];
   if(q2==="."){
     // The Workers no longer vacuum the maze: only an occasional normal cookie.
     // Super cookies ("o") are exclusively Valen's and Workers pass over them.
     if(w.eatCooldown<=0 && Math.random()<0.16){
       map[b][a]=" ";
       w.eatCooldown=95+Math.floor(Math.random()*120);
     }
   }
   if(Math.hypot(v.x-w.x,v.y-w.y)<.62){
     if(power){
       let home=WORKER_HOME[ws.indexOf(w)]||WORKER_HOME[0];
       w.x=home[0];w.y=home[1];w.dx=0;w.dy=1;w.officeDelay=70;w.eatCooldown=70;
       addScore(100)
     }else{
       if(!dying){dying=true;deathTick=72;sfx.faint();v.dx=v.dy=0;v.wx=v.wy=0}
       return;
     }
   }
 }
 if(!map.some(r=>r.includes(".")||r.includes("o")))nextLevel()
}
function update(){
 if(dying){
   deathTick--;
   if(deathTick<=0){
     dying=false;lives--;L.textContent=lives;
     if(lives<=0){end("THE WORKERS GANARON LAS COOKIES 🍪");return}
     v.x=10;v.y=16;v.dx=v.dy=v.wx=v.wy=0;
     ws=WORKER_HOME.map((q,i)=>({x:q[0],y:q[1],dx:i%2?1:-1,dy:0,n:info[i][0],col:info[i][1],eatCooldown:35+i*22,officeDelay:45+i*18}));
   }
   return;
 }

 if(keys.ArrowLeft||keys.KeyA)dir(-1,0);if(keys.ArrowRight||keys.KeyD)dir(1,0);if(keys.ArrowUp||keys.KeyW)dir(0,-1);if(keys.ArrowDown||keys.KeyS)dir(0,1);
 move(v,.105);

 // IMPORTANT: boss mode is resolved before moving Workers.
 // Nobody is allowed to remain waiting in the office while Valen has power.
 if(power>0) ws.forEach(w=>w.officeDelay=0);

 ws.forEach(w=>{
   if(w.eatCooldown>0)w.eatCooldown--;
   if(w.officeDelay>0){
     if(power>0)w.officeDelay=0;
     else{w.officeDelay--;return}
   }
   move(w,power>0?.060:.069);
 });

 if(power>0){
   power--;
   if(power===0)wrap.classList.remove("power");
 }
 updateBurger();
 collect();
}
function draw(){
 g.fillStyle="#02030a";g.fillRect(0,0,c.width,c.height);
 const col=COLORS[(level-1)%COLORS.length];
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){
   let q=map[y][x],X=x*T,Y=y*T;
   if(q==="#"){g.fillStyle=col[0];g.fillRect(X+2,Y+2,20,20);g.fillStyle=col[1];g.fillRect(X+6,Y+6,12,12)}
   else if(q==="."){cookie(X+12,Y+12,3)}
   else if(q==="o"){cookie(X+12,Y+12,7)}
 }
 if(burger){
   const bx=burger.x*T,by=burger.y*T;
   g.fillStyle="#d88a35";g.fillRect(bx+5,by+7,T-10,4);
   g.fillStyle="#5b321e";g.fillRect(bx+4,by+11,T-8,4);
   g.fillStyle="#65a84a";g.fillRect(bx+4,by+15,T-8,2);
   g.fillStyle="#e7b04b";g.fillRect(bx+5,by+17,T-10,4);
   g.fillStyle="#f6df8d";g.fillRect(bx+8,by+8,2,1);g.fillRect(bx+15,by+9,2,1);
 }
 // Oficina Gremial: sede central de The Workers.
 g.fillStyle="#171717";g.fillRect(8*T+3,11*T+3,5*T-6,3*T-6);
 g.strokeStyle="#f0c843";g.lineWidth=2;g.strokeRect(8*T+3,11*T+3,5*T-6,3*T-6);
 g.fillStyle="#f0c843";g.fillRect(9*T,11*T+6,3*T,8);
 g.fillStyle="#111";g.font="bold 7px Consolas";g.textAlign="center";g.fillText("OFICINA GREMIAL",10.5*T,11*T+13);
 g.fillStyle="#6d4229";g.fillRect(10*T+7,13*T-7,10,22);
 g.fillStyle="#f0c843";g.fillRect(10*T+14,13*T+2,2,2);
 g.textAlign="left";
 bear(v);ws.forEach(worker);
 if(pause){g.fillStyle="#000c";g.fillRect(0,0,c.width,c.height);g.fillStyle="#ffe45d";g.font="bold 36px Consolas";g.textAlign="center";g.fillText("PAUSA",c.width/2,c.height/2);g.textAlign="left"}
}
function cookie(X,Y,r){g.fillStyle="#e5b96e";g.beginPath();g.arc(X,Y,r,0,7);g.fill();if(r>4){g.fillStyle="#492817";g.fillRect(X-4,Y-4,3,3);g.fillRect(X+2,Y+1,3,3);g.fillRect(X+1,Y-5,2,2)}}
function bear(e){
 let X=e.x*T+12,Y=e.y*T+12,z=power>0?1:0;
 let fur=power>0?(Math.floor(power/12)%2?"#ffe45d":"#ff8fd0"):"#aaa09b";
 let scarf="#d62e32",dark="#111";

 if(dying){
   // Mini "desmayo": Valen gira, cae de costado y termina con los pies al aire.
   let p=1-deathTick/72;
   g.save();g.translate(X,Y);
   g.rotate(Math.min(1,p*1.35)*Math.PI/2);
   let drop=Math.sin(Math.min(1,p)*Math.PI/2)*5;g.translate(0,drop);
   g.fillStyle=fur;
   g.fillRect(-8,-7,16,15);                 // cabeza/cuerpo
   g.fillRect(-11,-9,6,6);g.fillRect(5,-9,6,6); // orejas
   g.fillRect(-12,-3,4,4);g.fillRect(8,-3,4,4); // brazos simétricos
   g.fillRect(-6,8,4,4);g.fillRect(2,8,4,4);    // piecitos
   g.fillStyle=scarf;g.fillRect(-8,4,16,4);
   g.fillStyle=dark;
   // ojos en X durante el desmayo
   g.fillRect(-5,-2,2,2);g.fillRect(-3,0,2,2);g.fillRect(-3,-2,2,2);g.fillRect(-5,0,2,2);
   g.fillRect(2,-2,2,2);g.fillRect(4,0,2,2);g.fillRect(4,-2,2,2);g.fillRect(2,0,2,2);
   g.restore();return;
 }

 // Paso alternado: brazos y pies cambian un píxel según movimiento.
 let moving=(e.dx||e.dy),step=moving?(Math.floor(performance.now()/110)%2):0;
 let armA=step?1:-1,armB=-armA;
 let footA=step?1:0,footB=step?0:1;

 g.fillStyle=fur;
 g.fillRect(X-8-z,Y-7-z,16+z*2,15+z*2);
 g.fillRect(X-11-z,Y-9-z,6+z,6+z);g.fillRect(X+5,Y-9-z,6+z,6+z);

 // Brazos simétricos, alternando arriba/abajo al caminar.
 g.fillRect(X-12-z,Y-3+armA,4+z,4);
 g.fillRect(X+8,Y-3+armB,4+z,4);

 // Piecitos: dos bloques chicos que alternan un píxel.
 g.fillRect(X-6,Y+8+footA,4,3+z);
 g.fillRect(X+2,Y+8+footB,4,3+z);

 g.fillStyle=scarf;g.fillRect(X-8-z,Y+4,16+z*2,4+z);
 g.fillStyle=dark;g.fillRect(X-5,Y-2,3,3);g.fillRect(X+2,Y-2,3,3)
}
function worker(w){
 let X=w.x*T+12,Y=w.y*T+12;
 // More faithful worker look: yellow square head + individual hair/cap/shades.
 g.fillStyle="#f2d35b";g.fillRect(X-8,Y-8,16,16);
 if(w.n==="BLONDIE"){g.fillStyle="#fff02e";g.fillRect(X-8,Y-10,16,4);g.fillRect(X-8,Y-7,3,4)}
 if(w.n==="RED"){g.fillStyle="#ef3e42";g.fillRect(X-8,Y-11,16,5);g.fillRect(X-8,Y-7,4,4)}
 if(w.n==="BLACKY"){g.fillStyle="#1c1817";g.fillRect(X-8,Y-11,16,5);g.fillRect(X-8,Y-7,3,3)}
 if(w.n==="SHADES"){g.fillStyle="#4b4032";g.fillRect(X-8,Y-11,16,5)}
 g.fillStyle="#111";
 if(w.n==="SHADES"){g.fillRect(X-7,Y-3,6,4);g.fillRect(X+1,Y-3,6,4);g.fillRect(X-1,Y-2,2,2)}
 else{g.fillRect(X-5,Y-2,3,4);g.fillRect(X+2,Y-2,3,4)}
 g.fillStyle="#161b76";g.fillRect(X-7,Y+8,14,5)
}
function loop(){if(!run)return;if(!pause)update();draw();startMusic();requestAnimationFrame(loop)}
function start(){
 checkpointScore=0;checkpointLevel=1;nextExtraLife=5000;intro.classList.add("hide");wrap.classList.remove("hide");reset()}
function end(msg){
 run=false;
 let old=document.getElementById("gameOverPanel");if(old)old.remove();
 const p=document.createElement("div");
 p.id="gameOverPanel";
 p.innerHTML=`<div class="goCard"><h2>FIN DEL TURNO</h2><p>${msg}</p><p>NIVEL ${level} · ${score} PUNTOS</p><button id="continueBtn">CONTINUAR</button><button id="restartBtn">REINICIAR PARTIDA</button></div>`;
 document.body.appendChild(p);
 document.getElementById("continueBtn").onclick=continueGame;
 document.getElementById("restartBtn").onclick=restartGame;
}
function continueGame(){
 document.getElementById("gameOverPanel")?.remove();
 score=checkpointScore;S.textContent=score;
 lives=3;L.textContent=lives;
 level=checkpointLevel;
 nextExtraLife=(Math.floor(score/5000)+1)*5000;
 loadLevel(level-1);
 v.x=10;v.y=16;v.dx=v.dy=v.wx=v.wy=0;
 ws=WORKER_HOME.map((q,i)=>({x:q[0],y:q[1],dx:i%2?1:-1,dy:0,n:info[i][0],col:info[i][1],eatCooldown:35+i*22,officeDelay:45+i*18}));
 power=0;wrap.classList.remove("power");burger=null;burgerTimer=0;burgerNext=700;
 dying=false;run=true;requestAnimationFrame(loop);
}
function restartGame(){
 document.getElementById("gameOverPanel")?.remove();
 location.reload();
}

document.addEventListener("keydown",e=>{
 if(!intro.classList.contains("hide")&&(e.code==="Space"||e.code==="Enter")){e.preventDefault();start();return}
 keys[e.code]=1;if(e.code==="KeyP"&&run)pause=!pause;
 if(e.code==="Escape"&&!coverOpen){e.preventDefault();location.href="index.html"}
});
document.addEventListener("keyup",e=>keys[e.code]=0);

let sx=0,sy=0,on=0;
intro.addEventListener("touchend",e=>{e.preventDefault();start()},{passive:false});
document.addEventListener("touchstart",e=>{if(!run||!e.touches.length)return;e.preventDefault();sx=e.touches[0].clientX;sy=e.touches[0].clientY;on=1},{passive:false});
document.addEventListener("touchend",e=>{if(!run||!on||!e.changedTouches.length)return;e.preventDefault();on=0;let dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.hypot(dx,dy)<18)return;Math.abs(dx)>Math.abs(dy)?dir(dx>0?1:-1,0):dir(0,dy>0?1:-1)},{passive:false});
