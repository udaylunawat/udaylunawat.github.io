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

const NODE_DRIFT_SPEED = 0.6;
const NODE_BASE_SIZE = 3.2;
const NODE_SIZE_VARIANCE = 2.0;

// ---------- Depth ----------
const DEPTH_LAYERS = 3;
const DEPTH_RANGE = 300;

// ---------- Twinkle ----------
const TWINKLE_SPEED = 0.5;
const TWINKLE_STRENGTH = 0.9;
const TWINKLE_VARIANCE = 0.5;

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

type Node = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
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

type Edge = {
  from: number;
  to: number;
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
  private activeEdges: Edge[] = [];

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
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.initNodes(isMobile ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP);
    this.initNodePoints();
    this.initConnectionLines();
    this.initShootingStars();
    this.initEdges();
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
        phase: Math.random() * Math.PI * 2
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
          // Complex twinkling with multiple frequencies
          float twinkle1 = sin(u_time * ${TWINKLE_SPEED} * a_speed + a_phase);
          float twinkle2 = sin(u_time * ${TWINKLE_SPEED} * 1.7 * a_speed + a_phase * 2.1);
          float twinkle = (twinkle1 + twinkle2 * 0.5) * ${TWINKLE_STRENGTH};
          
          // Depth-based scaling
          float depthFactor = 1.0 - (a_depth / ${DEPTH_LAYERS}.0) * 0.5;
          
          // Activity burst effect
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
          
          // Multi-layer glow
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
          // Smooth wave pulse
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
    this.activeConnections = [];
    
    // Breathing connection distance
    const breathe = Math.sin(time * CONNECTION_BREATHE_SPEED) * 0.5 + 0.5;
    const connectionDistance = CONNECTION_DISTANCE_MIN + 
      (CONNECTION_DISTANCE_MAX - CONNECTION_DISTANCE_MIN) * breathe;

    // Find connections
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        
        const dist = a.position.distanceTo(b.position);
        
        if (dist < connectionDistance) {
          const fadeStart = connectionDistance - CONNECTION_FADE_RANGE;
          let strength = 1.0;
          
          if (dist > fadeStart) {
            strength = 1.0 - ((dist - fadeStart) / CONNECTION_FADE_RANGE);
          }
          
          if (strength > 0.01) {
            // Add activity influence
            const activityBoost = (a.activity + b.activity) * 0.5;
            strength = Math.min(1.0, strength + activityBoost);
            
            this.activeConnections.push({
              from: i,
              to: j,
              strength: strength,
              pulsePhase: (i * 0.41 + j * 0.73) * Math.PI * 2
            });
          }
        }
      }
    }

    // Update geometry
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

    // Clear unused
    for (let i = this.activeConnections.length; i < pos.count / 2; i++) {
      alpha.setX(i * 2, 0);
      alpha.setX(i * 2 + 1, 0);
    }

    pos.needsUpdate = true;
    alpha.needsUpdate = true;
    pulse.needsUpdate = true;
  }

  /* ========================= ACTIVITY BURSTS ========================= */

  private triggerActivityBurst() {
    const burstNode = Math.floor(Math.random() * this.nodes.length);
    const center = this.nodes[burstNode].position;
    
    this.nodes.forEach((node) => {
      const dist = node.position.distanceTo(center);
      if (dist < BURST_RADIUS) {
        const influence = 1.0 - (dist / BURST_RADIUS);
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
    if (Math.random() < SHOOTING_STAR_CHANCE && this.shootingStars.length < 10) {
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
    const act = this.nodePoints.geometry.attributes.a_activity as THREE.BufferAttribute;
    const w = window.innerWidth / 2;
    const h = window.innerHeight / 2;

    this.nodes.forEach((node, i) => {
      // Movement
      node.position.add(node.velocity);

      // Wrap around
      if (node.position.x > w * 1.2) node.position.x = -w * 1.2;
      if (node.position.x < -w * 1.2) node.position.x = w * 1.2;
      if (node.position.y > h * 1.2) node.position.y = -h * 1.2;
      if (node.position.y < -h * 1.2) node.position.y = h * 1.2;

      // Decay activity
      node.activity *= 0.97;

      pos.setXYZ(i, node.position.x, node.position.y, node.position.z);
      act.setX(i, node.activity);
    });

    pos.needsUpdate = true;
    act.needsUpdate = true;
  }

  private updateEdges(dt: number) {
    // Compatibility stub
  }

  /* ========================= ANIMATION LOOP ========================= */

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.paused) return;

    const dt = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    // Random activity bursts
    if (Math.random() < BURST_CHANCE) {
      this.triggerActivityBurst();
    }

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