/* Gacha script - CONFIG at top */
const CONFIG = {
  YT_CHANNEL: 'https://youtube.com/@ChidorayMods', // change to your channel
  START_SPINS: 5,
  MUSIC_URL: '', // add direct mp3 in /assets and put path here, e.g. 'assets/bgm.mp3'
  SFX: {
    spin: 'assets/sfx-spin.mp3',
    r: 'assets/sfx-r.mp3',
    sr: 'assets/sfx-sr.mp3',
    ssr: 'assets/sfx-ssr.mp3',
    ur: 'assets/sfx-ur.mp3'
  },
  MODS: [
    {id:'m01', name:'Mod Alpha', img:'assets/mod-alpha.jpg', preview:'assets/preview-alpha.png', file:'https://example.com/mod1.zip', rarity:'SSR'},
    {id:'m02', name:'Mod UR - Celestia', img:'assets/mod-ur.jpg', preview:'assets/preview-ur.png', file:'https://example.com/mod2.zip', rarity:'UR'},
    {id:'m03', name:'Mod Beta', img:'assets/mod-beta.jpg', preview:'assets/preview-beta.png', file:'https://example.com/mod3.zip', rarity:'R'},
    {id:'m04', name:'Mod Gamma', img:'assets/mod-gamma.jpg', preview:'assets/preview-gamma.png', file:'https://example.com/mod4.zip', rarity:'SR'},
    {id:'m05', name:'Mod Delta', img:'assets/mod-delta.jpg', preview:'assets/preview-delta.png', file:'https://example.com/mod5.zip', rarity:'R'},
    {id:'m06', name:'Mod Epsilon', img:'assets/mod-epsilon.jpg', preview:'assets/preview-epsilon.png', file:'https://example.com/mod6.zip', rarity:'SR'},
    {id:'m07', name:'Mod Zeta', img:'assets/mod-zeta.jpg', preview:'assets/preview-zeta.png', file:'https://example.com/mod7.zip', rarity:'R'},
    {id:'m08', name:'Mod Theta', img:'assets/mod-theta.jpg', preview:'assets/preview-theta.png', file:'https://example.com/mod8.zip', rarity:'SSR'},
    {id:'m09', name:'Mod Kappa', img:'assets/mod-kappa.jpg', preview:'assets/preview-kappa.png', file:'https://example.com/mod9.zip', rarity:'R'}
  ],
  RARITY_WEIGHTS: { UR:1, SSR:8, SR:20, R:71 }
};

/* Elements */
const bannersEl = document.getElementById('banners');
const gridEl = document.getElementById('grid');
const subscribeBtn = document.getElementById('subscribeBtn');
const enterBtn = document.getElementById('enterBtn');
const spinBtn = document.getElementById('spinBtn');
const spinsCountEl = document.getElementById('spinsCount');
const resultPanel = document.getElementById('result-panel');
const overlay = document.getElementById('overlay');
const previewImg = document.getElementById('previewImg');
const previewName = document.getElementById('previewName');
const closePreview = document.getElementById('closePreview');
const fxCanvas = document.getElementById('fxCanvas');
const bgm = document.getElementById('bgm');
const sfxSpin = document.getElementById('sfxSpin');
const sfxR = document.getElementById('sfxR');
const sfxSR = document.getElementById('sfxSR');
const sfxSSR = document.getElementById('sfxSSR');
const sfxUR = document.getElementById('sfxUR');
const logoFile = document.getElementById('logoFile');
const uploadLogo = document.getElementById('uploadLogo');
const logoEl = document.getElementById('logo');

let spinsLeft = 0;
const STORAGE_KEY = 'gacha_spins_v3';
const SUB_KEY = 'gacha_sub_v3';

/* init */
function init(){
  // set subscribe link
  subscribeBtn.href = CONFIG.YT_CHANNEL;
  // load sounds
  bgm.src = CONFIG.MUSIC_URL || '';
  sfxSpin.src = CONFIG.SFX.spin || '';
  sfxR.src = CONFIG.SFX.r || '';
  sfxSR.src = CONFIG.SFX.sr || '';
  sfxSSR.src = CONFIG.SFX.ssr || '';
  sfxUR.src = CONFIG.SFX.ur || '';
  // build banners
  CONFIG.MODS.forEach((m, idx)=>{
    const d = document.createElement('div'); d.className='banner'; d.dataset.idx = idx;
    d.innerHTML = `<img src="${m.img}" alt="${m.name}"><div class="bname">${m.name}</div>`;
    d.addEventListener('click', ()=> openPreview(idx));
    bannersEl.appendChild(d);
  });
  // build grid 3x3 (assign mods cyclically to fill 9 slots; index 1 special UR slot visual)
  gridEl.innerHTML = '';
  for(let i=0;i<9;i++){
    const slot = document.createElement('div'); slot.className='slot';
    const mod = CONFIG.MODS[i % CONFIG.MODS.length];
    slot.innerHTML = `<img class="art" src="${mod.img}" alt="${mod.name}"><div class="title">${mod.name}</div>`;
    const badge = document.createElement('div'); badge.className='badge';
    const r = (mod.rarity||'R').toUpperCase(); badge.textContent = r;
    if(r==='UR') badge.classList.add('ur'); else if(r==='SSR') badge.classList.add('ssr'); else if(r==='SR') badge.classList.add('sr'); else badge.classList.add('r');
    slot.appendChild(badge);
    if(i===1) slot.classList.add('special');
    gridEl.appendChild(slot);
  }
  // restore spins
  const s = parseInt(localStorage.getItem(STORAGE_KEY) || '0',10); spinsLeft = isNaN(s)?0:s; spinsCountEl.textContent = spinsLeft;
  if(localStorage.getItem(SUB_KEY)) enableEnter();
  resizeCanvas();
}
init();

/* preview overlay */
function openPreview(idx){
  const mod = CONFIG.MODS[idx];
  previewImg.src = mod.preview || mod.img; previewName.textContent = mod.name;
  overlay.classList.add('show'); overlay.setAttribute('aria-hidden','false');
}
// proper event delegation for closing overlay
document.addEventListener('click', (e)=>{
  if(e.target && (e.target.id === 'closePreview' || e.target.id === 'overlay')){
    overlay.classList.remove('show'); overlay.setAttribute('aria-hidden','true');
  }
});

/* subscribe */
subscribeBtn.addEventListener('click', ()=>{
  localStorage.setItem(SUB_KEY, Date.now());
  spinsLeft = CONFIG.START_SPINS; localStorage.setItem(STORAGE_KEY, spinsLeft); spinsCountEl.textContent = spinsLeft;
  enableEnter();
  setTimeout(()=>{ try{ window.open(subscribeBtn.href || '#', '_blank'); }catch(e){} }, 60);
});

function enableEnter(){ enterBtn.disabled = false; enterBtn.classList.remove('disabled'); spinBtn.disabled = false; spinBtn.classList.remove('disabled'); }

/* logo upload preview */
uploadLogo.addEventListener('click', ()=> logoFile.click());
logoFile.addEventListener('change', e=>{ const f=e.target.files[0]; if(!f) return; logoEl.style.backgroundImage = `url(${URL.createObjectURL(f)})`; logoEl.textContent=''; });

/* weighted pick */
function weightedPick(weights){
  const entries = Object.entries(weights); let total=0; entries.forEach(([k,v])=> total+=v);
  let r=Math.random()*total; for(const [k,v] of entries){ if(r < v) return k; r -= v; } return entries[entries.length-1][0];
}
function pickModByRarity(rarity){
  const arr = CONFIG.MODS.filter(m=> (m.rarity||'R').toUpperCase() === rarity.toUpperCase()); if(arr.length===0) return CONFIG.MODS[Math.floor(Math.random()*CONFIG.MODS.length)]; return arr[Math.floor(Math.random()*arr.length)];
}

/* spin */
let isSpinning=false;
spinBtn.addEventListener('click', ()=>{ if(isSpinning) return; if(spinsLeft<=0){ alert('No spins left. Click Subscribe to get spins.'); return; } doSpin(); });

function doSpin(){
  isSpinning=true;
  if(sfxSpin.src){ try{sfxSpin.currentTime=0; sfxSpin.play(); }catch(e){} }
  const rarity = weightedPick(CONFIG.RARITY_WEIGHTS);
  const mod = pickModByRarity(rarity);
  // find a grid slot index for this mod (first occurrence)
  const slots = Array.from(gridEl.children);
  let targetIdx = slots.findIndex((slot, i)=> CONFIG.MODS[i % CONFIG.MODS.length].id === mod.id);
  if(targetIdx<0) targetIdx = Math.floor(Math.random()*9);

  // highlight animation sequence
  const totalLoops = 4 + Math.floor(Math.random()*3);
  const totalSteps = totalLoops*9 + targetIdx;
  let step=0; let interval=75;
  const highlight = (i)=>{ slots.forEach(s=>{ s.style.transform=''; s.style.boxShadow=''; }); slots[i].style.transform='scale(1.06)'; slots[i].style.boxShadow='0 20px 60px rgba(168,85,247,0.18)'; };
  const run = ()=>{
    const idx = step % 9;
    highlight(idx);
    step++;
    if(step <= totalSteps){
      interval = Math.min(500, interval * 1.06);
      setTimeout(run, interval);
    } else {
      setTimeout(()=>{ // finish
        slots.forEach(s=>{ s.style.transform=''; s.style.boxShadow=''; });
        onFinish(mod, targetIdx, rarity);
        isSpinning=false;
      }, 180);
    }
  };
  run();
}

/* finish */
function onFinish(mod, slotIdx, rarity){
  spinsLeft = Math.max(0, spinsLeft-1); localStorage.setItem(STORAGE_KEY, spinsLeft); document.getElementById('spinsCount').textContent = spinsLeft;
  resultPanel.innerHTML = '';
  const rc = document.createElement('div'); rc.className='result-card';
  const big = document.createElement('div'); big.className='big'; big.textContent = `Selamat! Anda mendapatkan: ${mod.name}`;
  rc.appendChild(big);
  const lbl = document.createElement('div'); lbl.textContent = rarity; lbl.style.fontWeight='800'; lbl.style.padding='6px 10px'; lbl.style.borderRadius='8px';
  if(rarity==='UR') { lbl.style.background='linear-gradient(90deg,var(--ur),#8b5cf6)'; lbl.style.color='#fff'; }
  else if(rarity==='SSR'){ lbl.style.background='linear-gradient(90deg,var(--ssr),#f59e0b)'; lbl.style.color='#111'; }
  else if(rarity==='SR'){ lbl.style.background='linear-gradient(90deg,var(--sr),#60a5fa)'; lbl.style.color='#fff'; }
  else { lbl.style.background='linear-gradient(90deg,var(--r),#34d399)'; lbl.style.color='#04251a'; }
  rc.appendChild(lbl);
  const art = document.createElement('img'); art.src = mod.preview || mod.img; art.style.maxWidth='320px'; art.style.borderRadius='12px'; art.style.boxShadow='0 18px 60px rgba(0,0,0,0.6)'; rc.appendChild(art);
  const dl = document.createElement('button'); dl.className='download-btn'; dl.textContent='Download Mod'; dl.onclick = ()=> window.open(mod.file,'_blank'); rc.appendChild(dl);
  const left = document.createElement('div'); left.className='muted'; left.textContent = `Spins tersisa: ${spinsLeft}`; rc.appendChild(left);
  resultPanel.appendChild(rc);

  // sfx and fx
  playSfxForRarity(rarity); triggerFx(rarity);
}

/* SFX */
function playSfxForRarity(rarity){
  try{
    if(rarity==='UR' && sfxUR.src){ sfxUR.currentTime=0; sfxUR.play(); }
    else if(rarity==='SSR' && sfxSSR.src){ sfxSSR.currentTime=0; sfxSSR.play(); }
    else if(rarity==='SR' && sfxSR.src){ sfxSR.currentTime=0; sfxSR.play(); }
    else if(sfxR.src){ sfxR.currentTime=0; sfxR.play(); }
  }catch(e){}
}

/* Simple FX: spawn confetti/fireworks using canvas */
const canvas = fxCanvas; const ctx = canvas.getContext('2d'); let W=innerWidth, H=innerHeight; canvas.width=W; canvas.height=H; window.addEventListener('resize', ()=>{ W=canvas.width=innerWidth; H=canvas.height=innerHeight; });
let parts=[], sparks=[];
function spawnConfetti(x,y,count,colors){ for(let i=0;i<count;i++){ parts.push({x,y, vx: (Math.random()-0.5)*8, vy: Math.random()*-8-2, size:4+Math.random()*6, color: colors[Math.floor(Math.random()*colors.length)], life: 80+Math.random()*40}); } }
function spawnFire(x,y,colors,intensity){ for(let i=0;i< (20*intensity); i++){ sparks.push({x,y, vx: Math.cos(i/(20*intensity)*Math.PI*2)* (2+Math.random()*6), vy: Math.sin(i/(20*intensity)*Math.PI*2)*(2+Math.random()*6), color: colors[Math.floor(Math.random()*colors.length)], life: 40+Math.random()*40, size:2+Math.random()*3}); } }
function triggerFx(rarity){
  if(rarity==='UR'){ spawnFire(W*0.5, H*0.25, ['#caa7ff','#ffd86b'], 3); spawnConfetti(W*0.5, H*0.25, 80, ['#caa7ff','#ffd86b','#ffffff']); }
  else if(rarity==='SSR'){ spawnFire(W*0.5, H*0.3, ['#ffd86b','#fff7d6'], 2); spawnConfetti(W*0.5, H*0.3, 60, ['#ffd86b','#ffffff']); }
  else if(rarity==='SR'){ spawnFire(W*0.5, H*0.32, ['#60a5fa','#cfe9ff'],1); spawnConfetti(W*0.5, H*0.32, 40, ['#60a5fa','#cfe9ff']); }
  else { spawnConfetti(W*0.5, H*0.28, 24, ['#34d399','#e6fffa']); }
}
function fxLoop(){ requestAnimationFrame(fxLoop); ctx.clearRect(0,0,W,H); for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.25; p.life--; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size, p.size*0.6); if(p.life<=0 || p.y>H+50) parts.splice(i,1);} for(let i=sparks.length-1;i>=0;i--){ const s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.vy+=0.1; s.life--; ctx.beginPath(); ctx.fillStyle=s.color; ctx.arc(s.x,s.y,s.size,0,Math.PI*2); ctx.fill(); if(s.life<=0) sparks.splice(i,1);} } fxLoop();

/* keyboard space to spin */
window.addEventListener('keydown', e=>{ if(e.code==='Space' && !isSpinning && spinsLeft>0) doSpin(); });

/* helper: weighted pick and pick mod by rarity */
function weightedPick(weights){ const arr=Object.entries(weights); let total=0; arr.forEach(([k,v])=>total+=v); let r=Math.random()*total; for(const [k,v] of arr){ if(r<v) return k; r-=v; } return arr[arr.length-1][0]; }
function pickModByRarity(rarity){ const arr=CONFIG.MODS.filter(m=> (m.rarity||'R').toUpperCase()===rarity.toUpperCase()); if(arr.length===0) return CONFIG.MODS[Math.floor(Math.random()*CONFIG.MODS.length)]; return arr[Math.floor(Math.random()*arr.length)]; }

/* end */
