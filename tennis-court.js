/* tennis-court.js — first-person three.js night stadium scene for the recital hall's replacement homepage.
   Exposes window.buildTennisCourt(container, opts) => { setLightMode, walkTo, toggleOverview, resetToStart, dispose } */
(function () {
  function buildTennisCourt(container, opts) {
    opts = opts || {};
    const onAnchors = opts.onAnchors || function () {};
    const T = window.THREE;

    const scene = new T.Scene();
    scene.background = new T.Color(0x05070d);
    scene.fog = new T.Fog(0x05070d, 20, 90);

    const camera = new T.PerspectiveCamera(62, 1, 0.1, 400);
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const hemi = new T.HemisphereLight(0xaac4ff, 0x0a0e1a, 0.4);
    scene.add(hemi);
    const key = new T.DirectionalLight(0xfff6e0, 0.75);
    key.position.set(6, 10, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.bias = -0.00008;
    key.shadow.normalBias = 0.035;
    key.shadow.radius = 2.5;
    key.shadow.camera.left = -16; key.shadow.camera.right = 16;
    key.shadow.camera.top = 16; key.shadow.camera.bottom = -16;
    key.shadow.camera.near = 1; key.shadow.camera.far = 40;
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const fill = new T.DirectionalLight(0xdce8ff, 0.12);
    fill.position.set(-5, 3, -4);
    scene.add(fill);

    const root = new T.Group();
    scene.add(root);

    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = grassCanvas.height = 512;
    const gctx = grassCanvas.getContext('2d');
    gctx.fillStyle = '#2e9e3f'; gctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 512, y = Math.random() * 512;
      const shade = Math.random() * 30 - 15;
      gctx.fillStyle = `rgba(${20 + shade},${100 + shade},${40 + shade * 0.6},0.5)`;
      gctx.fillRect(x, y, 1.4, 1.4);
    }
    for (let i = 0; i < 40; i++) {
      gctx.strokeStyle = 'rgba(20,70,28,0.18)'; gctx.lineWidth = 3;
      gctx.beginPath(); gctx.moveTo(0, i * 13); gctx.lineTo(512, i * 13); gctx.stroke();
    }
    const grassTex = new T.CanvasTexture(grassCanvas);
    grassTex.wrapS = grassTex.wrapT = T.RepeatWrapping; grassTex.repeat.set(14, 14);
    const grassMat = new T.MeshStandardMaterial({ name: 'apron_green', map: grassTex, roughness: 0.95 });

    const courtCanvas = document.createElement('canvas');
    courtCanvas.width = courtCanvas.height = 512;
    const cctx = courtCanvas.getContext('2d');
    cctx.fillStyle = '#2bb0e0'; cctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 7000; i++) {
      const x = Math.random() * 512, y = Math.random() * 512;
      const a = Math.random() * 0.08;
      cctx.fillStyle = `rgba(10,40,60,${a})`;
      cctx.fillRect(x, y, 1.2, 1.2);
    }
    const courtTex = new T.CanvasTexture(courtCanvas);
    courtTex.wrapS = courtTex.wrapT = T.RepeatWrapping; courtTex.repeat.set(4, 10);
    const courtMat = new T.MeshStandardMaterial({ name: 'court_lightblue', map: courtTex, roughness: 0.65 });
    const wallMat = new T.MeshStandardMaterial({ name: 'perimeter_wall', color: 0x151a22, roughness: 0.6, metalness: 0.1, side: T.DoubleSide });
    const seatBlueMat = new T.MeshStandardMaterial({ name: 'seat_blue', color: 0x1a2f66, roughness: 0.55, metalness: 0.05 });
    const seatRedMat = new T.MeshStandardMaterial({ name: 'seat_blue_dark', color: 0x102048, roughness: 0.55, metalness: 0.05 });
    const lightPoleMat = new T.MeshStandardMaterial({ name: 'light_pole', color: 0x222222, roughness: 0.5, metalness: 0.4 });
    const lightFixtureMat = new T.MeshStandardMaterial({ name: 'floodlight', color: 0xffffff, emissive: 0xfff3d6, emissiveIntensity: 6, roughness: 0.3 });
    const lineMat = new T.MeshStandardMaterial({ name: 'court_line_white', color: 0xffffff, roughness: 0.6, emissive: 0x222222 });
    const chairFrameMat = new T.MeshStandardMaterial({ name: 'umpire_chair_frame', color: 0x8a6a45, roughness: 0.7 });
    const chairSeatMat = new T.MeshStandardMaterial({ name: 'umpire_chair_seat', color: 0x14213b, roughness: 0.6 });
    const chairSignMat = new T.MeshStandardMaterial({ name: 'umpire_chair_sign', color: 0x14213b, roughness: 0.6 });
    const benchFrameMat = new T.MeshStandardMaterial({ name: 'bench_frame', color: 0x1c1c1c, roughness: 0.5, metalness: 0.4 });
    const benchCushionMat = new T.MeshStandardMaterial({ name: 'bench_cushion', color: 0xe9e3d3, roughness: 0.8 });
    const wheelMat = new T.MeshStandardMaterial({ name: 'chair_wheel', color: 0x1a1a1a, roughness: 0.6 });

    const courtW = 8.23, courtL = 23.77;
    const singlesW = 8.23 - 2 * 1.37;

    const grass = new T.Mesh(new T.PlaneGeometry(46, 50), grassMat);
    grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; root.add(grass);

    const court = new T.Mesh(new T.PlaneGeometry(courtW, courtL), courtMat);
    court.rotation.x = -Math.PI / 2; court.position.y = 0.01; court.receiveShadow = true; root.add(court);

    function line(w, d, x, z) {
      const m = new T.Mesh(new T.BoxGeometry(w, 0.02, d), lineMat);
      m.position.set(x, 0.02, z); root.add(m);
    }
    const baseZ = courtL / 2, doublesX = courtW / 2, singlesX = singlesW / 2, serviceZ = 6.4;
    line(0.05, courtL, -doublesX, 0); line(0.05, courtL, doublesX, 0);
    line(0.05, courtL, -singlesX, 0); line(0.05, courtL, singlesX, 0);
    line(courtW, 0.05, 0, -baseZ); line(courtW, 0.05, 0, baseZ);
    line(singlesW, 0.05, 0, -serviceZ); line(singlesW, 0.05, 0, serviceZ);
    line(0.05, serviceZ, 0, -serviceZ / 2); line(0.05, serviceZ, 0, serviceZ / 2);
    line(0.05, 0.4, 0, -baseZ + 0.2); line(0.05, 0.4, 0, baseZ - 0.2);

    const netPostGreenMat = new T.MeshStandardMaterial({ name: 'net_post_green', color: 0x2e8b3e, roughness: 0.4, metalness: 0.2 });
    const netTapeMat = new T.MeshStandardMaterial({ name: 'net_tape_gray', color: 0xb8bcc0, roughness: 0.5, metalness: 0.15 });
    const netWinderMat = new T.MeshStandardMaterial({ name: 'net_winder_brass', color: 0xc9a227, roughness: 0.35, metalness: 0.7 });
    const netHalfW = doublesX + 0.6;
    [-1, 1].forEach(side => {
      const x = side * netHalfW;
      const post = new T.Mesh(new T.BoxGeometry(0.09, 1.07, 0.09), netPostGreenMat);
      post.position.set(x, 0.535, 0); post.castShadow = true; root.add(post);
      const base = new T.Mesh(new T.BoxGeometry(0.22, 0.06, 0.22), netPostGreenMat);
      base.position.set(x, 0.03, 0); root.add(base);
      if (side < 0) {
        const winder = new T.Mesh(new T.BoxGeometry(0.16, 0.22, 0.07), netWinderMat);
        winder.position.set(x - 0.1, 0.92, 0); winder.rotation.z = -0.08; root.add(winder);
        const crank = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.09, 8), netWinderMat);
        crank.rotation.z = Math.PI / 2; crank.position.set(x - 0.19, 0.92, 0); root.add(crank);
      }
    });
    // net mesh: canvas grid texture on a transparent plane so the crossed cords + holes read clearly
    const netGridCanvas = document.createElement('canvas');
    netGridCanvas.width = 256; netGridCanvas.height = 64;
    const ngctx = netGridCanvas.getContext('2d');
    ngctx.clearRect(0, 0, 256, 64);
    ngctx.strokeStyle = '#f0f2f4'; ngctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 16) { ngctx.beginPath(); ngctx.moveTo(x, 0); ngctx.lineTo(x, 64); ngctx.stroke(); }
    for (let y = 0; y <= 64; y += 16) { ngctx.beginPath(); ngctx.moveTo(0, y); ngctx.lineTo(256, y); ngctx.stroke(); }
    const netGridTex = new T.CanvasTexture(netGridCanvas);
    netGridTex.wrapS = netGridTex.wrapT = T.RepeatWrapping; netGridTex.repeat.set(18, 3);
    const netMat = new T.MeshBasicMaterial({ name: 'net_mesh', color: 0xf0f2f4, alphaMap: netGridTex, transparent: true, side: T.DoubleSide });
    const netMesh = new T.Mesh(new T.PlaneGeometry(netHalfW * 2, 0.85), netMat);
    netMesh.position.set(0, 0.535, 0); root.add(netMesh);
    const netTapeTop = new T.Mesh(new T.BoxGeometry(netHalfW * 2, 0.07, 0.03), netTapeMat);
    netTapeTop.position.set(0, 0.975, 0); root.add(netTapeTop);
    const netTapeBottom = new T.Mesh(new T.BoxGeometry(netHalfW * 2, 0.05, 0.03), netTapeMat);
    netTapeBottom.position.set(0, 0.115, 0); root.add(netTapeBottom);

    // umpire chair (about)
    // umpire chair (about) — white X-frame director's chair with black canvas seat/back, black armrests, casters
    const chairWhiteMat = new T.MeshStandardMaterial({ name: 'umpire_chair_white', color: 0xf0f0ec, roughness: 0.45, metalness: 0.05 });
    const chairCanvasMat = new T.MeshStandardMaterial({ name: 'umpire_chair_black_canvas', color: 0x151515, roughness: 0.55 });
    const chair = new T.Group();
    const seatY = 0.5, backH = 0.62;
    // X-frame legs, front and back pairs crossing — built from exact top/bottom points so casters sit flush
    const casterR = 0.035;
    function makeChairLeg(topX, topZ, botX, botZ) {
      const top = new T.Vector3(topX, seatY + 0.01, topZ);
      const bot = new T.Vector3(botX, casterR, botZ);
      const dir = bot.clone().sub(top);
      const len = dir.length();
      const leg = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, len, 8), chairWhiteMat);
      leg.position.copy(top).add(dir.clone().multiplyScalar(0.5));
      leg.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
      leg.castShadow = true; chair.add(leg);
      const caster = new T.Mesh(new T.SphereGeometry(casterR, 8, 8), chairCanvasMat);
      caster.position.copy(bot); chair.add(caster);
    }
    [-1, 1].forEach(side => {
      makeChairLeg(side * 0.32, 0.24, side * 0.32, 0.24);
      makeChairLeg(side * 0.32, -0.24, side * 0.32, -0.24);
    });
    // vertical back posts
    [-0.32, 0.32].forEach(sx => {
      const post = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, backH + seatY, 8), chairWhiteMat);
      post.position.set(sx, (backH + seatY) / 2, -0.26); post.castShadow = true; chair.add(post);
    });
    // black canvas seat
    const seat = new T.Mesh(new T.BoxGeometry(0.66, 0.03, 0.5), chairCanvasMat);
    seat.position.set(0, seatY, 0); seat.castShadow = true; chair.add(seat);
    // black canvas backrest
    const backRest = new T.Mesh(new T.BoxGeometry(0.6, backH, 0.03), chairCanvasMat);
    backRest.position.set(0, seatY + 0.36, -0.26); backRest.castShadow = true; chair.add(backRest);
    // padded black armrests on white supports
    [-0.36, 0.36].forEach(sx => {
      const arm = new T.Mesh(new T.BoxGeometry(0.09, 0.05, 0.42), chairCanvasMat);
      arm.position.set(sx, seatY + 0.24, -0.02); arm.castShadow = true; chair.add(arm);
      const armLeg = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.24, 8), chairWhiteMat);
      armLeg.position.set(sx, seatY + 0.12, -0.02); chair.add(armLeg);
    });
    chair.position.set(-6.0, 0, 0); chair.rotation.y = Math.PI / 2; root.add(chair);

    // benches (experience)
    function makeBench() {
      const whiteMat = new T.MeshStandardMaterial({ name: 'bench_slat_white', color: 0xf2f2ef, roughness: 0.55 });
      const g = new T.Group();
      // two wide seat planks
      [-0.375, 0.375].forEach(sx => {
        const plank = new T.Mesh(new T.BoxGeometry(0.72, 0.06, 0.5), whiteMat);
        plank.position.set(sx, 0.46, 0.02); plank.castShadow = true; g.add(plank);
      });
      // three angled backrest slats
      for (let i = 0; i < 3; i++) {
        const slat = new T.Mesh(new T.BoxGeometry(1.5, 0.14, 0.045), whiteMat);
        slat.position.set(0, 0.6 + i * 0.19, -0.24 - i * 0.02);
        slat.rotation.x = -0.18;
        slat.castShadow = true; g.add(slat);
      }
      // A-frame black metal side supports
      [-0.78, 0.78].forEach(sx => {
        const frame = new T.Group();
        const backLeg = new T.Mesh(new T.BoxGeometry(0.05, 0.95, 0.05), benchFrameMat);
        backLeg.rotation.x = -0.28; backLeg.position.set(sx, 0.48, -0.18); frame.add(backLeg);
        const frontLeg = new T.Mesh(new T.BoxGeometry(0.05, 0.5, 0.05), benchFrameMat);
        frontLeg.rotation.x = 0.06; frontLeg.position.set(sx, 0.24, 0.15); frame.add(frontLeg);
        const seatRail = new T.Mesh(new T.BoxGeometry(0.045, 0.045, 0.5), benchFrameMat);
        seatRail.position.set(sx, 0.42, 0.02); frame.add(seatRail);
        g.add(frame);
      });
      return g;
    }
    const bench1 = makeBench(); bench1.position.set(-5.0, 0, -2.6); bench1.rotation.y = Math.PI / 2; root.add(bench1);
    const bench2 = makeBench(); bench2.position.set(-5.0, 0, 2.6); bench2.rotation.y = Math.PI / 2; root.add(bench2);

    // rackets + balls (research)
    const gripCanvas = document.createElement('canvas');
    gripCanvas.width = 64; gripCanvas.height = 128;
    const grctx = gripCanvas.getContext('2d');
    grctx.fillStyle = '#151515'; grctx.fillRect(0, 0, 64, 128);
    grctx.strokeStyle = '#000000'; grctx.lineWidth = 3;
    for (let y = 6; y < 128; y += 12) { grctx.beginPath(); grctx.moveTo(0, y); grctx.lineTo(64, y); grctx.stroke(); }
    const gripTex = new T.CanvasTexture(gripCanvas);
    gripTex.wrapT = T.RepeatWrapping; gripTex.repeat.set(1, 4);
    const gripMat = new T.MeshStandardMaterial({ name: 'racket_grip', map: gripTex, roughness: 0.7 });
    const framePurpleMat = new T.MeshStandardMaterial({ name: 'racket_frame_purple', color: 0x6a1e8a, roughness: 0.3, metalness: 0.35 });
    const frameOrangeMat = new T.MeshStandardMaterial({ name: 'racket_frame_orange', color: 0xe0642a, roughness: 0.3, metalness: 0.35 });
    const stringGridCanvas = document.createElement('canvas');
    stringGridCanvas.width = stringGridCanvas.height = 256;
    const sgctx = stringGridCanvas.getContext('2d');
    sgctx.clearRect(0, 0, 256, 256);
    sgctx.strokeStyle = '#e6e6e6'; sgctx.lineWidth = 2.5;
    for (let x = 0; x <= 256; x += 16) { sgctx.beginPath(); sgctx.moveTo(x, 0); sgctx.lineTo(x, 256); sgctx.stroke(); }
    for (let y = 0; y <= 256; y += 16) { sgctx.beginPath(); sgctx.moveTo(0, y); sgctx.lineTo(256, y); sgctx.stroke(); }
    const stringGridTex = new T.CanvasTexture(stringGridCanvas);
    const stringMat = new T.MeshBasicMaterial({ name: 'racket_strings', color: 0xe6e6e6, alphaMap: stringGridTex, transparent: true, side: T.DoubleSide });
    const seamCanvas = document.createElement('canvas');
    seamCanvas.width = seamCanvas.height = 256;
    const smctx = seamCanvas.getContext('2d');
    smctx.fillStyle = '#a9d93a'; smctx.fillRect(0, 0, 256, 256);
    smctx.strokeStyle = '#eef0d8'; smctx.lineWidth = 6;
    smctx.beginPath(); smctx.moveTo(0, 128); smctx.bezierCurveTo(70, 60, 186, 60, 256, 128); smctx.stroke();
    smctx.beginPath(); smctx.moveTo(0, 128); smctx.bezierCurveTo(70, 196, 186, 196, 256, 128); smctx.stroke();
    const seamTex = new T.CanvasTexture(seamCanvas);
    const ballMat = new T.MeshStandardMaterial({ name: 'tennis_ball_felt', map: seamTex, roughness: 0.85 });
    function makeRacket(topMat, bottomMat) {
      const g = new T.Group();
      const headTop = new T.Mesh(new T.TorusGeometry(0.55, 0.05, 10, 24, Math.PI), topMat);
      headTop.position.y = 1.1; headTop.rotation.z = Math.PI; headTop.castShadow = true; g.add(headTop);
      const headBottom = new T.Mesh(new T.TorusGeometry(0.55, 0.05, 10, 24, Math.PI), bottomMat);
      headBottom.position.y = 1.1; headBottom.castShadow = true; g.add(headBottom);
      const strings = new T.Mesh(new T.CircleGeometry(0.5, 24), stringMat);
      strings.position.y = 1.1; g.add(strings);
      const throat = new T.Mesh(new T.CylinderGeometry(0.06, 0.1, 0.35, 8), bottomMat);
      throat.position.y = 0.4; g.add(throat);
      const shaft = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.55, 8), topMat);
      shaft.position.y = 0.0; g.add(shaft);
      const grip = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.5, 8), gripMat);
      grip.position.y = -0.45; grip.castShadow = true; g.add(grip);
      return g;
    }
    // two rackets leaning against the net post
    const netLeanRacket = makeRacket(framePurpleMat, frameOrangeMat);
    netLeanRacket.scale.set(0.42, 0.42, 0.42);
    netLeanRacket.rotation.x = -0.34;
    netLeanRacket.rotation.z = 0.06;
    netLeanRacket.position.set(netHalfW - 0.28, 0.29, 0.26);
    root.add(netLeanRacket);

    const netLeanRacket2 = makeRacket(framePurpleMat, frameOrangeMat);
    netLeanRacket2.scale.set(0.42, 0.42, 0.42);
    netLeanRacket2.rotation.x = -0.34;
    netLeanRacket2.rotation.z = -0.1;
    netLeanRacket2.position.set(netHalfW - 0.15, 0.29, 0.3);
    root.add(netLeanRacket2);

    // black fabric ball hopper on an aluminum X-frame folding stand with casters (matches reference)
    const hopperFabricMat = new T.MeshStandardMaterial({ name: 'hopper_fabric_black', color: 0x161616, roughness: 0.75 });
    const hopperAlumMat = new T.MeshStandardMaterial({ name: 'hopper_frame_aluminum', color: 0xc9cdd2, roughness: 0.35, metalness: 0.75 });
    const hopperGroup = new T.Group();
    const basketR = 0.26, basketH = 0.5, standH = 0.62;
    const basket = new T.Mesh(new T.CylinderGeometry(basketR, basketR * 0.92, basketH, 20, 1, true), hopperFabricMat);
    basket.position.y = standH + basketH / 2; basket.castShadow = true; hopperGroup.add(basket);
    const basketFloor = new T.Mesh(new T.CircleGeometry(basketR * 0.92, 20), hopperFabricMat);
    basketFloor.rotation.x = -Math.PI / 2; basketFloor.position.y = standH; hopperGroup.add(basketFloor);
    const rim = new T.Mesh(new T.TorusGeometry(basketR, 0.012, 6, 24), hopperFabricMat);
    rim.rotation.x = Math.PI / 2; rim.position.y = standH + basketH; hopperGroup.add(rim);
    // X-frame aluminum folding legs, 4 splayed outward (built from exact top/bottom points so they're perfectly straight)
    const legTopY = standH;
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => {
      const top = new T.Vector3(Math.cos(a) * basketR * 0.5, legTopY, Math.sin(a) * basketR * 0.5);
      const bottom = new T.Vector3(Math.cos(a) * basketR * 1.15, 0, Math.sin(a) * basketR * 1.15);
      const dir = bottom.clone().sub(top);
      const len = dir.length();
      const legOuter = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, len, 6), hopperAlumMat);
      legOuter.position.copy(top).add(dir.clone().multiplyScalar(0.5));
      legOuter.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
      legOuter.castShadow = true; hopperGroup.add(legOuter);
      const caster = new T.Mesh(new T.SphereGeometry(0.035, 8, 8), hopperAlumMat);
      caster.position.copy(bottom); caster.position.y = 0.03;
      hopperGroup.add(caster);
    });

    // balls piled just above the rim
    for (let i = 0; i < 12; i++) {
      const rr = Math.random() * basketR * 0.75;
      const aa = Math.random() * Math.PI * 2;
      const ball = new T.Mesh(new T.SphereGeometry(0.075, 10, 10), ballMat);
      ball.position.set(Math.cos(aa) * rr, standH + basketH - 0.08 + Math.random() * 0.1, Math.sin(aa) * rr);
      ball.castShadow = true; hopperGroup.add(ball);
    }
    hopperGroup.position.set(-7.6, 0, -0.4);
    root.add(hopperGroup);

    // tennis duffel bag (projects)
    const bagBlackMat = new T.MeshStandardMaterial({ name: 'bag_black', color: 0x181818, roughness: 0.4, metalness: 0.15 });
    const bagStrapMat = new T.MeshStandardMaterial({ name: 'bag_strap_black', color: 0x111111, roughness: 0.5, metalness: 0.2 });
    const bagBuckleMat = new T.MeshStandardMaterial({ name: 'bag_buckle_silver', color: 0xc9c9c9, roughness: 0.3, metalness: 0.7 });
    const bagRedMat = new T.MeshStandardMaterial({ name: 'bag_red_piping', color: 0xe21c1c, roughness: 0.5, metalness: 0.05 });
    const bagGroup = new T.Group();
    const bagLen = 1.5, bagR = 0.42;
    const bagBody = new T.Mesh(new T.CylinderGeometry(bagR, bagR, bagLen, 24, 1, true), bagBlackMat);
    bagBody.rotation.z = Math.PI / 2; bagBody.castShadow = true; bagGroup.add(bagBody);
    [-1, 1].forEach(s => {
      const cap = new T.Mesh(new T.CircleGeometry(bagR, 24), bagBlackMat);
      cap.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
      cap.position.x = s * bagLen / 2; cap.castShadow = true; bagGroup.add(cap);
    });
    const zip = new T.Mesh(new T.TorusGeometry(bagR * 0.98, 0.014, 6, 24, Math.PI * 0.85), bagStrapMat);
    zip.rotation.set(Math.PI / 2, Math.PI / 2, 0); zip.position.set(0.05, bagR * 0.15, 0); bagGroup.add(zip);
    const pocketOutline = new T.Mesh(new T.PlaneGeometry(0.62, 0.34), new T.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 }));
    pocketOutline.position.set(0.05, -0.02, bagR + 0.002); bagGroup.add(pocketOutline);
    [-0.22, 0.22].forEach(hx => {
      const handle = new T.Mesh(new T.TorusGeometry(0.3, 0.026, 8, 20, Math.PI), bagStrapMat);
      handle.position.set(hx, bagR - 0.02, 0); bagGroup.add(handle);
    });
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 512; logoCanvas.height = 200;
    const lctx = logoCanvas.getContext('2d');
    lctx.font = "italic bold 100px Georgia, 'Times New Roman', serif";
    lctx.fillStyle = '#e21c1c'; lctx.textBaseline = 'middle'; lctx.textAlign = 'center';
    lctx.save(); lctx.translate(256, 110); lctx.rotate(-0.04); lctx.fillText('Wilson', 0, 0); lctx.restore();
    const logoTex = new T.CanvasTexture(logoCanvas); logoTex.needsUpdate = true;
    const logoMat = new T.MeshBasicMaterial({ name: 'bag_logo_wilson', map: logoTex, transparent: true, depthTest: true, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    const logoPatch = new T.Mesh(new T.PlaneGeometry(0.95, 0.36), logoMat);
    logoPatch.position.set(0, 0.1, bagR + 0.01); bagGroup.add(logoPatch);


    bagGroup.position.set(netHalfW + 3.6, bagR + 0.02, 1.6);
    bagGroup.rotation.y = -0.4;
    root.add(bagGroup);

    // ---- enclosed squircle stadium bowl ----
    const wallInnerX = doublesX + 7.5, wallInnerZ = baseZ + 7.5;
    const ellA = wallInnerX + 1.3, ellB = wallInnerZ + 1.3;
    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 1024; boardCanvas.height = 128;
    const bctx = boardCanvas.getContext('2d');
    bctx.fillStyle = '#0e7a44'; bctx.fillRect(0, 0, 1024, 128);
    bctx.font = 'bold 46px Arial'; bctx.fillStyle = '#ffffff'; bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) bctx.fillText('CENTER  COURT', 128 + i * 256, 64);
    const boardTex = new T.CanvasTexture(boardCanvas);
    boardTex.wrapS = T.RepeatWrapping; boardTex.repeat.set(6, 1);
    const boardTexMat = new T.MeshStandardMaterial({ name: 'ad_board_green', map: boardTex, roughness: 0.6, side: T.DoubleSide });

    const ringSegs = 64;
    const SQ_N = 5;
    function squircleFactor(th) {
      const c = Math.cos(th), s = Math.sin(th);
      return { fx: Math.sign(c) * Math.pow(Math.abs(c), 2 / SQ_N), fz: Math.sign(s) * Math.pow(Math.abs(s), 2 / SQ_N) };
    }
    function ellipsePt(a, b, t) { const th = t * Math.PI * 2; const { fx, fz } = squircleFactor(th); return { x: fx * a, z: fz * b, th }; }
    function squircleArcPoints(a, b, n) {
      const SEG = 720;
      const pts = [];
      for (let i = 0; i <= SEG; i++) pts.push(ellipsePt(a, b, i / SEG));
      const cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
      const total = cum[cum.length - 1];
      const out = [];
      for (let k = 0; k < n; k++) {
        const target = (k / n) * total;
        let idx = 0;
        while (idx < cum.length - 2 && cum[idx + 1] < target) idx++;
        const segLen = cum[idx + 1] - cum[idx] || 1e-9;
        const f = (target - cum[idx]) / segLen;
        const p0 = pts[idx], p1 = pts[idx + 1];
        out.push({ x: p0.x + (p1.x - p0.x) * f, z: p0.z + (p1.z - p0.z) * f, th: p0.th + (p1.th - p0.th) * f });
      }
      return out;
    }
    function reshapeToSquircle(geo, a, b) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        if (Math.hypot(x, z) < 1e-6) continue;
        const th = Math.atan2(z, x);
        const { fx, fz } = squircleFactor(th);
        pos.setX(i, fx * a); pos.setZ(i, fz * b);
      }
      pos.needsUpdate = true; geo.computeVertexNormals();
    }
    const boardGeo = new T.CylinderGeometry(1, 1, 0.55, ringSegs, 1, true);
    reshapeToSquircle(boardGeo, ellA, ellB);
    const boardRing = new T.Mesh(boardGeo, boardTexMat);
    boardRing.position.y = 0.5; root.add(boardRing);
    const wallCapGeo = new T.CylinderGeometry(1, 1, 0.12, ringSegs, 1, true);
    reshapeToSquircle(wallCapGeo, ellA, ellB);
    const wallCap = new T.Mesh(wallCapGeo, wallMat);
    wallCap.position.y = 0.83; root.add(wallCap);

    const TUNNELS = [];
    function angDist(a, b) { return Math.abs(((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI); }
    function inTunnel(th) { return TUNNELS.some(tt => angDist(th, tt) < 0.12); }
    const AISLES = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    function inAisle(th) { return AISLES.some(a => angDist(th, a) < 0.05); }
    const stepMat = new T.MeshStandardMaterial({ name: 'aisle_step_concrete', color: 0x88888c, roughness: 0.9 });
    function buildAisleSteps(rows, innerA, innerB, rowH, rowD, startY) {
      AISLES.forEach(a => {
        for (let r = 0; r < rows; r++) {
          const ra = innerA + r * rowD, rb = innerB + r * rowD;
          const { x, z, th } = ellipsePt(ra, rb, a / (Math.PI * 2));
          const step = new T.Mesh(new T.BoxGeometry(0.5, rowH, rowD * 1.02), stepMat);
          step.position.set(x, startY + r * rowH - rowH * 0.15, z);
          step.rotation.y = -th - Math.PI / 2;
          step.receiveShadow = true; step.castShadow = true;
          root.add(step);
        }
      });
    }
    function buildTier(rows, innerA, innerB, rowH, rowD, startY, seatColorFn) {
      for (let r = 0; r < rows; r++) {
        const a = innerA + r * rowD, b = innerB + r * rowD;
        const circumf = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
        const seatsPerRing = Math.max(60, Math.round(circumf / 0.42));
        const seatW = (circumf / seatsPerRing) * 0.94;
        const geo = new T.BoxGeometry(seatW, rowH * 0.85, rowD * 0.8);
        const y = startY + r * rowH;
        const mat = seatColorFn(r);
        const inst = new T.InstancedMesh(geo, mat, seatsPerRing);
        let count = 0;
        const dummy = new T.Object3D();
        const pts = squircleArcPoints(a, b, seatsPerRing);
        for (let i = 0; i < seatsPerRing; i++) {
          const { x, z, th } = pts[i];
          if (inTunnel(th) || inAisle(th)) continue;
          dummy.position.set(x, y, z);
          dummy.rotation.y = -th - Math.PI / 2;
          dummy.updateMatrix();
          inst.setMatrixAt(count++, dummy.matrix);
        }
        inst.count = count;
        inst.instanceMatrix.needsUpdate = true;
        inst.castShadow = true; inst.receiveShadow = true;
        root.add(inst);
      }
    }
    const concreteMat = new T.MeshStandardMaterial({ name: 'stand_concrete', color: 0x9a9a9e, roughness: 0.95, side: T.DoubleSide });
    function buildSupportShell(rBottom, rBottomZ, rTop, rTopZ, yBottom, yTop) {
      const h = yTop - yBottom;
      const geo = new T.CylinderGeometry(1, 1, h, ringSegs, 1, true);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
        const f = (y + h / 2) / h;
        const rx = rBottom + (rTop - rBottom) * f;
        const rz = rBottomZ + (rTopZ - rBottomZ) * f;
        const th = Math.atan2(z, x);
        const { fx, fz } = squircleFactor(th);
        pos.setX(i, fx * rx); pos.setZ(i, fz * rz);
      }
      pos.needsUpdate = true; geo.computeVertexNormals();
      const shell = new T.Mesh(geo, concreteMat);
      shell.position.y = yBottom + h / 2; shell.receiveShadow = true; root.add(shell);
    }
    const concourseY = 1.0 + 13 * 0.42 + 0.3;
    buildSupportShell(ellA + 0.1, ellB + 0.1, ellA + 0.6 + 13 * 0.62 + 0.3, ellB + 0.6 + 13 * 0.62 + 0.3, 0, concourseY);
    buildTier(13, ellA + 0.6, ellB + 0.6, 0.42, 0.62, 1.0, r => (r % 2 === 0 ? seatBlueMat : seatRedMat));
    buildAisleSteps(13, ellA + 0.6, ellB + 0.6, 0.42, 0.62, 1.0);
    const concGeo = new T.CylinderGeometry(1, 1, 0.5, ringSegs, 1, true);
    reshapeToSquircle(concGeo, ellA + 0.6 + 13 * 0.62 + 0.9, ellB + 0.6 + 13 * 0.62 + 0.9);
    const concourse = new T.Mesh(concGeo, wallMat);
    concourse.position.y = concourseY; root.add(concourse);
    const sponsorNames = ['PRESENTING SPONSOR', 'OFFICIAL PARTNER', 'CHAMPIONSHIP SERIES', 'TOUR PARTNER'];
    for (let i = 0; i < sponsorNames.length; i++) {
      const t = i / sponsorNames.length + 0.06;
      const { x, z, th } = ellipsePt(ellA + 0.6 + 13 * 0.62 + 0.9, ellB + 0.6 + 13 * 0.62 + 0.9, t);
      if (inTunnel(th)) continue;
      const canvas = document.createElement('canvas');
      canvas.width = 512; canvas.height = 128;
      const c = canvas.getContext('2d');
      c.fillStyle = '#f4f4f2'; c.fillRect(0, 0, 512, 128);
      c.strokeStyle = '#1a2f66'; c.lineWidth = 6; c.strokeRect(6, 6, 500, 116);
      c.font = 'bold 34px Arial'; c.fillStyle = '#1a2f66'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(sponsorNames[i], 256, 64);
      const tex = new T.CanvasTexture(canvas);
      const panel = new T.Mesh(new T.PlaneGeometry(2.2, 0.55), new T.MeshStandardMaterial({ name: 'sponsor_panel_' + i, map: tex, roughness: 0.5 }));
      panel.position.set(x, concourseY + 0.55, z);
      panel.rotation.y = -th - Math.PI / 2;
      root.add(panel);
    }
    const roofYtemp = concourseY + 0.6 + 14 * 0.46 + 0.4;
    buildSupportShell(ellA + 0.6 + 13 * 0.62 + 1.3, ellB + 0.6 + 13 * 0.62 + 1.3, ellA + 0.6 + 13 * 0.62 + 1.6 + 14 * 0.66 + 0.5, ellB + 0.6 + 13 * 0.62 + 1.6 + 14 * 0.66 + 0.5, concourseY, roofYtemp);
    buildTier(14, ellA + 0.6 + 13 * 0.62 + 1.6, ellB + 0.6 + 13 * 0.62 + 1.6, 0.46, 0.66, concourseY + 0.6, r => (r % 2 === 0 ? seatRedMat : seatBlueMat));
    buildAisleSteps(14, ellA + 0.6 + 13 * 0.62 + 1.6, ellB + 0.6 + 13 * 0.62 + 1.6, 0.46, 0.66, concourseY + 0.6);

    // sparse spectator crowd scattered across a few seat rows, for atmosphere.
    // Built as InstancedMesh (one draw call per color) rather than one Mesh per person —
    // the naive per-person approach adds several thousand individual draw calls, which is
    // heavy enough to stall/crash weaker GPUs (software renderers in particular).
    const crowdColors = [0x8a3a3a, 0x3a5a8a, 0x5a5a3a, 0xd8d4c8, 0x3a3a3a, 0x8a6a3a];
    const crowdMats = crowdColors.map(c => new T.MeshStandardMaterial({ color: c, roughness: 0.85 }));
    const crowdTorsoGeo = new T.CylinderGeometry(0.11, 0.13, 0.34, 8);
    const crowdHeadGeo = new T.SphereGeometry(0.075, 8, 8);
    const crowdSlots = crowdMats.map(() => []);
    function scatterCrowd(rows, innerA, innerB, rowH, rowD, startY, fillProb) {
      rows.forEach(r => {
        const a = innerA + r * rowD, b = innerB + r * rowD;
        const circumf = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
        const n = Math.max(60, Math.round(circumf / 0.42));
        const pts = squircleArcPoints(a, b, n);
        const y = startY + r * rowH;
        pts.forEach(({ x, z, th }) => {
          if (inTunnel(th) || inAisle(th)) return;
          if (Math.random() > fillProb) return;
          const mi = Math.floor(Math.random() * crowdMats.length);
          crowdSlots[mi].push({ x, y, z, th });
        });
      });
    }
    scatterCrowd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], ellA + 0.6, ellB + 0.6, 0.42, 0.62, 1.0, 0.45);
    scatterCrowd([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], ellA + 0.6 + 13 * 0.62 + 1.6, ellB + 0.6 + 13 * 0.62 + 1.6, 0.46, 0.66, concourseY + 0.6, 0.42);
    const crowdDummy = new T.Object3D();
    crowdSlots.forEach((slots, mi) => {
      if (!slots.length) return;
      const torsoInst = new T.InstancedMesh(crowdTorsoGeo, crowdMats[mi], slots.length);
      const headInst = new T.InstancedMesh(crowdHeadGeo, crowdMats[mi], slots.length);
      slots.forEach((s, i) => {
        crowdDummy.position.set(s.x, s.y + 0.32, s.z);
        crowdDummy.rotation.set(0, -s.th - Math.PI / 2, 0);
        crowdDummy.updateMatrix();
        torsoInst.setMatrixAt(i, crowdDummy.matrix);
        crowdDummy.position.set(s.x, s.y + 0.55, s.z);
        crowdDummy.rotation.set(0, 0, 0);
        crowdDummy.updateMatrix();
        headInst.setMatrixAt(i, crowdDummy.matrix);
      });
      torsoInst.instanceMatrix.needsUpdate = true;
      headInst.instanceMatrix.needsUpdate = true;
      torsoInst.castShadow = true;
      root.add(torsoInst, headInst);
    });

    const roofY = roofYtemp;
    const roofOuterA = ellA + 0.6 + 13 * 0.62 + 1.6 + 14 * 0.66 + 1.2, roofOuterB = ellB + 0.6 + 13 * 0.62 + 1.6 + 14 * 0.66 + 1.2;
    const roofGeo = new T.CylinderGeometry(1, 1, 0.3, ringSegs, 1, true);
    reshapeToSquircle(roofGeo, roofOuterA, roofOuterB);
    const roofMat = new T.MeshStandardMaterial({ name: 'roof_lip_concrete', color: 0x8a8a90, roughness: 0.85, side: T.DoubleSide });
    const roofRing = new T.Mesh(roofGeo, roofMat);
    roofRing.position.y = roofY; root.add(roofRing);
    const underGeo = new T.CylinderGeometry(1, 1.06, 0.06, ringSegs, 1, true);
    reshapeToSquircle(underGeo, roofOuterA, roofOuterB);
    const roofUnder = new T.Mesh(underGeo, roofMat);
    roofUnder.position.y = roofY - 0.15; root.add(roofUnder);

    const floodLamps = [], floodSpots = [], floodPoints = [], floodBeams = [];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const px = sx * roofOuterA * 1.15, pz = sz * roofOuterB * 1.15;
      const pole = new T.Mesh(new T.CylinderGeometry(0.13, 0.16, roofY + 2.2, 8), lightPoleMat);
      pole.position.set(px, (roofY + 2.2) / 2, pz); pole.castShadow = true; root.add(pole);
      const rig = new T.Mesh(new T.BoxGeometry(1.7, 0.35, 0.35), lightPoleMat);
      rig.position.set(px, roofY + 2.2, pz); root.add(rig);
      for (let i = -2; i <= 2; i++) {
        const lamp = new T.Mesh(new T.BoxGeometry(0.3, 0.2, 0.34), lightFixtureMat);
        lamp.position.set(px + i * 0.4, roofY + 2.0, pz);
        lamp.rotation.x = -Math.sign(sz) * 0.6;
        root.add(lamp);
        floodLamps.push(lamp);
      }
      const spot = new T.SpotLight(0xfff3d6, 420, roofY * 2.2, Math.PI / 7, 0.4, 1.2);
      spot.position.set(px, roofY + 2.0, pz);
      spot.target.position.set(0, 0.3, 0);
      spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048);
      spot.shadow.bias = -0.0003; spot.shadow.normalBias = 0.04; spot.shadow.radius = 3;
      root.add(spot, spot.target);
      floodSpots.push(spot);
      const fixtureLight = new T.PointLight(0xfff3d6, 30, roofY * 2, 2);
      fixtureLight.position.set(px, roofY + 2.0, pz); root.add(fixtureLight);
      floodPoints.push(fixtureLight);
      const beamLen = Math.sqrt(px * px + pz * pz + (roofY + 2.0) * (roofY + 2.0));
      const beamGeo = new T.ConeGeometry(beamLen * Math.tan(Math.PI / 7), beamLen, 24, 1, true);
      beamGeo.translate(0, -beamLen / 2, 0);
      const beamMat = new T.MeshBasicMaterial({ name: 'floodlight_beam', color: 0xfff3d6, transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide });
      const beam = new T.Mesh(beamGeo, beamMat);
      const fixturePos = new T.Vector3(px, roofY + 2.0, pz);
      const targetPos = new T.Vector3(0, 0.3, 0);
      beam.position.copy(fixturePos);
      beam.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), targetPos.clone().sub(fixturePos).normalize());
      root.add(beam);
      floodBeams.push(beam);
    });

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0,0,0,0.38)'); grad.addColorStop(0.7, 'rgba(0,0,0,0.18)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad; sctx.fillRect(0, 0, 256, 256);
    const shadowTex = new T.CanvasTexture(shadowCanvas);
    const shadowDisc = new T.Mesh(new T.CircleGeometry(1, 48), new T.MeshBasicMaterial({ name: 'ground_contact_shadow', map: shadowTex, transparent: true, depthWrite: false }));
    shadowDisc.scale.set(roofOuterA * 1.15, roofOuterB * 1.15, 1);
    shadowDisc.rotation.x = -Math.PI / 2; shadowDisc.position.y = -0.02; root.add(shadowDisc);

    // ---- flip-tally tower near the net: green/white stacked cards, one per section ----
    const scoreboardGroup = new T.Group();
    const signMeshes = [];
    const sbX = netHalfW + 1.6, sbZ = 0.5;
    const towerGreen = new T.MeshStandardMaterial({ name: 'tally_tower_green', color: 0x0e7a44, roughness: 0.45 });
    const towerWhite = new T.MeshStandardMaterial({ name: 'tally_tower_white', color: 0xffffff, roughness: 0.15, emissive: 0xffffff, emissiveIntensity: 0.55 });
    const cardW = 1.05, cardH = 0.34, cardD = 0.09;
    const capR = 0.16;
    const SIGNS = [
      { id: 'about', label: 'ABOUT' },
      { id: 'experience', label: 'WORK' },
      { id: 'research', label: 'RESEARCH' },
      { id: 'projects', label: 'PROJECTS' },
      { id: 'journal', label: 'BLOG' },
    ];
    const poleH = 1.07;
    const boardsH = SIGNS.length * cardH;
    const towerH = poleH + boardsH + 0.35;
    // green domed cap
    const towerH2 = towerH + 0.6;
    const cap = new T.Mesh(new T.CylinderGeometry(capR * 0.85, capR, 0.14, 16), towerGreen);
    cap.position.set(0, towerH2, 0); cap.castShadow = true; scoreboardGroup.add(cap);
    const capDome = new T.Mesh(new T.SphereGeometry(capR * 0.85, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), towerGreen);
    capDome.position.set(0, towerH2 + 0.07, 0); scoreboardGroup.add(capDome);
    // central support spine (thin, hidden behind cards)
    const spine = new T.Mesh(new T.BoxGeometry(0.08, towerH, 0.08), towerGreen);
    spine.position.set(0, towerH / 2, -cardD * 0.3); scoreboardGroup.add(spine);
    const cardWorldPos = {};
    SIGNS.forEach((c, i) => {
      const sy = poleH + boardsH - i * cardH - cardH / 2;
      // scalloped green connector between cards (half-cylinder notch, interlocking look)
      const notch = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, cardD * 1.05, 12), towerGreen);
      notch.rotation.x = Math.PI / 2;
      notch.position.set(0, sy + cardH / 2, -cardD * 0.35); scoreboardGroup.add(notch);
      const canvas = document.createElement('canvas');
      canvas.width = 480; canvas.height = 110;
      const cx = canvas.getContext('2d');
      cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, 480, 110);
      cx.fillStyle = '#0a5c34'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      const fontSize = c.label.length > 8 ? 52 : 66;
      cx.font = `900 ${fontSize}px Arial`;
      cx.fillText(c.label, 240, 55);
      const tex = new T.CanvasTexture(canvas);
      const signMat = new T.MeshStandardMaterial({ name: 'tally_card_' + c.id, map: tex, roughness: 0.15, emissive: 0xffffff, emissiveIntensity: 0.3 });
      const board = new T.Mesh(new T.BoxGeometry(cardW, cardH * 0.94, cardD), signMat);
      board.position.set(0, sy, 0); board.castShadow = true; board.userData.sectionId = c.id;
      scoreboardGroup.add(board);
      signMeshes.push(board);
      // white side rails (like the reference's rounded card edges)
      [-1, 1].forEach(side => {
        const rail = new T.Mesh(new T.CylinderGeometry(cardD * 0.36, cardD * 0.36, cardH * 0.94, 10), towerWhite);
        rail.rotation.x = Math.PI / 2;
        rail.position.set(side * cardW * 0.5, sy, 0);
        scoreboardGroup.add(rail);
      });
      cardWorldPos[c.id] = [sbX, sy, sbZ + cardD * 0.6 + 0.4];
    });
    // score flip cards clipped to the top of the sign post
    function makeScoreCard(digit) {
      const g = new T.Group();
      const canvas = document.createElement('canvas');
      canvas.width = 160; canvas.height = 190;
      const cx2 = canvas.getContext('2d');
      cx2.fillStyle = '#111111'; cx2.fillRect(0, 0, 160, 190);
      cx2.fillStyle = '#ffffff'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
      cx2.font = '900 34px Arial'; cx2.fillText('SETS WON', 80, 26);
      cx2.font = '900 120px Arial'; cx2.fillText(String(digit), 80, 118);
      const tex = new T.CanvasTexture(canvas);
      const cardMat = new T.MeshStandardMaterial({ map: tex, roughness: 0.5 });
      const card = new T.Mesh(new T.BoxGeometry(0.34, 0.4, 0.03), cardMat);
      card.castShadow = true; g.add(card);
      [-0.12, 0.12].forEach(cx3 => {
        const clip = new T.Mesh(new T.TorusGeometry(0.025, 0.008, 6, 12), towerWhite);
        clip.position.set(cx3, 0.21, 0); g.add(clip);
      });
      return g;
    }
    const scoreRod = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.86, 8), towerWhite);
    scoreRod.rotation.z = Math.PI / 2;
    scoreRod.position.set(0, towerH + 0.42, 0); scoreboardGroup.add(scoreRod);
    const scoreCard1 = makeScoreCard(6); scoreCard1.position.set(-0.2, towerH + 0.22, 0); scoreboardGroup.add(scoreCard1);
    const scoreCard2 = makeScoreCard(0); scoreCard2.position.set(0.2, towerH + 0.22, 0); scoreboardGroup.add(scoreCard2);
    // green flared base + ground spike
    const baseFlare = new T.Mesh(new T.CylinderGeometry(capR * 1.4, capR * 0.9, 0.2, 16), towerGreen);
    baseFlare.position.set(0, 0.1, 0); baseFlare.castShadow = true; scoreboardGroup.add(baseFlare);
    const spike = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.5, 6), new T.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.6 }));
    spike.position.set(0, -0.15, 0); scoreboardGroup.add(spike);
    // small directional arrow near the base, pointing toward the court
    const arrowMat = towerGreen;
    const arrowShaft = new T.Mesh(new T.BoxGeometry(0.3, 0.05, 0.02), arrowMat);
    arrowShaft.position.set(0.1, 0.28, cardD * 0.55 + 0.01); scoreboardGroup.add(arrowShaft);
    const arrowHead = new T.Mesh(new T.ConeGeometry(0.07, 0.14, 4), arrowMat);
    arrowHead.rotation.z = -Math.PI / 2; arrowHead.rotation.y = Math.PI / 4;
    arrowHead.position.set(-0.06, 0.28, cardD * 0.55 + 0.01); scoreboardGroup.add(arrowHead);

    scoreboardGroup.position.set(sbX, 0, sbZ);
    root.add(scoreboardGroup);

    // ---- portfolio feature anchors ----
    function makeBeacon(x, y, z) {
      const beacon = new T.Group();
      beacon.position.set(x, y, z);
      scene.add(beacon);
      return { beacon, glow: beacon, ring: beacon };
    }
    const ANCHOR_DEF = {
      projects: { pos: cardWorldPos.projects, base: [netHalfW + 3.6, 1.6] },
      journal: { pos: cardWorldPos.journal, base: [1.0, 0.6] },
      about: { pos: cardWorldPos.about, base: [-5.0, 0] },
      experience: { pos: cardWorldPos.experience, base: [-5.0, 2.6] },
      research: { pos: cardWorldPos.research, base: [netHalfW - 0.28, 0.42] },
    };
    const anchors = Object.keys(ANCHOR_DEF).map(id => {
      const d = ANCHOR_DEF[id];
      const { beacon, glow, ring } = makeBeacon(d.pos[0], d.pos[1], d.pos[2]);
      return { id, v: beacon.position.clone(), beacon, glow, ring, base: new T.Vector3(d.base[0], 0, d.base[1]) };
    });

    // ---- first-person controls ----
    const spawnPos = { x: 3.8, z: 11.3 };
    const spawnYaw = Math.PI + 0.15;
    const pos = new T.Vector3(spawnPos.x, 1.7, spawnPos.z);
    let yaw = spawnYaw, pitch = -0.05;
    let overview = false;
    const overviewPos = new T.Vector3(0, roofY * 1.6, roofOuterB * 1.9);
    const overviewTarget = new T.Vector3(0, 1, 0);
    const camPos = new T.Vector3();
    const camLook = new T.Vector3();
    const wallMargin = wallInnerX - 0.4, wallMarginZ = wallInnerZ - 0.4;
    let target = null;
    const keys = Object.create(null);
    let dragging = false, lastPX = 0, lastPY = 0, stepAcc = 0;
    const dom = renderer.domElement;
    dom.style.touchAction = 'none'; dom.style.cursor = 'grab';
    function clampPos() {
      pos.x = Math.max(-wallMargin, Math.min(wallMargin, pos.x));
      pos.z = Math.max(-wallMarginZ, Math.min(wallMarginZ, pos.z));
    }
    function onDown(e) { dragging = true; lastPX = e.clientX; lastPY = e.clientY; dom.style.cursor = 'grabbing'; try { dom.setPointerCapture(e.pointerId); } catch (_) {} }
    const raycaster = new T.Raycaster();
    const pointerNDC = new T.Vector2();
    function onUp(e) {
      const moved = Math.abs(e.clientX - lastPX) + Math.abs(e.clientY - lastPY);
      dragging = false; dom.style.cursor = 'grab'; try { dom.releasePointerCapture(e.pointerId); } catch (_) {}
      clearKeys();
      if (moved < 5 && opts.onSignClick) {
        const rect = dom.getBoundingClientRect();
        pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects(signMeshes, false);
        if (hits.length && hits[0].object.userData.sectionId) opts.onSignClick(hits[0].object.userData.sectionId);
      }
    }
    const hoverNDC = new T.Vector2(-10, -10);
    function onDrag(e) {
      const rect = dom.getBoundingClientRect();
      hoverNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      hoverNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!dragging) return;
      const dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      if (Math.abs(dx) + Math.abs(dy) > 2) target = null;
      yaw -= dx * 0.0032; pitch = Math.max(-0.5, Math.min(0.45, pitch - dy * 0.0032));
      lastPX = e.clientX; lastPY = e.clientY;
    }
    function onPointerLeave() { hoverNDC.set(-10, -10); }
    function onWheel(e) { e.preventDefault(); target = null; pos.x += Math.sin(yaw) * (-e.deltaY * 0.006); pos.z += Math.cos(yaw) * (-e.deltaY * 0.006); clampPos(); }
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointercancel', onUp);
    dom.addEventListener('pointermove', onDrag);
    dom.addEventListener('pointerleave', onPointerLeave);
    dom.addEventListener('wheel', onWheel, { passive: false });
    const onKey = (down) => (e) => {
      const k = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(k) === -1) return;
      keys[k] = down; if (down) target = null;
    };
    const kd = onKey(true), ku = onKey(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    function clearKeys() { for (const k in keys) keys[k] = false; }
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearKeys(); });

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

    const clock = new T.Clock();
    let running = true;
    const proj = new T.Vector3();

    function onContextLost(e) {
      e.preventDefault();
      running = false;
      console.warn('[tennis-court] WebGL context lost — pausing until restored.');
    }
    function onContextRestored() {
      console.warn('[tennis-court] WebGL context restored.');
      running = true;
      loop();
    }
    dom.addEventListener('webglcontextlost', onContextLost, false);
    dom.addEventListener('webglcontextrestored', onContextRestored, false);

    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      try {
        const t = clock.getElapsedTime();
        let mx = 0, mz = 0;
        if (keys.KeyW || keys.ArrowUp) mz += 1;
        if (keys.KeyS || keys.ArrowDown) mz -= 1;
        if (keys.KeyD || keys.ArrowRight) mx -= 1;
        if (keys.KeyA || keys.ArrowLeft) mx += 1;
        const moving = mx !== 0 || mz !== 0;
        if (moving) {
          const len = Math.hypot(mx, mz) || 1; mx /= len; mz /= len;
          const spd = 0.16;
          pos.x += (Math.sin(yaw) * mz + Math.cos(yaw) * mx) * spd;
          pos.z += (Math.cos(yaw) * mz - Math.sin(yaw) * mx) * spd;
          clampPos();
          stepAcc += spd; if (stepAcc > 0.6) { stepAcc = 0; if (opts.onFootstep) opts.onFootstep(); }
        } else if (target) {
          pos.x += (target.x - pos.x) * 0.06; pos.z += (target.z - pos.z) * 0.06;
          let dyaw = target.yaw - yaw; while (dyaw > Math.PI) dyaw -= 6.283; while (dyaw < -Math.PI) dyaw += 6.283;
          yaw += dyaw * 0.06;
          if (Math.hypot(target.x - pos.x, target.z - pos.z) < 0.15) target = null;
        }
        const bob = moving ? Math.sin(t * 9) * 0.03 : Math.sin(t * 1.4) * 0.01;
        const fpPos = new T.Vector3(pos.x, 1.7 + bob, pos.z);
        const fpLook = new T.Vector3(pos.x + Math.sin(yaw) * Math.cos(pitch), 1.7 + bob + Math.sin(pitch), pos.z + Math.cos(yaw) * Math.cos(pitch));
        const goalPos = overview ? overviewPos : fpPos;
        const goalLook = overview ? overviewTarget : fpLook;
        camPos.lerp(goalPos, overview ? 0.04 : 0.08);
        camLook.lerp(goalLook, overview ? 0.04 : 0.08);
        camera.position.copy(camPos);
        camera.lookAt(camLook);

        raycaster.setFromCamera(hoverNDC, camera);
        const hoverHits = raycaster.intersectObjects(signMeshes, false);
        const hoveredId = hoverHits.length ? hoverHits[0].object.userData.sectionId : null;
        for (const b of signMeshes) {
          const isHovered = b.userData.sectionId === hoveredId;
          b.position.z += ((isHovered ? 0.04 : 0) - b.position.z) * 0.2;
          b.material.emissiveIntensity += ((isHovered ? 0.42 : 0.3) - b.material.emissiveIntensity) * 0.2;
        }
        if (!dragging) dom.style.cursor = hoveredId ? 'pointer' : 'grab';

        for (const a of anchors) {
          // beacon visuals removed; anchors now only track position for signpost click/projection
        }
        const rect = { w: container.clientWidth, h: container.clientHeight };
        const out = anchors.map(a => {
          proj.copy(a.beacon.position).project(camera);
          const x = (proj.x * 0.5 + 0.5) * rect.w, y = (-proj.y * 0.5 + 0.5) * rect.h;
          const visible = proj.z < 1 && x > -50 && x < rect.w + 50;
          return { id: a.id, x, y, visible };
        });
        // enforce a minimum vertical gap between labels whose x-positions are close (avoids badge overlap on the signpost)
        const MIN_GAP = 34, MIN_GAP_X = 140;
        const sorted = out.slice().sort((p, q) => p.y - q.y);
        for (let i = 1; i < sorted.length; i++) {
          for (let j = 0; j < i; j++) {
            if (Math.abs(sorted[i].x - sorted[j].x) > MIN_GAP_X) continue;
            if (sorted[i].y - sorted[j].y < MIN_GAP) sorted[i].y = sorted[j].y + MIN_GAP;
          }
        }
        onAnchors(out);

        renderer.render(scene, camera);
      } catch (e) {
        running = false;
        if (opts.onError) opts.onError(e);
        else console.error('[tennis-court] render loop error:', e);
      }
    }
    loop();

    let lightMode = false;
    function setLightMode(v) {
      lightMode = v;
      if (v) {
        scene.background.set(0x9fc9e8);
        scene.fog.color.set(0x9fc9e8);
        hemi.intensity = 0.85; hemi.color.set(0xffffff); hemi.groundColor.set(0x6b7a5c);
        key.intensity = 1.15; key.color.set(0xffffff);
        fill.intensity = 0.4;
        floodSpots.forEach(s => s.intensity = 0);
        floodPoints.forEach(p => p.intensity = 0);
        floodBeams.forEach(b => b.material.opacity = 0);
        floodLamps.forEach(l => l.material.emissiveIntensity = 0.4);
        grassMat.color.set(0x6fa070);
        courtMat.color.set(0x5f93a8);
      } else {
        scene.background.set(0x05070d);
        scene.fog.color.set(0x05070d);
        hemi.intensity = 0.4; hemi.color.set(0xaac4ff); hemi.groundColor.set(0x0a0e1a);
        key.intensity = 0.65; key.color.set(0xfff6e0);
        fill.intensity = 0.15;
        floodSpots.forEach(s => s.intensity = 420);
        floodPoints.forEach(p => p.intensity = 30);
        floodBeams.forEach(b => b.material.opacity = 0.22);
        floodLamps.forEach(l => l.material.emissiveIntensity = 6);
        grassMat.color.set(0xffffff);
        courtMat.color.set(0xffffff);
      }
    }

    let audioCtx = null, audioNodes = null;
    function startAmbience() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const bufLen = audioCtx.sampleRate * 4;
      const buffer = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufLen; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.05;
        b1 = 0.985 * b1 + white * 0.08;
        b2 = 0.95 * b2 + white * 0.1;
        data[i] = (b0 + b1 + b2) * 0.6;
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buffer; src.loop = true;
      const bandpass = audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass'; bandpass.frequency.value = 450; bandpass.Q.value = 0.6;
      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass'; lowpass.frequency.value = 1200;
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.09;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.05;
      lfo.connect(lfoGain); lfoGain.connect(gain.gain);
      src.connect(bandpass); bandpass.connect(lowpass); lowpass.connect(gain); gain.connect(audioCtx.destination);
      src.start(); lfo.start();
      audioNodes = { src, gain, lfo };
    }
    function setSound(v) {
      if (v) startAmbience();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (v) {
        audioNodes.gain.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 0.6);
      } else if (audioNodes) {
        audioNodes.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      }
    }

    return {
      setLightMode,
      setSound,
      walkTo(id) {
        overview = false;
        const a = anchors.find(x => x.id === id); if (!a) return;
        const dir = new T.Vector3(-a.base.x, 0, -a.base.z);
        if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1); else dir.normalize();
        const tx = a.base.x + dir.x * 1.8, tz = a.base.z + dir.z * 1.8;
        target = { x: Math.max(-wallMargin, Math.min(wallMargin, tx)), z: Math.max(-wallMarginZ, Math.min(wallMarginZ, tz)), yaw: Math.atan2(a.base.x - tx, a.base.z - tz) };
      },
      toggleOverview(v) { overview = typeof v === 'boolean' ? v : !overview; target = null; return overview; },
      resetToStart() {
        overview = false; target = null;
        pos.x = spawnPos.x; pos.z = spawnPos.z; yaw = spawnYaw; pitch = -0.05;
      },
      dispose() {
        running = false; ro.disconnect();
        if (audioNodes) { try { audioNodes.src.stop(); audioNodes.lfo.stop(); } catch (_) {} }
        if (audioCtx) { try { audioCtx.close(); } catch (_) {} }
        dom.removeEventListener('pointerdown', onDown);
        dom.removeEventListener('pointerup', onUp);
        dom.removeEventListener('pointercancel', onUp);
        dom.removeEventListener('pointermove', onDrag);
        dom.removeEventListener('pointerleave', onPointerLeave);
        dom.removeEventListener('wheel', onWheel);
        dom.removeEventListener('webglcontextlost', onContextLost);
        dom.removeEventListener('webglcontextrestored', onContextRestored);
        window.removeEventListener('keydown', kd);
        window.removeEventListener('keyup', ku);
        window.removeEventListener('blur', clearKeys);
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      },
    };
  }
  window.buildTennisCourt = buildTennisCourt;
})();
