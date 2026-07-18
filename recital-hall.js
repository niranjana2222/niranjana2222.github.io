/* recital-hall.js — first-person three.js recital-hall scene (homepage).
   Adapted from a Claude Design reference: a stage with a grand piano, music stands,
   violin display, writing desk, and a bookshelf, one per portfolio section.
   Exposes window.buildRecitalHall(container, opts) => { walkTo, toggleOverview, resetToStart, setLightMode, dispose }
   Requires window.THREE (r128 UMD). */
(function () {
  const PAL = {
    fog: 0x2a2216,
    floor: 0x2a2432,
    floorDark: 0x1c1722,
    curtain: 0xead9a8,
    curtainDeep: 0xc9a961,
    gold: 0xd8b567,
    wood: 0x241d2e,
    brass: 0xcaa15a,
    ivory: 0xefe7d2,
    ebony: 0x100d16,
    wall: 0xe8dcb8,
    boxRed: 0x5a1a1e,
  };
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function buildRecitalHall(container, opts) {
    opts = opts || {};
    const THREE = window.THREE;
    const onAnchors = opts.onAnchors || function () {};
    const onFootstep = opts.onFootstep || function () {};

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    let stepAcc = 0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PAL.fog, 8, 34);
    const skyTex = (() => {
      const cv = document.createElement('canvas'); cv.width = 4; cv.height = 128;
      const ctx = cv.getContext('2d');
      const gr = ctx.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, '#100a0d'); gr.addColorStop(0.6, '#1c1215'); gr.addColorStop(1, '#251a1e');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, 4, 128);
      return new THREE.CanvasTexture(cv);
    })();
    const skyTexLight = (() => {
      const cv = document.createElement('canvas'); cv.width = 4; cv.height = 128;
      const ctx = cv.getContext('2d');
      const gr = ctx.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, '#f0dde2'); gr.addColorStop(0.6, '#f3ecec'); gr.addColorStop(1, '#f8f1e4');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, 4, 128);
      return new THREE.CanvasTexture(cv);
    })();
    scene.background = skyTex;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

    const amb = new THREE.AmbientLight(0xa08088, 0.22);
    scene.add(amb);
    const rim = new THREE.HemisphereLight(0x5a3540, 0x120a0d, 0.4);
    scene.add(rim);

    function texCanvas(fn, size) {
      size = size || 256;
      const cv = document.createElement('canvas'); cv.width = cv.height = size;
      fn(cv.getContext('2d'), size);
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return t;
    }
    const woodTex = texCanvas((ctx, s) => {
      ctx.fillStyle = '#2a2234'; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 60; i++) {
        ctx.strokeStyle = i % 2 ? '#221b2a' : '#332a3e'; ctx.globalAlpha = rand(0.3, 0.6); ctx.lineWidth = rand(1.5, 3);
        const y = Math.random() * s;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(s * 0.3, y + rand(-5, 5), s * 0.7, y + rand(-5, 5), s, y + rand(-6, 6)); ctx.stroke();
      }
    });
    woodTex.repeat.set(4, 4);
    const curtainTex = texCanvas((ctx, s) => {
      ctx.fillStyle = '#e8dcb8'; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 24; i++) {
        const x = (i / 24) * s;
        const g = ctx.createLinearGradient(x, 0, x + s / 24, 0);
        g.addColorStop(0, 'rgba(120,95,50,.18)'); g.addColorStop(0.5, 'rgba(240,225,190,.3)'); g.addColorStop(1, 'rgba(120,95,50,.18)');
        ctx.fillStyle = g; ctx.fillRect(x, 0, s / 24, s);
      }
    });
    curtainTex.repeat.set(1, 1);
    const ceilingTex = texCanvas((ctx, s) => {
      ctx.fillStyle = '#e8dcb8'; ctx.fillRect(0, 0, s, s);
      const n = 4, c = s / n;
      ctx.strokeStyle = 'rgba(90,60,20,.5)'; ctx.lineWidth = 4;
      for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(i * c, 0); ctx.lineTo(i * c, s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * c); ctx.lineTo(s, i * c); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(216,181,103,.8)'; ctx.lineWidth = 3;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { ctx.strokeRect(i * c + 12, j * c + 12, c - 24, c - 24); }
    });
    ceilingTex.repeat.set(5, 5);
    const wallTex = texCanvas((ctx, s) => {
      ctx.fillStyle = '#ede1c2'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#c9a355'; ctx.lineWidth = 10;
      ctx.strokeRect(s * 0.1, s * 0.08, s * 0.8, s * 0.86);
      ctx.strokeStyle = '#b8924a'; ctx.lineWidth = 4;
      ctx.strokeRect(s * 0.14, s * 0.12, s * 0.72, s * 0.78);
      ctx.fillStyle = '#e6d8b0'; ctx.fillRect(s * 0.16, s * 0.14, s * 0.68, s * 0.74);
      (() => {
        const px0 = s * 0.16, py0 = s * 0.14, pw = s * 0.68, ph = s * 0.74;
        const cols = 3, rows = 4, cw = pw / cols, ch = ph / rows;
        ctx.strokeStyle = 'rgba(90,60,20,.5)'; ctx.lineWidth = 3;
        for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(px0 + i * cw, py0); ctx.lineTo(px0 + i * cw, py0 + ph); ctx.stroke(); }
        for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(px0, py0 + j * ch); ctx.lineTo(px0 + pw, py0 + j * ch); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(216,181,103,.8)'; ctx.lineWidth = 2.5;
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
          ctx.strokeRect(px0 + i * cw + 8, py0 + j * ch + 8, cw - 16, ch - 16);
        }
      })();
      for (let i = 0; i < 160; i++) { ctx.fillStyle = '#d8c99a'; ctx.globalAlpha = rand(0.04, 0.1); ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2); }
    });
    wallTex.repeat.set(6, 1);

    const stageWoodTex = texCanvas((ctx, s) => {
      ctx.fillStyle = '#c9a066'; ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 26; i++) {
        const x = (i / 26) * s;
        ctx.fillStyle = i % 2 ? '#bd9257' : '#d3ab72'; ctx.fillRect(x, 0, s / 26, s);
      }
      ctx.strokeStyle = 'rgba(90,60,25,.35)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 26; i++) { const x = (i / 26) * s; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke(); }
      for (let i = 0; i < 400; i++) { ctx.fillStyle = 'rgba(90,60,25,.15)'; ctx.fillRect(Math.random() * s, Math.random() * s, rand(6, 18), 1); }
    });
    stageWoodTex.repeat.set(5, 5);

    // ---- floor ----
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: woodTex, roughness: 0.55, metalness: 0.08 });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(26, 40), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    const stageH = 0.6;
    const stageDepthBack = -9.5, stageFront = 2.2, stageHalfW = 9.4;
    const stageMat = new THREE.MeshStandardMaterial({ color: 0xc9a066, map: stageWoodTex, roughness: 0.35, metalness: 0.05 });
    const stage = new THREE.Mesh(new THREE.BoxGeometry(stageHalfW * 2, stageH, stageFront - stageDepthBack), stageMat);
    stage.position.set(0, stageH / 2, (stageFront + stageDepthBack) / 2);
    stage.receiveShadow = true; stage.castShadow = true; scene.add(stage);
    const nosing = new THREE.Mesh(new THREE.BoxGeometry(stageHalfW * 2 + 0.1, 0.05, 0.12),
      new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.4, metalness: 0.6 }));
    nosing.position.set(0, stageH, stageFront); scene.add(nosing);
    const stepCount = 4;
    const stepDepth = 0.5, stepRise = stageH / stepCount;
    for (let i = 0; i < stepCount; i++) {
      const stepH = stageH - i * stepRise;
      const stepZ = stageFront + stepDepth * (i + 0.5);
      const step = new THREE.Mesh(new THREE.BoxGeometry(stageHalfW * 2, stepH, stepDepth), stageMat);
      step.position.set(0, stepH / 2, stepZ); step.castShadow = true; step.receiveShadow = true; scene.add(step);
    }
    const stairsBackEdge = stageFront + stepDepth * stepCount;

    const curtainMat = new THREE.MeshStandardMaterial({ color: 0xf0e6c8, map: wallTex, roughness: 0.75, side: THREE.DoubleSide });
    const rad = 11.5;
    const curtainWall = new THREE.Mesh(
      new THREE.CylinderGeometry(rad, rad, 10.6, 40, 1, true),
      curtainMat
    );
    curtainWall.position.y = 5.3;
    curtainWall.castShadow = true; curtainWall.receiveShadow = true;
    scene.add(curtainWall);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.16, 8, 40, Math.PI),
      new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.35, metalness: 0.55 }));
    trim.rotation.x = Math.PI; trim.rotation.z = Math.PI; trim.position.set(0, 6.4, -10.5);
    scene.add(trim);
    const trimInner = new THREE.Mesh(new THREE.TorusGeometry(9.6, 0.08, 8, 40, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf0dba8, roughness: 0.3, metalness: 0.5 }));
    trimInner.rotation.x = Math.PI; trimInner.rotation.z = Math.PI; trimInner.position.set(0, 6.2, -10.3);
    scene.add(trimInner);

    const backWall = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 10.4, 40, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf0e6c8, map: wallTex, roughness: 0.75, side: THREE.BackSide }));
    backWall.position.y = 5.1; scene.add(backWall);

    const ceiling = new THREE.Mesh(new THREE.CircleGeometry(15, 40),
      new THREE.MeshStandardMaterial({ color: PAL.wall, map: ceilingTex, roughness: 0.7 }));
    ceiling.rotation.x = Math.PI / 2; ceiling.position.y = 10.2; scene.add(ceiling);
    const medallion = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 8, 40),
      new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.35, metalness: 0.6 }));
    medallion.rotation.x = Math.PI / 2; medallion.position.set(0, 10.15, -2); scene.add(medallion);
    const medallion2 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.05, 8, 32),
      new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.35, metalness: 0.6 }));
    medallion2.rotation.x = Math.PI / 2; medallion2.position.set(0, 10.14, -2); scene.add(medallion2);
    const fixturePositions = [[-4.2, -6], [4.2, -6], [-4.2, -2], [4.2, -2], [-4.2, 2], [4.2, 2], [0, -8], [0, 4]];
    fixturePositions.forEach(([fx, fz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 8, 20),
        new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.4, metalness: 0.55 }));
      ring.rotation.x = Math.PI / 2; ring.position.set(fx, 10.1, fz); scene.add(ring);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20),
        new THREE.MeshStandardMaterial({ color: 0xfff0d0, emissive: 0xffe6b0, emissiveIntensity: 0.6 }));
      disc.rotation.x = Math.PI / 2; disc.position.set(fx, 10.08, fz); scene.add(disc);
      const pl = new THREE.PointLight(0xffe6b0, 0.5, 6);
      pl.position.set(fx, 9.8, fz); scene.add(pl);
    });

    // ---- spotlights ----
    const spots = [];
    function makeSpot(x, z, color, intensity) {
      const sp = new THREE.SpotLight(color, intensity, 22, Math.PI / 8, 0.5, 1.4);
      sp.position.set(x, 9, z);
      sp.target.position.set(x, 0, z);
      sp.castShadow = true;
      sp.shadow.mapSize.set(1024, 1024);
      scene.add(sp, sp.target);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 20, 1, true),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.set(x, 4.6, z);
      scene.add(cone);
      spots.push({ light: sp, cone });
      return sp;
    }
    makeSpot(0, -1, 0xfff0d0, 5.5);
    [-4.2, -2.1, 2.1, 4.2].forEach((x, i) => makeSpot(x, i % 2 === 0 ? 1.5 : -1.5, 0xffe6b8, 1.6));

    const motes = (() => {
      const N = 90;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pos[i * 3] = rand(-6, 6); pos[i * 3 + 1] = rand(0.5, 8); pos[i * 3 + 2] = rand(-6, 3); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xffe9c0, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
      const pts = new THREE.Points(geo, mat); pts.userData.pos = pos; pts.userData.N = N;
      scene.add(pts); return pts;
    })();

    // ---- feature builders ----
    function wood() { return new THREE.MeshStandardMaterial({ color: 0x8a7358, map: woodTex, roughness: 0.75 }); }
    function ebony() { return new THREE.MeshStandardMaterial({ color: PAL.ebony, roughness: 0.08, metalness: 0.35, envMapIntensity: 1.2 }); }
    function brass() { return new THREE.MeshStandardMaterial({ color: PAL.brass, roughness: 0.35, metalness: 0.7 }); }
    function paper() { return new THREE.MeshStandardMaterial({ color: PAL.ivory, roughness: 0.85 }); }

    function makeMusicStand() {
      const g = new THREE.Group();
      const brassMat = new THREE.MeshStandardMaterial({ color: PAL.brass, roughness: 0.35, metalness: 0.75 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 1.3, 8), brassMat);
      pole.position.y = 0.65; pole.castShadow = true; g.add(pole);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.22, 0.05, 10), brassMat);
      base.position.y = 0.03; g.add(base);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.28, 6), brassMat);
        leg.position.set(Math.cos(a) * 0.14, 0.14, Math.sin(a) * 0.14);
        leg.rotation.z = Math.cos(a) * 0.6; leg.rotation.x = -Math.sin(a) * 0.6;
        leg.castShadow = true; g.add(leg);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }));
        foot.position.set(Math.cos(a) * 0.26, 0.01, Math.sin(a) * 0.26); g.add(foot);
      }
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.02), brassMat);
      deskTop.position.set(0, 1.28, 0); deskTop.rotation.x = -0.55; deskTop.castShadow = true; g.add(deskTop);
      // sheet music drawn the same way as the notation on the books — canvas texture,
      // not hand-placed geometry, so both read as the same kind of "written music"
      const standSheetTex = texCanvas((ctx, s) => {
        ctx.fillStyle = '#f3e6c8'; ctx.fillRect(0, 0, s, s);
        const ink = '#2a2432';
        const staffY = s * 0.4, staffGap = s * 0.05;
        for (let ln = 0; ln < 5; ln++) {
          ctx.strokeStyle = ink; ctx.globalAlpha = 0.85; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(s * 0.08, staffY + ln * staffGap); ctx.lineTo(s * 0.92, staffY + ln * staffGap); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (let i = 0; i < 11; i++) {
          const nx = s * 0.1 + i * (s * 0.82 / 11);
          const ny = staffY + rand(-1, 5) * staffGap;
          ctx.fillStyle = ink;
          ctx.beginPath(); ctx.ellipse(nx, ny, s * 0.022, s * 0.015, -0.3, 0, 6.283); ctx.fill();
          ctx.fillRect(nx + s * 0.018, ny - s * 0.1, s * 0.007, s * 0.1);
        }
        const staffY2 = s * 0.68;
        for (let ln = 0; ln < 5; ln++) {
          ctx.strokeStyle = ink; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(s * 0.08, staffY2 + ln * staffGap); ctx.lineTo(s * 0.92, staffY2 + ln * staffGap); ctx.stroke();
        }
        for (let i = 0; i < 10; i++) {
          const nx = s * 0.1 + i * (s * 0.82 / 10);
          const ny = staffY2 + rand(-1, 5) * staffGap;
          ctx.fillStyle = ink;
          ctx.beginPath(); ctx.ellipse(nx, ny, s * 0.022, s * 0.015, -0.3, 0, 6.283); ctx.fill();
          ctx.fillRect(nx + s * 0.018, ny - s * 0.1, s * 0.007, s * 0.1);
        }
      });
      const pageMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: standSheetTex, roughness: 0.85, side: THREE.DoubleSide });
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.28), pageMat);
      sheet.position.set(0, 1.33, 0.03); sheet.rotation.x = -0.55; g.add(sheet);
      return g;
    }

    function makeGrandPiano(lidOpen) {
      const g = new THREE.Group();
      const felt = new THREE.MeshStandardMaterial({ color: 0x7a1a20, roughness: 0.9 });
      const brassHw = new THREE.MeshStandardMaterial({ color: PAL.brass, roughness: 0.25, metalness: 0.85 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 2.3), ebony());
      body.position.set(0, 0.55, -0.15); body.castShadow = true; body.receiveShadow = true; g.add(body);
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.6, 20, 1, false, 0, Math.PI), ebony());
      tail.rotation.y = Math.PI / 2; tail.position.set(0, 0.55, 0.85); tail.castShadow = true; g.add(tail);
      [[-0.75, -0.9], [0.75, -0.9], [0, 0.95]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.62, 10), ebony());
        leg.position.set(lx, 0.31, lz); leg.castShadow = true; g.add(leg);
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), brassHw);
        foot.position.set(lx, 0.0, lz); g.add(foot);
      });
      const lyreTopY = 0.86;
      const lyrePost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.02, lyreTopY - 0.16, 8), ebony());
      lyrePost1.position.set(-0.08, (lyreTopY + 0.16) / 2, -1.0); lyrePost1.rotation.z = 0.05; lyrePost1.castShadow = true; g.add(lyrePost1);
      const lyrePost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.02, lyreTopY - 0.16, 8), ebony());
      lyrePost2.position.set(0.08, (lyreTopY + 0.16) / 2, -1.0); lyrePost2.rotation.z = -0.05; lyrePost2.castShadow = true; g.add(lyrePost2);
      const pedalBox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.14), brassHw);
      pedalBox.position.set(0, 0.16, -1.0); pedalBox.castShadow = true; g.add(pedalBox);
      [-0.11, 0, 0.11].forEach((px) => {
        const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.02, 0.11), brassHw);
        pedal.position.set(px, 0.19, -0.94); pedal.rotation.x = -0.15; g.add(pedal);
      });
      const kbBed = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.32), ebony());
      kbBed.position.set(0, 0.86, -1.05); g.add(kbBed);
      const feltStrip = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.015, 0.03), felt);
      feltStrip.position.set(0, 0.895, -0.91); g.add(feltStrip);
      for (let i = 0; i < 14; i++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.03, 0.28),
          new THREE.MeshStandardMaterial({ color: PAL.ivory, roughness: 0.35, metalness: 0.05 }));
        key.position.set(-0.58 + i * 0.09, 0.92, -1.05); key.castShadow = true; g.add(key);
      }
      const blackPattern = [0, 1, 3, 4, 5];
      for (let i = 0; i < 13; i++) {
        if (blackPattern.indexOf(i % 7) === -1) continue;
        const bkey = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.17),
          new THREE.MeshStandardMaterial({ color: 0x0e0b12, roughness: 0.2, metalness: 0.15 }));
        bkey.position.set(-0.58 + i * 0.09 + 0.045, 0.938, -0.97); bkey.castShadow = true; g.add(bkey);
      }
      // fold-down music desk, propped up behind the keyboard
      const musicDesk = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.34, 0.02), ebony());
      musicDesk.position.set(0, 1.12, -0.82); musicDesk.rotation.x = -0.35; musicDesk.castShadow = true; g.add(musicDesk);
      const deskLedge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.025, 0.05), brassHw);
      deskLedge.position.set(0, 0.94, -0.78); deskLedge.rotation.x = -0.35; g.add(deskLedge);
      if (lidOpen) {
        const lid = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.05, 2.1), ebony());
        lid.position.set(0, 1.15, -0.1); lid.rotation.x = -0.95; lid.rotation.z = 0.02; lid.castShadow = true; g.add(lid);
        for (let i = 0; i < 10; i++) {
          const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.6, 4), brassHw);
          str.position.set(-0.7 + i * 0.14, 0.65, 0.2); str.rotation.x = Math.PI / 2 + 0.15; g.add(str);
        }
      } else {
        const lid = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.05, 2.1), ebony());
        lid.position.set(0, 0.86, -0.15); lid.castShadow = true; g.add(lid);
      }
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.4), wood());
      bench.position.set(0, 0.46, -1.6); bench.castShadow = true; g.add(bench);
      [[-0.35, -1.42], [0.35, -1.42], [-0.35, -1.78], [0.35, -1.78]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), wood());
        leg.position.set(lx, 0.2, lz); g.add(leg);
      });
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.36),
        new THREE.MeshStandardMaterial({ color: 0x9c1f30, roughness: 0.85 }));
      cushion.position.set(0, 0.53, -1.6); g.add(cushion);
      return g;
    }

    function makeDesk() {
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.7), wood());
      top.position.y = 0.78; top.castShadow = true; g.add(top);
      [[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.06), wood());
        leg.position.set(lx, 0.39, lz); leg.castShadow = true; g.add(leg);
      });
      [-0.2, 0.2].forEach(ox => {
        const rot = rand(-0.1, 0.1);
        const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.015, 0.5), paper());
        sheet.position.set(ox, 0.815, 0); sheet.rotation.y = rot; sheet.castShadow = true; g.add(sheet);
        for (let ln = 0; ln < 4; ln++) {
          const staffZ = -0.16 + ln * 0.1;
          for (let s = 0; s < 5; s++) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.003),
              new THREE.MeshStandardMaterial({ color: 0x2a2432 }));
            line.position.set(ox, 0.823, staffZ + (s - 2) * 0.012);
            line.rotation.x = -Math.PI / 2; line.rotation.z = rot; g.add(line);
          }
          for (let n = 0; n < 6; n++) {
            const note = new THREE.Mesh(new THREE.CircleGeometry(0.008, 8),
              new THREE.MeshStandardMaterial({ color: 0x2a2432 }));
            note.position.set(ox - 0.15 + n * 0.06, 0.824, staffZ + rand(-0.018, 0.018));
            note.rotation.x = -Math.PI / 2; note.rotation.z = rot; g.add(note);
          }
        }
      });
      const lampBaseX = 0.45, lampBaseZ = -0.2, lampBaseY = 0.82;
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.025, 16), brass());
      lampBase.position.set(lampBaseX, lampBaseY, lampBaseZ); lampBase.castShadow = true; g.add(lampBase);
      const stemH = 0.28;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, stemH, 10), brass());
      stem.position.set(lampBaseX, lampBaseY + 0.02 + stemH / 2, lampBaseZ); g.add(stem);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.035, 10), brass());
      collar.position.set(lampBaseX, lampBaseY + 0.02 + stemH * 0.55, lampBaseZ); g.add(collar);
      const shadeY = lampBaseY + 0.02 + stemH + 0.04;
      const lampShade = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.1),
        new THREE.MeshStandardMaterial({ color: PAL.brass, roughness: 0.25, metalness: 0.75, side: THREE.DoubleSide }));
      lampShade.position.set(lampBaseX, shadeY, lampBaseZ); lampShade.castShadow = true; g.add(lampShade);
      const finialTip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), brass());
      finialTip.position.set(lampBaseX, shadeY + 0.132, lampBaseZ); g.add(finialTip);
      const glow = new THREE.PointLight(0xf5d98a, 0.6, 2);
      glow.position.set(lampBaseX, shadeY - 0.06, lampBaseZ); g.add(glow);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x3a2f47, roughness: 0.85 }));
      seat.position.set(0, 0.5, 0.55); g.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.05), seat.material);
      back.position.set(0, 0.75, 0.74); g.add(back);
      [[-0.17, 0.38], [0.17, 0.38], [-0.17, 0.72], [0.17, 0.72]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.48, 6), wood());
        leg.position.set(lx, 0.24, lz); leg.castShadow = true; g.add(leg);
      });
      return g;
    }

    function makeViolin(scale) {
      scale = scale || 1;
      const g = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a4a2e, roughness: 0.42, metalness: 0.08 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x2a160e, roughness: 0.5 });
      const pts = [];
      [[0.001, -0.52], [0.15, -0.42], [0.185, -0.26], [0.11, -0.06], [0.2, 0.16], [0.175, 0.36], [0.09, 0.48], [0.001, 0.53]].forEach(([r, y]) => pts.push(new THREE.Vector2(r * scale, y * scale)));
      const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), woodMat);
      body.scale.z = 0.34; body.castShadow = true; body.receiveShadow = true; g.add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.028 * scale, 0.036 * scale, 0.62 * scale, 8), dark);
      neck.position.y = 0.82 * scale; neck.castShadow = true; g.add(neck);
      const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.045 * scale, 0.02 * scale, 8, 12), dark);
      scroll.position.y = 1.14 * scale; scroll.rotation.x = Math.PI / 2; g.add(scroll);
      const fingerboard = new THREE.Mesh(new THREE.BoxGeometry(0.05 * scale, 0.01 * scale, 0.6 * scale), dark);
      fingerboard.position.set(0, 0.5 * scale, 0.06 * scale); g.add(fingerboard);
      for (let i = 0; i < 4; i++) {
        const str = new THREE.Mesh(new THREE.CylinderGeometry(0.003 * scale, 0.003 * scale, 1.55 * scale, 3),
          new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: 0.3, metalness: 0.6 }));
        str.position.set(-0.045 * scale + i * 0.03 * scale, 0.42 * scale, 0.02 * scale);
        str.rotation.x = 0.05; g.add(str);
      }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.05 * scale, 0.012 * scale), new THREE.MeshStandardMaterial({ color: 0xe8ddc6, roughness: 0.7 }));
      bridge.position.set(0, -0.28 * scale, 0.09 * scale); g.add(bridge);
      return g;
    }
    function makeBow(scale) {
      scale = scale || 1;
      const g = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012 * scale, 0.016 * scale, 1.5 * scale, 6),
        new THREE.MeshStandardMaterial({ color: 0x5c3a22, roughness: 0.5 }));
      g.add(stick);
      const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.004 * scale, 0.004 * scale, 1.42 * scale, 4),
        new THREE.MeshStandardMaterial({ color: 0xf0e8d4, roughness: 0.6 }));
      hair.position.x = 0.03 * scale; g.add(hair);
      return g;
    }

    function makeBookStack(scale) {
      scale = scale || 1;
      const g = new THREE.Group();
      const noteCoverTex = (bg, ink) => texCanvas((ctx, s) => {
        ctx.fillStyle = bg; ctx.fillRect(0, 0, s, s);
        const staffY = s * 0.3, staffGap = s * 0.045;
        for (let ln = 0; ln < 5; ln++) {
          ctx.strokeStyle = ink; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(s * 0.08, staffY + ln * staffGap); ctx.lineTo(s * 0.92, staffY + ln * staffGap); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (let i = 0; i < 14; i++) {
          const nx = s * 0.1 + i * (s * 0.82 / 14);
          const ny = staffY + rand(-1, 5) * staffGap;
          ctx.fillStyle = ink;
          ctx.beginPath(); ctx.ellipse(nx, ny, s * 0.018, s * 0.013, -0.3, 0, 6.283); ctx.fill();
          ctx.fillRect(nx + s * 0.015, ny - s * 0.09, s * 0.006, s * 0.09);
        }
        const staffY2 = s * 0.62;
        for (let ln = 0; ln < 5; ln++) {
          ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(s * 0.08, staffY2 + ln * staffGap); ctx.lineTo(s * 0.92, staffY2 + ln * staffGap); ctx.stroke();
        }
        for (let i = 0; i < 12; i++) {
          const nx = s * 0.1 + i * (s * 0.82 / 12);
          const ny = staffY2 + rand(-1, 5) * staffGap;
          ctx.fillStyle = ink;
          ctx.beginPath(); ctx.ellipse(nx, ny, s * 0.018, s * 0.013, -0.3, 0, 6.283); ctx.fill();
          ctx.fillRect(nx + s * 0.015, ny - s * 0.09, s * 0.006, s * 0.09);
        }
      });
      const blackTex = noteCoverTex('#161616', '#f0ede0');
      const whiteTex = noteCoverTex('#f0ede0', '#161616');
      let y = 0;
      const sizes = [[0.62, 0.16], [0.6, 0.15], [0.58, 0.15], [0.56, 0.14], [0.54, 0.14], [0.52, 0.13]];
      sizes.forEach(([w, h], i) => {
        const d = w * 0.8;
        const isBlack = i % 2 === 0;
        const slouch = rand(-0.09, 0.09);
        const shiftX = rand(-0.04, 0.04) * scale, shiftZ = rand(-0.03, 0.03) * scale;
        const coverMat = new THREE.MeshStandardMaterial({
          color: isBlack ? 0x1c1c1c : 0xf2ede0, map: isBlack ? blackTex : whiteTex, roughness: 0.7,
        });
        const book = new THREE.Mesh(new THREE.BoxGeometry(w * scale, h * scale, d * scale), coverMat);
        book.position.set(shiftX, (y + h / 2) * scale, shiftZ);
        book.rotation.y = slouch; book.rotation.z = slouch * 0.4;
        book.castShadow = true; book.receiveShadow = true; g.add(book);
        const pages = new THREE.Mesh(new THREE.BoxGeometry(0.02 * scale, h * 0.92 * scale, d * scale * 0.98),
          new THREE.MeshStandardMaterial({ color: 0xece4cc, roughness: 0.85 }));
        pages.position.set(shiftX - w * 0.5 * scale, (y + h / 2) * scale, shiftZ);
        pages.rotation.copy(book.rotation); g.add(pages);
        y += h;
      });
      const topY = y * scale;
      const openBase = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.02 * scale, 0.4 * scale), paper());
      openBase.position.set(0, topY + 0.01 * scale, 0); openBase.rotation.y = -0.05; g.add(openBase);
      [-1, 1].forEach(s => {
        const page = new THREE.Mesh(new THREE.PlaneGeometry(0.24 * scale, 0.34 * scale), paper());
        page.position.set(s * 0.13 * scale, topY + 0.021 * scale, 0);
        page.rotation.x = -Math.PI / 2; page.rotation.z = s * -0.08;
        page.castShadow = true; g.add(page);
        for (let j = 0; j < 6; j++) {
          const line = new THREE.Mesh(new THREE.PlaneGeometry(0.18 * scale, 0.005 * scale),
            new THREE.MeshStandardMaterial({ color: 0x2a2432, roughness: 0.9 }));
          line.position.set(s * 0.13 * scale, topY + 0.022 * scale, -0.12 * scale + j * 0.042 * scale);
          line.rotation.x = -Math.PI / 2; line.rotation.z = s * -0.08;
          g.add(line);
        }
      });
      return g;
    }

    function makePlaqueTable(scale) {
      scale = scale || 1;
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.1 * scale, 0.06 * scale, 0.6 * scale), wood());
      top.position.y = 0.78 * scale; top.castShadow = true; top.receiveShadow = true; g.add(top);
      [[-0.47, -0.24], [0.47, -0.24], [-0.47, 0.24], [0.47, 0.24]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.025 * scale, 0.75 * scale, 8), wood());
        leg.position.set(lx * scale, 0.39 * scale, lz * scale); leg.castShadow = true; g.add(leg);
      });
      const plaqueGroup = new THREE.Group();
      plaqueGroup.position.set(0, 0.81 * scale, 0.02 * scale);
      plaqueGroup.rotation.x = -0.55;
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.15, metalness: 0.1 });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.32 * scale, 0.24 * scale, 0.018 * scale), frameMat);
      frame.position.set(0, 0.12 * scale, 0); frame.castShadow = true; plaqueGroup.add(frame);
      const plateMat = new THREE.MeshStandardMaterial({ color: PAL.brass, roughness: 0.35, metalness: 0.8 });
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.18 * scale, 0.006 * scale), plateMat);
      plate.position.set(0, 0.12 * scale, 0.011 * scale); plate.castShadow = true; plaqueGroup.add(plate);
      const inkMat = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: 0.5, metalness: 0.6 });
      const lineWidths = [0.1, 0.16, 0.09, 0.13];
      lineWidths.forEach((w, j) => {
        const line = new THREE.Mesh(new THREE.BoxGeometry(w * scale, 0.012 * scale, 0.001 * scale), inkMat);
        line.position.set(-(0.16 - w / 2) * scale + 0.02 * scale, (0.19 - j * 0.045) * scale, 0.0145 * scale);
        plaqueGroup.add(line);
      });
      const brace = new THREE.Mesh(new THREE.BoxGeometry(0.02 * scale, 0.16 * scale, 0.012 * scale), frameMat);
      brace.position.set(0, 0.02 * scale, -0.08 * scale); brace.rotation.x = 0.9; plaqueGroup.add(brace);
      g.add(plaqueGroup);
      return g;
    }

    function makeFeature(id) {
      const contactShadow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
      contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = 0.005;
      const g = new THREE.Group();
      if (id === 'projects') { const s = makeMusicStand(); s.position.x = -0.3; g.add(s); const s2 = makeMusicStand(); s2.position.set(0.4, 0, -0.5); s2.rotation.y = 0.3; g.add(s2); }
      else if (id === 'blog') { g.add(makeDesk()); }
      else if (id === 'about') { g.add(makePlaqueTable(1)); }
      else if (id === 'experience') { g.add(makeBookStack(1)); }
      else { const p = makeGrandPiano(true); p.rotation.y = Math.PI; g.add(p); }
      g.add(contactShadow);
      return g;
    }

    const SECTIONS = ['projects', 'blog', 'about', 'experience', 'research'];
    const featureGroup = new THREE.Group();
    scene.add(featureGroup);
    const positions = [[-5.0, -1.3], [-2.6, -2.3], [0, -2.9], [2.6, -2.3], [5.0, -1.3]];
    const anchors = SECTIONS.map((id, i) => {
      const [x, z] = positions[i];
      const f = makeFeature(id);
      f.position.set(x, stageH, z);
      if (id === 'about' || id === 'research') f.rotation.y = Math.PI * 0.08 * (i - 2);
      featureGroup.add(f);
      const beaconY = (id === 'research' || id === 'about' ? 2.1 : 1.9) + stageH;
      const beacon = new THREE.Group();
      beacon.position.set(x, beaconY, z + 0.3);
      const noteMat = new THREE.MeshStandardMaterial({ color: 0xffe3ad, emissive: 0xe8b96a, emissiveIntensity: 0.9, roughness: 0.4 });
      const noteHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), noteMat);
      noteHead.scale.set(1.15, 0.85, 1); noteHead.rotation.z = -0.35;
      beacon.add(noteHead);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.26, 8), noteMat);
      stem.position.set(0.05, 0.13, 0); beacon.add(stem);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.26, 0.31, 20),
        new THREE.MeshBasicMaterial({ color: 0xe8b96a, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; beacon.add(ring);
      scene.add(beacon);
      return { id, v: new THREE.Vector3(x, beaconY, z + 0.3), beacon, glow: noteHead, ring, base: new THREE.Vector3(x, 0, z) };
    });

    const pilasterMat = new THREE.MeshStandardMaterial({ color: 0xe6d8b0, roughness: 0.6 });
    for (let i = -3; i <= 3; i++) {
      const a = (i / 3) * Math.PI * 0.55;
      const px = Math.sin(a) * 11.3, pz = Math.cos(a) * -11.3;
      const pilaster = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 9.8, 12), pilasterMat);
      pilaster.position.set(px, 4.9, pz); pilaster.castShadow = true; scene.add(pilaster);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.4, metalness: 0.5 }));
      cap.position.set(px, 9.75, pz); scene.add(cap);
    }
    const swagMat = new THREE.MeshStandardMaterial({ color: 0xa81f2c, roughness: 0.85 });
    [-1, 1].forEach(side => {
      const swag = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5.5, 10, 1, true), swagMat);
      swag.position.set(side * 9.6, 7.6, -9.6); swag.rotation.x = Math.PI; swag.rotation.z = side * 0.12;
      swag.castShadow = true; scene.add(swag);
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 16),
        new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.4, metalness: 0.5 }));
      tie.position.set(side * 9.6, 5.2, -9.55); tie.rotation.x = Math.PI / 2; scene.add(tie);
    });

    const carpetMat = new THREE.MeshStandardMaterial({ color: 0xa81f30, roughness: 0.9 });
    const carpetLen = stageFront - stageDepthBack;
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3, carpetLen), carpetMat);
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, stageH + 0.01, (stageFront + stageDepthBack) / 2); carpet.receiveShadow = true; scene.add(carpet);
    for (let i = 0; i < stepCount; i++) {
      const stepH = stageH - i * stepRise;
      const stepZ = stageFront + stepDepth * (i + 0.5);
      const stepCarpet = new THREE.Mesh(new THREE.PlaneGeometry(2.6, stepDepth), carpetMat);
      stepCarpet.rotation.x = -Math.PI / 2;
      stepCarpet.position.set(0, stepH + 0.01, stepZ);
      stepCarpet.receiveShadow = true; scene.add(stepCarpet);
      const riser = new THREE.Mesh(new THREE.PlaneGeometry(2.62, stepRise), carpetMat);
      riser.position.set(0, stepH - stepRise / 2, stepZ + stepDepth / 2 + 0.002);
      scene.add(riser);
    }
    const floorCarpet = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2), carpetMat);
    floorCarpet.rotation.x = -Math.PI / 2;
    floorCarpet.position.set(0, 0.01, stairsBackEdge + 1);
    floorCarpet.receiveShadow = true; scene.add(floorCarpet);

    let lightMode = false;
    function setLightMode(v) {
      lightMode = v;
      scene.background = v ? skyTexLight : skyTex;
      scene.fog.color.set(v ? 0xece0e2 : 0x180f12);
      scene.fog.near = v ? 14 : 8; scene.fog.far = v ? 40 : 34;
      amb.intensity = v ? 0.85 : 0.22;
      rim.intensity = v ? 0.5 : 0.4;
      floorMat.color.set(v ? 0xe0d4b0 : 0xffffff);
      stageMat.color.set(v ? 0xe6d8b0 : 0x18131f);
      curtainMat.color.set(v ? 0xfff6dc : 0xf0e6c8);
      spots.forEach(s => { s.cone.material.opacity = v ? 0.015 : 0.06; });
      motes.material.opacity = v ? 0.18 : 0.5;
    }

    // ---- first-person controls ----
    const spawnPos = { x: 0, z: 8.4 };
    const spawnYaw = Math.PI;
    const pos = new THREE.Vector3(spawnPos.x, 1.7, spawnPos.z);
    let yaw = spawnYaw, pitch = -0.03;
    let overview = false;
    const overviewPos = new THREE.Vector3(0, 9.5, 10.5);
    const overviewTarget = new THREE.Vector3(0, 1, -3);
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    const bounds = { minX: -8.5, maxX: 8.5, minZ: -5, maxZ: 8.5 };
    const wallMargin = 10.6;
    let target = null;
    const keys = Object.create(null);
    let dragging = false, lastPX = 0, lastPY = 0;
    const dom = renderer.domElement;
    dom.style.touchAction = 'none'; dom.style.cursor = 'grab';
    const KEEPOUT = { research: 2.6 };
    const DEFAULT_KEEPOUT = 1.15;
    function clampPos() {
      pos.x = Math.max(bounds.minX, Math.min(bounds.maxX, pos.x));
      pos.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, pos.z));
      const dist = Math.hypot(pos.x, pos.z);
      if (dist > wallMargin) { const s = wallMargin / dist; pos.x *= s; pos.z *= s; }
      for (const a of anchors) {
        const min = KEEPOUT[a.id] || DEFAULT_KEEPOUT;
        const dx = pos.x - a.base.x, dz = pos.z - a.base.z;
        const d = Math.hypot(dx, dz);
        if (d < min && d > 0.0001) {
          const s = min / d;
          pos.x = a.base.x + dx * s;
          pos.z = a.base.z + dz * s;
        }
      }
    }
    function onDown(e) { dragging = true; lastPX = e.clientX; lastPY = e.clientY; dom.style.cursor = 'grabbing'; try { dom.setPointerCapture(e.pointerId); } catch (_) {} }
    function onUp(e) { dragging = false; dom.style.cursor = 'grab'; try { dom.releasePointerCapture(e.pointerId); } catch (_) {} }
    function onDrag(e) {
      if (!dragging) return;
      const dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      if (Math.abs(dx) + Math.abs(dy) > 2) target = null;
      yaw -= dx * 0.0032; pitch = Math.max(-0.5, Math.min(0.45, pitch - dy * 0.0032));
      lastPX = e.clientX; lastPY = e.clientY;
    }
    function onWheel(e) { e.preventDefault(); target = null; pos.x += Math.sin(yaw) * (-e.deltaY * 0.006); pos.z += Math.cos(yaw) * (-e.deltaY * 0.006); clampPos(); }
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointercancel', onUp);
    dom.addEventListener('pointermove', onDrag);
    dom.addEventListener('wheel', onWheel, { passive: false });
    const onKey = (down) => (e) => {
      const k = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(k) === -1) return;
      keys[k] = down; if (down) target = null;
    };
    const kd = onKey(true), ku = onKey(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    function resize() {
      const w = container.clientWidth || 800, h = container.clientHeight || 600;
      renderer.setSize(w, h, true);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    camPos.set(pos.x, 1.7, pos.z);
    camLook.set(pos.x, 1.7, pos.z - 1);

    const clock = new THREE.Clock();
    let running = true;
    const proj = new THREE.Vector3();

    function onContextLost(e) {
      e.preventDefault();
      running = false;
      console.warn('[recital-hall] WebGL context lost — pausing until restored.');
    }
    function onContextRestored() {
      console.warn('[recital-hall] WebGL context restored.');
      running = true;
      loop();
    }
    dom.addEventListener('webglcontextlost', onContextLost, false);
    dom.addEventListener('webglcontextrestored', onContextRestored, false);

    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      try { frame(); }
      catch (e) {
        running = false;
        if (opts.onError) opts.onError(e);
        else console.error('[recital-hall] render loop error:', e);
      }
    }

    function frame() {
      const t = clock.getElapsedTime();

      let mx = 0, mz = 0;
      if (keys.KeyW || keys.ArrowUp) mz += 1;
      if (keys.KeyS || keys.ArrowDown) mz -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      const moving = mx !== 0 || mz !== 0;
      if (moving) {
        const len = Math.hypot(mx, mz) || 1; mx /= len; mz /= len;
        const spd = 0.075;
        pos.x += (Math.sin(yaw) * mz - Math.cos(yaw) * mx) * spd;
        pos.z += (Math.cos(yaw) * mz + Math.sin(yaw) * mx) * spd;
        clampPos();
        stepAcc += spd;
        if (stepAcc > 0.65) { stepAcc = 0; onFootstep(); }
      } else if (target) {
        pos.x += (target.x - pos.x) * 0.06; pos.z += (target.z - pos.z) * 0.06;
        let dyaw = target.yaw - yaw; while (dyaw > Math.PI) dyaw -= 6.283; while (dyaw < -Math.PI) dyaw += 6.283;
        yaw += dyaw * 0.06;
        if (Math.hypot(target.x - pos.x, target.z - pos.z) < 0.15) target = null;
      }
      const bob = moving ? Math.sin(t * 9) * 0.03 : Math.sin(t * 1.4) * 0.01;
      const fpPos = new THREE.Vector3(pos.x, 1.7 + bob, pos.z);
      const fpLook = new THREE.Vector3(pos.x + Math.sin(yaw) * Math.cos(pitch), 1.7 + bob + Math.sin(pitch), pos.z + Math.cos(yaw) * Math.cos(pitch));
      const goalPos = overview ? overviewPos : fpPos;
      const goalLook = overview ? overviewTarget : fpLook;
      camPos.lerp(goalPos, overview ? 0.03 : 0.07);
      camLook.lerp(goalLook, overview ? 0.03 : 0.07);
      camera.position.copy(camPos);
      camera.lookAt(camLook);

      spots.forEach((s, i) => { s.cone.material.opacity = 0.045 + Math.sin(t * 0.5 + i) * 0.012; });
      for (const a of anchors) {
        const s = 1 + Math.sin(t * 2 + a.v.x) * 0.14;
        a.glow.scale.setScalar(s);
        a.ring.material.opacity = 0.35 + Math.sin(t * 1.6 + a.v.z) * 0.2;
        a.beacon.position.y = a.v.y + Math.sin(t * 1.3 + a.v.x) * 0.08;
      }
      const p = motes.userData.pos, N = motes.userData.N;
      for (let i = 0; i < N; i++) { p[i * 3 + 1] += 0.003; if (p[i * 3 + 1] > 8) p[i * 3 + 1] = 0.5; }
      motes.geometry.attributes.position.needsUpdate = true;

      const rect = { w: container.clientWidth, h: container.clientHeight };
      const out = anchors.map(a => {
        proj.copy(a.beacon.position).project(camera);
        const x = (proj.x * 0.5 + 0.5) * rect.w, y = (-proj.y * 0.5 + 0.5) * rect.h;
        const visible = proj.z < 1 && x > -50 && x < rect.w + 50;
        return { id: a.id, x, y, visible };
      });
      onAnchors(out);

      renderer.render(scene, camera);
    }
    loop();

    return {
      walkTo(id) {
        overview = false;
        const a = anchors.find(x => x.id === id); if (!a) return;
        const dz = id === 'research' ? 3.2 : 1.6;
        const tx = a.base.x, tz = a.base.z + dz;
        target = { x: Math.max(bounds.minX, Math.min(bounds.maxX, tx)), z: Math.max(bounds.minZ, Math.min(bounds.maxZ, tz)), yaw: Math.atan2(a.base.x - tx, a.base.z - tz) };
      },
      toggleOverview(v) { overview = typeof v === 'boolean' ? v : !overview; target = null; return overview; },
      resetToStart() {
        overview = false; target = null;
        pos.x = spawnPos.x; pos.z = spawnPos.z; yaw = spawnYaw; pitch = -0.03;
      },
      setLightMode,
      dispose() {
        running = false; ro.disconnect();
        dom.removeEventListener('pointerdown', onDown);
        dom.removeEventListener('pointerup', onUp);
        dom.removeEventListener('pointercancel', onUp);
        dom.removeEventListener('pointermove', onDrag);
        dom.removeEventListener('wheel', onWheel);
        dom.removeEventListener('webglcontextlost', onContextLost);
        dom.removeEventListener('webglcontextrestored', onContextRestored);
        window.removeEventListener('keydown', kd);
        window.removeEventListener('keyup', ku);
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      },
    };
  }
  window.buildRecitalHall = buildRecitalHall;
})();
