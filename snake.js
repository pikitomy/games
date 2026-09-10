const intro=document.getElementById("intro"),modeScreen=document.getElementById("modeScreen"),gameScreen=document.getElementById("gameScreen");
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const scoreEl=document.getElementById("score"),score2El=document.getElementById("score2"),highEl=document.getElementById("highScore");
const levelEl=document.getElementById("level"),effectEl=document.getElementById("effect");
const overlay=document.getElementById("overlay"),overlayTitle=document.getElementById("overlayTitle"),overlayText=document.getElementById("overlayText");
const restart=document.getElementById("restart"),backMode=document.getElementById("backMode"),p2Hud=document.getElementById("p2Hud"),highHud=document.getElementById("highHud"),controls=document.getElementById("controls");

const CELL=24,COLS=25,ROWS=25;
let mode=1,snake1=[],snake2=[],dir1,nextDir1,dir2,nextDir2,foods=[];
let score1=0,score2=0,timer,running=false,paused=false,speed=120,obstacles=[],level=1,effectUntil=0;
let high=Number(localStorage.getItem("pikysSnakeHigh")||0);highEl.textContent=high;

const layouts=[
 [],
 [{x:6,y:7},{x:7,y:7},{x:8,y:7},{x:16,y:17},{x:17,y:17},{x:18,y:17}],
 [{x:5,y:6},{x:5,y:7},{x:5,y:8},{x:19,y:16},{x:19,y:17},{x:19,y:18},{x:11,y:12},{x:12,y:12},{x:13,y:12}],
 [{x:4,y:5},{x:5,y:5},{x:6,y:5},{x:18,y:5},{x:19,y:5},{x:20,y:5},{x:4,y:19},{x:5,y:19},{x:6,y:19},{x:18,y:19},{x:19,y:19},{x:20,y:19},{x:12,y:10},{x:12,y:11},{x:12,y:13},{x:12,y:14}],
 [{x:7,y:4},{x:7,y:5},{x:7,y:6},{x:7,y:18},{x:7,y:19},{x:7,y:20},{x:17,y:4},{x:17,y:5},{x:17,y:6},{x:17,y:18},{x:17,y:19},{x:17,y:20},{x:10,y:9},{x:11,y:9},{x:13,y:9},{x:14,y:9},{x:10,y:15},{x:11,y:15},{x:13,y:15},{x:14,y:15}]
];

function showModes(){
 clearInterval(timer);running=false;
 intro.classList.add("hidden");gameScreen.classList.add("hidden");modeScreen.classList.remove("hidden");
}
function startGame(m){
 mode=m;
 modeScreen.classList.add("hidden");gameScreen.classList.remove("hidden");
 p2Hud.classList.toggle("hidden",mode!==2);
 highHud.classList.toggle("hidden",mode===2);
 controls.textContent=mode===1 ? "WASD o Flechas · P = pausa · ESC = volver" : "Piky: WASD · Jugador 2: Flechas · P = pausa · ESC = volver";
 reset();
}
function reset(){
 clearInterval(timer);overlay.classList.add("hidden");paused=false;
 score1=0;score2=0;speed=120;level=1;effectEl.textContent="";
 snake1=mode===1
   ? [{x:12,y:12},{x:11,y:12},{x:10,y:12},{x:9,y:12}]
   : [{x:6,y:12},{x:5,y:12},{x:4,y:12},{x:3,y:12}];
 dir1={x:1,y:0};nextDir1={...dir1};

 if(mode===2){
   snake2=[{x:18,y:12},{x:19,y:12},{x:20,y:12},{x:21,y:12}];
   dir2={x:-1,y:0};nextDir2={...dir2};
 }else snake2=[];

 scoreEl.textContent=0;score2El.textContent=0;
 setLevel();placeFoods();running=true;draw();loop();
}
function loop(){clearInterval(timer);timer=setInterval(tick,speed)}
function allSnakes(){return mode===2?[...snake1,...snake2]:snake1}
function occupied(x,y){return allSnakes().some(p=>p.x===x&&p.y===y)||obstacles.some(p=>p.x===x&&p.y===y)}
function placeFoods(){
 foods=[];
 const cantidad=mode===2?2:1;
 for(let i=0;i<cantidad;i++){
   let f;
   do{
     f={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS),type:pickFoodType()};
   }while(occupied(f.x,f.y)||foods.some(q=>q.x===f.x&&q.y===f.y));
   foods.push(f);
 }
}
function pickFoodType(){
 const total=score1+score2;
 if(total<3||Math.random()<.68)return "apple";
 return ["shrink","grow","fast","slow"][Math.floor(Math.random()*4)];
}
function refillFoods(){
 const cantidad=mode===2?2:1;
 while(foods.length<cantidad){
   let f;
   do{
     f={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS),type:pickFoodType()};
   }while(occupied(f.x,f.y)||foods.some(q=>q.x===f.x&&q.y===f.y));
   foods.push(f);
 }
}
function setLevel(){
 const total=score1+score2;
 const newLevel=Math.min(5,1+Math.floor(total/5));
 level=newLevel;
 obstacles=layouts[level-1].filter(o=>!allSnakes().some(s=>s.x===o.x&&s.y===o.y));
 levelEl.textContent="NIVEL "+level;
}
function showEffect(t){effectUntil=Date.now()+1600;effectEl.textContent=t}
function applyFood(which,type){
 let snake=which===1?snake1:snake2;
 if(which===1)score1++;else score2++;
 scoreEl.textContent=score1;score2El.textContent=score2;

 if(type==="grow"){
   let tail=snake[snake.length-1];for(let i=0;i<3;i++)snake.push({...tail});
   showEffect((which===1?"PIKY":"J2")+" ¡SE ALARGA!");
 }
 if(type==="shrink"){
   for(let i=0;i<3&&snake.length>4;i++)snake.pop();
   showEffect((which===1?"PIKY":"J2")+" ¡SE ACHICA!");
 }
 if(type==="fast"){speed=Math.max(52,speed-18);loop();showEffect("¡TURBO!")}
 if(type==="slow"){speed=Math.min(180,speed+22);loop();showEffect("¡CÁMARA LENTA!")}
 if(type==="apple")showEffect((which===1?"PIKY":"J2")+" +1");

 setLevel();
}
function deadByWorld(head,snake,otherSnake){
 return head.x<0||head.y<0||head.x>=COLS||head.y>=ROWS||
   snake.some(p=>p.x===head.x&&p.y===head.y)||
   otherSnake.some(p=>p.x===head.x&&p.y===head.y)||
   obstacles.some(p=>p.x===head.x&&p.y===head.y);
}
function tick(){
 if(!running||paused)return;
 if(effectUntil&&Date.now()>effectUntil){effectEl.textContent="";effectUntil=0}

 dir1=nextDir1;
 if(mode===2)dir2=nextDir2;

 const h1={x:snake1[0].x+dir1.x,y:snake1[0].y+dir1.y};
 const h2=mode===2?{x:snake2[0].x+dir2.x,y:snake2[0].y+dir2.y}:null;

 let d1=deadByWorld(h1,snake1,snake2);
 let d2=mode===2?deadByWorld(h2,snake2,snake1):false;

 // choque de frente simultáneo
 if(mode===2 && h1.x===h2.x && h1.y===h2.y){d1=true;d2=true}

 if(d1||d2){gameOver(d1,d2);return}

 snake1.unshift(h1);
 if(mode===2)snake2.unshift(h2);

 let i1=foods.findIndex(f=>h1.x===f.x&&h1.y===f.y);
 let i2=mode===2?foods.findIndex(f=>h2.x===f.x&&h2.y===f.y):-1;

 if(i1>=0){
   const tipo=foods[i1].type;
   foods.splice(i1,1);
   applyFood(1,tipo);
 }else snake1.pop();

 // Recalcular para J2 porque J1 pudo haber quitado una comida del array.
 if(mode===2){
   i2=foods.findIndex(f=>h2.x===f.x&&h2.y===f.y);
   if(i2>=0){
     const tipo=foods[i2].type;
     foods.splice(i2,1);
     applyFood(2,tipo);
   }else snake2.pop();
 }

 refillFoods();
 draw();
}
function center(p){return{x:p.x*CELL+CELL/2,y:p.y*CELL+CELL/2}}
function drawSnake(snake,color,glow,glasses=false){
 if(!snake.length)return;
 ctx.save();
 ctx.strokeStyle=color;ctx.lineWidth=CELL-6;ctx.lineCap="round";ctx.lineJoin="round";
 ctx.shadowBlur=glow?12:0;ctx.shadowColor=color;
 ctx.beginPath();
 let tail=center(snake[snake.length-1]);ctx.moveTo(tail.x,tail.y);
 for(let i=snake.length-2;i>=0;i--){let p=center(snake[i]);ctx.lineTo(p.x,p.y)}
 ctx.stroke();
 ctx.shadowBlur=0;ctx.strokeStyle=glasses?"#7cf33e":"#ff9af1";ctx.lineWidth=4;ctx.globalAlpha=.3;ctx.stroke();ctx.restore();

 if(glasses){
   const h=snake[0],X=h.x*CELL,Y=h.y*CELL;
   ctx.strokeStyle="#ff2525";ctx.lineWidth=3;
   ctx.strokeRect(X+3,Y+7,7,7);ctx.strokeRect(X+14,Y+7,7,7);
   ctx.beginPath();ctx.moveTo(X+10,Y+10);ctx.lineTo(X+14,Y+10);ctx.stroke();
 }
}
function drawFood(food){
 const X=food.x*CELL+12,Y=food.y*CELL+12;
 if(food.type==="apple"){
   ctx.fillStyle="#ff3434";ctx.beginPath();ctx.arc(X,Y+1,8,0,Math.PI*2);ctx.fill();
   ctx.fillStyle="#63e66f";ctx.fillRect(X,Y-10,3,7);return;
 }
 const data={shrink:["−","#ff5c9d"],grow:["+","#6dff72"],fast:["⚡","#ffe342"],slow:["S","#53d9ff"]}[food.type];
 ctx.save();ctx.shadowBlur=12;ctx.shadowColor=data[1];ctx.fillStyle=data[1];
 ctx.beginPath();ctx.roundRect(X-9,Y-7,18,14,7);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle="#07100a";ctx.font="bold 13px Consolas";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(data[0],X,Y+1);ctx.restore();
}
function draw(){
 ctx.fillStyle="#03100a";ctx.fillRect(0,0,600,600);
 ctx.strokeStyle="#0b2417";ctx.lineWidth=1;
 for(let x=0;x<=600;x+=CELL){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,600);ctx.stroke()}
 for(let y=0;y<=600;y+=CELL){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(600,y);ctx.stroke()}
 obstacles.forEach(o=>{
   let X=o.x*CELL,Y=o.y*CELL;
   ctx.fillStyle="#145f34";ctx.fillRect(X+2,Y+2,CELL-4,CELL-4);
   ctx.fillStyle="#2cae55";ctx.fillRect(X+5,Y+5,CELL-10,5);
   ctx.strokeStyle="#66ff86";ctx.strokeRect(X+2,Y+2,CELL-4,CELL-4);
 });
 foods.forEach(drawFood);
 drawSnake(snake1,"#35d85f",false,true);
 if(mode===2)drawSnake(snake2,"#ff3adf",true,false);

 if(paused){ctx.fillStyle="#000b";ctx.fillRect(0,0,600,600);ctx.fillStyle="#ffe54d";ctx.font="bold 48px Consolas";ctx.textAlign="center";ctx.fillText("PAUSA",300,310);ctx.textAlign="left"}
}
function gameOver(d1,d2){
 running=false;clearInterval(timer);

 if(mode===1){
   if(score1>high){high=score1;localStorage.setItem("pikysSnakeHigh",high);highEl.textContent=high;overlayTitle.textContent="¡NUEVO RÉCORD!"}
   else overlayTitle.textContent="GAME OVER";
   overlayText.textContent=`Piky hizo ${score1} punto${score1===1?"":"s"} · nivel ${level}`;
 }else{
   if(d1&&d2)overlayTitle.textContent="¡EMPATE!";
   else if(d1)overlayTitle.textContent="¡GANA JUGADOR 2!";
   else overlayTitle.textContent="¡GANA PIKY!";
   overlayText.textContent=`Piky ${score1} - ${score2} Jugador 2 · nivel ${level}`;
 }
 overlay.classList.remove("hidden");
}
function setDirection(player,x,y){
 if(!running)return;
 if(player===1){
   if(x===-dir1.x&&y===-dir1.y)return;nextDir1={x,y};
 }else{
   if(x===-dir2.x&&y===-dir2.y)return;nextDir2={x,y};
 }
}
document.addEventListener("keydown",e=>{
 if(!intro.classList.contains("hidden")&&e.code==="Escape"){window.location.href="index.html";return}
 if(!intro.classList.contains("hidden")&&(e.code==="Space"||e.code==="Enter")){e.preventDefault();showModes();return}
 if(!modeScreen.classList.contains("hidden")&&e.code==="Escape"){modeScreen.classList.add("hidden");intro.classList.remove("hidden");return}
 if(!gameScreen.classList.contains("hidden"))e.preventDefault();

 if(e.code==="Escape"&&!gameScreen.classList.contains("hidden")){showModes();return}
 if(e.code==="KeyP"&&running){paused=!paused;draw();return}

 if(mode===1){
   if(e.code==="ArrowUp"||e.code==="KeyW")setDirection(1,0,-1);
   if(e.code==="ArrowDown"||e.code==="KeyS")setDirection(1,0,1);
   if(e.code==="ArrowLeft"||e.code==="KeyA")setDirection(1,-1,0);
   if(e.code==="ArrowRight"||e.code==="KeyD")setDirection(1,1,0);
 }else{
   if(e.code==="KeyW")setDirection(1,0,-1);
   if(e.code==="KeyS")setDirection(1,0,1);
   if(e.code==="KeyA")setDirection(1,-1,0);
   if(e.code==="KeyD")setDirection(1,1,0);

   if(e.code==="ArrowUp")setDirection(2,0,-1);
   if(e.code==="ArrowDown")setDirection(2,0,1);
   if(e.code==="ArrowLeft")setDirection(2,-1,0);
   if(e.code==="ArrowRight")setDirection(2,1,0);
 }
});
document.getElementById("onePlayer").onclick=()=>startGame(1);
document.getElementById("twoPlayers").onclick=()=>startGame(2);
restart.onclick=()=>reset();
backMode.onclick=()=>showModes();