const c=document.getElementById("game"),x=c.getContext("2d"),intro=document.getElementById("intro"),wrap=document.getElementById("wrap"),scoreEl=document.getElementById("score"),highEl=document.getElementById("high");
let keys={},paddle,balls=[],bricks=[],caps=[],score=0,lives=3,level=1,running=false,paused=false,launched=false,msg="",msgUntil=0,shield=0;
let high=+localStorage.getItem("tomysBreakoutHigh")||0;highEl.textContent=high;
let AC;function sound(f=440,d=.05){try{AC??=new (AudioContext||webkitAudioContext)();AC.resume();let o=AC.createOscillator(),g=AC.createGain();o.type="square";o.frequency.value=f;g.gain.value=.025;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
const COLORS=["#ff3b5c","#ff8a28","#ffe135","#56ef72","#39d7ff","#8c65ff","#ff4fd8"];
const POW={BIG:{icon:"B",name:"BIG PADDLE!",col:"#56ef72"},SMALL:{icon:"M",name:"MINI PADDLE!",col:"#ff3b5c"},MULTI:{icon:"3",name:"MULTIBALL!",col:"#ff4fd8"},LIFE:{icon:"+",name:"EXTRA LIFE!",col:"#ff6688"},SLOW:{icon:"S",name:"SLOW BALL!",col:"#39d7ff"},FAST:{icon:"F",name:"FAST BALL!",col:"#ff8a28"},SHIELD:{icon:"D",name:"SHIELD!",col:"#ffe135"}};
function build(){bricks=[];let rows=Math.min(4+level,9),cols=12,bw=64,bh=22,g=7,start=(900-(cols*bw+(cols-1)*g))/2;for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){if(level>2&&level%3===0&&(q+r)%5===0)continue;bricks.push({x:start+q*(bw+g),y:65+r*(bh+g),w:bw,h:bh,color:COLORS[r%COLORS.length],alive:true})}}
function spawnBall(){balls=[{x:paddle.x+paddle.w/2,y:paddle.y-10,r:7,vx:4.1+level*.18,vy:-(5+level*.12)}];launched=false}
function reset(){score=0;lives=3;level=1;paddle={x:390,y:555,w:120,h:14,s:8};caps=[];shield=0;build();spawnBall();scoreEl.textContent=0;running=true;paused=false;requestAnimationFrame(loop)}
function circleRect(b,r){let nx=Math.max(r.x,Math.min(b.x,r.x+r.w)),ny=Math.max(r.y,Math.min(b.y,r.y+r.h));return (b.x-nx)**2+(b.y-ny)**2<b.r*b.r}
function possiblePower(){if(level<2)return null;let a=["BIG","SLOW"];if(level>=3)a.push("MULTI");if(level>=4)a.push("LIFE","SMALL","FAST");if(level>=5)a.push("SHIELD");return a[Math.floor(Math.random()*a.length)]}
function drop(br){let chance=Math.min(.09+(level-2)*.012,.17);if(Math.random()<chance){let type=possiblePower();if(type)caps.push({x:br.x+br.w/2,y:br.y+br.h/2,type,vy:2.25})}}
function flash(t){msg=t;msgUntil=performance.now()+1100}
function power(type){sound(1100,.12);if(type==="BIG")paddle.w=Math.min(210,paddle.w+55);if(type==="SMALL")paddle.w=Math.max(65,paddle.w-45);if(type==="LIFE")lives++;if(type==="SLOW")balls.forEach(b=>{b.vx*=.72;b.vy*=.72});if(type==="FAST")balls.forEach(b=>{b.vx*=1.28;b.vy*=1.28});if(type==="SHIELD")shield=1;if(type==="MULTI"&&balls.length){let originals=[...balls];for(let b of originals){if(balls.length>=6)break;balls.push({...b,vx:-b.vx*1.02,vy:b.vy*.98});balls.push({...b,vx:b.vx*.72,vy:-Math.abs(b.vy)*1.05})}}flash(POW[type].name)}
function update(){if(keys.ArrowLeft||keys.KeyA)paddle.x-=paddle.s;if(keys.ArrowRight||keys.KeyD)paddle.x+=paddle.s;paddle.x=Math.max(5,Math.min(895-paddle.w,paddle.x));
if(!launched&&balls.length){balls[0].x=paddle.x+paddle.w/2;balls[0].y=paddle.y-10;return}
for(let b of balls){b.x+=b.vx;b.y+=b.vy;if(b.x-b.r<0||b.x+b.r>900){b.vx*=-1;sound(230)}if(b.y-b.r<0){b.vy=Math.abs(b.vy);sound(270)}
if(b.vy>0&&circleRect(b,paddle)){b.y=paddle.y-b.r;b.vy=-Math.abs(b.vy);b.vx=((b.x-(paddle.x+paddle.w/2))/(paddle.w/2))*7;sound(480)}
if(shield&&b.y+b.r>=590&&b.vy>0){b.y=582;b.vy=-Math.abs(b.vy);shield=0;flash("SHIELD SAVE!");sound(850,.12)}
for(let br of bricks)if(br.alive&&circleRect(b,br)){br.alive=false;b.vy*=-1;score+=10*level;scoreEl.textContent=score;drop(br);sound(650+Math.random()*250);break}}
balls=balls.filter(b=>b.y<625);
for(let cp of caps){cp.y+=cp.vy;if(cp.y+10>paddle.y&&cp.y-10<paddle.y+paddle.h&&cp.x>paddle.x&&cp.x<paddle.x+paddle.w){power(cp.type);cp.y=999}}caps=caps.filter(cp=>cp.y<610);
if(!balls.length){lives--;if(lives<=0){gameOver();return}paddle.w=120;spawnBall()}
if(bricks.every(b=>!b.alive)){level++;paddle.w=120;caps=[];shield=0;build();spawnBall();flash("LEVEL "+level);sound(1000,.18)}}
function draw(){x.fillStyle="#03030b";x.fillRect(0,0,900,600);for(let i=0;i<75;i++){x.fillStyle=i%8?"#14142d":"#5555aa";x.fillRect((i*137)%900,(i*83)%530,2,2)}
bricks.forEach(b=>{if(!b.alive)return;x.fillStyle=b.color;x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle="#ffffff55";x.fillRect(b.x+3,b.y+3,b.w-6,3)});
if(shield){x.fillStyle="#ffe135";x.fillRect(0,590,900,5)}x.fillStyle="#f7f7ff";x.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);x.fillStyle="#00eaff";x.fillRect(paddle.x+7,paddle.y+4,paddle.w-14,5);
x.fillStyle="#fff";balls.forEach(b=>{x.beginPath();x.arc(b.x,b.y,b.r,0,Math.PI*2);x.fill()});
for(let cp of caps){let P=POW[cp.type];x.fillStyle=P.col;x.fillRect(cp.x-13,cp.y-9,26,18);x.strokeStyle="#fff";x.strokeRect(cp.x-13,cp.y-9,26,18);x.fillStyle="#000";x.font="bold 13px Consolas";x.textAlign="center";x.fillText(P.icon,cp.x,cp.y+5)}x.textAlign="left";
x.fillStyle="#fff";x.font="17px Consolas";x.fillText("VIDAS: "+"● ".repeat(Math.min(lives,8)),15,28);x.fillText("NIVEL "+level,800,28);
if(performance.now()<msgUntil){x.textAlign="center";x.font="bold 34px Consolas";x.fillStyle="#ffe600";x.fillText(msg,450,330);x.textAlign="left"}
if(paused){x.fillStyle="#000b";x.fillRect(0,0,900,600);x.fillStyle="#ffe600";x.font="bold 50px Consolas";x.fillText("PAUSA",360,310)}}
function gameOver(){running=false;if(score>high){high=score;localStorage.setItem("tomysBreakoutHigh",high);highEl.textContent=high}setTimeout(()=>{alert("GAME OVER · "+score+" puntos · Nivel "+level);showIntro()},50)}
function showIntro(){running=false;wrap.classList.add("hidden");intro.classList.remove("hidden")}
function loop(){if(!running)return;if(!paused)update();draw();requestAnimationFrame(loop)}
function start(){intro.classList.add("hidden");wrap.classList.remove("hidden");reset()}
document.addEventListener("keydown",e=>{if(!running&&(e.code==="Space"||e.code==="Enter")&&!intro.classList.contains("hidden")){e.preventDefault();start();return}keys[e.code]=true;if(e.code==="Space"&&running){e.preventDefault();launched=true}if(e.code==="KeyP"&&running)paused=!paused;if(e.code==="Escape"){if(running)showIntro();else if(!intro.classList.contains("hidden"))window.location.href="index.html"}});
document.addEventListener("keyup",e=>keys[e.code]=false);