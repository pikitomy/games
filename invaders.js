const intro = document.getElementById("intro");
const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const restartBtn = document.getElementById("restart");

const W = canvas.width, H = canvas.height;
let keys = {};
let player, bullets, aliens, alienBullets, shields, stars;
let running = false, paused = false, score = 0, lives = 3, level = 1;
let alienDir = 1, alienSpeed = 0.5, lastShot = 0, alienShotClock = 0;
let highScore = Number(localStorage.getItem("valenHighScore") || 0);
highScoreEl.textContent = highScore;

function startGame(){
  intro.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetGame();
}

function resetGame(){
  overlay.classList.add("hidden");
  score = 0; lives = 3; level = 1;
  scoreEl.textContent = score;
  running = true; paused = false;
  stars = Array.from({length:100},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.7+.3}));
  newLevel(true);
  requestAnimationFrame(loop);
}

function newLevel(fullReset=false){
  player = {x:W/2-29,y:H-84,w:58,h:60,speed:6};
  bullets = [];
  alienBullets = [];
  aliens = [];
  shields = [
    {x:150,y:H-150,w:95,h:22,hp:5},
    {x:402,y:H-150,w:95,h:22,hp:5},
    {x:655,y:H-150,w:95,h:22,hp:5}
  ];
  const rows = 5, cols = 10;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      aliens.push({x:120+c*64,y:80+r*48,w:34,h:24,row:r,alive:true});
    }
  }
  alienDir = 1;
  alienSpeed = 0.45 + (level-1)*0.12;
}

function drawBackground(){
  ctx.fillStyle="#020714"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#dff7ff";
  for(const s of stars){ctx.globalAlpha=.35+Math.random()*.45;ctx.fillRect(s.x,s.y,s.r,s.r)}
  ctx.globalAlpha=1;

  // House silhouette / warm windows
  ctx.fillStyle="#08131f";
  ctx.fillRect(0,H-120,W,120);
  ctx.fillStyle="#121a23";
  ctx.beginPath();
  ctx.moveTo(90,H-120); ctx.lineTo(190,H-230); ctx.lineTo(300,H-120); ctx.fill();
  ctx.fillRect(110,H-120,170,100);
  ctx.fillStyle="#f7b84a";
  ctx.fillRect(145,H-95,28,32); ctx.fillRect(210,H-95,28,32);
}

function drawValen(){
  // Valen visto DE ESPALDAS, como en la referencia.
  const x=player.x, y=player.y;

  // Orejas
  ctx.fillStyle="#aaa19d";
  ctx.fillRect(x+3,y+7,14,15);
  ctx.fillRect(x+41,y+7,14,15);
  ctx.fillStyle="#8e8581";
  ctx.fillRect(x+5,y+11,7,8);
  ctx.fillRect(x+46,y+11,7,8);

  // Cabeza de espaldas
  ctx.fillStyle="#b8afaa";
  ctx.fillRect(x+12,y+5,34,29);
  ctx.fillRect(x+8,y+12,42,18);

  // Sombras laterales para dar forma
  ctx.fillStyle="#9c938f";
  ctx.fillRect(x+8,y+16,5,14);
  ctx.fillRect(x+45,y+16,5,14);

  // Cuerpo
  ctx.fillStyle="#b1a8a3";
  ctx.fillRect(x+14,y+32,30,22);
  ctx.fillRect(x+10,y+36,8,16);
  ctx.fillRect(x+40,y+36,8,16);

  // Pañuelo rojo visto desde atrás
  ctx.fillStyle="#b52527";
  ctx.fillRect(x+11,y+30,36,6);
  ctx.fillRect(x+16,y+36,26,5);
  ctx.fillRect(x+21,y+41,16,5);
  ctx.fillRect(x+26,y+46,6,6);

  // Patitas
  ctx.fillStyle="#9e9591";
  ctx.fillRect(x+13,y+51,12,7);
  ctx.fillRect(x+33,y+51,12,7);
  ctx.fillStyle="#c4bcb7";
  ctx.fillRect(x+10,y+55,16,5);
  ctx.fillRect(x+32,y+55,16,5);

  // Blaster centrado sobre la cabeza
  ctx.fillStyle="#3e5797";
  ctx.fillRect(x+27,y-13,5,18);
  ctx.fillStyle="#dceaf0";
  ctx.fillRect(x+24,y-20,11,10);
  ctx.fillStyle="#59c7e8";
  ctx.fillRect(x+25,y-29,9,10);
}

function drawAlien(a){
  const palette = ["#74ff78","#54d5ff","#ff6666","#ffd45a","#d486ff"];
  ctx.fillStyle = palette[a.row % palette.length];
  const x=a.x,y=a.y;
  ctx.fillRect(x+7,y,20,4);
  ctx.fillRect(x+3,y+4,28,12);
  ctx.fillRect(x,y+8,34,8);
  ctx.fillStyle="#020714";
  ctx.fillRect(x+8,y+8,4,4);ctx.fillRect(x+22,y+8,4,4);
  ctx.fillStyle=palette[a.row % palette.length];
  ctx.fillRect(x+4,y+20,6,4);ctx.fillRect(x+24,y+20,6,4);
}

function draw(){
  drawBackground();
  ctx.fillStyle="#bfe9ff";
  ctx.font="18px Consolas";
  ctx.fillText("VIDAS: "+ "♥".repeat(lives), 18, 28);
  ctx.fillText("NIVEL: "+level, W-130, 28);

  for(const s of shields){
    if(s.hp<=0) continue;
    ctx.fillStyle=`rgba(90,255,150,${0.25+0.12*s.hp})`;
    ctx.fillRect(s.x,s.y,s.w,s.h);
  }

  drawValen();
  aliens.filter(a=>a.alive).forEach(drawAlien);

  ctx.fillStyle="#72e9ff";
  bullets.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
  ctx.fillStyle="#ff5454";
  alienBullets.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
}

function update(){
  if(keys.ArrowLeft||keys.KeyA) player.x-=player.speed;
  if(keys.ArrowRight||keys.KeyD) player.x+=player.speed;
  player.x=Math.max(8,Math.min(W-player.w-8,player.x));

  bullets.forEach(b=>b.y-=8);
  alienBullets.forEach(b=>b.y+=4.2);
  bullets=bullets.filter(b=>b.y>-20);
  alienBullets=alienBullets.filter(b=>b.y<H+20);

  let edge=false;
  for(const a of aliens){
    if(!a.alive) continue;
    a.x += alienDir*alienSpeed;
    if(a.x<20 || a.x+a.w>W-20) edge=true;
  }
  if(edge){
    alienDir*=-1;
    aliens.forEach(a=>{ if(a.alive) a.y+=14; });
  }

  for(const b of bullets){
    for(const a of aliens){
      if(a.alive && hit(b,a)){
        a.alive=false; b.y=-999;
        score += (5-a.row)*10;
        scoreEl.textContent=score;
      }
    }
  }

  // Shields absorb shots
  for(const b of alienBullets){
    for(const s of shields){
      if(s.hp>0 && hit(b,s)){ s.hp--; b.y=H+999; }
    }
  }

  // Player hit
  for(const b of alienBullets){
    if(hit(b,player)){
      b.y=H+999; lives--;
      if(lives<=0){ gameOver(); return; }
    }
  }

  // Alien invasion line
  if(aliens.some(a=>a.alive && a.y+a.h>=player.y-15)){ gameOver(); return; }

  // Alien shooting
  alienShotClock++;
  if(alienShotClock > Math.max(25,70-level*4)){
    alienShotClock=0;
    const alive=aliens.filter(a=>a.alive);
    if(alive.length){
      const shooter=alive[Math.floor(Math.random()*alive.length)];
      alienBullets.push({x:shooter.x+15,y:shooter.y+24,w:4,h:12});
    }
  }

  if(aliens.every(a=>!a.alive)){
    level++;
    newLevel();
  }
}

function shoot(){
  const now=performance.now();
  if(now-lastShot<240 || !running || paused) return;
  lastShot=now;
  bullets.push({x:player.x+28,y:player.y-32,w:4,h:14});
}

function hit(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function gameOver(){
  running=false;
  if(score>highScore){
    highScore=score;
    localStorage.setItem("valenHighScore",highScore);
    highScoreEl.textContent=highScore;
    overlayTitle.textContent="¡NUEVO RÉCORD!";
    overlayText.textContent=`Valen defendió la casa con ${score} puntos.`;
  } else {
    overlayTitle.textContent="GAME OVER";
    overlayText.textContent=`Valen hizo ${score} puntos. Los marcianos prometieron volver.`;
  }
  overlay.classList.remove("hidden");
}

function loop(){
  if(!running) return;
  if(!paused) update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown",e=>{
  if(!intro.classList.contains("hidden") && e.code==="Escape"){ window.location.href="index.html"; return; }
  if(!intro.classList.contains("hidden") && (e.code==="Space"||e.code==="Enter")){
    e.preventDefault(); startGame(); return;
  }
  if(!gameScreen.classList.contains("hidden")) e.preventDefault();
  keys[e.code]=true;
  if(e.code==="Space") shoot();
  if(e.code==="KeyP") paused=!paused;
  if(e.code==="Escape"){
    running=false;
    gameScreen.classList.add("hidden");
    intro.classList.remove("hidden");
  }
});
document.addEventListener("keyup",e=>keys[e.code]=false);
restartBtn.addEventListener("click",resetGame);
