const cv=document.getElementById("canvas"),g=cv.getContext("2d");
const portada=document.getElementById("portada"),juego=document.getElementById("juego"),cartel=document.getElementById("cartel");
const nombreNivel=document.getElementById("nombreNivel"),movEl=document.getElementById("movimientos"),faltanEl=document.getElementById("faltan");
const T=48,W=16,H=12;
let nivel=0,mapa=[],px=0,py=0,mov=0,jugando=false,pausa=false;

// Sokoban clásico: cualquier objeto puede ocupar cualquier marca.
// Los objetos sólo cambian visualmente para representar el desorden de la casa.
const niveles=[
{nombre:"NIVEL 1 — EL LIVING", objetos:["zapatilla","libro","juguete"], mapa:[
"################",
"#      #       #",
"#  .   #       #",
"#      #   .   #",
"#   $      #   #",
"###   ###  #   #",
"#      $       #",
"#  #       $   #",
"#  #   .       #",
"#      @       #",
"#              #",
"################"]},
{nombre:"NIVEL 2 — LA COCINA", objetos:["taza","olla","plato"], mapa:[
"################",
"#   #          #",
"# . #     .    #",
"#   #          #",
"#   ####  ###  #",
"#      $       #",
"#  $       #   #",
"#      #   $   #",
"#  .   #       #",
"#      @       #",
"#              #",
"################"]},
{nombre:"NIVEL 3 — CUARTO DE TOMY", objetos:["joystick","zapatilla","juguete","libro"], mapa:[
"################",
"# .    #       #",
"#      #   .   #",
"#  ##  #       #",
"#  $       ##  #",
"#      $       #",
"####       #   #",
"#  $   #   $   #",
"#  .   #   .   #",
"#      @       #",
"#              #",
"################"]},
{nombre:"NIVEL 4 — NUESTRO DORMITORIO", objetos:["ropa","zapatilla","libro","taza"], mapa:[
"################",
"# .  #         #",
"#    #     .   #",
"#    ###       #",
"# $        ##  #",
"#     $        #",
"# ##      #    #",
"#  $   #  $    #",
"#  .   #    .  #",
"#      @       #",
"#              #",
"################"]},
{nombre:"NIVEL 5 — EL BAÑO", objetos:["toalla","frasco","ropa"], mapa:[
"################",
"#     ####     #",
"# .            #",
"#     #   .    #",
"###   #        #",
"#   $ #        #",
"#     # $  ##  #",
"#  $           #",
"#       .      #",
"#      @       #",
"#              #",
"################"]},
{nombre:"NIVEL 6 — EL LAVADERO", objetos:["ropa","frasco","zapatilla","toalla"], mapa:[
"################",
"# .       #    #",
"#     .   #    #",
"# ###     #    #",
"#   $          #",
"#      $  ###  #",
"# ##           #",
"#  $    #  $   #",
"#  .    #   .  #",
"#      @       #",
"#              #",
"################"]},
{nombre:"NIVEL FINAL — TODA LA CASA", objetos:["ropa","libro","juguete","zapatilla","taza"], mapa:[
"################",
"# .  #     .   #",
"#    #         #",
"# ## ####  ##  #",
"# $      $     #",
"#    ##        #",
"###      ###   #",
"# $  # $    $  #",
"# .  #   .  .  #",
"#       @      #",
"#              #",
"################"]}
];

function cargar(n){
  nivel=n; mov=0; pausa=false;
  mapa=niveles[n].mapa.map(r=>r.padEnd(W," ").slice(0,W).split(""));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(mapa[y][x]=="@"){px=x;py=y;mapa[y][x]=" "}
  nombreNivel.textContent=niveles[n].nombre;
  actualizar(); cartel.classList.add("oculto"); dibujar();
}
function esPared(x,y){return x<0||y<0||x>=W||y>=H||mapa[y][x]=="#"}
function esObjeto(x,y){return mapa[y][x]=="$"||mapa[y][x]=="*"}
function esMarca(x,y){return mapa[y][x]=="."||mapa[y][x]=="*"}
function mover(dx,dy){
  if(!jugando||pausa)return;
  let nx=px+dx,ny=py+dy;if(esPared(nx,ny))return;
  if(esObjeto(nx,ny)){
    let bx=nx+dx,by=ny+dy;if(esPared(bx,by)||esObjeto(bx,by))return;
    let origen=mapa[ny][nx],dest=mapa[by][bx];
    mapa[ny][nx]=(origen=="*")?".":" ";
    mapa[by][bx]=(dest==".")?"*":"$";
  }
  px=nx;py=ny;mov++;actualizar();dibujar();
  if(contarFaltan()==0)ganar();
}
function contarFaltan(){let n=0;for(let r of mapa)for(let c of r)if(c=="$")n++;return n}
function actualizar(){movEl.textContent=mov;faltanEl.textContent=contarFaltan()}
function ganar(){
  jugando=false;
  cartel.innerHTML=`<strong>¡CADA COSA<br>EN SU LUGAR!</strong><br>${mov} movimientos<br><small>PRESIONÁ ESPACIO PARA CONTINUAR</small>`;
  cartel.classList.remove("oculto");
}
function siguiente(){
  if(nivel<niveles.length-1){jugando=true;cargar(nivel+1)}
  else{
    nivel=niveles.length;
    cartel.innerHTML=`<strong>¡CASA ORDENADA!</strong><br>Caritolina puede descansar.<br><small>Jordan y Tomy: NO TOQUEN NADA 😂<br><br>ESPACIO PARA VOLVER A LA PORTADA</small>`;
    cartel.classList.remove("oculto");
  }
}
function suelo(x,y){g.fillStyle=(x+y)%2?"#caa778":"#d6b586";g.fillRect(x*T,y*T,T,T);g.strokeStyle="#b78e61";g.strokeRect(x*T,y*T,T,T)}
function pared(x,y){let X=x*T,Y=y*T;g.fillStyle="#626975";g.fillRect(X,Y,T,T);g.fillStyle="#7b8490";g.fillRect(X+3,Y+3,T-6,10);g.fillStyle="#4c525c";g.fillRect(X+3,Y+17,T-6,T-20);g.strokeStyle="#343943";g.strokeRect(X,Y,T,T)}
function marca(x,y){let X=x*T+24,Y=y*T+24;g.fillStyle="#ff58aa33";g.beginPath();g.arc(X,Y,14,0,Math.PI*2);g.fill();g.strokeStyle="#ff58aa";g.lineWidth=3;g.beginPath();g.arc(X,Y,12,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(X-6,Y);g.lineTo(X+6,Y);g.moveTo(X,Y-6);g.lineTo(X,Y+6);g.stroke()}
function objeto(x,y,i,enMarca){
 let tipo=niveles[nivel].objetos[i%niveles[nivel].objetos.length],X=x*T+24,Y=y*T+24;
 g.save();g.translate(X,Y);
 if(enMarca){g.fillStyle="#56e78a55";g.fillRect(-19,-19,38,38)}
 if(tipo=="zapatilla"){g.fillStyle="#555";g.fillRect(-16,-5,29,14);g.fillStyle="#eee";g.fillRect(4,5,12,4)}
 else if(tipo=="libro"){g.fillStyle="#c73742";g.fillRect(-15,-15,30,30);g.fillStyle="#ffd65a";g.fillRect(-9,-12,3,24)}
 else if(tipo=="juguete"){g.fillStyle="#b97942";g.fillRect(-12,-10,24,23);g.beginPath();g.arc(-10,-11,6,0,7);g.arc(10,-11,6,0,7);g.fill()}
 else if(tipo=="joystick"){g.fillStyle="#292b32";g.fillRect(-17,-10,34,20);g.fillStyle="#ff4fa3";g.fillRect(-10,-2,8,4);g.fillStyle="#55d8ff";g.fillRect(8,-3,5,5)}
 else if(tipo=="ropa"){g.fillStyle="#e9eef9";g.fillRect(-10,-14,20,28);g.fillRect(-18,-12,9,12);g.fillRect(9,-12,9,12);g.fillStyle="#2d70ca";g.fillRect(-10,4,20,5)}
 else if(tipo=="taza"){g.fillStyle="#f5f5f5";g.fillRect(-11,-13,19,25);g.strokeStyle="#f5f5f5";g.lineWidth=4;g.strokeRect(7,-7,8,13)}
 else if(tipo=="olla"){g.fillStyle="#686b70";g.fillRect(-14,-9,28,21);g.fillStyle="#a8adb5";g.fillRect(-18,-13,36,5)}
 else if(tipo=="plato"){g.fillStyle="#edf7ff";g.beginPath();g.arc(0,0,16,0,7);g.fill();g.strokeStyle="#5aa8e9";g.stroke()}
 else if(tipo=="toalla"){g.fillStyle="#66d0cc";g.fillRect(-14,-17,28,34);g.fillStyle="#ffffff88";g.fillRect(-14,5,28,4)}
 else {g.fillStyle="#9ad16a";g.fillRect(-10,-16,20,32);g.fillStyle="#fff";g.fillRect(-6,-10,12,11)}
 g.restore();
}
function caro(){
 let X=px*T,Y=py*T;
 // pelo castaño largo
 g.fillStyle="#4b2a18";g.fillRect(X+10,Y+3,28,13);g.fillRect(X+7,Y+10,8,26);g.fillRect(X+33,Y+10,7,28);
 g.fillStyle="#70401f";g.fillRect(X+14,Y+4,17,5);
 // cara
 g.fillStyle="#efd0a7";g.fillRect(X+14,Y+10,20,18);g.fillStyle="#402016";g.fillRect(X+17,Y+17,4,4);g.fillRect(X+28,Y+17,4,4);g.fillStyle="#f05a9c";g.fillRect(X+22,Y+23,7,3);
 // ambo azul y vivos fucsias
 g.fillStyle="#286dc4";g.fillRect(X+10,Y+28,29,14);g.fillStyle="#ff4fa3";g.fillRect(X+10,Y+28,29,4);g.fillRect(X+22,Y+32,5,10);
 g.fillStyle="#efd0a7";g.fillRect(X+5,Y+30,6,11);g.fillRect(X+39,Y+30,6,11);
 g.fillStyle="#174b95";g.fillRect(X+14,Y+42,9,5);g.fillRect(X+27,Y+42,9,5);g.fillStyle="#555";g.fillRect(X+12,Y+46,12,2);g.fillRect(X+26,Y+46,12,2);
}
function dibujar(){
 g.clearRect(0,0,cv.width,cv.height);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(mapa[y][x]=="#")pared(x,y);else{suelo(x,y);if(esMarca(x,y))marca(x,y)}}
 let idx=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(esObjeto(x,y))objeto(x,y,idx++,mapa[y][x]=="*");
 caro();
 if(pausa){g.fillStyle="#050710cc";g.fillRect(0,0,cv.width,cv.height);g.fillStyle="#ffdf45";g.font="bold 48px Consolas";g.textAlign="center";g.fillText("PAUSA",cv.width/2,cv.height/2);g.textAlign="left"}
}
document.addEventListener("keydown",e=>{
 if(!portada.classList.contains("oculto")&&(e.code=="Space"||e.code=="Enter")){e.preventDefault();portada.classList.add("oculto");juego.classList.remove("oculto");jugando=true;cargar(0);return}
 if(!jugando&&portada.classList.contains("oculto")&&e.code=="Space"){e.preventDefault();if(nivel>=niveles.length){juego.classList.add("oculto");portada.classList.remove("oculto")}else siguiente();return}
 if(e.code=="Escape"){if(!portada.classList.contains("oculto")){window.location.href="index.html";return} jugando=false;juego.classList.add("oculto");portada.classList.remove("oculto");return}
 if(e.code=="KeyR"&&nivel<niveles.length){jugando=true;cargar(nivel);return}
 if(e.code=="KeyP"&&jugando){pausa=!pausa;dibujar();return}
 let d={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]}[e.code];
 if(d){e.preventDefault();mover(...d)}
});