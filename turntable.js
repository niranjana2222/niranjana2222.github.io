/* turntable.js — gooey blob carousel. Call createTurntable(cfg) */
function createTurntable(cfg) {
  const {
    stageId, gooLayerId, labelLayerId, filterId,
    focalModelId = null, capId = null, prevId = null, nextId = null,
    projects, onFocusChange = null,
    rx = 30, ry = 14, cy = 45, base = 21
  } = cfg;

  const N = projects.length, STEP = 2 * Math.PI / N;
  const MERGED = base * 1.12;
  const stage = document.getElementById(stageId);
  const gooLayer = document.getElementById(gooLayerId);
  const labelLayer = document.getElementById(labelLayerId);
  const fm = focalModelId ? document.getElementById(focalModelId) : null;
  const capEl = capId ? document.getElementById(capId) : null;
  const gooBlur = document.querySelector('#' + filterId + ' feGaussianBlur');
  const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;

  const SHAPES = [
    '47% 53% 44% 56% / 55% 47% 53% 45%','56% 44% 52% 48% / 46% 57% 43% 54%',
    '44% 56% 51% 49% / 57% 44% 56% 43%','53% 47% 57% 43% / 47% 55% 45% 53%',
    '50% 50% 43% 57% / 56% 45% 55% 44%','52% 48% 46% 54% / 53% 46% 54% 47%',
    '45% 55% 53% 47% / 48% 53% 47% 52%','55% 45% 48% 52% / 54% 48% 52% 46%',
  ];

  let rot = Math.PI, curFocal = 0, lastPos = [];
  let gather = 0, sizeMerge = 0, mergeScale = 1, captionDrop = 0, cdV = 0;
  const blobs = [], labels = [];

  projects.forEach((p, i) => {
    const b = document.createElement('div');
    b.className = 't-blob'; b.style.background = p.grad; b.style.borderRadius = SHAPES[i % SHAPES.length];
    gooLayer.appendChild(b); blobs.push(b);
    const l = document.createElement('div');
    l.className = 't-label'; l.dataset.index = i;
    l.innerHTML = '<span class="k">' + p.kind + '</span><span class="t">' + p.name + '</span>';
    labelLayer.appendChild(l); labels.push(l);
  });

  function ss(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
  function eio(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
  function eoc(t){ return 1-Math.pow(1-t,3); }
  function snap(){ return Math.round((rot-Math.PI)/STEP)*STEP+Math.PI; }
  function detent(i){ let t=Math.PI-(i/N)*2*Math.PI; while(t<rot-Math.PI)t+=2*Math.PI; while(t>rot+Math.PI)t-=2*Math.PI; return t; }
  function cellAt(e){
    const r=stage.getBoundingClientRect(); let best=null,bd=1e9;
    for(let i=0;i<N;i++){
      const p=lastPos[i]; if(!p) continue;
      const cx=p.x/100*r.width, cy2=p.y/100*r.height, rad=p.size/100*r.width/2;
      const d=Math.hypot(e.clientX-r.left-cx, e.clientY-r.top-cy2);
      if(d<rad*1.05&&d<bd){bd=d;best=i;}
    } return best;
  }

  function layout(){
    let focal=0,fd=-1,pos=[];
    for(let i=0;i<N;i++){
      const th=(i/N)*2*Math.PI+rot, d=(1-Math.cos(th))/2;
      let x=50+rx*Math.sin(th), y=cy-ry*Math.cos(th);
      x=50+(x-50)*(1-gather); y=cy+(y-cy)*(1-gather);
      const indiv=base*(0.5+0.95*d), size=indiv+(MERGED*mergeScale-indiv)*sizeMerge;
      pos.push({x,y,size,d}); if(d>fd){fd=d;focal=i;}
    }
    for(let i=0;i<N;i++){
      const p=pos[i],b=blobs[i],l=labels[i];
      b.style.left=p.x+'%'; b.style.top=p.y+'%';
      b.style.width=p.size+'%'; b.style.height=p.size+'%';
      b.style.opacity=(0.4+0.6*p.d).toFixed(2); b.style.zIndex=Math.round(p.d*100);
      const drop=captionDrop*ss(0.7,1,p.d);
      l.style.display='flex'; l.style.left=p.x+'%'; l.style.top=(p.y+p.size*0.30*drop)+'%';
      l.style.transform='translate(-50%,-50%) scale('+(0.82+0.23*p.d).toFixed(3)+')';
      l.style.opacity=((0.32+0.68*p.d)*(1-gather)).toFixed(2);
      l.style.zIndex=Math.round(p.d*100)+(drop>0.5?600:200);
    }
    const prev=curFocal; curFocal=focal; lastPos=pos;
    const fp=pos[focal], mo=captionDrop*ss(0.9,0.97,fp.d);
    if(fm){ if(projects[focal].model&&mo>0.02){
      fm.style.display='block'; fm.style.opacity=mo.toFixed(2);
      fm.style.left=fp.x+'%'; fm.style.top=fp.y+'%';
      fm.style.width=(fp.size*1.15)+'%'; fm.style.height=(fp.size*1.15)+'%';
    } else fm.style.display='none'; }
    if(capEl){ const P=projects[focal]; capEl.innerHTML='<strong>'+P.name+'</strong> · '+P.kind; }
    if(onFocusChange&&focal!==prev) onFocusChange(focal,projects[focal]);
  }

  let omega=0, mode='drift', target=rot, cp=0, switched=false, convTarget=rot;
  const DRIFT=reduceMotion?0:(2*Math.PI/180);
  const SK=42, SC=2*Math.sqrt(42)*0.62, FRIC=0.95, OMIN=0.45, CDUR=reduceMotion?0.01:0.72;
  const CMIN=0.45, CPOP=1.4, CDK=95, CDC=2*Math.sqrt(95)*0.72, MAXV=14, DK=0.012;

  function seekTo(t){target=t;gather=0;sizeMerge=0;mode='seek';}
  function startConverge(t){convTarget=t;cp=0;switched=false;mode='converge';}
  function goToCell(i){
    if(i===curFocal)return;
    const d=Math.min((i-curFocal+N)%N,(curFocal-i+N)%N);
    if(d>=2)startConverge(detent(i)); else seekTo(detent(i));
  }

  if(prevId) document.getElementById(prevId).onclick=()=>seekTo(snap()-STEP);
  if(nextId) document.getElementById(nextId).onclick=()=>seekTo(snap()+STEP);

  let down=false,dragged=false,sx=0,rotStart=0,downCell=null,dragT=0,dragV=0;
  stage.addEventListener('pointerdown',e=>{
    if(e.target.closest('model-viewer'))return;
    down=true;dragged=false;mode='drag';omega=0;gather=0;sizeMerge=0;
    sx=e.clientX;rotStart=rot;downCell=cellAt(e);dragT=performance.now();dragV=0;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove',e=>{
    if(!down)return; const dx=e.clientX-sx;
    if(Math.abs(dx)>4)dragged=true;
    const nr=rotStart-dx*DK,now=performance.now(),dt=Math.max(8,now-dragT)/1000;
    dragV=(nr-rot)/dt;rot=nr;dragT=now;
  });
  stage.addEventListener('pointerup',()=>{
    if(!down)return; down=false;
    if(!dragged){if(downCell!=null)goToCell(downCell);else seekTo(snap());return;}
    omega=Math.max(-MAXV,Math.min(MAXV,dragV));mode='fling';
  });

  let last=performance.now();
  function frame(now){
    const dt=Math.min((now-last)/1000,0.05);last=now;let dropTarget;
    if(mode==='fling'){
      rot+=omega*dt;omega*=Math.pow(FRIC,dt*60);
      if(Math.abs(omega)<OMIN)seekTo(snap());
      dropTarget=Math.max(0,1-Math.abs(omega)/0.9);
    }else if(mode==='drag'){
      dropTarget=0;
    }else if(mode==='seek'){
      omega+=((target-rot)*SK-omega*SC)*dt;rot+=omega*dt;
      if(Math.abs(target-rot)<0.0012&&Math.abs(omega)<0.02){rot=target;omega=0;mode='drift';}
      dropTarget=Math.max(0,1-Math.abs(omega)/0.9);
    }else if(mode==='converge'){
      cp+=dt/CDUR; const P=0.44;
      if(cp<P){const ev=eio(cp/P);gather=ev;sizeMerge=Math.pow(ev,0.6);mergeScale=1-(1-CMIN)*ev;}
      else{const u=(cp-P)/(1-P);gather=1-eio(u);sizeMerge=Math.pow(Math.max(0,gather),0.6);
        mergeScale=u<0.5?CMIN+(CPOP-CMIN)*eoc(u/0.5):CPOP+(1-CPOP)*eio((u-0.5)/0.5);}
      dropTarget=cp<P?0:eio((cp-P)/(1-P));
      if(cp>=P&&!switched){rot=convTarget;switched=true;}
      if(cp>=1){gather=0;sizeMerge=0;mergeScale=1;omega=0;mode='drift';}
    }else{
      omega+=(DRIFT-omega)*(1-Math.pow(0.25,dt));rot+=omega*dt;dropTarget=1;
    }
    if(gooBlur)gooBlur.setAttribute('stdDeviation',(6+Math.max(0,gather)*7).toFixed(1));
    cdV+=((dropTarget-captionDrop)*CDK-cdV*CDC)*dt;captionDrop+=cdV*dt;
    layout();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);layout();
  return{goToCell,seekTo,getCurFocal:()=>curFocal};
}
