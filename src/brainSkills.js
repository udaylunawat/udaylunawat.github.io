// brainSkills.js — transparent brain + neon labels + particles + CSS2D name + per-card HORIZONTAL chip carousel (mobile-scaled)
export function mountBrainSkills({
  container,
  glbPath,
  clusters = [],
  options = {}
} = {}) {
  if (!container) throw new Error('mountBrainSkills: container is required');
  const THREE = window.THREE;
  if (!THREE?.GLTFLoader) throw new Error('THREE.GLTFLoader missing (load UMD helpers first)');

  // ---- Config ----
  const cfg = {
    keepRatio: 0.20,
    accent: 0x26a269,
    baseOpacity: 0.035,
    fresnelPow: 2.1,
    edgeStrength: 0.10,
    showSurface: true,
    showEdges: true,
    rotSpeed: 0.0009,
    pause: false,
    labelBaseScale: 1.0,
    hoverScale: 1.10,
    particles: {
      enabled: true,
      count: 700,
      baseSize: 2.0,
      pulseAmp: 2.0,
      opacity: 0.95,
      linksPerNode: 3,
      linkDist: 2.8,
      rewireMs: 700
    },
    name: {
      text: '',
      offset: { x: 0, y: -0.9, z: 0 },
      visible: true
    },
    carousel: {
      enabled: true,
      visibleCount: 2,          // chips visible per card (desktop default)
      switchMs: 3500,
      switchMsMobile: 4200
    },
    ...options
  };

  // ---- Canvas / Renderer ----
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;';
  container.style.position ||= 'relative';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  // initial DPR; we’ll also reset in resize()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);

  // ---- CSS2D overlay (name) ----
  let labelRenderer = null;
  if (THREE.CSS2DRenderer) {
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.inset = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRenderer.domElement.style.zIndex = '2';
    container.appendChild(labelRenderer.domElement);
  }

  // ---- Scene / Camera / Rig ----
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 0, 4);

  const rig = new THREE.Group(); // rotate/scale name + brain together
  scene.add(rig);

  scene.add(new THREE.AmbientLight(0xa0ffd0, 0.22));
  const dir = new THREE.DirectionalLight(0xffffff, 0.28); dir.position.set(5,10,7); scene.add(dir);

  // ---- Mobile / UI scale helpers ----
  let isMobile = window.matchMedia('(max-width: 768px)').matches;
  const mq = window.matchMedia('(max-width: 768px)');
  mq.addEventListener?.('change', e => { isMobile = e.matches; tuneForViewport(); });

  function computeUiScale() {
    // 320..768 px -> 0.90..1.10
    const w = container.clientWidth || 360;
    const s = 0.90 + Math.min(1, Math.max(0, (w - 320) / (768 - 320))) * 0.20;
    return s;
  }

  function getChipSwitchMs(){
    return isMobile ? cfg.carousel.switchMsMobile : cfg.carousel.switchMs;
  }

  function tuneForViewport(){
    // push CSS vars for text sizing (read by injected CSS)
    const ui = computeUiScale();
    container.style.setProperty('--ui-scale', ui.toFixed(3));
    container.style.setProperty('--chip-font', isMobile ? '12px' : '13px');

    // adjust carousel count
    cfg.carousel.visibleCount = isMobile ? 1 : (options?.carousel?.visibleCount ?? cfg.carousel.visibleCount);

    // slightly larger card base scale on phones
    cfg.labelBaseScale = isMobile ? 1.25 : 1.0;

    // recalc carousels immediately
    chipCarousels.forEach(cc => { cc.visible = Math.max(1, cfg.carousel.visibleCount|0); cc.start = 0; });
    measureAllChipCarousels();

    // refit the brain to current viewport
    resize();
    fitBrain(isMobile ? 0.88 : 0.82);
  }

  // ---- Materials ----
  const accent = new THREE.Color(cfg.accent);
  const makeHolo = () => new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uColor:{value:accent}, uFresnelPow:{value:cfg.fresnelPow}, uBaseOpacity:{value:cfg.baseOpacity} },
    vertexShader: `
      varying vec3 vW; varying vec3 vN;
      void main(){ vN=normalize(normalMatrix*normal); vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz;
        gl_Position=projectionMatrix*viewMatrix*wp;
      }`,
    fragmentShader: `
      precision mediump float; uniform float uTime; uniform vec3 uColor; uniform float uFresnelPow; uniform float uBaseOpacity;
      varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 V=normalize(cameraPosition - vW);
        float fres = pow(1.0 - max(dot(normalize(vN),V),0.0), uFresnelPow);
        float scan = 0.5 + 0.5 * sin(vW.y*0.30 + uTime*1.2);
        float grid = step(0.48, fract(vW.y*0.05 + uTime*0.10)) * 0.12;
        float a = clamp(uBaseOpacity + fres*0.18 + grid, 0.0, 0.35);
        vec3 col = uColor * (0.30 + mix(scan, 1.0, fres) * 0.45);
        gl_FragColor = vec4(col, a);
      }`,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
  });

  const makeWire = () => new THREE.ShaderMaterial({
    uniforms:{ uTime:{value:0}, uColor:{value:accent}, uEdge:{value:cfg.edgeStrength} },
    vertexShader: `varying vec3 vW; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader:`precision mediump float; uniform float uTime; uniform vec3 uColor; uniform float uEdge; varying vec3 vW;
      void main(){ float w=0.5+0.5*sin(uTime*0.9+vW.y*1.0); vec3 col=uColor*(0.40+0.36*w); float a=clamp(uEdge*(0.5+0.8*w),0.,1.); gl_FragColor=vec4(col,a); }`,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
  });

  // ---- Particles shaders ----
  const pointsVert = `
    uniform float uTime; uniform float uBaseSize; uniform float uPulseAmp; uniform float uOpacity;
    attribute float aSize; attribute float aPhase; varying float vAlpha;
    void main(){
      vec3 p=position; float wiggle=0.18*sin(uTime*0.8 + aPhase); p += normalize(p)*wiggle;
      vec4 mv = modelViewMatrix*vec4(p,1.0);
      float pulse = 0.5+0.5*sin(uTime*1.1 + aPhase);
      float size = (uBaseSize + uPulseAmp*pulse) * aSize;
      gl_PointSize = size * (280.0 / -mv.z);
      vAlpha = uOpacity * (0.35 + 0.65*pulse);
      gl_Position = projectionMatrix*mv;
    }`;
  const pointsFrag = `precision mediump float; varying float vAlpha; void main(){ vec2 c=gl_PointCoord-vec2(0.5); float d=length(c); float ring=smoothstep(0.5,0.0,d), core=smoothstep(0.18,0.0,d); float a=clamp(ring*.8 + core*.4, 0., 1.) * vAlpha; gl_FragColor=vec4(0.62,1.0,0.84,a);} `;
  const lineVert = `uniform float uTime; varying float vAlpha; attribute float aOpacity; attribute float aPhase; void main(){ vAlpha = aOpacity * (0.75 + 0.25 * sin(uTime*1.2 + aPhase)); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const lineFrag = `precision mediump float; varying float vAlpha; void main(){ gl_FragColor=vec4(0.15,0.82,0.53,vAlpha); }`;

  // ---- State ----
  const loader = new THREE.GLTFLoader();
  const modifier = new THREE.SimplifyModifier();
  let root, mesh, wire, holoMat, wireMat, originalGeom;
  let animatedMats = [];
  let anchors = {};
  const cards = [];
  const hoverScale = new Map();
  let points, lines, pGeom, lineGeom, pointsMat, lineMat;
  let CONNECTIONS = cfg.particles.linksPerNode;
  let lastRewire = 0;
  let dragging=true, prevX=0, rotY=0, targetRotY=0, rafId=null;

  // ---- Per-card HORIZONTAL chip carousels ----
  const chipCarousels = [];   // [{el, viewport, track, chips, widths, offsets, start, visible, paused, gap}]
  let lastChipTick = performance.now();

  // ---- Name state ----
  let nameObj = null, nameSpriteMat = null;

  // ---- CSS injection ----
  const injectCSS = () => {
    if (document.getElementById('brain-label-css')) return;
    const el = document.createElement('style');
    el.id = 'brain-label-css';
    el.textContent = `
      :root{ --ui-scale:1; --chip-font:12px; }
      .brain-cluster{position:absolute;left:0;top:0;transform:translate(-50%,-50%) scale(1);min-width:190px;
        background:rgba(18,24,28,.55);border:1px solid rgba(38,162,105,.28);backdrop-filter:blur(8px) saturate(130%);
        border-radius:14px;padding:10px 12px;color:#fff;box-shadow:0 8px 24px rgba(38,162,105,.10);pointer-events:auto;opacity:0;
        transition:box-shadow .16s ease,border-color .16s ease;}
      .brain-cluster h4{margin:0 0 6px;font-weight:600;font-size:clamp(10px, calc(12px * var(--ui-scale)), 14px);letter-spacing:.35px;color:rgba(255,255,255,.9);text-shadow:0 0 6px rgba(38,162,105,.35);}      
      .brain-chips-viewport{position:relative;overflow:hidden;width:100%;}
      .brain-chips-track{display:flex;flex-direction:row;gap:6px;will-change:transform;transition:transform .55s ease;}
      .brain-chip{display:inline-flex;align-items:center;gap:6px;padding:calc(5px * var(--ui-scale)) calc(7px * var(--ui-scale));border-radius:10px;background:rgba(38,162,105,.12);
        border:1px solid rgba(38,162,105,.35);font-size:clamp(10px, calc(var(--chip-font) * var(--ui-scale)), 14px);color:#fff;white-space:nowrap;transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease,filter .12s ease,text-shadow .12s ease;}
      .brain-cluster h4:hover,.brain-chip:hover,.brain-chip:focus-visible{
        color:#f2fff8;text-shadow:0 0 12px rgba(38,162,105,1),0 0 26px rgba(38,162,105,1),0 0 42px rgba(38,162,105,.95),
        0 0 80px rgba(38,162,105,.75),0 0 120px rgba(38,162,105,.6);filter:drop-shadow(0 0 22px rgba(38,162,105,1));outline:none;}
      .brain-chip:hover,.brain-chip:focus-visible{ background: rgba(38,162,105,.22); border-color: rgba(38,162,105,.75); }
      .brain-name2d{
        pointer-events:none;font:700 clamp(18px, calc(3.6vw * var(--ui-scale)), 56px)/1.1 'Montserrat',sans-serif;letter-spacing:.06em;color:#e8fff3;
        -webkit-text-stroke:.4px rgba(0,0,0,.25);
        text-shadow:0 0 12px rgba(38,162,105,1),0 0 28px rgba(38,162,105,1),0 0 48px rgba(38,162,105,.9),0 0 90px rgba(38,162,105,.7);
      }
      @media (max-width: 768px){ .brain-chip{ -webkit-text-stroke:0; } }
    `;
    document.head.appendChild(el);
  };
  injectCSS();

  // ---- Utils ----
  const project = (obj3D) => {
    const v = new THREE.Vector3().copy(obj3D.position);
    obj3D.parent.localToWorld(v); v.project(camera);
    return { x:(v.x+1)*0.5*container.clientWidth, y:(1-v.y)*0.5*container.clientHeight, z:v.z };
  };

  // HORIZONTAL chip carousel helpers
  function measureChipCarousel(cc){
    cc.track.style.transform = 'translateX(0)';
    // compute each chip width including margins
    cc.widths = cc.chips.map(ch => ch.getBoundingClientRect().width);
    // viewport width = sum of first N chips + gaps
    const vis = Math.min(cc.visible, cc.widths.length);
    const gap = cc.gap;
    let vpW = 0;
    for (let i=0;i<vis;i++) vpW += cc.widths[i];
    const gapsInView = Math.max(0, vis - 1);
    vpW += gapsInView * gap;
    // ensure we can always see at least the longest chip among those in view
    const longest = cc.widths.slice(0, Math.max(1, vis)).reduce((a,b)=>Math.max(a,b), 0);
    vpW = Math.max(longest, vpW);

    cc.viewport.style.width = `${Math.ceil(vpW)}px`;

    // cumulative x offsets for translateX
    cc.offsets = [0];
    for (let i = 1; i < cc.chips.length; i++) {
      cc.offsets[i] = cc.offsets[i-1] + cc.widths[i-1] + gap;
    }
    applyChipWindow(cc);
  }

  function measureAllChipCarousels(){ chipCarousels.forEach(measureChipCarousel); }

  function applyChipWindow(cc){
    const x = cc.offsets[cc.start] || 0;
    cc.track.style.transform = `translateX(-${x}px)`;
  }

  function stepChipWindow(cc){
    if (!cc.chips.length) return;
    cc.start = (cc.start + cc.visible) % cc.chips.length;
    applyChipWindow(cc);
  }

  function tickChipCarousels(now){
    if (!cfg.carousel.enabled) return;
    const switchEvery = getChipSwitchMs();
    if (now - lastChipTick > switchEvery) {
      lastChipTick = now;
      chipCarousels.forEach(cc => {
        if (!cc.paused && cc.chips.length > cc.visible) stepChipWindow(cc);
      });
    }
  }

  // Build cluster cards with per-card horizontal chip carousel
  function buildLabels() {
    cards.forEach(c => c.el.remove()); cards.length = 0; hoverScale.clear();
    chipCarousels.length = 0;

    clusters.forEach((c)=>{
      const el = document.createElement('div');
      el.className = 'brain-cluster';

      const chipsHTML = (c.items||[])
        .map(it => `<span class="brain-chip" tabindex="0">${it.label}</span>`)
        .join('');

      el.innerHTML = `
        <h4>${c.title||c.key}</h4>
        <div class="brain-chips-viewport">
          <div class="brain-chips-track">${chipsHTML}</div>
        </div>
      `;

      container.appendChild(el);
      hoverScale.set(el, 1.0);
      el.addEventListener('mouseenter', ()=>hoverScale.set(el, cfg.hoverScale));
      el.addEventListener('mouseleave', ()=>hoverScale.set(el, 1.0));
      cards.push({key:c.key, el});

      const viewport = el.querySelector('.brain-chips-viewport');
      const track    = el.querySelector('.brain-chips-track');
      const chips    = Array.from(track.querySelectorAll('.brain-chip'));

      const cc = {
        el, viewport, track, chips,
        widths: [], offsets: [],
        start: 0,
        visible: Math.max(1, cfg.carousel.visibleCount|0),
        paused: false,
        gap: 6 // must match CSS gap
      };
      chipCarousels.push(cc);

      // pause on hover/focus to let users read
      el.addEventListener('mouseenter', ()=>{ cc.paused = true; });
      el.addEventListener('mouseleave', ()=>{ cc.paused = false; });
      track.addEventListener('focusin', ()=>{ cc.paused = true; });
      track.addEventListener('focusout', ()=>{ cc.paused = false; });
    });

    queueMicrotask(measureAllChipCarousels);
    requestAnimationFrame(() => measureAllChipCarousels());
    if (document.fonts?.ready) {
      document.fonts.ready.then(measureAllChipCarousels);
    }
    window.addEventListener('load', measureAllChipCarousels);

    // kick once so you see motion immediately
    setTimeout(() => {
      chipCarousels.forEach(cc => {
        if (cc.chips.length > cc.visible) stepChipWindow(cc);
      });
      lastChipTick = performance.now();
    }, 250);
  }

  function triangleCentroids(nonIndexedGeometry){
    const pos = nonIndexedGeometry.attributes.position.array;
    const triCount = pos.length/9, out = new Float32Array(triCount*3);
    for(let i=0;i<triCount;i++){
      const b=i*9;
      out[i*3  ]=(pos[b]+pos[b+3]+pos[b+6])/3;
      out[i*3+1]=(pos[b+1]+pos[b+4]+pos[b+7])/3;
      out[i*3+2]=(pos[b+2]+pos[b+5]+pos[b+8])/3;
    }
    return out;
  }

  function buildParticlesFromGeometry(geom){
    if(points){ mesh.remove(points); points.geometry.dispose(); points.material.dispose(); points=null; }
    if(lines){ mesh.remove(lines); lineGeom?.dispose?.(); lineMat?.dispose?.(); lines=null; }

    const cents = triangleCentroids(geom.toNonIndexed());
    const triCount = cents.length/3;
    const desired = cfg.particles.count;
    const step = Math.max(1, Math.floor(triCount/desired));
    const count = Math.min(desired, Math.floor(triCount/step));

    const posArr = new Float32Array(count*3);
    const sizes  = new Float32Array(count);
    const phases = new Float32Array(count);
    for(let i=0,j=0;i<triCount && j<count;i+=step,j++){
      posArr[j*3]=cents[i*3]; posArr[j*3+1]=cents[i*3+1]; posArr[j*3+2]=cents[i*3+2];
      sizes[j]=0.9+Math.random()*0.8; phases[j]=Math.random()*Math.PI*2;
    }

    pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(posArr,3));
    pGeom.setAttribute('aSize', new THREE.BufferAttribute(sizes,1));
    pGeom.setAttribute('aPhase', new THREE.BufferAttribute(phases,1));
    pointsMat = new THREE.ShaderMaterial({
      uniforms:{ uTime:{value:0}, uBaseSize:{value:cfg.particles.baseSize}, uPulseAmp:{value:cfg.particles.pulseAmp}, uOpacity:{value:cfg.particles.opacity} },
      vertexShader: pointsVert, fragmentShader: pointsFrag,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
    });
    points = new THREE.Points(pGeom, pointsMat); points.visible = cfg.particles.enabled;
    mesh.add(points);

    CONNECTIONS = cfg.particles.linksPerNode;
    const maxSeg = count * CONNECTIONS;
    const linePositions = new Float32Array(maxSeg*2*3);
    const lineOpacities = new Float32Array(maxSeg*2);
    const linePhases    = new Float32Array(maxSeg*2);
    lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions,3).setUsage(THREE.DynamicDrawUsage));
    lineGeom.setAttribute('aOpacity', new THREE.BufferAttribute(lineOpacities,1).setUsage(THREE.DynamicDrawUsage));
    lineGeom.setAttribute('aPhase',   new THREE.BufferAttribute(linePhases,1).setUsage(THREE.DynamicDrawUsage));
    lineMat = new THREE.ShaderMaterial({ uniforms:{uTime:{value:0}}, vertexShader:lineVert, fragmentShader:lineFrag,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
    lines = new THREE.LineSegments(lineGeom, lineMat); lines.visible = cfg.particles.enabled && CONNECTIONS>0;
    mesh.add(lines);

    // links
    const LINK2 = cfg.particles.linkDist * cfg.particles.linkDist;
    const pa = pGeom.attributes.position.array; const n = pa.length/3;
    const maxPer = new Uint8Array(n); let countSeg=0;
    for(let i=0;i<n;i++){
      if(maxPer[i]>=CONNECTIONS) continue;
      const ax=pa[i*3], ay=pa[i*3+1], az=pa[i*3+2];
      for(let j=i+1;j<n;j++){
        if(maxPer[j]>=CONNECTIONS) continue;
        const bx=pa[j*3], by=pa[j*3+1], bz=pa[j*3+2];
        const dx=ax-bx, dy=ay-by, dz=az-bz; const d2=dx*dx+dy*dy+dz*dz;
        if(d2<LINK2){
          const k=countSeg*2*3; if(k>=linePositions.length) break;
          linePositions[k]=ax; linePositions[k+1]=ay; linePositions[k+2]=az;
          linePositions[k+3]=bx; linePositions[k+4]=by; linePositions[k+5]=bz;
          const baseOp = Math.max(0.06, 1.0 - Math.sqrt(d2)/cfg.particles.linkDist) * 0.35;
          const o=countSeg*2; lineOpacities[o]=baseOp; lineOpacities[o+1]=baseOp;
          const p=countSeg*2; linePhases[p]=Math.random()*Math.PI*2; linePhases[p+1]=Math.random()*Math.PI*2;
          countSeg++; maxPer[i]++; maxPer[j]++; if(maxPer[i]>=CONNECTIONS) break;
        }
      }
    }
    lineGeom.setDrawRange(0, countSeg*2);
    lineGeom.attributes.position.needsUpdate = true;
    lineGeom.attributes.aOpacity.needsUpdate = true;
    lineGeom.attributes.aPhase.needsUpdate   = true;
  }

  function buildWithRatio(keep){
    let geom = THREE.BufferGeometryUtils.mergeVertices(mesh.geometry.toNonIndexed());
    const triCount = geom.attributes.position.count/3;
    const target = Math.max(48, Math.floor(triCount*keep));
    geom = modifier.modify(geom, target);
    geom.computeVertexNormals();
    mesh.geometry = geom;

    holoMat = makeHolo();
    mesh.material = holoMat;

    if(wire) mesh.remove(wire);
    wireMat = makeWire();
    wire = new THREE.LineSegments(new THREE.WireframeGeometry(geom), wireMat);
    mesh.add(wire);

    animatedMats = [];
    mesh.traverse(o => { const m=o.material; if(m?.uniforms?.uTime) animatedMats.push(m); });
  }

  // ---- Name text sprite fallback ----
  function makeTextSprite(text){
    const cnv = document.createElement('canvas');
    const ctx = cnv.getContext('2d');
    const px = 256, pad = 32;
    cnv.width = 1024; cnv.height = 256;
    ctx.font = `700 ${px}px Montserrat, sans-serif`;
    const m = ctx.measureText(text);
    cnv.width = Math.ceil(m.width) + pad*2;
    cnv.height = px + pad*2;
    ctx.font = `700 ${px}px Montserrat, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8fff3';
    ctx.shadowColor = 'rgba(38,162,105,1)';
    ctx.shadowBlur = 48;
    ctx.fillText(text, cnv.width/2, cnv.height/2);
    const tex = new THREE.CanvasTexture(cnv);
    tex.minFilter = THREE.LinearFilter;
    nameSpriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false });
    const sprite = new THREE.Sprite(nameSpriteMat);
    const wUnits = 2.0;
    const aspect = cnv.width / cnv.height;
    sprite.scale.set(wUnits, wUnits/aspect, 1);
    sprite.renderOrder = 9999;
    return sprite;
  }

  // ---- Resize / Animate ----
  function resize(){
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (labelRenderer) labelRenderer.setSize(w, h);
  }

  function animate(){
    rafId = requestAnimationFrame(animate);
    if (!root) return;

    if(!cfg.pause && !dragging) targetRotY += cfg.rotSpeed;
    rotY += (targetRotY - rotY)*0.08;
    rig.rotation.y = rotY;

    const t = performance.now()*0.001;
    const now = performance.now();

    // per-card chip carousels
    tickChipCarousels(now);

    animatedMats.forEach(m => m.uniforms.uTime.value = t);
    if(pointsMat){ pointsMat.uniforms.uTime.value = t; }
    if(lineMat){ lineMat.uniforms.uTime.value = t; }

    if(lines && now - lastRewire > cfg.particles.rewireMs){
      lastRewire = now; buildParticlesFromGeometry(mesh.geometry);
    }

    // position cluster cards (screen space)
    cards.forEach(({key, el})=>{
      const node = anchors[key];
      if(!node) return;
      const s = project(node);
      const depth = 1 - Math.min(1, Math.max(0, s.z));
      const baseScale = cfg.labelBaseScale * (0.88 + depth*0.22);
      const hScale = hoverScale.get(el) || 1.0;

      const ui = parseFloat(getComputedStyle(container).getPropertyValue('--ui-scale')) || 1;
      let finalScale = baseScale * hScale * ui;
      const floor = isMobile ? 0.85 : 0.75; // never shrink below this
      if (finalScale < floor) finalScale = floor;

      const opac = (s.z<1.0) ? (0.22 + depth*0.78) : 0;
      el.style.transform = `translate(${s.x}px, ${s.y}px) translate(-50%,-50%) scale(${finalScale})`;
      el.style.opacity = opac.toFixed(3);
      el.style.zIndex = String(Math.round(depth*1000));
    });

    if(wire) wire.visible = cfg.showEdges && cfg.edgeStrength>0.001;
    if(mesh) mesh.material.visible = cfg.showSurface;
    if(points) points.visible = cfg.particles.enabled;
    if(lines)  lines.visible  = cfg.particles.enabled && cfg.particles.linksPerNode>0;

    renderer.render(scene,camera);
    if (labelRenderer) labelRenderer.render(scene, camera);
  }

  function fitBrain(fill = 0.85) {
    if (!root) return;
    rig.scale.setScalar(1);
    const fov = THREE.Math.degToRad(camera.fov);
    const viewH = 2 * Math.tan(fov / 2) * camera.position.z;
    const viewW = viewH * camera.aspect;
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const sx = (viewW  * fill) / (size.x || 1);
    const sy = (viewH  * fill) / (size.y || 1);
    const s  = Math.min(sx, sy);
    rig.scale.setScalar(s);
  }

  // ---- Load GLB ----
  loader.load(glbPath, (gltf)=>{
    root = gltf.scene;
    mesh = null; root.traverse(o=>{ if(o.isMesh && !mesh) mesh=o; });
    if(!mesh) throw new Error('No mesh in GLB');

    originalGeom = THREE.BufferGeometryUtils.mergeVertices(mesh.geometry.toNonIndexed());
    mesh.geometry = originalGeom.clone();
    buildWithRatio(cfg.keepRatio);

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    root.position.sub(center);

    // anchors
    const extX = size.x/2, extY=size.y/2, extZ=size.z/2;
    const anchorVecs = {
      frontal:    new THREE.Vector3(0,         0.10*extY, +0.62*extZ),
      visual:     new THREE.Vector3(0,         0.10*extY, -0.62*extZ),
      motor:      new THREE.Vector3(0,         0.65*extY,  0),
      temporalL:  new THREE.Vector3(-0.68*extX, 0.00,     0.12*extZ),
      temporalR:  new THREE.Vector3( 0.68*extX, 0.00,     0.12*extZ),
      infra:      new THREE.Vector3(0,        -0.62*extY, -0.20*extZ),
    };
    anchors = {};
    Object.entries(anchorVecs).forEach(([k,v])=>{ const n=new THREE.Object3D(); n.position.copy(v); mesh.add(n); anchors[k]=n; });

    buildLabels();
    document.querySelectorAll('.brain-chips-track').forEach(t=>{
      const w = t.getBoundingClientRect().width;
      t.style.setProperty('--track-w', `${w + 1 + 6}px`); // +1 to avoid subpixel seam; +gap
    });
    buildParticlesFromGeometry(mesh.geometry);
    rig.add(root);

    // name
    if (labelRenderer && THREE.CSS2DObject) {
      const nameEl = document.createElement('div');
      nameEl.className = 'brain-name2d';
      nameEl.textContent = cfg.name.text;
      nameObj = new THREE.CSS2DObject(nameEl);
    } else {
      nameObj = makeTextSprite(cfg.name.text);
    }
    nameObj.position.set(cfg.name.offset.x, cfg.name.offset.y, cfg.name.offset.z);
    nameObj.visible = !!cfg.name.visible;
    rig.add(nameObj);

    // input - desktop mouse controls
    canvas.addEventListener('mousedown', e=>{ dragging=true; prevX=e.clientX; });
    window.addEventListener('mousemove', e=>{ if(!dragging) return; targetRotY += (e.clientX-prevX)*0.003; prevX=e.clientX; });
    window.addEventListener('mouseup', ()=> dragging=false);

    // mobile touch controls
    let touchDragging = false;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let initialPinchDistance = 0;
    let initialCameraDistance = 4;
    let minZoom = 2;
    let maxZoom = 8;
    let touchPointers = new Map();

    function getTouchDistance(touches) {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const touches = e.touches;
      for (let i = 0; i < touches.length; i++) {
        touchPointers.set(touches[i].identifier, {
          x: touches[i].clientX,
          y: touches[i].clientY
        });
      }
      if (touches.length === 1) {
        touchDragging = true;
        lastTouchX = touches[0].clientX;
        lastTouchY = touches[0].clientY;
      } else if (touches.length === 2) {
        touchDragging = false;
        initialPinchDistance = getTouchDistance(touches);
        initialCameraDistance = camera.position.z;
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const touches = e.touches;
      if (touches.length === 1 && touchDragging) {
        const touch = touches[0];
        const deltaX = touch.clientX - lastTouchX;
        targetRotY += deltaX * 0.003;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
      } else if (touches.length === 2) {
        const currentDistance = getTouchDistance(touches);
        if (initialPinchDistance > 0) {
          const scale = currentDistance / initialPinchDistance;
          let newDistance = initialCameraDistance / scale;
          newDistance = Math.max(minZoom, Math.min(maxZoom, newDistance));
          camera.position.z = newDistance;
          camera.updateProjectionMatrix();
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        touchPointers.delete(touches[i].identifier);
      }
      if (e.touches.length === 0) {
        touchDragging = false;
        initialPinchDistance = 0;
      } else if (e.touches.length === 1) {
        touchDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    }, { passive: false });

    tuneForViewport();
    animate();
  });

  // ---- Resize observer ----
  const ro = new ResizeObserver(() => {
    resize();
    fitBrain(isMobile ? 0.88 : 0.82);
    if (labelRenderer) labelRenderer.setSize(renderer.domElement.width, renderer.domElement.height);
    measureAllChipCarousels();
  });
  ro.observe(container);

  // ---- API ----
  return {
    setOptions(next){
      Object.assign(cfg, next||{});
      if(next?.particles){
        Object.assign(cfg.particles, next.particles);
        if(pointsMat){
          pointsMat.uniforms.uBaseSize.value = cfg.particles.baseSize;
          pointsMat.uniforms.uPulseAmp.value = cfg.particles.pulseAmp;
          pointsMat.uniforms.uOpacity.value  = cfg.particles.opacity;
        }
        buildParticlesFromGeometry(mesh.geometry);
      }
      if(holoMat){
        holoMat.uniforms.uBaseOpacity.value = cfg.baseOpacity;
        holoMat.uniforms.uFresnelPow.value  = cfg.fresnelPow;
      }
      if(wireMat){ wireMat.uniforms.uEdge.value = cfg.edgeStrength; }
      if(next?.name && nameObj){
        if (typeof next.name.text === 'string') {
          if (nameObj.isCSS2DObject) {
            nameObj.element.textContent = next.name.text;
          } else if (nameSpriteMat) {
            rig.remove(nameObj);
            nameObj = makeTextSprite(next.name.text);
            nameObj.position.set(cfg.name.offset.x, cfg.name.offset.y, cfg.name.offset.z);
            rig.add(nameObj);
          }
          cfg.name.text = next.name.text;
        }
        if (next.name.offset){
          cfg.name.offset = { ...cfg.name.offset, ...next.name.offset };
          nameObj.position.set(cfg.name.offset.x, cfg.name.offset.y, cfg.name.offset.z);
        }
        if (typeof next.name.visible === 'boolean'){
          cfg.name.visible = next.name.visible;
          nameObj.visible = cfg.name.visible;
        }
      }
      if(next?.carousel){
        Object.assign(cfg.carousel, next.carousel);
        chipCarousels.forEach(cc => { cc.visible = Math.max(1, cfg.carousel.visibleCount|0); cc.start = 0; });
        lastChipTick = performance.now();
        measureAllChipCarousels();
      }
      // retune view if options affect layout
      tuneForViewport();
    },
    destroy(){
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mouseup', ()=>{});
      window.removeEventListener('mousemove', ()=>{});
      renderer.dispose();
      if (labelRenderer) {
        labelRenderer.dispose?.();
        labelRenderer.domElement.remove();
      }
      canvas.remove();
      cards.forEach(c=>c.el.remove());
    }
  };
}
