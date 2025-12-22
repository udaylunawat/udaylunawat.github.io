import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

/* ======================================================
   TUNABLE PARAMETERS
   ====================================================== */

// Nodes
const NODE_COUNT_DESKTOP = 100;
const NODE_COUNT_MOBILE = 45;
const NODE_DRIFT_SPEED = 0.52;
const NODE_BASE_SIZE = 4.8;
const NODE_SIZE_VARIANCE = 4.0;

// Depth layers
const DEPTH_LAYERS = 3;
const DEPTH_RANGE = 400;

// Dynamic connections
const CONNECTION_DISTANCE = 100;
const CONNECTION_FADE_DISTANCE = 80;
const CONNECTION_PULSE_SPEED = 1.5;

// Animation
const SHIMMER_SPEED = 0.9;
const SHIMMER_STRENGTH = 0.3;

// Colors
const STAR_COLOR = new THREE.Color(0.75, 0.85, 1.0);
const CONNECTION_COLOR = new THREE.Color(0.5, 0.8, 1.0);

// Shooting stars
const SHOOTING_STAR_CHANCE = 0.01;
const SHOOTING_STAR_SPEED = 10.0;
const SHOOTING_STAR_LIFETIME = 1.5;
const SHOOTING_STAR_TRAIL_LENGTH = 150;

// Bloom
const BLOOM_STRENGTH = 1.4;
const BLOOM_RADIUS = 0.8;
const BLOOM_THRESHOLD = 0.08;

/* ====================================================== */

type Node = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  shimmerPhase: number;
  depth: number;
  activity: number;
  phase: number;
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

  private nodePoints!: THREE.Points;
  private connectionLines!: THREE.LineSegments;
  private shootingStarLines!: THREE.LineSegments;
  private edgeMesh!: THREE.InstancedMesh;

  private clock = new THREE.Clock();
  private scrollEnergy = 0;

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
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    container.appendChild(this.renderer.domElement);

    this.initNodes(isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP);
    this.initNodePoints();
    this.initConnectionLines();
    this.initShootingStars();
    this.initPost();

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  /* ========================= NODES ========================= */

  private initNodes(count: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < count; i++) {
      const depth = Math.floor(Math.random() * DEPTH_LAYERS);
      const depthFactor = depth / (DEPTH_LAYERS - 1);
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
        shimmerPhase: Math.random() * Math.PI * 2,
        depth: depth,
        activity: Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private initNodePoints() {
    const positions = new Float32Array(this.nodes.length * 3);
    const sizes = new Float32Array(this.nodes.length);
    const phases = new Float32Array(this.nodes.length);
    const depths = new Float32Array(this.nodes.length);

    this.nodes.forEach((node, i) => {
      positions[i * 3] = node.position.x;
      positions[i * 3 + 1] = node.position.y;
      positions[i * 3 + 2] = node.position.z;
      sizes[i] = node.size;
      phases[i] = node.shimmerPhase;
      depths[i] = node.depth;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('a_size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('a_phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('a_depth', new THREE.BufferAttribute(depths, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: STAR_COLOR }
      },
      vertexShader: `
        uniform float u_time;
        attribute float a_size;
        attribute float a_phase;
        attribute float a_depth;
        varying float v_alpha;
        varying float v_brightness;

        void main() {
          float shimmer = sin(u_time * ${SHIMMER_SPEED} + a_phase) * ${SHIMMER_STRENGTH};
          float depthFactor = 1.0 - (a_depth / ${DEPTH_LAYERS - 1}.0) * 0.5;
          
          v_alpha = 0.4 + shimmer * 0.4;
          v_brightness = 0.7 + shimmer * 0.3;
          
          gl_PointSize = a_size * depthFactor * (1.0 + shimmer * 0.4);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float v_alpha;
        varying float v_brightness;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          
          float soft = smoothstep(0.5, 0.0, d);
          float core = smoothstep(0.2, 0.0, d) * 0.8;
          
          vec3 finalColor = u_color * v_brightness;
          float finalAlpha = soft * v_alpha + core;
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `
    });

    this.nodePoints = new THREE.Points(geometry, material);
    this.scene.add(this.nodePoints);
  }

  /* ========================= DYNAMIC CONNECTIONS ========================= */

  private initConnectionLines() {
    // Create buffer for maximum possible connections
    const maxConnections = this.nodes.length * 5;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxConnections * 6);
    const alphas = new Float32Array(maxConnections * 2);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('a_alpha', new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: CONNECTION_COLOR }
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
        uniform float u_time;
        uniform vec3 u_color;
        varying float v_alpha;

        void main() {
          gl_FragColor = vec4(u_color, v_alpha);
        }
      `
    });

    this.connectionLines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.connectionLines);
  }

  private updateDynamicConnections(dt: number, time: number) {
    this.activeConnections = [];

    // Find all pairs within connection distance
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        
        const dist = a.position.distanceTo(b.position);
        
        if (dist < CONNECTION_DISTANCE) {
          // Calculate connection strength based on distance
          const strength = 1.0 - Math.max(0, (dist - (CONNECTION_DISTANCE - CONNECTION_FADE_DISTANCE)) / CONNECTION_FADE_DISTANCE);
          
          if (strength > 0) {
            // Add pulsing effect
            const pulse = Math.sin(time * CONNECTION_PULSE_SPEED + (i + j) * 0.5) * 0.3 + 0.7;
            
            this.activeConnections.push({
              from: i,
              to: j,
              strength: strength * pulse,
              pulsePhase: (i + j) * 0.1
            });
          }
        }
      }
    }

    // Update line geometry
    const pos = this.connectionLines.geometry.attributes.position as THREE.BufferAttribute;
    const alpha = this.connectionLines.geometry.attributes.a_alpha as THREE.BufferAttribute;

    this.activeConnections.forEach((conn, idx) => {
      const from = this.nodes[conn.from].position;
      const to = this.nodes[conn.to].position;
      
      pos.setXYZ(idx * 2, from.x, from.y, from.z);
      pos.setXYZ(idx * 2 + 1, to.x, to.y, to.z);
      
      const opacity = conn.strength * 0.25;
      alpha.setX(idx * 2, opacity);
      alpha.setX(idx * 2 + 1, opacity);
    });

    // Hide unused connections
    for (let i = this.activeConnections.length; i < pos.count / 2; i++) {
      pos.setXYZ(i * 2, 0, 0, 0);
      pos.setXYZ(i * 2 + 1, 0, 0, 0);
      alpha.setX(i * 2, 0);
      alpha.setX(i * 2 + 1, 0);
    }

    pos.needsUpdate = true;
    alpha.needsUpdate = true;
  }

  /* ========================= SHOOTING STARS ========================= */

  private initShootingStars() {
    const maxStars = 10;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxStars * 6);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        u_color: { value: new THREE.Color(1, 1, 1) }
      },
      vertexShader: `
        varying float v_position;
        void main() {
          v_position = position.x;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float v_position;
        void main() {
          gl_FragColor = vec4(u_color, 0.8);
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
    
    const angle = Math.atan2(-y, -x) + (Math.random() - 0.5) * 0.3;
    
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
    if (Math.random() < SHOOTING_STAR_CHANCE && this.shootingStars.length < 10) {
      this.spawnShootingStar();
    }

    this.shootingStars = this.shootingStars.filter(star => {
      star.age += dt;
      star.position.add(star.velocity.clone().multiplyScalar(dt * 60));
      return star.age < star.lifetime;
    });

    const pos = this.shootingStarLines.geometry.attributes.position as THREE.BufferAttribute;
    
    this.shootingStars.forEach((star, i) => {
      const fadeOut = 1.0 - (star.age / star.lifetime);
      const trailLength = SHOOTING_STAR_TRAIL_LENGTH * fadeOut;
      
      const tail = star.position.clone().sub(
        star.velocity.clone().normalize().multiplyScalar(trailLength)
      );
      
      pos.setXYZ(i * 2, star.position.x, star.position.y, star.position.z);
      pos.setXYZ(i * 2 + 1, tail.x, tail.y, tail.z);
    });
    
    for (let i = this.shootingStars.length; i < 10; i++) {
      pos.setXYZ(i * 2, 0, 0, 0);
      pos.setXYZ(i * 2 + 1, 0, 0, 0);
    }
    
    pos.needsUpdate = true;
  }

  /* ========================= EDGES (for compatibility) ========================= */

  private initEdges() {
    // Stub for compatibility
  }

  /* ========================= POST PROCESSING ========================= */

  private initPost() {
    const renderPass = new RenderPass(this.scene, this.camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      BLOOM_STRENGTH,
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
    const w = window.innerWidth / 2;
    const h = window.innerHeight / 2;

    this.nodes.forEach((node, i) => {
      node.position.add(node.velocity);

      // Wrap around screen edges for continuous movement
      if (node.position.x > w * 1.2) node.position.x = -w * 1.2;
      if (node.position.x < -w * 1.2) node.position.x = w * 1.2;
      if (node.position.y > h * 1.2) node.position.y = -h * 1.2;
      if (node.position.y < -h * 1.2) node.position.y = h * 1.2;

      pos.setXYZ(i, node.position.x, node.position.y, node.position.z);
    });

    pos.needsUpdate = true;
  }

  private updateEdges(dt: number) {
    // Compatibility stub - connections now handled dynamically
  }

  /* ========================= ANIMATION LOOP ========================= */

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.paused) return;

    const dt = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    this.updateNodes(dt);
    this.updateDynamicConnections(dt, t);
    this.updateShootingStars(dt);
    this.updateEdges(dt);

    (this.nodePoints.material as THREE.ShaderMaterial).uniforms.u_time.value = t;
    (this.connectionLines.material as THREE.ShaderMaterial).uniforms.u_time.value = t;

    this.renderer.clear();
    this.composer.render();
    this.bloomComposer.render();
  };

  /* ========================= API ========================= */

  setScrollVelocity(v: number) {
    this.scrollEnergy = Math.min(v, 1.5);
  }

  setPaused(v: boolean) {
    this.paused = v;
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
}

export const neuralParticlesService = new NeuralParticlesService();