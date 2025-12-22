import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

/* ======================================================
   TUNABLE PARAMETERS (SAFE ZONE)
   ====================================================== */

// ---------- Nodes ----------
const NODE_COUNT_DESKTOP = 70;
const NODE_COUNT_MOBILE = 40;

const NODE_DRIFT_SPEED = 5.6;
const NODE_BASE_SIZE = 3.2;
const NODE_SIZE_VARIANCE = 4.0;

// ---------- Depth ----------
const DEPTH_LAYERS = 3;
const DEPTH_RANGE = 300;

// ---------- Twinkle ----------
const TWINKLE_SPEED = 0.5;
const TWINKLE_STRENGTH = 0.85;
const TWINKLE_VARIANCE = 0.4;

// ---------- Connections ----------
const CONNECTION_DISTANCE_MIN = 80;
const CONNECTION_DISTANCE_MAX = 120;
const CONNECTION_BREATHE_SPEED = 0.7;
const CONNECTION_FADE_RANGE = 100;

// ---------- Pulse ----------
const PULSE_SPEED = 0.3;
const PULSE_INTENSITY = 0.9;

// ---------- Activity Bursts ----------
const BURST_CHANCE = 0.005;
const BURST_RADIUS = 250;
const BURST_STRENGTH = 0.8;

// ---------- Shooting Stars ----------
const SHOOTING_STAR_CHANCE = 0.01;
const SHOOTING_STAR_SPEED = 12;
const SHOOTING_STAR_LIFETIME = 1.8;
const SHOOTING_STAR_TRAIL = 180;

// ---------- Bloom ----------
const BLOOM_STRENGTH = 1.6;
const BLOOM_RADIUS = 0.95;
const BLOOM_THRESHOLD = 0.1;

/* ====================================================== */

// Performance constants
const SPATIAL_GRID_SIZE = 150;
const TARGET_FPS = 50;
const FPS_SAMPLE_SIZE = 30;
const MOUSE_INTERACTION_RADIUS = 150;

type Node = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  depth: number;
  activity: number;
  phase: number;
  gridX: number;
  gridY: number;
};

type ActiveConnection = {
  from: number;
  to: number;
  strength: number;
  pulsePhase: number;
};

type ShootingStar = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  age: number;
};

type SignalParticle = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  progress: number;
  speed: number;
  life: number;
};

class NeuralParticlesService {
  private mounted = false;
  private paused = false;

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;

  private composer!: EffectComposer;
  private bloomComposer!: EffectComposer;

  private nodes: Node[] = [];
  private activeConnections: ActiveConnection[] = [];
  private shootingStars: ShootingStar[] = [];
  private signalParticles: SignalParticle[] = [];

  private nodePoints!: THREE.Points;
  private connectionLines!: THREE.LineSegments;
  private shootingStarLines!: THREE.LineSegments;
  private signalPoints!: THREE.Points;

  private clock = new THREE.Clock();
  private scrollEnergy = 0;

  // Spatial partitioning
  private spatialGrid: Map<string, number[]> = new Map();
  
  // Adaptive quality
  private fpsSamples: number[] = [];
  private qualityLevel = 1.0;
  private lastFrameTime = 0;
  
  // Mouse interaction
  private mouse = new THREE.Vector2();
  private mouseWorldPos = new THREE.Vector3();
  private isMouseActive = false;

  /* ====================================================== */

  mount(container: HTMLElement) {
    if (this.mounted) return;
    this.mounted = true;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      -w / 2, w / 2,
       h / 2, -h / 2,
      -1000, 1000
    );

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    container.appendChild(this.renderer.domElement);

    this.initNodes(isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP);
    this.initNodePoints();
    this.initConnectionLines();
    this.initShootingStars();
    this.initSignalParticles();
    this.initPost();
    this.initMouseInteraction(container);

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  /* ========================= SPATIAL PARTITIONING ========================= */

  private getGridKey(x: number, y: number): string {
    const gx = Math.floor(x / SPATIAL_GRID_SIZE);
    const gy = Math.floor(y / SPATIAL_GRID_SIZE);
    return `${gx},${gy}`;
  }

  private updateSpatialGrid() {
    this.spatialGrid.clear();
    
    this.nodes.forEach((node, i) => {
      const key = this.getGridKey(node.position.x, node.position.y);
      node.gridX = Math.floor(node.position.x / SPATIAL_GRID_SIZE);
      node.gridY = Math.floor(node.position.y / SPATIAL_GRID_SIZE);
      
      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      this.spatialGrid.get(key)!.push(i);
    });
  }

  private getNeighborNodes(node: Node): number[] {
    const neighbors: number[] = [];
    
    // Check 3x3 grid around node
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${node.gridX + dx},${node.gridY + dy}`;
        const cells = this.spatialGrid.get(key);
        if (cells) {
          neighbors.push(...cells);
        }
      }
    }
    
    return neighbors;
  }

  /* ========================= ADAPTIVE QUALITY ========================= */

  private updateAdaptiveQuality(fps: number) {
    this.fpsSamples.push(fps);
    if (this.fpsSamples.length > FPS_SAMPLE_SIZE) {
      this.fpsSamples.shift();
    }

    if (this.fpsSamples.length === FPS_SAMPLE_SIZE) {
      const avgFps = this.fpsSamples.reduce((a, b) => a + b) / FPS_SAMPLE_SIZE;
      
      if (avgFps < TARGET_FPS * 0.8) {
        this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.05);
      } else if (avgFps > TARGET_FPS * 1.1 && this.qualityLevel < 1.0) {
        this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.02);
      }
    }
  }

  /* ========================= MOUSE INTERACTION ========================= */

  private initMouseInteraction(container: HTMLElement) {
    const updateMouse = (e: MouseEvent | Touch) => {
      const rect = container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left - rect.width / 2;
      this.mouse.y = -(e.clientY - rect.top - rect.height / 2);
      this.mouseWorldPos.set(this.mouse.x, this.mouse.y, 0);
      this.isMouseActive = true;
    };

    container.addEventListener('mousemove', (e) => updateMouse(e));
    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      updateMouse(e.touches[0]);
    });

    container.addEventListener('click', (e) => this.addNodeAtMouse(e));
    container.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        this.addNodeAtMouse(e.changedTouches[0]);
      }
    });

    container.addEventListener('mouseleave', () => {
      this.isMouseActive = false;
    });
  }

  private addNodeAtMouse(e: MouseEvent | Touch) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = -(e.clientY - rect.top - rect.height / 2);

    const newNode: Node = {
      position: new THREE.Vector3(x, y, -DEPTH_RANGE * 0.5),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * NODE_DRIFT_SPEED,
        (Math.random() - 0.5) * NODE_DRIFT_SPEED,
        0
      ),
      size: NODE_BASE_SIZE * 1.5,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 1.2,
      depth: 1,
      activity: 1.0,
      phase: Math.random() * Math.PI * 2,
      gridX: 0,
      gridY: 0
    };

    this.nodes.push(newNode);
    this.resizeNodeBuffers();
    this.triggerActivityBurstAt(newNode.position);
  }

  private applyMouseInfluence() {
    if (!this.isMouseActive) return;

    this.nodes.forEach(node => {
      const dist = node.position.distanceTo(this.mouseWorldPos);
      if (dist < MOUSE_INTERACTION_RADIUS) {
        const influence = 1.0 - (dist / MOUSE_INTERACTION_RADIUS);
        const force = this.mouseWorldPos.clone()
          .sub(node.position)
          .normalize()
          .multiplyScalar(influence * 0.5);
        
        node.velocity.add(force);
        node.activity = Math.min(1.0, node.activity + influence * 0.1);
      }
    });
  }

  /* ========================= NODES ========================= */

  private initNodes(count: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < count; i++) {
      const depth = Math.floor(Math.random() * DEPTH_LAYERS);
      const depthFactor = depth / Math.max(1, DEPTH_LAYERS - 1);
      const z = -DEPTH_RANGE * depthFactor;

      this.nodes.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * w * 1.2,
          (Math.random() - 0.5) * h * 1.2,
          z
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * NODE_DRIFT_SPEED,
          (Math.random() - 0.5) * NODE_DRIFT_SPEED,
          0
        ),
        size: NODE_BASE_SIZE + Math.random() * NODE_SIZE_VARIANCE,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.8 + Math.random() * 0.4,
        depth: depth,
        activity: Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        gridX: 0,
        gridY: 0
      });
    }
  }

  private initNodePoints() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.nodes.length * 3);
    const sizes = new Float32Array(this.nodes.length);
    const phases = new Float32Array(this.nodes.length);
    const speeds = new Float32Array(this.nodes.length);
    const depths = new Float32Array(this.nodes.length);

    this.nodes.forEach((node, i) => {
      positions[i * 3] = node.position.x;
      positions[i * 3 + 1] = node.position.y;
      positions[i * 3 + 2] = node.position.z;
      sizes[i] = node.size;
      phases[i] = node.twinklePhase;
      speeds[i] = node.twinkleSpeed;
      depths[i] = node.depth;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('a_size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('a_phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('a_speed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('a_depth', new THREE.BufferAttribute(depths, 1));
    geometry.setAttribute('a_activity', new THREE.BufferAttribute(new Float32Array(this.nodes.length), 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 }
      },
      vertexShader: `
        uniform float u_time;
        attribute float a_size;
        attribute float a_phase;
        attribute float a_speed;
        attribute float a_depth;
        attribute float a_activity;
        varying float v_alpha;
        varying float v_glow;

        void main() {
          float twinkle1 = sin(u_time * ${TWINKLE_SPEED} * a_speed + a_phase);
          float twinkle2 = sin(u_time * ${TWINKLE_SPEED} * 1.7 * a_speed + a_phase * 2.1);
          float twinkle = (twinkle1 + twinkle2 * 0.5) * ${TWINKLE_STRENGTH};
          
          float depthFactor = 1.0 - (a_depth / ${DEPTH_LAYERS}.0) * 0.5;
          float activityGlow = a_activity * 1.5;
          
          v_alpha = 0.5 + twinkle * 0.4 + activityGlow * 0.3;
          v_glow = 1.0 + twinkle + activityGlow;
          
          float finalSize = a_size * depthFactor * (1.0 + twinkle * 0.5 + activityGlow * 0.8);
          gl_PointSize = finalSize;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float v_alpha;
        varying float v_glow;

        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float d = length(center);
          if (d > 0.5) discard;
          
          float core = smoothstep(0.5, 0.0, d);
          float glow1 = smoothstep(0.5, 0.2, d);
          float glow2 = smoothstep(0.5, 0.35, d);
          
          vec3 color = vec3(0.7, 0.85, 1.0) * v_glow;
          float alpha = core * v_alpha + glow1 * 0.5 + glow2 * 0.2;
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    this.nodePoints = new THREE.Points(geometry, material);
    this.scene.add(this.nodePoints);
  }

  private resizeNodeBuffers() {
    const geometry = this.nodePoints.geometry;
    const newSize = this.nodes.length;
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newSize * 3), 3));
    geometry.setAttribute('a_size', new THREE.BufferAttribute(new Float32Array(newSize), 1));
    geometry.setAttribute('a_phase', new THREE.BufferAttribute(new Float32Array(newSize), 1));
    geometry.setAttribute('a_speed', new THREE.BufferAttribute(new Float32Array(newSize), 1));
    geometry.setAttribute('a_depth', new THREE.BufferAttribute(new Float32Array(newSize), 1));
    geometry.setAttribute('a_activity', new THREE.BufferAttribute(new Float32Array(newSize), 1));

    this.nodes.forEach((node, i) => {
      (geometry.attributes.a_size as THREE.BufferAttribute).setX(i, node.size);
      (geometry.attributes.a_phase as THREE.BufferAttribute).setX(i, node.twinklePhase);
      (geometry.attributes.a_speed as THREE.BufferAttribute).setX(i, node.twinkleSpeed);
      (geometry.attributes.a_depth as THREE.BufferAttribute).setX(i, node.depth);
    });
  }

  /* ========================= DYNAMIC CONNECTIONS ========================= */

  private initConnectionLines() {
    const maxConnections = this.nodes.length * 6;
    const geometry = new THREE.BufferGeometry();
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxConnections * 6), 3));
    geometry.setAttribute('a_alpha', new THREE.BufferAttribute(new Float32Array(maxConnections * 2), 1));
    geometry.setAttribute('a_pulse', new THREE.BufferAttribute(new Float32Array(maxConnections * 2), 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 }
      },
      vertexShader: `
        attribute float a_alpha;
        attribute float a_pulse;
        varying float v_alpha;
        varying float v_pulse;

        void main() {
          v_alpha = a_alpha;
          v_pulse = a_pulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        varying float v_alpha;
        varying float v_pulse;

        void main() {
          float pulse = sin(u_time * ${PULSE_SPEED} + v_pulse) * 0.5 + 0.5;
          pulse = pow(pulse, 2.5);
          
          vec3 color = vec3(0.5, 0.75, 1.0);
          float brightness = 0.5 + pulse * ${PULSE_INTENSITY};
          float alpha = v_alpha * (0.6 + pulse * 0.4);
          
          gl_FragColor = vec4(color * brightness, alpha);
        }
      `
    });

    this.connectionLines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.connectionLines);
  }

  private updateDynamicConnections(dt: number, time: number) {
    this.updateSpatialGrid();
    this.activeConnections = [];
    
    const breathe = Math.sin(time * CONNECTION_BREATHE_SPEED) * 0.5 + 0.5;
    const connectionDistance = CONNECTION_DISTANCE_MIN + 
      (CONNECTION_DISTANCE_MAX - CONNECTION_DISTANCE_MIN) * breathe;
    const connectionDistSq = connectionDistance * connectionDistance;

    const maxConnectionsPerFrame = Math.floor(this.nodes.length * 3 * this.qualityLevel);
    let connectionCount = 0;

    for (let i = 0; i < this.nodes.length && connectionCount < maxConnectionsPerFrame; i++) {
      const nodeA = this.nodes[i];
      const neighbors = this.getNeighborNodes(nodeA);
      
      for (const j of neighbors) {
        if (j <= i || connectionCount >= maxConnectionsPerFrame) continue;
        
        const nodeB = this.nodes[j];
        const distSq = nodeA.position.distanceToSquared(nodeB.position);
        
        if (distSq < connectionDistSq) {
          const dist = Math.sqrt(distSq);
          const fadeStart = connectionDistance - CONNECTION_FADE_RANGE;
          let strength = 1.0;
          
          if (dist > fadeStart) {
            strength = 1.0 - ((dist - fadeStart) / CONNECTION_FADE_RANGE);
          }
          
          if (strength > 0.01) {
            const activityBoost = (nodeA.activity + nodeB.activity) * 0.5;
            strength = Math.min(1.0, strength + activityBoost);
            
            this.activeConnections.push({
              from: i,
              to: j,
              strength: strength,
              pulsePhase: (i * 0.41 + j * 0.73) * Math.PI * 2
            });
            
            connectionCount++;
            
            // Spawn signal particles on strong connections
            if (Math.random() < 0.02 * strength && this.signalParticles.length < 50) {
              this.spawnSignalParticle(nodeA.position, nodeB.position);
            }
          }
        }
      }
    }

    const pos = this.connectionLines.geometry.attributes.position as THREE.BufferAttribute;
    const alpha = this.connectionLines.geometry.attributes.a_alpha as THREE.BufferAttribute;
    const pulse = this.connectionLines.geometry.attributes.a_pulse as THREE.BufferAttribute;

    this.activeConnections.forEach((conn, idx) => {
      const from = this.nodes[conn.from].position;
      const to = this.nodes[conn.to].position;
      
      pos.setXYZ(idx * 2, from.x, from.y, from.z);
      pos.setXYZ(idx * 2 + 1, to.x, to.y, to.z);
      
      const opacity = conn.strength * 0.4;
      alpha.setX(idx * 2, opacity);
      alpha.setX(idx * 2 + 1, opacity);
      
      pulse.setX(idx * 2, conn.pulsePhase);
      pulse.setX(idx * 2 + 1, conn.pulsePhase);
    });

    for (let i = this.activeConnections.length; i < pos.count / 2; i++) {
      alpha.setX(i * 2, 0);
      alpha.setX(i * 2 + 1, 0);
    }

    pos.needsUpdate = true;
    alpha.needsUpdate = true;
    pulse.needsUpdate = true;
  }

  /* ========================= SIGNAL PARTICLES ========================= */

  private initSignalParticles() {
    const maxSignals = 50;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(maxSignals * 3);
    const sizes = new Float32Array(maxSignals);
    const alphas = new Float32Array(maxSignals);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('a_size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('a_alpha', new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float a_size;
        attribute float a_alpha;
        varying float v_alpha;
        
        void main() {
          v_alpha = a_alpha;
          gl_PointSize = a_size;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float v_alpha;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float d = length(center);
          if (d > 0.5) discard;
          
          float core = smoothstep(0.5, 0.0, d);
          vec3 color = vec3(0.3, 0.8, 1.0);
          
          gl_FragColor = vec4(color, core * v_alpha);
        }
      `
    });

    this.signalPoints = new THREE.Points(geometry, material);
    this.scene.add(this.signalPoints);
  }

  private spawnSignalParticle(from: THREE.Vector3, to: THREE.Vector3) {
    this.signalParticles.push({
      from: from.clone(),
      to: to.clone(),
      progress: 0,
      speed: 1.5 + Math.random() * 0.5,
      life: 1.0
    });
  }

  private updateSignalParticles(dt: number) {
    this.signalParticles = this.signalParticles.filter(signal => {
      signal.progress += signal.speed * dt;
      signal.life = 1.0 - signal.progress;
      return signal.progress < 1.0;
    });

    const pos = this.signalPoints.geometry.attributes.position as THREE.BufferAttribute;
    const size = this.signalPoints.geometry.attributes.a_size as THREE.BufferAttribute;
    const alpha = this.signalPoints.geometry.attributes.a_alpha as THREE.BufferAttribute;
    
    this.signalParticles.forEach((signal, i) => {
      const current = signal.from.clone().lerp(signal.to, signal.progress);
      pos.setXYZ(i, current.x, current.y, current.z);
      size.setX(i, 4 + signal.life * 3);
      alpha.setX(i, signal.life);
    });
    
    for (let i = this.signalParticles.length; i < 50; i++) {
      alpha.setX(i, 0);
    }
    
    pos.needsUpdate = true;
    size.needsUpdate = true;
    alpha.needsUpdate = true;
  }

  /* ========================= ACTIVITY BURSTS ========================= */

  private triggerActivityBurst() {
    const burstNode = Math.floor(Math.random() * this.nodes.length);
    const center = this.nodes[burstNode].position;
    this.triggerActivityBurstAt(center);
  }

  private triggerActivityBurstAt(center: THREE.Vector3) {
    const burstRadiusSq = BURST_RADIUS * BURST_RADIUS;
    
    this.nodes.forEach((node) => {
      const distSq = node.position.distanceToSquared(center);
      if (distSq < burstRadiusSq) {
        const influence = 1.0 - (Math.sqrt(distSq) / BURST_RADIUS);
        node.activity = Math.min(1.0, node.activity + influence * BURST_STRENGTH);
      }
    });
  }

  /* ========================= SHOOTING STARS ========================= */

  private initShootingStars() {
    const maxStars = 10;
    const geometry = new THREE.BufferGeometry();
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxStars * 6), 3));
    geometry.setAttribute('a_alpha', new THREE.BufferAttribute(new Float32Array(maxStars * 2), 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 }
      },
      vertexShader: `
        attribute float a_alpha;
        varying float v_alpha;
        
        void main() {
          v_alpha = a_alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float v_alpha;
        
        void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
        }
      `
    });

    this.shootingStarLines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.shootingStarLines);
  }

  private spawnShootingStar() {
    const w = window.innerWidth / 2;
    const h = window.innerHeight / 2;
    
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    
    if (side === 0) { x = -w * 1.2; y = (Math.random() - 0.5) * h; }
    else if (side === 1) { x = w * 1.2; y = (Math.random() - 0.5) * h; }
    else if (side === 2) { x = (Math.random() - 0.5) * w; y = -h * 1.2; }
    else { x = (Math.random() - 0.5) * w; y = h * 1.2; }
    
    const angle = Math.atan2(-y, -x) + (Math.random() - 0.5) * 0.4;
    
    this.shootingStars.push({
      position: new THREE.Vector3(x, y, -50),
      velocity: new THREE.Vector3(
        Math.cos(angle) * SHOOTING_STAR_SPEED,
        Math.sin(angle) * SHOOTING_STAR_SPEED,
        0
      ),
      lifetime: SHOOTING_STAR_LIFETIME,
      age: 0
    });
  }

  private updateShootingStars(dt: number) {
    if (Math.random() < SHOOTING_STAR_CHANCE * this.qualityLevel && this.shootingStars.length < 10) {
      this.spawnShootingStar();
    }

    this.shootingStars = this.shootingStars.filter(star => {
      star.age += dt;
      star.position.add(star.velocity.clone().multiplyScalar(dt * 60));
      return star.age < star.lifetime;
    });

    const pos = this.shootingStarLines.geometry.attributes.position as THREE.BufferAttribute;
    const alpha = this.shootingStarLines.geometry.attributes.a_alpha as THREE.BufferAttribute;
    
    this.shootingStars.forEach((star, i) => {
      const fadeOut = 1.0 - (star.age / star.lifetime);
      const trailLength = SHOOTING_STAR_TRAIL * fadeOut;
      
      const tail = star.position.clone().sub(
        star.velocity.clone().normalize().multiplyScalar(trailLength)
      );
      
      pos.setXYZ(i * 2, star.position.x, star.position.y, star.position.z);
      pos.setXYZ(i * 2 + 1, tail.x, tail.y, tail.z);
      
      alpha.setX(i * 2, 0.9 * fadeOut);
      alpha.setX(i * 2 + 1, 0.0);
    });
    
    for (let i = this.shootingStars.length; i < 10; i++) {
      alpha.setX(i * 2, 0);
      alpha.setX(i * 2 + 1, 0);
    }
    
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
  }

  /* ========================= POST PROCESSING ========================= */

  private initPost() {
    const renderPass = new RenderPass(this.scene, this.camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      BLOOM_STRENGTH * this.qualityLevel,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.addPass(renderPass);
    this.bloomComposer.addPass(bloomPass);
  }

  /* ========================= UPDATE ========================= */

  private updateNodes(dt: number) {
    const pos = this.nodePoints.geometry.attributes.position as THREE.BufferAttribute;
    const act = this.nodePoints.geometry.attributes.a_activity as THREE.BufferAttribute;
    const w = window.innerWidth / 2;
    const h = window.innerHeight / 2;

    // Apply scroll velocity influence
    const scrollInfluence = this.scrollEnergy * 0.3;

    this.nodes.forEach((node, i) => {
      // Movement with scroll influence
      const velocity = node.velocity.clone();
      velocity.y += scrollInfluence;
      node.position.add(velocity);

      // Wrap around
      if (node.position.x > w * 1.2) node.position.x = -w * 1.2;
      if (node.position.x < -w * 1.2) node.position.x = w * 1.2;
      if (node.position.y > h * 1.2) node.position.y = -h * 1.2;
      if (node.position.y < -h * 1.2) node.position.y = h * 1.2;

      // Decay activity
      node.activity *= 0.97;

      // Dampen velocity
      node.velocity.multiplyScalar(0.99);

      pos.setXYZ(i, node.position.x, node.position.y, node.position.z);
      act.setX(i, node.activity);
    });

    // Decay scroll energy
    this.scrollEnergy *= 0.95;

    pos.needsUpdate = true;
    act.needsUpdate = true;
  }

  /* ========================= ANIMATION LOOP ========================= */

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.paused) return;

    const now = performance.now();
    const dt = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    // FPS tracking
    if (this.lastFrameTime > 0) {
      const fps = 1000 / (now - this.lastFrameTime);
      this.updateAdaptiveQuality(fps);
    }
    this.lastFrameTime = now;

    // Random activity bursts
    if (Math.random() < BURST_CHANCE * this.qualityLevel) {
      this.triggerActivityBurst();
    }

    // Mouse interaction
    this.applyMouseInfluence();

    // Updates
    this.updateNodes(dt);
    this.updateDynamicConnections(dt, t);
    this.updateShootingStars(dt);
    this.updateSignalParticles(dt);

    // Update uniforms
    (this.nodePoints.material as THREE.ShaderMaterial).uniforms.u_time.value = t;
    (this.connectionLines.material as THREE.ShaderMaterial).uniforms.u_time.value = t;

    // Render
    this.renderer.clear();
    this.composer.render();
    this.bloomComposer.render();
  };

  /* ========================= API ========================= */

  setScrollVelocity(v: number) {
    this.scrollEnergy = Math.min(Math.abs(v) * 2, 1.5);
    
    // Trigger activity on scroll
    if (Math.abs(v) > 0.5) {
      const randomNode = Math.floor(Math.random() * this.nodes.length);
      this.triggerActivityBurstAt(this.nodes[randomNode].position);
    }
  }

  setPaused(v: boolean) {
    this.paused = v;
  }

  getQualityLevel(): number {
    return this.qualityLevel;
  }

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.left = -w / 2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloomComposer.setSize(w, h);
  };

  unmount() {
    if (!this.mounted) return;
    
    this.mounted = false;
    window.removeEventListener('resize', this.onResize);
    
    this.scene.clear();
    this.renderer.dispose();
    this.composer.dispose();
    this.bloomComposer.dispose();
  }
}

export const neuralParticlesService = new NeuralParticlesService();