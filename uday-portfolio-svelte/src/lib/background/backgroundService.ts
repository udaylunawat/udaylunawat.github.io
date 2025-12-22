import * as THREE from 'three';

class BackgroundService {
  private static instance: BackgroundService;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private mesh!: THREE.Mesh;
  private material!: THREE.ShaderMaterial;
  private clock = new THREE.Clock();

  private paused = false;
  private scrollY = 0;
  private mounted = false;

  // Smooth color state
  private currentColor1 = new THREE.Vector3(15, 20, 30);
  private currentColor2 = new THREE.Vector3(0, 90, 60);

  private targetColor1 = this.currentColor1.clone();
  private targetColor2 = this.currentColor2.clone();

  private readonly COLOR_LERP_SPEED = 0.035; // lower = slower, smoother

  static getInstance() {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  mount(container: HTMLElement) {
    if (this.mounted) return;
    this.mounted = true;

    const aspect = window.innerWidth / window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10);
    this.camera.position.z = 1.6;

    this.material = this.createMaterial();

    const geometry = new THREE.PlaneGeometry(2 * aspect, 2, 48, 36);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    window.addEventListener('resize', this.onResize);
    document.addEventListener('scroll', this.onScroll, { passive: true });

    this.animate();
  }

  private createMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        u_time: { value: 0 },
        u_scroll: { value: 0 },
        u_color1: { value: this.currentColor1.clone() },
        u_color2: { value: this.currentColor2.clone() }
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float u_scroll;

        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.y += u_scroll * 0.15;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float u_time;
        uniform vec3 u_color1;
        uniform vec3 u_color2;

        float noise(vec2 p) {
          return sin(p.x) * sin(p.y);
        }

        void main() {
          vec2 uv = vUv;
          float t = u_time * 0.25;

          float w1 = sin((uv.x + t) * 3.0);
          float w2 = sin((uv.y - t * 0.7) * 4.0);
          float n = noise(uv * 6.0 + t);

          float mixVal = clamp(
            0.5 + 0.25 * w1 + 0.25 * w2 + 0.15 * n,
            0.0,
            1.0
          );

          vec3 color = mix(u_color1, u_color2, mixVal) / 255.0;
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
  }

  /* =====================
     THEMES (TARGET ONLY)
     ===================== */

  setTheme(name: 'experience' | 'projects') {
    if (name === 'experience') {
      this.targetColor1.set(15, 20, 30);
      this.targetColor2.set(0, 90, 60);
    }

    if (name === 'projects') {
      this.targetColor1.set(5, 6, 14);     // almost black
      this.targetColor2.set(30, 20, 60);   // faint violet-blue
    }
  }

  setPaused(v: boolean) {
    this.paused = v;
  }

  /* =====================
     ANIMATION LOOP
     ===================== */

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.paused) return;

    const t = this.clock.getElapsedTime();

    // Smooth color interpolation
    this.currentColor1.lerp(this.targetColor1, this.COLOR_LERP_SPEED);
    this.currentColor2.lerp(this.targetColor2, this.COLOR_LERP_SPEED);

    this.material.uniforms.u_color1.value.copy(this.currentColor1);
    this.material.uniforms.u_color2.value.copy(this.currentColor2);

    this.material.uniforms.u_time.value = t;
    this.material.uniforms.u_scroll.value = this.scrollY * 0.001;

    this.renderer.render(this.scene, this.camera);
  };

  /* =====================
     EVENTS
     ===================== */

  private onResize = () => {
    const aspect = window.innerWidth / window.innerHeight;

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private onScroll = () => {
    this.scrollY = window.scrollY || 0;
  };
}

export const backgroundService = BackgroundService.getInstance();