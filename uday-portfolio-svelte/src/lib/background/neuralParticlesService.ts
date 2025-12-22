import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

type Node = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  activity: number;
  phase: number;
};

type Edge = {
  a: number;
  b: number;
  phase: number;
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
  private edges: Edge[] = [];

  private nodePoints!: THREE.Points;
  private edgeMesh!: THREE.InstancedMesh;

  private nodeColor = new THREE.Color(0.85, 0.9, 0.9);
  private edgeColor = new THREE.Color(0.6, 0.9, 1.0);

  private scrollEnergy = 0;
  private clock = new THREE.Clock();

  private maxDistance = 280;
  private maxEdges = 1200;

  mount(container: HTMLElement) {
    if (this.mounted) return;
    this.mounted = true;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      -w / 2, w / 2, h / 2, -h / 2, -10, 10
    );

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);

    this.initNodes(48);
    this.initNodePoints();
    this.initEdges();

    this.initPostProcessing();

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  /* =======================
     INITIALIZATION
     ======================= */

  private initNodes(count: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < count; i++) {
      this.nodes.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * w,
          (Math.random() - 0.5) * h,
          0
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.25,
          (Math.random() - 0.5) * 0.25,
          0
        ),
        activity: Math.random(),
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private initNodePoints() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.nodes.length * 3);
    const activity = new Float32Array(this.nodes.length);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('a_activity', new THREE.BufferAttribute(activity, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: this.nodeColor }
      },
      vertexShader: `
        uniform float u_time;
        attribute float a_activity;
        varying float v_activity;

        void main() {
          v_activity = a_activity;
          float twinkle = sin(u_time * 3.0 + a_activity * 6.28) * 0.5 + 0.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.5 + twinkle * 3.5 + a_activity * 4.0;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float v_activity;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;

          float glow = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(u_color, glow * (0.4 + v_activity));
        }
      `
    });

    this.nodePoints = new THREE.Points(geometry, material);
    this.scene.add(this.nodePoints);
  }

  private initEdges() {
    const edgeGeo = new THREE.PlaneGeometry(1, 1);
    const edgeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: this.edgeColor }
      },
      vertexShader: `
        uniform float u_time;
        varying float v_pulse;

        void main() {
          v_pulse = sin(u_time * 4.0 + position.x * 10.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float v_pulse;

        void main() {
          float a = 0.25 + 0.35 * smoothstep(0.0, 1.0, v_pulse);
          gl_FragColor = vec4(u_color, a);
        }
      `
    });

    this.edgeMesh = new THREE.InstancedMesh(edgeGeo, edgeMat, this.maxEdges);
    this.edgeMesh.frustumCulled = false;
    this.scene.add(this.edgeMesh);
  }

  private initPostProcessing() {
    const renderPass = new RenderPass(this.scene, this.camera);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,
      0.6,
      0.15
    );

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.addPass(renderPass);
    this.bloomComposer.addPass(bloomPass);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
  }

  /* =======================
     SIMULATION
     ======================= */

  private updateEdges() {
    let count = 0;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i].pos;
        const b = this.nodes[j].pos;
        const d = a.distanceTo(b);

        if (d < this.maxDistance && count < this.maxEdges) {
          const mid = a.clone().add(b).multiplyScalar(0.5);
          const len = d;
          const angle = Math.atan2(b.y - a.y, b.x - a.x);

          dummy.position.set(mid.x, mid.y, 0);
          dummy.scale.set(len, 1.0, 1.0);
          dummy.rotation.z = angle;
          dummy.updateMatrix();

          this.edgeMesh.setMatrixAt(count, dummy.matrix);
          count++;
        }
      }
    }

    this.edgeMesh.count = count;
    this.edgeMesh.instanceMatrix.needsUpdate = true;
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.paused) return;

    const t = this.clock.getElapsedTime();

    const posAttr = this.nodePoints.geometry.attributes.position as THREE.BufferAttribute;
    const actAttr = this.nodePoints.geometry.attributes.a_activity as THREE.BufferAttribute;

    this.nodes.forEach((n, i) => {
      n.pos.addScaledVector(n.vel, 1 + this.scrollEnergy * 2);
      n.activity *= 0.96;

      if (Math.abs(n.pos.x) > window.innerWidth / 2) n.vel.x *= -1;
      if (Math.abs(n.pos.y) > window.innerHeight / 2) n.vel.y *= -1;

      if (Math.random() < 0.002 + this.scrollEnergy * 0.01) {
        n.activity = 1.0;
      }

      posAttr.setXYZ(i, n.pos.x, n.pos.y, 0);
      actAttr.setX(i, n.activity);
    });

    posAttr.needsUpdate = true;
    actAttr.needsUpdate = true;

    this.updateEdges();

    (this.nodePoints.material as THREE.ShaderMaterial).uniforms.u_time.value = t;
    (this.edgeMesh.material as THREE.ShaderMaterial).uniforms.u_time.value = t;

    this.renderer.clear();
    this.composer.render();
    this.bloomComposer.render();
  };

  /* =======================
     PUBLIC API
     ======================= */

  setScrollVelocity(v: number) {
    this.scrollEnergy = Math.min(v, 1.5);
  }

  setTheme(theme: 'experience' | 'projects') {
    if (theme === 'experience') {
      this.nodeColor.setRGB(0.3, 0.9, 0.6);
      this.edgeColor.setRGB(0.3, 1.0, 0.7);
    } else {
      this.nodeColor.setRGB(0.4, 0.6, 1.0);
      this.edgeColor.setRGB(0.4, 0.7, 1.0);
    }
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