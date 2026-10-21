/* ===========================================================
   SITO DELLE OPERE — logica della pagina
   I contenuti NON stanno qui: vivono nella cartella "contenuti"
   e si modificano dal pannello Pages CMS.
   =========================================================== */

/* ---------- 1. SCHIZZO DI COLORE ---------- */
const tinte=['#a8522e','#bf8c2c','#5e6a44','#2f5752'];

/* generatore di numeri casuali: con lo stesso seme rifà lo stesso schizzo */
function rng(seme){
  let t=seme>>>0;
  return()=>{t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return((r^r>>>14)>>>0)/4294967296};
}
function mischia(a,rand){
  const v=[...a];
  for(let i=v.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[v[i],v[j]]=[v[j],v[i]];}
  return v;
}
/* macchia irregolare: raggi variabili, con qualche punta più lunga */
function macchia(cx,cy,r,rand,irr=.5,punte=.22){
  const n=14,p=[];
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2+(rand()-.5)*.26;
    let rr=r*(1-irr/2+rand()*irr);
    if(rand()<punte) rr*=1.45+rand()*.85;
    p.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.95]);
  }
  const m=(u,v)=>[((u[0]+v[0])/2).toFixed(1),((u[1]+v[1])/2).toFixed(1)];
  let d=`M${m(p[n-1],p[0]).join(' ')}`;
  for(let i=0;i<n;i++) d+=` Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${m(p[i],p[(i+1)%n]).join(' ')}`;
  return d+'Z';
}
/* pennellata: curva piena, larga al centro e assottigliata alle estremità */
function pennellata(cx,cy,base,rand){
  const ang=rand()*Math.PI*2, len=base*(1.7+rand()*1.2);
  const x0=cx-Math.cos(ang)*len/2, y0=cy-Math.sin(ang)*len/2;
  const x2=cx+Math.cos(ang)*len/2, y2=cy+Math.sin(ang)*len/2;
  const curva=(rand()-.5)*base*1.5;
  const qx=(x0+x2)/2+Math.cos(ang+Math.PI/2)*curva;
  const qy=(y0+y2)/2+Math.sin(ang+Math.PI/2)*curva;
  const N=26, wmax=base*(.13+rand()*.14), sx=[], dx=[];
  for(let i=0;i<=N;i++){
    const t=i/N, u=1-t;
    const x=u*u*x0+2*u*t*qx+t*t*x2, y=u*u*y0+2*u*t*qy+t*t*y2;
    const tx=2*u*(qx-x0)+2*t*(x2-qx), ty=2*u*(qy-y0)+2*t*(y2-qy);
    const l=Math.hypot(tx,ty)||1, nx=-ty/l, ny=tx/l;
    const w=wmax*Math.pow(Math.sin(Math.PI*t),.5)*(.72+rand()*.56);
    sx.push([x+nx*w,y+ny*w]); dx.push([x-nx*w,y-ny*w]);
  }
  const pt=[...sx,...dx.reverse()];
  return 'M'+pt.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L')+'Z';
}
/* colatura: rivolo che scende e finisce in una goccia */
function colatura(x,y,len,rand){
  const w=1.5+rand()*2.4, w2=.8+rand()*1.1, sposta=(rand()-.5)*12;
  const xf=x+sposta;
  return {d:`M${(x-w).toFixed(1)} ${y.toFixed(1)} C${(x-w).toFixed(1)} ${(y+len*.55).toFixed(1)} ${(xf-w2).toFixed(1)} ${(y+len*.8).toFixed(1)} ${xf.toFixed(1)} ${(y+len).toFixed(1)}`
        +` C${(xf+w2).toFixed(1)} ${(y+len*.8).toFixed(1)} ${(x+w).toFixed(1)} ${(y+len*.55).toFixed(1)} ${(x+w).toFixed(1)} ${y.toFixed(1)} Z`,
          gx:xf, gy:y+len, gr:w2*1.7+.8};
}
/* raggio: lingua di colore che parte dalla massa e finisce in una goccia */
function raggio(cx,cy,ang,r0,len,wid,rand){
  const N=14,sx=[],dx=[],curv=(rand()-.5)*.55;
  let fx=cx,fy=cy;
  for(let i=0;i<=N;i++){
    const t=i/N, a=ang+curv*t, d=r0+len*t;
    const x=cx+Math.cos(a)*d, y=cy+Math.sin(a)*d;
    const nx=-Math.sin(a), ny=Math.cos(a);
    const w=wid*Math.pow(1-t,.9)*(.65+rand()*.6)+.35;
    sx.push([x+nx*w,y+ny*w]); dx.push([x-nx*w,y-ny*w]);
    fx=x; fy=y;
  }
  return {d:'M'+[...sx,...dx.reverse()].map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L')+'Z',
          gx:fx, gy:fy, gr:.8+rand()*2.2};
}
/* composizione completa dello schizzo */
function schizzo(seme,opt={}){
  const rand=rng(seme);
  const {w=400,h=400,cx=w/2,cy=h/2,base=96,pennellate=2,gocce=true,spruzzi=22}=opt;
  const c=mischia(tinte,rand);
  const dentro=(x,y,m=4)=>x>m&&x<w-m&&y>m&&y<h-m;
  let s='';
  for(let i=0;i<pennellate;i++)
    s+=`<path d="${pennellata(cx+(rand()-.5)*base*.5,cy+(rand()-.5)*base*.6,base*.95,rand)}"
         fill='${c[(i+1)%c.length]}' opacity='${(.36+rand()*.2).toFixed(2)}'/>`;
  const nr=4+Math.floor(rand()*3);
  for(let i=0;i<nr;i++){
    const ang=rand()*Math.PI*2;
    const r=raggio(cx,cy,ang,base*(.45+rand()*.3),base*(.5+rand()*1.05),base*(.055+rand()*.075),rand);
    const t=c[Math.floor(rand()*c.length)];
    if(!dentro(r.gx,r.gy,8)) continue;
    s+=`<path d="${r.d}" fill='${t}' opacity='${(.55+rand()*.3).toFixed(2)}'/>
        <circle cx='${r.gx.toFixed(1)}' cy='${r.gy.toFixed(1)}' r='${r.gr.toFixed(1)}' fill='${t}' opacity='.75'/>`;
  }
  s+=`<path d="${macchia(cx,cy,base*.76,rand,.52,.28)}" fill='${c[0]}' opacity='.9'/>`;
  for(let i=0;i<2+Math.floor(rand()*2);i++){
    const a=rand()*Math.PI*2, dist=base*(.2+rand()*.45);
    s+=`<path d="${macchia(cx+Math.cos(a)*dist,cy+Math.sin(a)*dist,base*(.2+rand()*.26),rand,.7,.32)}"
         fill='${c[(i+1)%c.length]}' opacity='${(.55+rand()*.3).toFixed(2)}'/>`;
  }
  s+=`<path d="${pennellata(cx+(rand()-.5)*base*.5,cy+(rand()-.5)*base*.5,base*.85,rand)}"
       fill='${c[c.length-1]}' opacity='${(.3+rand()*.2).toFixed(2)}'/>`;
  for(let i=0;i<6+Math.floor(rand()*5);i++){
    const a=rand()*Math.PI*2, dist=base*(.85+rand()*1.15);
    const gx=cx+Math.cos(a)*dist, gy=cy+Math.sin(a)*dist*.92;
    if(!dentro(gx,gy,10)) continue;
    s+=`<path d="${macchia(gx,gy,base*(.035+rand()*.12),rand,.72,.38)}"
         fill='${c[Math.floor(rand()*c.length)]}' opacity='${(.5+rand()*.4).toFixed(2)}'/>`;
  }
  if(gocce) for(let i=0;i<1+Math.floor(rand()*2);i++){
    const col=colatura(cx+(rand()-.5)*base, cy+base*(.45+rand()*.25), base*(.25+rand()*.5), rand);
    const t=c[Math.floor(rand()*c.length)];
    if(!dentro(col.gx,col.gy,8)) continue;
    s+=`<path d="${col.d}" fill='${t}' opacity='.7'/>
        <circle cx='${col.gx.toFixed(1)}' cy='${col.gy.toFixed(1)}' r='${col.gr.toFixed(1)}' fill='${t}' opacity='.75'/>`;
  }
  for(let i=0;i<spruzzi;i++){
    const a=rand()*Math.PI*2, dist=base*(.8+rand()*1.45);
    const x=cx+Math.cos(a)*dist, y=cy+Math.sin(a)*dist*.95;
    if(!dentro(x,y)) continue;
    s+=`<ellipse cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' rx='${(.7+rand()*3).toFixed(1)}' ry='${(.7+rand()*2.1).toFixed(1)}'
         transform='rotate(${(rand()*180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})'
         fill='${c[Math.floor(rand()*c.length)]}' opacity='${(.35+rand()*.45).toFixed(2)}'/>`;
  }
  return s;
}
/* segnaposto per le opere senza fotografia: schizzo su fondo carta,
   sempre uguale per ciascuna posizione dell'elenco */
function segnaposto(i){
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
    <rect width='400' height='500' fill='#e9e2d4'/>
    <g style='mix-blend-mode:multiply' opacity='.78'>
      ${schizzo(1000+i*977,{w:400,h:500,cy:250,base:96,pennellate:2,spruzzi:18})}
    </g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
/* indirizzo dell'immagine da mostrare.
   grande=true → versione ad alta risoluzione per l'ingrandimento,
   se caricata; altrimenti si usa l'unica disponibile. */
function fonte(o,grande){
  if(grande && o.immagine_grande) return o.immagine_grande;
  if(o.immagine) return o.immagine;
  if(o.immagine_grande) return o.immagine_grande;
  return segnaposto(o._i);
}
/* didascalia: tecnica · misure · anno, saltando i campi vuoti */
function didascalia(o){
  return [o.tecnica,o.misure,o.anno].filter(Boolean).join(' · ');
}

/* ---------- 2. CARICAMENTO DEI CONTENUTI ---------- */
const $=id=>document.getElementById(id);
const testo=(id,v)=>{const el=$(id); if(el) el.textContent=v||'';};
let opere=[], visibili=[];

async function leggi(nome){
  const r=await fetch(`contenuti/${nome}.json?v=${Date.now()}`);
  if(!r.ok) throw new Error(`${nome}.json non raggiungibile (${r.status})`);
  return r.json();
}

async function avvia(){
  let sito,datiOpere,esposizioni,critiche;
  try{
    [sito,datiOpere,esposizioni,critiche]=await Promise.all(
      ['sito','opere','esposizioni','critiche'].map(leggi));
  }catch(err){
    console.error('Contenuti non caricati:',err);
    $('grid').innerHTML=`<p style="grid-column:1/-1">I contenuti non sono stati caricati.
      Se stai aprendo il file con un doppio clic, usa invece un piccolo server locale
      (<code>python3 -m http.server</code>) oppure guarda il sito già pubblicato.</p>`;
    return;
  }

  /* intestazione e pagina */
  document.title=`${sito.nome} — ${sito.ruolo}`;
  const md=$('meta-descrizione'); if(md) md.content=sito.descrizione_sito||'';
  testo('marca-nome',sito.nome); testo('marca-ruolo',sito.ruolo); testo('pie-nome',sito.nome);

  /* apertura */
  const a=sito.apertura||{};
  testo('a-occhiello',a.occhiello); testo('a-titolo',a.titolo);
  testo('a-titolo-corsivo',a.titolo_corsivo); testo('a-intro',a.introduzione);
  if(a.pulsante1) testo('a-pulsante1',a.pulsante1);
  if(a.pulsante2) testo('a-pulsante2',a.pulsante2);

  /* citazione */
  const c=sito.citazione||{};
  testo('cit-testo',c.testo?`«${c.testo}»`:''); testo('cit-autore',c.autore);

  /* biografia */
  const b=sito.biografia||{};
  if(b.ritratto) $('bio-ritratto').style.backgroundImage=`url('${b.ritratto}')`;
  testo('bio-apertura',b.apertura);
  $('bio-paragrafi').innerHTML='';
  (b.paragrafi||[]).forEach(p=>{
    const el=document.createElement('p'); el.textContent=p; $('bio-paragrafi').appendChild(el);
  });
  $('bio-numeri').innerHTML='';
  (b.numeri||[]).forEach(n=>{
    const d=document.createElement('div');
    const s=document.createElement('strong'); s.textContent=n.valore||'';
    const e=document.createElement('span'); e.textContent=n.etichetta||'';
    d.append(s,e); $('bio-numeri').appendChild(d);
  });

  /* contatti */
  const k=sito.contatti||{};
  testo('con-intro',k.introduzione);
  const em=$('con-email'); em.textContent=k.email||''; em.href=`mailto:${k.email||''}`;
  testo('con-studio',k.studio); testo('con-opere',k.nota_opere);
  $('chiave').value=k.chiave_web3forms||'';
  $('mittente').value=`Sito di ${sito.nome||''}`;

  /* mostre */
  const um=$('elenco-mostre'); um.innerHTML='';
  (esposizioni.mostre||[]).forEach(m=>{
    const li=document.createElement('li');
    const an=document.createElement('div'); an.className='yr'; an.textContent=m.anno||'';
    const bx=document.createElement('div');
    const h=document.createElement('h3'); h.textContent=m.titolo||'';
    const p=document.createElement('p'); p.textContent=m.sede||'';
    bx.append(h,p);
    if(m.tipo){const t=document.createElement('span'); t.className='tag'; t.textContent=m.tipo; bx.appendChild(t);}
    li.append(an,bx); um.appendChild(li);
  });

  /* cataloghi */
  const uc=$('elenco-cataloghi'); uc.innerHTML='';
  (esposizioni.cataloghi||[]).forEach(c2=>{
    const d=document.createElement('div'); d.className='cat';
    const cov=document.createElement('div'); cov.className='cov'; cov.setAttribute('aria-hidden','true');
    if(c2.copertina){cov.style.backgroundImage=`url('${c2.copertina}')`;cov.style.backgroundSize='cover';}
    const bx=document.createElement('div');
    const h=document.createElement('h3'); h.textContent=c2.titolo||'';
    const p=document.createElement('p'); p.textContent=c2.dettagli||'';
    bx.append(h,p); d.append(cov,bx); uc.appendChild(d);
  });

  /* critiche */
  const q=$('elenco-critiche'); q.innerHTML='';
  (critiche.critiche||[]).forEach(cr=>{
    const bq=document.createElement('blockquote'); bq.className='rv';
    const p=document.createElement('p'); p.textContent=cr.testo||'';
    const ci=document.createElement('cite'); ci.textContent=cr.fonte||'';
    bq.append(p,ci); q.appendChild(bq);
  });

  /* opere */
  opere=datiOpere.opere||[];
  costruisciFiltri();
  render('Tutte');

  osserva();
}

/* ---------- 3. GALLERIA ----------
   Il numero di opere è libero: la griglia si allarga da sola.
   Per non far pesare pagine con molte opere, se ne mostrano
   PASSO alla volta e le fotografie si caricano via via che
   si scorre (loading="lazy"). */
const PASSO=12;
let filtro='Tutte', quante=PASSO;

function costruisciFiltri(){
  const filters=$('filters'); filters.innerHTML='';
  ['Tutte',...new Set(opere.map(o=>o.categoria).filter(Boolean))].forEach((c,i)=>{
    const b=document.createElement('button'); b.type='button'; b.textContent=c; if(!i) b.className='on';
    b.addEventListener('click',()=>{
      [...filters.children].forEach(x=>x.classList.remove('on'));
      b.classList.add('on'); render(c);
    });
    filters.appendChild(b);
  });
}

function render(f,azzera=true){
  if(f!==undefined) filtro=f;
  if(azzera) quante=PASSO;
  const grid=$('grid'); grid.innerHTML='';
  visibili=opere.map((o,i)=>({...o,_i:i}))
                .filter(o=>filtro==='Tutte'||o.categoria===filtro);

  visibili.slice(0,quante).forEach((o,n)=>{
    const b=document.createElement('button'); b.className='card'; b.type='button';
    const fr=document.createElement('div'); fr.className='frame';
    const im=document.createElement('img');
    im.src=fonte(o,false);
    im.alt=[o.titolo,didascalia(o)].filter(Boolean).join(' — ');
    im.loading='lazy'; im.decoding='async';
    const look=document.createElement('span'); look.className='look'; look.textContent='Ingrandisci';
    fr.append(im,look);
    const h=document.createElement('h3'); h.textContent=o.titolo||'';
    const p=document.createElement('p'); p.textContent=didascalia(o);
    b.append(fr,h,p);
    b.addEventListener('click',()=>apri(n));
    grid.appendChild(b);
  });

  const piu=$('piu');
  if(visibili.length>quante){
    piu.hidden=false;
    piu.textContent=`Mostra altre opere (${quante} di ${visibili.length})`;
  }else{
    piu.hidden=true;
  }
}
$('piu').addEventListener('click',()=>{ quante+=PASSO; render(undefined,false); });

/* ---------- 4. INGRANDIMENTO ---------- */
const lb=$('lb');
let cur=0;
function apri(n){cur=n;mostra();lb.classList.add('open');document.body.style.overflow='hidden';$('lbx').focus();}
function mostra(){
  const o=visibili[cur];
  const im=$('lbpic');
  im.src=fonte(o,true);                 /* alta risoluzione, se caricata */
  im.alt=[o.titolo,didascalia(o)].filter(Boolean).join(' — ');
  $('lbcap').innerHTML='';
  const h=document.createElement('h3'); h.textContent=o.titolo||'';
  const p=document.createElement('p'); p.textContent=didascalia(o);
  $('lbcap').append(h,p);
  /* prepara in anticipo l'opera seguente, così la freccia non fa attendere */
  if(visibili.length>1){
    const succ=visibili[(cur+1)%visibili.length];
    const pre=new Image(); pre.src=fonte(succ,true);
  }
}
function chiudi(){lb.classList.remove('open');document.body.style.overflow='';}
function scorri(d){if(!visibili.length)return;cur=(cur+d+visibili.length)%visibili.length;mostra();}
$('lbx').addEventListener('click',chiudi);
$('lbp').addEventListener('click',()=>scorri(-1));
$('lbn').addEventListener('click',()=>scorri(1));
lb.addEventListener('click',e=>{if(e.target===lb)chiudi();});
document.addEventListener('keydown',e=>{
  if(!lb.classList.contains('open'))return;
  if(e.key==='Escape')chiudi();
  if(e.key==='ArrowLeft')scorri(-1);
  if(e.key==='ArrowRight')scorri(1);
});

/* ---------- 5. MENU, COMPARSE, MODULO ---------- */
const burger=$('burger'), links=$('links');
burger.addEventListener('click',()=>{
  const ap=links.classList.toggle('open');
  burger.classList.toggle('on',ap);
  burger.setAttribute('aria-expanded',ap);
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');burger.classList.remove('on');burger.setAttribute('aria-expanded','false');
}));

function osserva(){
  const voci=[...links.querySelectorAll('a')];
  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.rv').forEach(el=>el.classList.add('in')); return;
  }
  voci.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean).forEach(s=>{
    new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting) voci.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
    }),{rootMargin:'-45% 0px -50% 0px'}).observe(s);
  });
  const rv=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target);}
  }),{threshold:.12});
  document.querySelectorAll('.rv').forEach(el=>rv.observe(el));
}

const form=$('form'), msg=$('msg'), send=$('send');
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!form.name.value.trim()||!form.email.value.trim()||!form.message.value.trim()){
    msg.className='err';msg.textContent='Compila nome, email e messaggio.';return;
  }
  if(!$('chiave').value||$('chiave').value.startsWith('INSERISCI')){
    msg.className='err';msg.textContent='Il modulo non è ancora collegato a una casella di posta.';return;
  }
  send.disabled=true;msg.className='';msg.textContent='Invio in corso…';
  try{
    const r=await fetch('https://api.web3forms.com/submit',{
      method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const j=await r.json();
    if(!j.success) throw new Error();
    msg.className='ok';msg.textContent='Messaggio inviato. Grazie, risponderò al più presto.';
    form.reset();
  }catch(err){
    msg.className='err';msg.textContent='Invio non riuscito. Riprova fra poco oppure scrivimi direttamente via email.';
  }finally{send.disabled=false;}
});

/* ---------- 6. AVVIO ---------- */
const splash=$('splash');
function disegnaSplash(){
  splash.innerHTML=schizzo(Math.floor(Math.random()*1e9),{base:112,pennellate:3,spruzzi:28});
}
disegnaSplash();
splash.addEventListener('click',disegnaSplash);

/* una macchia più piccola dietro il titolo di ogni sezione,
   anch'essa diversa a ogni visita */
function macchieNeiTitoli(){
  document.querySelectorAll('.head').forEach(h=>{
    if(h.querySelector('.macchia')) return;
    const d=document.createElement('div');
    d.className='macchia';
    d.setAttribute('aria-hidden','true');
    d.innerHTML='<svg viewBox="0 0 400 400">'
      + schizzo(Math.floor(Math.random()*1e9),{base:118,pennellate:1,gocce:false,spruzzi:9})
      + '</svg>';
    h.insertBefore(d,h.firstChild);
  });
}
macchieNeiTitoli();

$('y').textContent=new Date().getFullYear();
avvia();
