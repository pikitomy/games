/* Piky's GAMES - ranking global; API DonWeb, frontend GitHub Pages. */
(()=>{'use strict';
const API='https://sigri.com.ar/herramientas/arcade_api/';
const game=document.currentScript?.dataset.game;
if(!['snake','pong','breakout','simon','sokoban','invaders','workers'].includes(game))return;
let latest=null,showing=false;
const safe=t=>String(t??'');
const button=document.createElement('button');button.id='pikyRankButton';button.type='button';button.textContent='🏆 TOP 10';
const modal=document.createElement('div');modal.id='pikyRankModal';modal.hidden=true;
modal.innerHTML='<section id="pikyRankCard" role="dialog" aria-modal="true" aria-label="Ranking"><h2>🏆 RÉCORDS</h2><div id="pikyRankContent"></div><p id="pikyRankStatus" role="status"></p><button type="button" id="pikyRankClose">CERRAR</button></section>';
document.body.append(button,modal);
const content=modal.querySelector('#pikyRankContent'),status=modal.querySelector('#pikyRankStatus');
const names={snake:'PIKY’S SNAKE',pong:'TOMY VS. VALEN',breakout:'TOMY’S BREAKOUT',simon:'FYDITO’S SIMON',sokoban:'CARITOLINA',invaders:'VALEN VS. MARCIANOS',workers:'VALEN & THE WORKERS'};
modal.querySelector('h2').textContent='🏆 '+names[game];
function clear(){content.replaceChildren();status.textContent=''}
async function getTop(){const r=await fetch(API+'top10.php?juego='+encodeURIComponent(game),{cache:'no-store'});if(!r.ok)throw Error('Servidor no disponible');const d=await r.json();if(!d.ok||!Array.isArray(d.records))throw Error('Respuesta inválida');return d.records}
function render(records){const ol=document.createElement('ol');records.forEach((r,i)=>{const li=document.createElement('li'),n=document.createElement('span'),v=document.createElement('b');n.textContent=(i+1)+'. '+safe(r.nombre);v.textContent=Number(r.puntaje).toLocaleString('es-AR');li.append(n,v);ol.append(li)});content.append(ol);if(!records.length){const p=document.createElement('p');p.textContent='Todavía no hay récords. ¡Inaugurá la tabla!';content.append(p)}}
async function open(score=null){latest=Number.isSafeInteger(score)&&score>=0?score:null;showing=true;modal.hidden=false;clear();status.textContent='Consultando récords…';let top;
try{top=await getTop()}catch(e){status.textContent='No se pudo conectar con el ranking. El juego sigue funcionando sin conexión.';return}
if(!showing)return;render(top);status.textContent='';
if(latest===null)return;
const qualifies=top.length<10||latest>Number(top[9].puntaje);
const p=document.createElement('p');p.textContent='Tu puntaje: '+latest.toLocaleString('es-AR')+(qualifies?' · ¡Entrás al Top 10!':' · Seguí intentando para entrar al Top 10.');content.prepend(p);
if(!qualifies)return;
const input=document.createElement('input');input.type='text';input.maxLength=20;input.placeholder='Tu nombre (máximo 20 caracteres)';input.autocomplete='nickname';input.value=localStorage.getItem('pikyRankingName')||'';
const save=document.createElement('button');save.type='button';save.textContent='GUARDAR RÉCORD';content.append(input,save);
save.onclick=async()=>{const nombre=input.value.trim();if(!nombre||Array.from(nombre).length>20){status.textContent='Escribí un nombre de hasta 20 caracteres.';return}save.disabled=true;status.textContent='Guardando…';try{const r=await fetch(API+'guardar.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({juego:game,nombre,puntaje:latest})});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'No se pudo guardar');localStorage.setItem('pikyRankingName',nombre);clear();render(await getTop());status.textContent='¡Récord guardado! 🎉';latest=null}catch(e){status.textContent=e.message||'No se pudo guardar';save.disabled=false}};
}
function close(){showing=false;modal.hidden=true;latest=null}
button.onclick=()=>open();modal.querySelector('#pikyRankClose').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
window.addEventListener('keydown',e=>{if(!modal.hidden){e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();close()}}},true);
window.PikyRanking={show:score=>open(Number(score)),open:()=>open()};
})();