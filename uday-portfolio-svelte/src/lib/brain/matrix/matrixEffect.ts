// matrixEffect.ts
// Cinematic Matrix transition for Skills section

export class MatrixEffect {
  /* =========================
     PARAMETERS (TUNE HERE)
     ========================= */

  private TOTAL_DURATION = 3_500; // ms
  private GLITCH_DURATION = 800;
  private TEXT_DELAY = 300;
  private FADE_OUT_DURATION = 600;

  private FONT_SIZE = 26;
  private RAIN_SPEED = 0.75;
  private TRAIL_ALPHA = 0.08;

  private TEXT = 'LOADING MATRIX MIND';
  private phase: 'glitch' | 'text' | 'rain' = 'glitch';
  /* ========================= */

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private overlay!: HTMLDivElement;
  private textEl!: HTMLDivElement;

  private glyphs =
    'アカサタナハマヤラワABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  private columns = 0;
  private drops: number[] = [];

  private startTime = 0;
  private isComplete = false;

  onComplete: (() => void) | null = null;

  constructor() {
    this.init();
  }

  /* =========================
     INIT
     ========================= */

  private init() {
    this.injectStyles();
    this.createCanvas();
    this.createOverlay();
    this.resize();

    this.animate = this.animate.bind(this);
    this.resize = this.resize.bind(this);

    window.addEventListener('resize', this.resize);

    requestAnimationFrame(() => this.start());
  }

  /* =========================
     STYLES
     ========================= */

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --matrix: #00ff41;
        --bg: #050807;
        --glow: 0 0 12px rgba(0,255,65,.75);
      }

      .matrix-active {
        background: var(--bg);
        overflow: hidden;
      }

      .matrix-overlay {
        position: fixed;
        inset: 0;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .matrix-text {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: clamp(18px, 3vw, 30px);
        letter-spacing: 0.45em;
        color: #caffd8;

        padding: 22px 28px;
        background: rgba(0, 0, 0, 0.55);
        border: 1px solid rgba(0, 255, 65, 0.35);
        border-radius: 14px;

        box-shadow:
          0 0 18px rgba(0,255,65,0.55),
          inset 0 0 18px rgba(0,255,65,0.15);

        text-shadow:
          0 0 10px rgba(0,255,65,0.9),
          0 0 28px rgba(0,255,65,0.6);

        opacity: 0;
        transform: scale(0.96);
        transition:
          opacity 0.6s ease,
          transform 0.6s ease;

        white-space: nowrap;
      }

      .matrix-text.visible {
        opacity: 1;
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);
  }

  /* =========================
     CANVAS
     ========================= */

  private createCanvas() {
    document.body.classList.add('matrix-active');

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9998;
      opacity: 1;
    `;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
  }

  /* =========================
     OVERLAY TEXT
     ========================= */

  private createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'matrix-overlay';

    this.textEl = document.createElement('div');
    this.textEl.className = 'matrix-text';
    this.textEl.textContent = this.TEXT;

    this.overlay.appendChild(this.textEl);
    document.body.appendChild(this.overlay);
  }

  /* =========================
     RESIZE
     ========================= */

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx.font = `${this.FONT_SIZE}px monospace`;

    this.columns = Math.floor(this.canvas.width / this.FONT_SIZE);
    this.drops = Array.from(
      { length: this.columns },
      () => -Math.random() * 50
    );
  }

  /* =========================
     START
     ========================= */

  private start() {
    this.startTime = performance.now();
    this.phase = 'glitch';

    // Start animation loop
    requestAnimationFrame(this.animate);

    // Reveal text AFTER glitch
    setTimeout(() => {
      this.phase = 'text';
      this.textEl.classList.add('visible');

      this.textEl.animate(
        [
          { opacity: 0.2 },
          { opacity: 1 },
          { opacity: 0.6 },
          { opacity: 1 }
        ],
        { duration: 400, easing: 'steps(2)' }
      );
    }, this.GLITCH_DURATION + this.TEXT_DELAY);

    // Start rain AFTER text stabilizes
    setTimeout(() => {
      this.phase = 'rain';
    }, this.GLITCH_DURATION + this.TEXT_DELAY + 500);

    // End effect
    setTimeout(() => this.complete(), this.TOTAL_DURATION);
  }

  /* =========================
     ANIMATE
     ========================= */

  private animate(time: number) {
    if (this.isComplete) return;

    switch (this.phase) {
      case 'glitch':
        this.drawGlitch();
        break;

      case 'text':
        // DO NOTHING HERE
        // Let browser paint overlay cleanly
        break;

      case 'rain':
        this.drawMatrix();
        break;
    }

    requestAnimationFrame(this.animate);
  }

  /* =========================
     GLITCH
     ========================= */

  private drawGlitch() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // White flash
    this.ctx.fillStyle = Math.random() > 0.85 ? '#ffffff' : '#000000';
    this.ctx.fillRect(0, 0, w, h);

    // Horizontal tearing
    for (let i = 0; i < 6; i++) {
      const y = Math.random() * h;
      const height = Math.random() * 12 + 2;
      this.ctx.fillStyle = 'rgba(0,255,65,0.15)';
      this.ctx.fillRect(0, y, w, height);
    }
  }

  /* =========================
     MATRIX RAIN
     ========================= */

  private drawMatrix() {
    this.ctx.fillStyle = `rgba(0,0,0,${this.TRAIL_ALPHA})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#00ff41';

    for (let i = 0; i < this.columns; i++) {
      const char = this.glyphs[(Math.random() * this.glyphs.length) | 0];
      const x = i * this.FONT_SIZE;
      const y = this.drops[i] * this.FONT_SIZE;

      this.ctx.fillText(char, x, y);

      if (y > this.canvas.height) {
        this.drops[i] = -Math.random() * 30;
      } else {
        this.drops[i] += this.RAIN_SPEED;
      }
    }
  }

  /* =========================
     COMPLETE
     ========================= */

  private complete() {
    if (this.isComplete) return;
    this.isComplete = true;

    this.canvas.style.transition = `opacity ${this.FADE_OUT_DURATION}ms ease`;
    this.overlay.style.transition = `opacity ${this.FADE_OUT_DURATION}ms ease`;

    this.canvas.style.opacity = '0';
    this.overlay.style.opacity = '0';

    setTimeout(() => this.destroy(), this.FADE_OUT_DURATION);

    this.onComplete?.();
  }

  /* =========================
     DESTROY
     ========================= */

  private destroy() {
    document.body.classList.remove('matrix-active');
    window.removeEventListener('resize', this.resize);

    this.canvas.remove();
    this.overlay.remove();
  }
}