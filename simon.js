const intro=document.querySelector("#intro"),wrap=document.querySelector("#wrap"),area=document.querySelector("#area"),pads=[...document.querySelectorAll(".pad")],roundEl=document.querySelector("#round"),highEl=document.querySelector("#high"),display=document.querySelector("#display"),statusEl=document.querySelector("#status");
let seq=[],pos=0,round=0,running=false,accept=false,paused=false,token=0,AC;
let high=+localStorage.getItem("fyditoSimonHigh")||0;
highEl.textContent=high;
const notes=[261.63,329.63,392,523.25],sleep=m=>new Promise(r=>setTimeout(r,m));

function tone(i,d=.2,bad=false){try{AC??=new(AudioContext||webkitAudioContext)();AC.resume();let o=AC.createOscillator(),g=AC.createGain();o.type=bad?"sawtooth":"square";o.frequency.value=bad?92:notes[i];g.gain.value=.045;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
async function light(i,d=300){pads[i].classList.add("active");tone(i,d/1000*.8);await sleep(d);pads[i].classList.remove("active")}
function setRound(n){round=n;roundEl.textContent=n;display.textContent=String(n).padStart(2,"0")}
function tempo(){return Math.max(240,520-(round-1)*18)}

async function next(){if(!running)return;accept=false;pos=0;setRound(round+1);seq.push(Math.floor(Math.random()*4));statusEl.textContent="MIRÁ Y ESCUCHÁ...";await sleep(600);let t=++token,speed=tempo();for(let i of seq){if(!running||paused||t!==token)return;await light(i,speed);await sleep(Math.max(80,speed*.28))}if(!running||paused||t!==token)return;statusEl.textContent="¡TU TURNO!";accept=true}

async function press(i){if(!running||paused||!accept)return;accept=false;await light(i,tempo());if(i!==seq[pos]){statusEl.textContent="¡NOOO! 😵";tone(0,.65,true);pads.forEach(p=>p.classList.add("active"));await sleep(180);pads.forEach(p=>p.classList.remove("active"));await sleep(600);gameOver();return}pos++;if(pos===seq.length){if(round>high){high=round;localStorage.setItem("fyditoSimonHigh",high);highEl.textContent=high}statusEl.textContent="¡BIEN!";await sleep(600);next()}else accept=true}

function start(){token++;seq=[];pos=0;setRound(0);running=true;accept=false;paused=false;area.classList.remove("paused");intro.classList.add("hidden");wrap.classList.remove("hidden");statusEl.textContent="PREPARADO...";setTimeout(next,650)}
function showIntro(){token++;running=false;accept=false;paused=false;area.classList.remove("paused");wrap.classList.add("hidden");intro.classList.remove("hidden")}
function gameOver(){running=false;accept=false;if(round>high){high=round;localStorage.setItem("fyditoSimonHigh",high);highEl.textContent=high}setTimeout(()=>{alert("GAME OVER · Ronda "+round+" · Récord "+high);showIntro()},60)}

async function replay(){if(!running||paused)return;accept=false;pos=0;statusEl.textContent="REPETIMOS...";let t=++token,speed=tempo();await sleep(350);for(let i of seq){if(!running||paused||t!==token)return;await light(i,speed);await sleep(Math.max(80,speed*.28))}if(running&&!paused&&t===token){statusEl.textContent="¡TU TURNO!";accept=true}}
function pause(){if(!running)return;paused=!paused;token++;area.classList.toggle("paused",paused);accept=false;if(!paused)replay()}

pads.forEach((p,i)=>p.onclick=()=>press(i));
intro.onclick=start;
const keys={Digit7:0,Numpad7:0,KeyW:0,ArrowUp:0,Digit9:1,Numpad9:1,KeyD:1,ArrowRight:1,Digit1:2,Numpad1:2,KeyA:2,ArrowLeft:2,Digit3:3,Numpad3:3,KeyS:3,ArrowDown:3};

document.addEventListener("keydown",e=>{
 if(!running&&!intro.classList.contains("hidden")&&(e.code==="Space"||e.code==="Enter")){e.preventDefault();start();return}
 if(e.code==="Escape"){e.preventDefault();if(running||!wrap.classList.contains("hidden"))showIntro();else location.href="index.html";return}
 if(e.code==="KeyP"&&running){e.preventDefault();pause();return}
 if(keys[e.code]!==undefined&&!e.repeat){e.preventDefault();press(keys[e.code])}
});
