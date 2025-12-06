import './matrix-effect.js';

// --- Inject CSS ---
(function injectBrainCSS() {
  if (document.getElementById('brain-deep-css')) return;
  const style = document.createElement('style');
  style.id = 'brain-deep-css';
  style.textContent = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: transparent !important;
      color: #e8fff3;
      font-family: 'Montserrat', sans-serif;
      overflow-x: hidden;
      min-height: 100vh;
    }
    #brain-host {
      position: relative;
      width: 100%;
      height: min(88svh, 88dvh, 760px);
      aspect-ratio: 16 / 11;
      z-index: 2;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.7s cubic-bezier(.7,.2,.2,1);
      margin: 0 auto;
      background: transparent;

      /* 3D stage */
      perspective: 1200px;
      transform-style: preserve-3d;

      --neural-pulse: 0.4;
      --ui-scale: 1;
    }
    #brain-host.brain-visible {
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    #brain-links-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 3;
    }
    .brain-link {
      fill: none;
      stroke: #10ff7f;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;

      stroke-dasharray: 3 14;
      stroke-dashoffset: 0;

      opacity: 0.9;

      filter:
        drop-shadow(0 0 6px rgba(16, 255, 127, 0.85))
        drop-shadow(0 0 18px rgba(16, 255, 127, 0.75));

      shape-rendering: geometricPrecision;
      vector-effect: non-scaling-stroke;

      animation: neuralTravel 1.2s linear infinite,
                 neuralIdleGlow 2.4s ease-in-out infinite;
    }

    .brain-link--active {
      stroke: #7bffbf;
      stroke-width: 4.2;
      animation:
        neuralTravel 0.7s linear infinite,
        neuralActiveGlow 0.65s ease-in-out infinite;
    }

    @keyframes neuralTravel {
      0%   { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -70; }
    }

    @keyframes neuralIdleGlow {
      0% {
        opacity: 0.55;
        filter:
          drop-shadow(0 0 6px rgba(16, 255, 127, 0.75))
          drop-shadow(0 0 16px rgba(16, 255, 127, 0.55));
      }
      50% {
        opacity: 1;
        filter:
          drop-shadow(0 0 12px rgba(16, 255, 127, 1))
          drop-shadow(0 0 28px rgba(16, 255, 127, 0.95));
      }
      100% {
        opacity: 0.7;
        filter:
          drop-shadow(0 0 6px rgba(16, 255, 127, 0.75))
          drop-shadow(0 0 16px rgba(16, 255, 127, 0.55));
      }
    }

    @keyframes neuralActiveGlow {
      0% {
        opacity: 0.7;
        stroke-width: 3.0;
        filter:
          drop-shadow(0 0 10px rgba(123, 255, 191, 1))
          drop-shadow(0 0 22px rgba(123, 255, 191, 0.95));
      }
      45% {
        opacity: 1;
        stroke-width: 3.8;
        filter:
          drop-shadow(0 0 18px rgba(180, 255, 210, 1))
          drop-shadow(0 0 40px rgba(180, 255, 210, 0.98));
      }
      100% {
        opacity: 0.75;
        stroke-width: 3.2;
        filter:
          drop-shadow(0 0 12px rgba(123, 255, 191, 1))
          drop-shadow(0 0 30px rgba(123, 255, 191, 0.9));
      }
    }

    .brain-cluster {
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%) scale(1);
      transform-style: preserve-3d;
      will-change: transform, opacity;

      min-width: 230px;
      max-width: 290px;

      padding: 0;
      background: transparent;
      border-radius: 0;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;

      color: rgba(245, 255, 252, 0.98);
      pointer-events: auto;
      opacity: 0;
      z-index: 10;
      overflow: visible;

      transition:
        transform 0.22s ease-out,
        opacity 0.20s ease-out;
    }

    .brain-cluster::before {
      content: none;
    }

    .brain-cluster:hover {
      min-width: 340px;
      max-width: 560px;
      padding: 18px 18px 16px;
      opacity: 1 !important;
      z-index: 9999 !important;
    }

    .brain-cluster--active {
      border-color: transparent;
      box-shadow: none;
    }

    .cluster-title {
      color: #d5ffe9;
      font-size: 15px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
      letter-spacing: 0.14em;
      text-transform: uppercase;

      background: linear-gradient(120deg, #c0ffe4, #73ffd0);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;

      text-shadow: 0 0 8px rgba(38, 162, 105, 0.7);
      white-space: nowrap;
    }

    .skills-carousel {
      position: relative;
      width: 100%;
      height: 72px;
      overflow: hidden;
      margin-top: 4px;
      padding-top: 6px;
      border-top: none;
    }

    .skills-track {
      display: flex;
      align-items: stretch;
      height: 100%;
      gap: 6px;
      padding: 0 4px;
      transition: transform 0.5s ease;
      will-change: transform;
    }

    .skill-item {
      all: unset;
      box-sizing: border-box;

      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      min-width: 72px;
      height: 40px;
      padding: 0;

      background: transparent;
      border: none;
      box-shadow: none;

      cursor: default;
      position: relative;
      overflow: visible;

      transform-origin: 50% 50%;
      transition:
        transform 0.18s ease-out,
        opacity 0.18s ease-out;
    }

    .skill-item:hover {
      transform:
        translateY(-2px)
        scale(1.2)
        rotateX(3deg)
        rotateY(-3deg);
    }

    .skill-icon-wrap {
      width: 100%;
      height: 30px;
      border-radius: 0;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
      box-shadow: none;
    }

    .skill-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
      filter: saturate(1.05) contrast(1.05);
      transform-origin: center;
      transition:
        transform 0.18s ease-out,
        filter 0.18s ease-out;
    }

    .skill-item:hover .skill-icon {
      transform: scale(1.2);
      filter: saturate(1.18) brightness(1.06);
    }

    .skill-tooltip {
      display: none !important;
    }

    .skill-item:hover .skill-tooltip {
      opacity: 0;
      transform: translateY(0);
    }

    .brain-cluster:hover .skills-carousel {
      height: auto;
      max-height: 220px;
      overflow-y: auto;
    }

    .brain-cluster:hover .skills-track {
      flex-wrap: wrap;
      justify-content: flex-start;
      transform: none !important;
      padding: 6px 2px 2px;
      gap: 8px;
    }

    .brain-cluster:hover .skill-item {
      flex: 0 0 calc(33.333% - 8px);
      min-width: 0;
      height: auto;
      padding: 4px 0;
    }

    .brain-name2d {
      position: absolute;
      left: 50%;
      bottom: 3%;
      transform: translateX(-50%);
      pointer-events: none;
      font: 700 clamp(18px, calc(3.6vw * var(--ui-scale)), 56px)/1.1 'Montserrat', sans-serif;
      letter-spacing: .06em;
      color: #e8fff3;
      -webkit-text-stroke: .4px rgba(0,0,0,.25);
      text-shadow:
        0 0 12px rgba(38,162,105,1),
        0 0 28px rgba(38,162,105,1),
        0 0 48px rgba(38,162,105,.9),
        0 0 90px rgba(38,162,105,.7);
      z-index: 4;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      #brain-host { height: 72svh; }

      .brain-cluster {
        min-width: 170px;
        max-width: 210px;
        padding: 0;
        border-radius: 0;
        box-shadow: none;
        background: transparent;
      }

      .brain-cluster:hover {
        min-width: 210px;
        max-width: 260px;
      }

      .cluster-title {
        font-size: 13px;
        margin-bottom: 6px;
        letter-spacing: 0.10em;
      }

      .skills-carousel { height: 54px; }

      .skill-item {
        min-width: 70px;
        height: 50px;
        padding: 5px 5px 4px;
      }

      .skill-icon-wrap {
        height: 26px;
      }

      .skill-label {
        font-size: 10px;
      }

      .skill-tooltip {
        top: -24px;
        font-size: 9px;
      }
    }
  `;
  document.head.appendChild(style);
})();

// --- Skill logo configuration ---
const skillLogos = {
  // Programming & Core ML
  Python: ['https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff'],
  PySpark: ['https://img.shields.io/badge/PySpark-E25A1C?style=for-the-badge&logo=apache-spark&logoColor=white'],
  Groovy: ['https://img.shields.io/badge/Groovy-4298B8?style=for-the-badge&logo=apache-groovy&logoColor=white'],
  FastAPI: ['https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white'],

  // ML Frameworks
  'Neural Nets': ['https://img.shields.io/badge/-TensorFlow-FF6F00?logo=tensorflow&logoColor=white'],
  TensorFlow: ['https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white'],
  ScikitLearn: ['https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white'],
  XGBoost: ['https://img.shields.io/badge/XGBoost-017CEE?style=for-the-badge&logo=xgboost&logoColor=white'],

  // Data & Viz
  Pandas: ['https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white'],
  NumPy: ['https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white'],
  Tableau: ['https://img.shields.io/badge/Tableau-E97627?style=for-the-badge&logo=tableau&logoColor=white'],
  Matplotlib: ['https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge'],
  Folium: ['https://img.shields.io/badge/Folium-77B829?style=for-the-badge'],

  // LLM & agents
  LangChain: ['https://img.shields.io/badge/LangChain-000000?style=for-the-badge'],
  LangGraph: ['https://img.shields.io/badge/LangGraph-000000?style=for-the-badge'],
  Langfuse: ['https://img.shields.io/badge/Langfuse-000000?style=for-the-badge'],
  Prompting: ['https://img.shields.io/badge/Prompting-412991?logo=openai&logoColor=white'],
  RAG: ['https://img.shields.io/badge/RAG-0b7285?logo=readthedocs&logoColor=white'],
  Embeddings: ['https://img.shields.io/badge/Embeddings-FFB000'],
  'Vector DBs': ['https://img.shields.io/badge/ChromaDB-VectorDB-orange'],

  // Web / Apps
  Streamlit: ['https://img.shields.io/badge/-Streamlit-FF4B4B?style=flat&logo=streamlit&logoColor=black'],
  Gradio: ['https://img.shields.io/badge/Gradio-FF4B4B?style=for-the-badge&logo=gradio&logoColor=white'],
  Plotly: ['https://img.shields.io/badge/-Plotly-3F4F75?style=flat&logo=plotly&logoColor=white'],
  Dash: ['https://img.shields.io/badge/Dash-008DE4?style=for-the-badge&logo=dash&logoColor=white'],

  // MLOps
  MLflow: ['https://img.shields.io/badge/MLflow-0194E2?style=for-the-badge&logo=mlflow&logoColor=white'],
  'Seldon Core': ['https://img.shields.io/badge/Seldon_Core-2F80ED?style=for-the-badge'],
  WeightsBiases: ['https://img.shields.io/badge/Weights_&_Biases-FFBE00?style=for-the-badge&logo=weightsandbiases&logoColor=black'],
  Jenkins: ['https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white'],
  GitHubActions: ['https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white'],

  // DB
  MongoDB: ['https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white'],
  Redis: ['https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white'],
  MySQL: ['https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white'],
  PostgreSQL: ['https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white'],
  SQLModel: ['https://img.shields.io/badge/SQLModel-000000?style=for-the-badge'],
  Alembic: ['https://img.shields.io/badge/Alembic-000000?style=for-the-badge'],

  // Cloud / infra
  Docker: ['https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white'],
  Kubernetes: ['https://img.shields.io/badge/Kubernetes-2496ED?style=for-the-badge&logo=kubernetes&logoColor=white'],
  Kubeflow: ['https://img.shields.io/badge/Kubeflow-2496ED?style=for-the-badge&logo=kubeflow&logoColor=white'],
  GCP: ['https://img.shields.io/badge/-Google%20Cloud%20Platform-4285F4?style=flat&logo=google%20cloud&logoColor=black'],
  CloudRun: ['https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white'],
  VertexAI: ['https://img.shields.io/badge/Vertex_AI-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white'],
  ComputeEngine: ['https://img.shields.io/badge/Compute_Engine-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white'],
  CloudStorage: ['https://img.shields.io/badge/Cloud_Storage-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white'],
  CloudFunctions: ['https://img.shields.io/badge/Cloud_Functions-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white'],
  AWSEC2: ['https://img.shields.io/badge/EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white'],
  S3: ['https://img.shields.io/badge/S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white'],
  SageMaker: ['https://img.shields.io/badge/SageMaker-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white'],
  Lambda: ['https://img.shields.io/badge/Lambda-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white'],
  Databricks: ['https://img.shields.io/badge/Databricks-FF3621?style=for-the-badge&logo=databricks&logoColor=white'],

  // AI services
  Whisper: ['https://img.shields.io/badge/Whisper-000000?logo=openai&logoColor=white'],
  Agents: ['https://img.shields.io/badge/Agents-AI-blueviolet'],
  'LLM Orchestration': ['https://img.shields.io/badge/LLM%20Orchestration-000000?logo=openai&logoColor=white'],
  Eval: ['https://img.shields.io/badge/Eval-FFB000?logo=huggingface&logoColor=white'],
  GoogleADK: ['https://img.shields.io/badge/Google_ADK-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white']
};

function getSkillLogo(skillName) {
  const sources = skillLogos[skillName];
  if (!sources || !sources.length) {
    return `https://via.placeholder.com/32x32/ffffff/000000?text=${encodeURIComponent(
      skillName
    )}`;
  }
  return sources[0];
}

// --- Load Three.js and helpers if not present ---
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureThreeDeps() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/modifiers/SimplifyModifier.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/BufferGeometryUtils.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/renderers/CSS2DRenderer.js');
}

// --- BrainConfig ---
class BrainConfig {
  static getDefault() {
    return {
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
        count: 400,
        baseSize: 0.02,
        pulseAmp: 0.25,
        opacity: 0.8,
        linksPerNode: 3,
        linkDist: 3.0,
        rewireMs: 2000,
        firingRate: 0.02,
        firingDuration: 0.5
      },
      name: {
        text: '',
        offset: { x: 0, y: -0.9, z: 0 },
        visible: true
      },
      mobile: {
        particlesCount: 200,
        labelScale: 1.25
      },
      carousel: {
        speed: 0.5,       // interpreted as px per frame at 60 fps
        pauseOnHover: true,
        enabled: true
      }
    };
  }

  static merge(defaultConfig, userConfig) {
    return {
      ...defaultConfig,
      ...userConfig,
      particles: { ...defaultConfig.particles, ...(userConfig.particles || {}) },
      name: { ...defaultConfig.name, ...(userConfig.name || {}) },
      mobile: { ...defaultConfig.mobile, ...(userConfig.mobile || {}) },
      carousel: { ...defaultConfig.carousel, ...(userConfig.carousel || {}) }
    };
  }
}

// --- Brain visualization with neural effects + skill icons ---
class BrainVisualization {
  constructor(container, glbPath, clusters, options = {}) {
    this.container = container;
    this.scaleMultiplier = typeof options.scaleMultiplier === 'number' ? options.scaleMultiplier : 2;
    this.disableNeuralPulse = !!options.disableNeuralPulse;
    this.glbPath = glbPath;
    this.clusters = clusters;
    this.cfg = BrainConfig.merge(BrainConfig.getDefault(), options);
    this.THREE = window.THREE;

    this.carousels = new Map();
    this.cards = [];
    this.anchors = {};
    this.neuralLights = [];
    this.animatedMats = [];
    this.dragging = false;
    this.prevX = 0;
    this.rotY = 0;
    this.targetRotY = 0;
    this.rafId = null;
    this.lastTime = null;
    this.resizeObserver = null;
    this.isDestroyed = false;

    this.init();
  }

  init() {
    if (!this.THREE?.GLTFLoader) {
      throw new Error('THREE.GLTFLoader missing');
    }

    this.setupRenderer();
    this.setupScene();
    this.setupEventListeners();
    this.setupNameLabel();
    this.loadBrainModel();
  }

  setupRenderer() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:auto;';
    this.container.style.position = 'relative';
    this.container.appendChild(this.canvas);

    this.renderer = new this.THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight, false);

    this.setupSVGLayer();
    this.setupLabelRenderer();
  }

  setupSVGLayer() {
    const svgNS = 'http://www.w3.org/2000/svg';
    this.linkSvg = document.createElementNS(svgNS, 'svg');
    this.linkSvg.setAttribute('id', 'brain-links-layer');
    this.linkSvg.setAttribute('width', '100%');
    this.linkSvg.setAttribute('height', '100%');
    this.linkSvg.style.position = 'absolute';
    this.linkSvg.style.inset = '0';
    this.linkSvg.style.pointerEvents = 'none';
    this.container.appendChild(this.linkSvg);
  }

  setupLabelRenderer() {
    if (this.THREE.CSS2DRenderer) {
      this.labelRenderer = new this.THREE.CSS2DRenderer();
      this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.labelRenderer.domElement.style.position = 'absolute';
      this.labelRenderer.domElement.style.inset = '0';
      this.labelRenderer.domElement.style.pointerEvents = 'none';
      this.labelRenderer.domElement.style.zIndex = '2';
      this.container.appendChild(this.labelRenderer.domElement);
    }
  }

  setupScene() {
    this.scene = new this.THREE.Scene();
    this.camera = new this.THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, 4);

    this.rig = new this.THREE.Group();
    this.scene.add(this.rig);

    this.scene.add(new this.THREE.AmbientLight(0xa0ffd0, 0.25));
    const dirLight = new this.THREE.DirectionalLight(0xffffff, 0.35);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    for (let i = 0; i < 5; i++) {
      const light = new this.THREE.PointLight(0x80ffc0, 0.3, 10);
      light.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      );
      this.scene.add(light);
      this.neuralLights.push(light);
    }

    this.neuralFiring = new Map();
    this.lastNeuralUpdate = 0;
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    this.mq = window.matchMedia('(max-width: 768px)');
    this.mq.addEventListener('change', e => {
      this.isMobile = e.matches;
      this.tuneForViewport();
    });
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', e => {
      this.dragging = true;
      this.prevX = e.clientX;
    });

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    this.setupTouchControls();

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        this.fitBrain(this.isMobile ? 0.88 : 0.82);
      });
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  onMouseMove = e => {
    if (!this.dragging) return;
    this.targetRotY += (e.clientX - this.prevX) * 0.003;
    this.prevX = e.clientX;
  };

  onMouseUp = () => {
    this.dragging = false;
  };

  onWindowResize = () => {
    this.resize();
    this.fitBrain(window.matchMedia('(max-width: 768px)').matches ? 0.88 : 0.82);
  };

  setupTouchControls() {
    let touchDragging = false;
    let lastTouchX = 0;

    this.canvas.addEventListener(
      'touchstart',
      e => {
        e.preventDefault();
        if (e.touches.length === 1) {
          touchDragging = true;
          lastTouchX = e.touches[0].clientX;
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchmove',
      e => {
        e.preventDefault();
        if (e.touches.length === 1 && touchDragging) {
          const touch = e.touches[0];
          const deltaX = touch.clientX - lastTouchX;
          this.targetRotY += deltaX * 0.003;
          lastTouchX = touch.clientX;
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchend',
      () => {
        touchDragging = false;
      },
      { passive: false }
    );
  }

  setupNameLabel() {
    if (!this.cfg.name?.visible || !this.cfg.name.text) return;
    const el = document.createElement('div');
    el.className = 'brain-name2d';
    el.textContent = this.cfg.name.text;
    this.container.appendChild(el);
    this.nameLabelEl = el;
  }

  loadBrainModel() {
    const loader = new this.THREE.GLTFLoader();
    loader.load(
      this.glbPath,
      gltf => this.onBrainLoaded(gltf),
      undefined,
      err => {
        console.error('Failed to load brain GLB', err);
      }
    );
  }

  onBrainLoaded(gltf) {
    if (this.isDestroyed) return;

    this.root = gltf.scene;
    this.mesh = this.findFirstMesh(this.root);

    if (this.root && typeof this.scaleMultiplier === 'number') {
      this.root.scale.multiplyScalar(this.scaleMultiplier);
    }

    if (!this.mesh) {
      throw new Error('No mesh found in GLB');
    }

    this.processBrainGeometry();
    this.setupAnchors();

    this.updateBrainHighlightForCluster('frontal', 1.0);

    this.buildClusterCards();
    this.setupEnhancedParticles();
    this.tuneForViewport();
    this.startAnimation();
  }

  findFirstMesh(object) {
    let mesh = null;
    object.traverse(child => {
      if (child.isMesh && !mesh) {
        mesh = child;
      }
    });
    return mesh;
  }

  processBrainGeometry() {
    const originalGeom = this.THREE.BufferGeometryUtils.mergeVertices(
      this.mesh.geometry.toNonIndexed()
    );
    this.mesh.geometry = originalGeom.clone();

    const modifier = new this.THREE.SimplifyModifier();
    let geom = this.THREE.BufferGeometryUtils.mergeVertices(
      this.mesh.geometry.toNonIndexed()
    );
    const triCount = geom.attributes.position.count / 3;
    const target = Math.max(48, Math.floor(triCount * this.cfg.keepRatio));
    geom = modifier.modify(geom, target);
    geom.computeVertexNormals();
    this.mesh.geometry = geom;

    this.applyMaterials();
    this.rig.add(this.root);
  }

  applyMaterials() {
    const accent = new this.THREE.Color(this.cfg.accent);

    this.holoMat = new this.THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: accent },
        uFresnelPow: { value: this.cfg.fresnelPow },
        uBaseOpacity: { value: this.cfg.baseOpacity },
        uNeuralPulse: { value: 0.0 },

        uHighlightCenter: { value: new this.THREE.Vector3(0, 0, 0) },
        uHighlightRadius: { value: 0.6 },
        uHighlightStrength: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vW;
        varying vec3 vN;
        varying vec2 vUv;
        void main(){
          vN = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = wp.xyz;
          vUv = uv;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uFresnelPow;
        uniform float uBaseOpacity;
        uniform float uNeuralPulse;

        uniform vec3 uHighlightCenter;
        uniform float uHighlightRadius;
        uniform float uHighlightStrength;

        varying vec3 vW;
        varying vec3 vN;
        varying vec2 vUv;

        void main(){
          vec3 V = normalize(cameraPosition - vW);
          float fres = pow(1.0 - max(dot(normalize(vN), V), 0.0), uFresnelPow);

          float pulseWave = sin(uTime * 3.0 + vW.x * 2.0 + vW.y * 3.0) * 0.5 + 0.5;
          float neuralGlow = uNeuralPulse * pulseWave * 0.3;

          float scan = 0.5 + 0.5 * sin(vW.y * 0.30 + uTime * 1.2);
          float grid = step(0.48, fract(vW.y * 0.05 + uTime * 0.10)) * 0.12;

          float hDist = length(vW - uHighlightCenter);
          float r = max(uHighlightRadius, 0.0001);
          float hMask = exp(-pow(hDist / r, 2.0));
          hMask = clamp(hMask * uHighlightStrength, 0.0, 1.0);

          float a = clamp(
            uBaseOpacity
            + fres * 0.18
            + grid
            + neuralGlow,
            0.0, 0.5
          );

          vec3 baseCol = uColor * (
            0.30
            + mix(scan, 1.0, fres) * 0.45
            + neuralGlow
          );

          vec3 highlightCol = vec3(0.85, 1.0, 0.9);
          vec3 col = mix(baseCol, highlightCol, hMask);

          a = max(a, hMask * 0.9);

          gl_FragColor = vec4(col, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: this.THREE.AdditiveBlending
    });

    this.mesh.material = this.holoMat;

    this.wireMat = new this.THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: accent },
        uEdge: { value: this.cfg.edgeStrength },
        uNeuralPulse: { value: 0.0 },

        uHighlightCenter: { value: new this.THREE.Vector3(0, 0, 0) },
        uHighlightRadius: { value: 0.6 },
        uHighlightStrength: { value: 0.0 }
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vW;
        varying float vNeural;
        void main(){
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vW = wp.xyz;
          vNeural = sin(uTime * 4.0 + position.y * 5.0) * 0.5 + 0.5;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uEdge;
        uniform float uNeuralPulse;

        uniform vec3 uHighlightCenter;
        uniform float uHighlightRadius;
        uniform float uHighlightStrength;

        varying vec3 vW;
        varying float vNeural;

        void main(){
          float baseWave = 0.5 + 0.5 * sin(uTime * 0.9 + vW.y * 1.0);
          float neuralImpulse = vNeural * uNeuralPulse * 0.8;

          float hDist = length(vW - uHighlightCenter);
          float r = max(uHighlightRadius, 0.0001);
          float hMask = exp(-pow(hDist / r, 2.0));
          hMask = clamp(hMask * uHighlightStrength, 0.0, 1.0);

          vec3 baseCol = uColor * (
            0.40
            + 0.36 * baseWave
            + neuralImpulse
          );

          vec3 highlightCol = vec3(0.9, 1.0, 0.95);
          vec3 col = mix(baseCol, highlightCol, hMask);

          float a = clamp(
            uEdge * (0.5 + 0.8 * baseWave)
            + neuralImpulse * 0.5,
            0.0, 1.0
          );

          a = max(a, hMask * 0.9);

          gl_FragColor = vec4(col, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: this.THREE.AdditiveBlending
    });

    this.wire = new this.THREE.LineSegments(
      new this.THREE.WireframeGeometry(this.mesh.geometry),
      this.wireMat
    );
    this.mesh.add(this.wire);

    this.animatedMats = [this.holoMat, this.wireMat];
  }

  setupEnhancedParticles() {
    if (this.particles) {
      this.mesh.remove(this.particles);
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }

    const particleCount = this.isMobile
      ? this.cfg.mobile.particlesCount
      : this.cfg.particles.count;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const firingStates = new Float32Array(particleCount);

    const geometry = this.mesh.geometry;
    const positionAttribute = geometry.attributes.position;
    const vertexCount = positionAttribute.count;

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex = Math.floor(Math.random() * vertexCount);
      positions[i * 3] = positionAttribute.array[vertexIndex * 3];
      positions[i * 3 + 1] = positionAttribute.array[vertexIndex * 3 + 1];
      positions[i * 3 + 2] = positionAttribute.array[vertexIndex * 3 + 2];

      sizes[i] = 0.6 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2;
      firingStates[i] = 0;
    }

    const geometry2 = new this.THREE.BufferGeometry();
    geometry2.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    geometry2.setAttribute('aSize', new this.THREE.BufferAttribute(sizes, 1));
    geometry2.setAttribute('aPhase', new this.THREE.BufferAttribute(phases, 1));
    geometry2.setAttribute(
      'aFiringState',
      new this.THREE.BufferAttribute(firingStates, 1)
    );

    const particleMaterial = new this.THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseSize: { value: this.cfg.particles.baseSize * 0.5 },
        uPulseAmp: { value: this.cfg.particles.pulseAmp * 0.3 },
        uOpacity: { value: this.cfg.particles.opacity },
        uFiringRate: { value: this.cfg.particles.firingRate }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBaseSize;
        uniform float uPulseAmp;
        uniform float uOpacity;
        uniform float uFiringRate;

        attribute float aSize;
        attribute float aPhase;
        attribute float aFiringState;

        varying float vFiringState;
        varying float vAlpha;

        void main() {
          vec3 p = position;

          float firingIntensity = aFiringState;
          float neuralPulse = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase + position.y * 3.0);

          if (firingIntensity > 0.0) {
            neuralPulse = 0.8 + 0.2 * firingIntensity;
            p += vec3(0.0, firingIntensity * 0.05, 0.0);
          }

          float drift = 0.01 * sin(uTime * 0.3 + aPhase * 2.0);
          p += vec3(0.0, drift, 0.0);

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float size = (uBaseSize + uPulseAmp * neuralPulse) * aSize * (1.0 + firingIntensity * 0.8);
          gl_PointSize = size * (250.0 / -mv.z);
          vAlpha = uOpacity * (0.5 + 0.5 * neuralPulse) * (1.0 + firingIntensity * 0.5);
          vFiringState = firingIntensity;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        precision mediump float;
        varying float vFiringState;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);

          vec3 restingColor = vec3(0.3, 0.8, 0.9);
          vec3 firingColor = vec3(0.4, 1.0, 0.8);

          vec3 color = mix(restingColor, firingColor, vFiringState);

          float core = smoothstep(0.4, 0.0, dist) * 0.8;
          float halo = smoothstep(0.6, 0.3, dist) * 0.4;
          float firingGlow = vFiringState * smoothstep(0.8, 0.0, dist) * 1.0;

          float a = (core + halo + firingGlow) * vAlpha;

          if (a < 0.01) discard;

          gl_FragColor = vec4(color, a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: this.THREE.AdditiveBlending
    });

    this.particles = new this.THREE.Points(geometry2, particleMaterial);
    this.particles.visible = this.cfg.particles.enabled;
    this.mesh.add(this.particles);

    this.particleGeometry = geometry2;
    this.particleMaterial = particleMaterial;
  }

  updateNeuralActivity(time) {
    if (this.disableNeuralPulse) {
      if (this.holoMat) this.holoMat.uniforms.uNeuralPulse.value = 0;
      if (this.wireMat) this.wireMat.uniforms.uNeuralPulse.value = 0;
      return;
    }

    if (!this.particleGeometry) return;

    const firingStates = this.particleGeometry.attributes.aFiringState;
    const particleCount = firingStates.count;

    for (let i = 0; i < particleCount; i++) {
      let currentState = firingStates.array[i];

      if (currentState <= 0 && Math.random() < this.cfg.particles.firingRate) {
        currentState = 1.0;
      } else if (currentState > 0) {
        currentState -= (1.0 / this.cfg.particles.firingDuration) * 0.016;
        if (currentState < 0) currentState = 0;
      }

      firingStates.array[i] = currentState;
    }

    firingStates.needsUpdate = true;

    const pulseIntensity = 0.5 + 0.5 * Math.sin(time * 2.0);
    if (this.holoMat) this.holoMat.uniforms.uNeuralPulse.value = pulseIntensity;
    if (this.wireMat) this.wireMat.uniforms.uNeuralPulse.value = pulseIntensity;
    if (this.container) {
      this.container.style.setProperty('--neural-pulse', pulseIntensity.toFixed(3));
    }
  }

  setupAnchors() {
    const box = new this.THREE.Box3().setFromObject(this.root);
    const size = new this.THREE.Vector3();
    box.getSize(size);
    const center = new this.THREE.Vector3();
    box.getCenter(center);
    this.root.position.sub(center);
    this.brainRadius = size.length() / 2;

    const extX = size.x / 2;
    const extY = size.y / 2;
    const extZ = size.z / 2;
    const anchorVecs = {
      frontal: new this.THREE.Vector3(0, 0.1 * extY, 0.62 * extZ),
      visual: new this.THREE.Vector3(0, 0.1 * extY, -0.62 * extZ),
      motor: new this.THREE.Vector3(0, 0.65 * extY, 0),
      temporalL: new this.THREE.Vector3(-0.68 * extX, 0.0, 0.12 * extZ),
      temporalR: new this.THREE.Vector3(0.68 * extX, 0.0, 0.12 * extZ),
      infra: new this.THREE.Vector3(0, -0.62 * extY, -0.2 * extZ)
    };

    Object.entries(anchorVecs).forEach(([key, position]) => {
      const node = new this.THREE.Object3D();
      node.position.copy(position);
      this.mesh.add(node);
      this.anchors[key] = { node };
    });
  }

  buildClusterCards() {
    this.cards.forEach(card => card.el.remove());
    this.cards = [];
    this.carousels.clear();

    this.clusters.forEach((cluster, clusterIndex) => {
      const el = document.createElement('div');
      el.className = 'brain-cluster';
      el.setAttribute('data-cluster-index', clusterIndex);

      const skillsHTML = cluster.items
        .map(
          item => `
            <button class="skill-item" data-skill="${item.label}">
              <div class="skill-icon-wrap">
                <img src="${getSkillLogo(item.label)}" alt="${item.label}" class="skill-icon">
              </div>
              <div class="skill-tooltip">${item.label}</div>
            </button>
          `
        )
        .join('');

      el.innerHTML = `
        <h4 class="cluster-title">${cluster.title || cluster.key}</h4>
        <div class="skills-carousel">
          <div class="skills-track">${skillsHTML}</div>
        </div>
      `;

      this.container.appendChild(el);

      const linkEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      linkEl.setAttribute('class', 'brain-link');
      linkEl.setAttribute('x1', '0');
      linkEl.setAttribute('y1', '0');
      linkEl.setAttribute('x2', '0');
      linkEl.setAttribute('y2', '0');
      this.linkSvg.appendChild(linkEl);

      linkEl.style.animationDelay = `${-(Math.random() * 2).toFixed(2)}s`;

      const track = el.querySelector('.skills-track');
      const carouselData = {
        track,
        items: cluster.items,
        position: 0,
        paused: false
      };
      this.carousels.set(el, carouselData);

      this.cards.push({
        key: cluster.key,
        el,
        link: linkEl,
        clusterIndex
      });

      if (this.cfg.carousel.pauseOnHover) {
        el.addEventListener('mouseenter', () => {
          carouselData.paused = true;
        });
        el.addEventListener('mouseleave', () => {
          carouselData.paused = false;
        });
      }
    });
  }

  updateCarousels(dt) {
    if (!this.cfg.carousel.enabled) return;

    const speedPerSecond = this.cfg.carousel.speed * 60.0; // interpret as px per frame at 60 fps
    const deltaPx = speedPerSecond * dt;

    this.carousels.forEach(carousel => {
      if (carousel.paused) return;
      const track = carousel.track;
      if (!track) return;
      const totalWidth = track.scrollWidth;
      const visibleWidth = track.parentElement.clientWidth;

      if (totalWidth > visibleWidth) {
        carousel.position -= deltaPx;

        if (Math.abs(carousel.position) >= totalWidth - visibleWidth) {
          carousel.position = 0;
        }

        track.style.transform = `translateX(${carousel.position}px)`;
      } else {
        carousel.position = 0;
        track.style.transform = 'translateX(0px)';
      }
    });
  }

  computeUiScale() {
    const w = this.container.clientWidth || 360;
    const s =
      0.9 +
      Math.min(1, Math.max(0, (w - 320) / (768 - 320))) *
        0.2;
    return s;
  }

  tuneForViewport() {
    const ui = this.computeUiScale();
    this.container.style.setProperty('--ui-scale', ui.toFixed(3));

    if (this.isMobile) {
      this.cfg.labelBaseScale = this.cfg.mobile.labelScale;
      if (this.cfg.particles) {
        this.cfg.particles.count = this.cfg.mobile.particlesCount;
      }
    } else {
      this.cfg.labelBaseScale = 1.0;
    }

    this.resize();
    this.fitBrain(this.isMobile ? 0.88 : 0.82);

    if (this.mesh) {
      this.setupEnhancedParticles();
    }
  }

  resize() {
    if (!this.renderer) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    if (this.labelRenderer) {
      this.labelRenderer.setSize(w, h);
    }
  }

  fitBrain(fill = 0.85) {
    if (!this.root) return;
    this.rig.scale.setScalar(1);
    const fov = this.THREE.Math.degToRad(this.camera.fov);
    const viewH = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const viewW = viewH * this.camera.aspect;
    const box = new this.THREE.Box3().setFromObject(this.root);
    const size = new this.THREE.Vector3();
    box.getSize(size);
    const sx = (viewW * fill) / (size.x || 1);
    const sy = (viewH * fill) / (size.y || 1);
    const s = Math.min(sx, sy);
    this.rig.scale.setScalar(s);
  }

  startAnimation() {
    this.lastTime = performance.now() * 0.001;
    this.animate();
  }

  animate() {
    if (this.isDestroyed) return;
    this.rafId = requestAnimationFrame(() => this.animate());
    if (!this.root) return;

    const time = performance.now() * 0.001;
    const dt = Math.max(0.001, time - (this.lastTime || time));
    this.lastTime = time;

    if (!this.cfg.pause && !this.dragging) {
      this.targetRotY += this.cfg.rotSpeed;
    }
    this.rotY += (this.targetRotY - this.rotY) * 0.08;
    this.rig.rotation.y = this.rotY;

    this.animatedMats.forEach(m => (m.uniforms.uTime.value = time));

    this.updateNeuralActivity(time);

    this.neuralLights.forEach((light, i) => {
      light.intensity = 0.2 + 0.1 * Math.sin(time * 2 + i);
      light.position.x += Math.sin(time * 0.5 + i) * 0.01;
      light.position.y += Math.cos(time * 0.7 + i) * 0.01;
    });

    this.updateClusterCards();
    this.updateCarousels(dt);

    this.renderer.render(this.scene, this.camera);
    if (this.labelRenderer) {
      this.labelRenderer.render(this.scene, this.camera);
    }
  }

  updateBrainHighlightForCluster(clusterKey, strength = 1.0) {
    if (!this.holoMat || !this.wireMat || !this.mesh) return;

    if (!clusterKey || !this.anchors[clusterKey]) {
      this.holoMat.uniforms.uHighlightStrength.value = 0.0;
      this.wireMat.uniforms.uHighlightStrength.value = 0.0;
      return;
    }

    const anchor = this.anchors[clusterKey];
    const worldPos = new this.THREE.Vector3();
    anchor.node.getWorldPosition(worldPos);

    this.holoMat.uniforms.uHighlightCenter.value.copy(worldPos);
    this.wireMat.uniforms.uHighlightCenter.value.copy(worldPos);

    const r = (this.brainRadius || 1.0) * 0.2;
    this.holoMat.uniforms.uHighlightRadius.value = r;
    this.wireMat.uniforms.uHighlightRadius.value = r;

    this.holoMat.uniforms.uHighlightStrength.value = strength;
    this.wireMat.uniforms.uHighlightStrength.value = strength;
  }

  updateClusterCards() {
    const rect = this.container.getBoundingClientRect();
    const cx = rect.width * 0.5;
    const cy = rect.height * 0.5;
    const ui =
      parseFloat(getComputedStyle(this.container).getPropertyValue('--ui-scale')) ||
      1;

    const cardState = this.cards
      .map(card => {
        const anchor = this.anchors[card.key];
        if (!anchor) return null;

        const screenPos = this.projectToScreen(anchor.node);
        const depth = 1 - Math.min(1, Math.max(0, screenPos.z));
        const dx = screenPos.x - cx;
        const dy = screenPos.y - cy;
        const len = Math.hypot(dx, dy) || 1;

        return { card, screenPos, depth, dx, dy, len };
      })
      .filter(Boolean);

    let activeCard = null;
    if (cardState.length) {
      activeCard = cardState.reduce(
        (best, cur) => (!best || cur.depth > best.depth ? cur : best),
        null
      );
    }

    if (activeCard && activeCard.depth > 0.2) {
      this.updateBrainHighlightForCluster(activeCard.card.key, activeCard.depth);
    } else {
      this.updateBrainHighlightForCluster(null, 0.0);
    }

    cardState.forEach(state => {
      const { card, screenPos, depth, dx, dy, len } = state;
      const scale = this.root?.scale?.x || 1;
      const push = 1 * ui * scale;
      const cardX = screenPos.x + (dx / len) * push;
      const cardY = screenPos.y + (dy / len) * push;

      let baseScale = this.cfg.labelBaseScale * (0.8 + depth * 0.4);
      let finalScale = baseScale * ui;
      let opacity = screenPos.z < 1.0 ? 0.6 + depth * 0.4 : 0.4;

      const isActive = activeCard && activeCard.card === card && depth > 0.25;

      if (isActive) {
        card.el.classList.add('brain-cluster--active');
        finalScale *= 1.15;
        opacity = Math.max(opacity, 0.9);
      } else {
        card.el.classList.remove('brain-cluster--active');
      }

      const normDx = dx / rect.width;
      const normDy = dy / rect.height;
      const tiltMax = 10;
      const liftMax = 80;

      const tiltY = -normDx * tiltMax * depth;
      const tiltX =  normDy * tiltMax * depth;
      const zLift  = liftMax * depth;

      card.el.style.setProperty('--card-depth', depth.toFixed(3));

      card.el.style.transform =
        `translate3d(${cardX}px, ${cardY}px, ${zLift}px)` +
        ` translate(-50%, -50%)` +
        ` rotateX(${tiltX.toFixed(2)}deg)` +
        ` rotateY(${tiltY.toFixed(2)}deg)` +
        ` scale(${finalScale})`;

      card.el.style.opacity = opacity.toFixed(3);
      card.el.style.zIndex = String(500 + Math.round(depth * 500));

      if (card.link) {
        const centerX = cx;
        const centerY = cy;
        const insideRatio = 0.5;

        const anchorX = screenPos.x;
        const anchorY = screenPos.y;
        const innerX = anchorX + (centerX - anchorX) * insideRatio;
        const innerY = anchorY + (centerY - anchorY) * insideRatio;

        let titleX = cardX;
        let titleY = cardY;

        const titleEl = card.el.querySelector('.cluster-title');
        if (titleEl) {
          const tRect = titleEl.getBoundingClientRect();
          const cRect = rect;

          titleX = (tRect.left + tRect.right) * 0.5 - cRect.left;
          titleY = (tRect.top + tRect.bottom) * 0.5 - cRect.top;
        }

        card.link.setAttribute('x1', innerX.toFixed(1));
        card.link.setAttribute('y1', innerY.toFixed(1));
        card.link.setAttribute('x2', titleX.toFixed(1));
        card.link.setAttribute('y2', titleY.toFixed(1));

        const linkOpacity = isActive ? 0.8 : 0.3 + depth * 0.3;
        card.link.style.opacity = linkOpacity.toFixed(3);

        if (isActive) {
          card.link.classList.add('brain-link--active');
        } else {
          card.link.classList.remove('brain-link--active');
        }
      }
    });
  }

  projectToScreen(obj3D) {
    const v = new this.THREE.Vector3().copy(obj3D.position);
    obj3D.parent.localToWorld(v);
    v.project(this.camera);
    return {
      x: (v.x + 1) * 0.5 * this.container.clientWidth,
      y: (1 - v.y) * 0.5 * this.container.clientHeight,
      z: v.z
    };
  }

  setOptions(newOptions) {
    this.cfg = BrainConfig.merge(this.cfg, newOptions);
    if (newOptions.name && this.nameLabelEl) {
      this.nameLabelEl.textContent = this.cfg.name.text || '';
    } else if (newOptions.name && !this.nameLabelEl && this.cfg.name.text) {
      this.setupNameLabel();
    }
    this.tuneForViewport();
  }

  destroy() {
    this.isDestroyed = true;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.labelRenderer) {
      this.labelRenderer.dispose();
      if (this.labelRenderer.domElement?.parentNode) {
        this.labelRenderer.domElement.parentNode.removeChild(this.labelRenderer.domElement);
      }
    }

    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.cards.forEach(card => {
      if (card.el.parentNode) card.el.parentNode.removeChild(card.el);
    });

    if (this.linkSvg?.parentNode) {
      this.linkSvg.parentNode.removeChild(this.linkSvg);
    }

    if (this.nameLabelEl?.parentNode) {
      this.nameLabelEl.parentNode.removeChild(this.nameLabelEl);
    }

    this.cards = [];
    this.carousels.clear();
  }
}

// optional: expose globally for debugging
if (typeof window !== 'undefined') {
  window.BrainVisualization = BrainVisualization;
}

// --- Main loader ---
export async function mountBrainDeepSkills({
  container = document.getElementById('brain-host'),
  glbPath = './src/brain.glb',
  clusters = [],
  options = {}
} = {}) {
  await ensureThreeDeps();

  const autoReveal = options.autoReveal !== false;

  if (!container) {
    container = document.createElement('div');
    container.id = 'brain-host';
    document.body.appendChild(container);
  }

  container.classList.remove('brain-visible');
  container.style.opacity = '0';

  let matrixDone = false;
  let matrix;
  if (autoReveal) {
    if (window.MatrixEffect) {
      matrix = new window.MatrixEffect(document.body);
      matrix.onComplete = () => {
        matrixDone = true;
        container.classList.add('brain-visible');
        container.style.opacity = '1';
      };
    } else {
      setTimeout(() => {
        matrixDone = true;
        container.classList.add('brain-visible');
        container.style.opacity = '1';
      }, 7000);
    }
  } else {
    matrixDone = false;
  }

  if (!clusters.length) {
    clusters = [
      {
        key: 'frontal',
        title: 'Reasoning · Planning',
        items: [
          { label: 'Python' },
          { label: 'PySpark' },
          { label: 'Groovy' },
          { label: 'FastAPI' },
          { label: 'LangGraph' },
          { label: 'Neural Nets' },
          { label: 'LangChain' },
          { label: 'Langfuse' },
          { label: 'SQLModel' },
          { label: 'Alembic' }
        ]
      },
      {
        key: 'visual',
        title: 'Visual Cortex',
        items: [
          { label: 'Streamlit' },
          { label: 'Gradio' },
          { label: 'Plotly' },
          { label: 'Dash' },
          { label: 'Tableau' },
          { label: 'Matplotlib' },
          { label: 'Folium' }
        ]
      },
      {
        key: 'motor',
        title: 'Motor · Control',
        items: [
          { label: 'Agents' },
          { label: 'LLM Orchestration' },
          { label: 'Eval' },
          { label: 'MLflow' },
          { label: 'Seldon Core' },
          { label: 'Jenkins' },
          { label: 'GitHubActions' },
          { label: 'WeightsBiases' }
        ]
      },
      {
        key: 'temporalR',
        title: 'Temporal · R',
        items: [{ label: 'Whisper' }, { label: 'MongoDB' }, { label: 'Redis' }]
      },
      {
        key: 'temporalL',
        title: 'Temporal · L',
        items: [
          { label: 'RAG' },
          { label: 'Embeddings' },
          { label: 'Vector DBs' },
          { label: 'MySQL' },
          { label: 'PostgreSQL' }
        ]
      },
      {
        key: 'infra',
        title: 'Infrastructure',
        items: [
          { label: 'Docker' },
          { label: 'Kubernetes' },
          { label: 'Kubeflow' },
          { label: 'GCP' },
          { label: 'CloudRun' },
          { label: 'VertexAI' },
          { label: 'ComputeEngine' },
          { label: 'CloudStorage' },
          { label: 'CloudFunctions' },
          { label: 'AWSEC2' },
          { label: 'S3' },
          { label: 'SageMaker' },
          { label: 'Lambda' },
          { label: 'Databricks' },
          { label: 'GoogleADK' }
        ]
      }
    ];
  }

  const brain = new BrainVisualization(container, glbPath, clusters, options);

  if (!matrixDone && autoReveal) {
    container.classList.remove('brain-visible');
    container.style.opacity = '0';
  } else if (!autoReveal) {
    // caller controls visibility
  }

  return brain;
}