import * as THREE from 'three';

class ParticlesService {
  private mounted = false;
  private paused = false;

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private points!: THREE.Points;
  private material!: THREE.ShaderMaterial;

  private velocity = 0;
  private targetColor = new THREE.Color(0.8, 0.9, 0.9);

  mount(container: HTMLElement) {
    if (this.mounted) return;
    this.mounted = true;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      -10,
      10
    );

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });

    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    const count = 120;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        u_time: { value: 0 },
        u_velocity: { value: 0 },
        u_color: { value: this.targetColor }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_velocity;
        varying float vAlpha;

        void main() {
          vec3 p = position;
          p.y += sin(u_time + p.x * 0.01) * (4.0 + u_velocity * 12.0);
          vAlpha = 0.5 + u_velocity * 0.6;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = 2.5 + u_velocity * 2.0;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(u_color, vAlpha * (1.0 - d * 2.0));
        }
      `
    });

    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.paused) return;

    this.material.uniforms.u_time.value += 0.01;
    this.material.uniforms.u_velocity.value +=
      (this.velocity - this.material.uniforms.u_velocity.value) * 0.08;

    this.renderer.render(this.scene, this.camera);
  };

  setScrollVelocity(v: number) {
    this.velocity = Math.min(v, 1.5);
  }

  setTheme(theme: 'experience' | 'projects') {
    if (theme === 'experience') {
      this.targetColor.set(0.4, 0.9, 0.6);
    } else {
      this.targetColor.set(0.4, 0.6, 1.0);
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
  };
}

export const particlesService = new ParticlesService();