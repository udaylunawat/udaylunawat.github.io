// Authentic Matrix Effect for Skills Section - smoothed & slowed
class MatrixEffect {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.overlay = null;
    this.typedElement = null;

    this.glyphs =
      'アカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズヅブプエケセテネヘメレヱゲゼデベペオコソトノホモヨロゴゾドボポヴヵヶABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/=%<>|&^~';

    this.fontSize = 22;
    this.backFontSize = 16;
    this.columns = 0;
    this.backColumns = 0;
    this.drops = [];
    this.backDrops = [];
    this.running = true;

    this.brain = [
      '> INIT neural_skill_graph',
      '  LOAD_MODEL        brain.glb                  OK',
      '  INDEX_SKILLS      52 nodes / 6 clusters      OK',
      '  TRACE_EDGES       frontal -> visual -> infra OK',
      '  SYNC_MEMORY       project graph warm         OK',
      '  ROUTE_INPUT       gestures + hover anchors   OK',
      '  RENDER_PASS       hologram + particles       READY',
      '',
      'console.ready({ target: "skills", mode: "interactive" })'
    ];

    this.animationDuration = 3600;
    this.startTime = 0;
    this.isAnimating = false;
    this.isComplete = false;
    this.onComplete = null;
    this.animationTimer = null;
    this.lastFrameTime = 0;

    // Typing state
    this.line = 0;
    this.col = 0;
    this.buffer = '';

    this.lastGlitchTime = 0;
    this.glitchInterval = 3500;

    this.rainSpeed = 0.62;
    this.backRainSpeed = 0.28;
    this.trailFade = 0.07;

    this.init();
  }

  init() {
    // Add Matrix-style CSS
    this.addMatrixStyles();

    // Create canvas for Matrix rain
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix';
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      display: block;
      filter: contrast(108%);
      z-index: 9998;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    // Create overlay with terminal
    this.createOverlay();

    // Set canvas size and initialize
    this.resize();

    // Bind methods
    this.animate = this.animate.bind(this);
    this.resize = this.resize.bind(this);
    this.typeNext = this.typeNext.bind(this);

    // Add resize listener
    window.addEventListener('resize', this.resize);

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'g') this.glitch();
    });

    // Click to toggle rain
    window.addEventListener('click', () => {
      this.running = !this.running;
      if (this.running) requestAnimationFrame(this.animate);
    });

    requestAnimationFrame(() => {
      this.start();
    });
  }



  addMatrixStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg: #020504;
        --matrix: #58f2a6;
        --matrix-hot: #effff7;
        --matrix-cyan: #7bdfff;
        --matrix-dim: rgba(88, 242, 166, 0.13);
        --glow: 0 0 10px rgba(88, 242, 166, 0.36), 0 0 28px rgba(88, 242, 166, 0.18);
        --scanline: rgba(255,255,255,0.025);
      }

      .matrix-active {
        background:
          radial-gradient(900px 600px at 50% 42%, rgba(15, 52, 35, 0.42) 0%, rgba(2, 5, 4, 0.1) 54%, var(--bg) 100%),
          #020504;
        color: var(--matrix);
        overflow: hidden;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }

      @media (max-width: 576px) {
        .matrix-active {
          overflow: hidden;
        }
      }

      .matrix-active .scanlines::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 2px,
          var(--scanline) 3px,
          transparent 4px
        );
        mix-blend-mode: overlay;
        opacity: 0.14;
        z-index: 9999;
      }

      .matrix-active .vignette::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(to bottom, rgba(255,255,255,0.025), transparent 18%, transparent 82%, rgba(0,0,0,0.28)),
          radial-gradient(78% 68% at 50% 45%, transparent 58%, rgba(0,0,0,0.88) 100%);
        z-index: 10000;
      }

      .matrix-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: max(10px, env(safe-area-inset-top, 0px)) 10px max(16px, env(safe-area-inset-bottom, 0px)) 10px;
        pointer-events: none;
        z-index: 10001;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 768px) {
        .matrix-overlay {
          align-items: center;   /* keep it centered */
          justify-content: center;
          padding-top: max(16px, env(safe-area-inset-top, 0px));
          padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
          overflow-y: auto;      /* allow scroll if content taller than viewport */
        }
      }

      .matrix-terminal {
        position: relative;
        pointer-events: auto;
        background:
          linear-gradient(180deg, rgba(10, 24, 18, 0.88), rgba(2, 8, 6, 0.82)),
          rgba(2, 8, 6, 0.78);
        border: 1px solid rgba(148, 255, 207, 0.18);
        border-radius: 8px;
        padding: clamp(14px, 2.7vmin, 24px);
        box-shadow:
          0 0 0 1px rgba(123, 223, 255, 0.04),
          0 22px 64px rgba(0,0,0,0.62),
          inset 0 1px 0 rgba(255,255,255,0.06);
        backdrop-filter: blur(12px) saturate(112%);
        width: min(820px, 100%);
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .matrix-terminal::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(100deg, transparent 0%, rgba(123, 223, 255, 0.36) 42%, rgba(88, 242, 166, 0.42) 52%, transparent 72%);
        background-size: 240% 100%;
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        animation: matrix-border-scan 3.4s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes matrix-border-scan {
        0%, 18% { background-position: 140% 0; opacity: 0; }
        35%, 68% { opacity: 1; }
        100% { background-position: -100% 0; opacity: 0; }
      }

      /* Bootstrap-friendly wrapper */
      .matrix-terminal-bootstrap {
        width: 100%;
      }

      @media (max-width: 768px) {
        .matrix-terminal {
          max-height: calc(100vh - max(36px, env(safe-area-inset-top, 0px)) - max(40px, env(safe-area-inset-bottom, 0px)));
          overflow-y: auto;
        }
      }

      .matrix-terminal-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(239, 255, 247, 0.82);
        margin-bottom: 14px;
      }

      @media (max-width: 576px) {
        .matrix-terminal-header {
          font-size: 10px;
          margin-bottom: 6px;
        }
        .matrix-terminal-meta {
          display: none;
        }
      }

      .matrix-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: var(--glow);
        background: var(--matrix);
        opacity: 0.78;
        animation: matrix-pulse 2.2s ease-in-out infinite;
      }

      .matrix-title {
        filter: drop-shadow(0 0 8px rgba(88,242,166,0.25));
      }

      .matrix-terminal-meta {
        margin-left: auto;
        color: rgba(123, 223, 255, 0.72);
        letter-spacing: 0.12em;
      }

      @keyframes matrix-pulse {
        50% { opacity: 0.55; }
      }

      .matrix-typed {
        margin: 0;
        line-height: 1.55;
        font-size: clamp(11px, 1.55vmin, 14px);
        text-shadow: 0 0 12px rgba(88, 242, 166, 0.22);
        white-space: pre;
        color: rgba(198, 255, 225, 0.92);
        min-height: 170px;
        max-height: 42vh;
        overflow-y: auto;
        padding: 12px;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 6px;
        background:
          linear-gradient(to bottom, rgba(255,255,255,0.025), transparent),
          rgba(0, 0, 0, 0.18);
      }

      @media (max-width: 576px) {
        .matrix-typed {
          min-height: 156px;
          max-height: 38vh;
          font-size: 10px;
        }
      }

      .matrix-console-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .matrix-kv {
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 6px;
        padding: 8px 9px;
        background: rgba(255,255,255,0.025);
      }

      .matrix-kv span {
        display: block;
        color: rgba(255,255,255,0.42);
        font-size: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .matrix-kv strong {
        display: block;
        color: var(--matrix-hot);
        font-size: 13px;
        font-weight: 500;
      }

      @media (max-width: 576px) {
        .matrix-console-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .matrix-status {
        margin-top: 12px;
        font-size: clamp(10px, 1.8vmin, 13px);
        letter-spacing: 0.08em;
        color: rgba(142, 255, 193, 0.88);
        text-shadow: 0 0 10px rgba(88, 242, 166, 0.22);
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .matrix-status-label {
        min-width: max-content;
      }

      .matrix-bar {
        --w: 260px;
        position: relative;
        width: var(--w);
        max-width: 60vw;
        height: 6px;
        border: 1px solid rgba(88,242,166,0.22);
        border-radius: 999px;
        overflow: hidden;
        box-shadow: inset 0 0 10px rgba(88,242,166,0.16);
      }

      .matrix-bar > i {
        position: absolute;
        inset: 0;
        display: block;
        transform: translateX(-100%);
        background: linear-gradient(to right,
          rgba(88,242,166,0.12),
          rgba(123,223,255,0.76),
          rgba(239,255,247,0.92)
        );
        animation: matrix-load 3.6s cubic-bezier(.5,0,.2,1) infinite;
      }

      @keyframes matrix-load {
        to { transform: translateX(0%); }
      }

      .matrix-cursor {
        opacity: 1;
        animation: matrix-blink 1s infinite;
      }

      @keyframes matrix-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      /* Respect prefers-reduced-motion */
      @media (prefers-reduced-motion: reduce) {
        .matrix-bar > i {
          animation-duration: 14s;
        }
        .matrix-dot {
          animation-duration: 4s;
        }
      }
    `;
    document.head.appendChild(style);
  }

  createOverlay() {
    document.body.classList.add('matrix-active', 'scanlines', 'vignette');

    this.overlay = document.createElement('div');
    this.overlay.className = 'matrix-overlay';

    const terminal = document.createElement('div');
    terminal.className = 'matrix-terminal';

    terminal.innerHTML = `
      <div class="matrix-terminal-header">
        <span class="matrix-dot"></span>
        <span class="matrix-title">NEURAL CONSOLE</span>
        <span class="matrix-terminal-meta">TRACE/04</span>
      </div>
      <pre class="matrix-typed" id="matrix-typed"></pre>
      <div class="matrix-console-grid">
        <div class="matrix-kv"><span>nodes</span><strong>52</strong></div>
        <div class="matrix-kv"><span>edges</span><strong>186</strong></div>
        <div class="matrix-kv"><span>latency</span><strong>18ms</strong></div>
        <div class="matrix-kv"><span>status</span><strong>READY</strong></div>
      </div>
      <div class="matrix-status">
        <span class="matrix-status-label">deploying interactive brain graph</span>
        <div class="matrix-bar"><i></i></div>
        <span class="matrix-cursor" aria-hidden="true">▌</span>
      </div>
    `;

    this.overlay.appendChild(terminal);
    document.body.appendChild(this.overlay);
    this.typedElement = document.getElementById('matrix-typed');
  }

  resize() {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Set font once per resize for crisp text
    this.ctx.font = `${this.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.backColumns = Math.floor(this.canvas.width / this.backFontSize);
    this.drops = new Array(this.columns);
    this.backDrops = new Array(this.backColumns);

    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = -Math.random() * 40;
    }
    for (let i = 0; i < this.backColumns; i++) {
      this.backDrops[i] = -Math.random() * 70;
    }
  }

  start() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.isComplete = false;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.canvas.style.opacity = '1';

    requestAnimationFrame(this.animate);

    setTimeout(() => {
      this.typeNext();
    }, 500);

    this.animationTimer = setTimeout(() => {
      this.complete();
    }, this.animationDuration);
  }

  animate(timestamp) {
    if (!this.running) return;
    if (!this.ctx) return;

    const delta = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 16.67 : 1;
    this.lastFrameTime = timestamp;

    this.ctx.fillStyle = `rgba(1, 7, 5, ${this.trailFade})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawRainLayer({
      drops: this.backDrops,
      fontSize: this.backFontSize,
      speed: this.backRainSpeed,
      delta,
      head: 'rgba(123, 223, 255, 0.34)',
      trail: 'rgba(88, 242, 166, 0.055)',
      resetDepth: 70
    });

    this.drawRainLayer({
      drops: this.drops,
      fontSize: this.fontSize,
      speed: this.rainSpeed,
      delta,
      head: 'rgba(198, 255, 225, 0.82)',
      trail: 'rgba(88, 242, 166, 0.14)',
      resetDepth: 34
    });

    requestAnimationFrame(this.animate);
  }

  drawRainLayer({ drops, fontSize, speed, delta, head, trail, resetDepth }) {
    this.ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    for (let i = 0; i < drops.length; i++) {
      const char = this.glyphs[(Math.random() * this.glyphs.length) | 0];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      this.ctx.fillStyle = head;
      this.ctx.fillText(char, x, y);

      this.ctx.fillStyle = trail;
      this.ctx.fillText(char, x, y - fontSize);
      this.ctx.fillText(char, x, y - fontSize * 2);

      if (y > this.canvas.height + fontSize * 2) {
        drops[i] = -Math.random() * resetDepth;
      } else {
        drops[i] += speed * delta;
      }
    }
  }

  typeNext() {
    if (!this.typedElement) return;

    if (this.line >= this.brain.length) {
      setTimeout(() => {
        this.complete();
      }, 1800);
      return;
    }

    const current = this.brain[this.line];
    this.buffer += current[this.col] || ' ';
    this.typedElement.textContent = this.buffer + '\n';
    this.col++;

    if (this.col > current.length) {
      this.buffer += '\n';
      this.line++;
      this.col = 0;
      setTimeout(() => this.typeNext(), 56);
    } else {
      setTimeout(() => this.typeNext(), 8 + Math.random() * 10);
    }
  }

  glitch() {
    if (!this.typedElement) return;

    const original = this.typedElement.textContent;
    const chars = original.split('');
    const swaps = 12;

    for (let i = 0; i < swaps; i++) {
      const idx = (Math.random() * chars.length) | 0;
      chars[idx] = this.glyphs[(Math.random() * this.glyphs.length) | 0];
    }

    this.typedElement.textContent = chars.join('');

    setTimeout(() => {
      if (this.typedElement) this.typedElement.textContent = original;
    }, 55);
  }

  complete() {
    if (this.isComplete) return;
    this.isAnimating = false;
    this.isComplete = true;

    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    const brainHost = document.getElementById('brain-host');
    if (brainHost) {
      brainHost.classList.remove('matrix-hidden');
    }

    this.canvas.style.opacity = '0';
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.transform = 'scale(0.985)';
    }

    setTimeout(() => {
      document.body.classList.remove('matrix-active', 'scanlines', 'vignette');

      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
    }, 500);

    if (this.onComplete) this.onComplete();
  }

  destroy() {
    this.isAnimating = false;

    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    document.body.classList.remove('matrix-active', 'scanlines', 'vignette');

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    window.removeEventListener('resize', this.resize);
  }
}

// Export for use in other modules
window.MatrixEffect = MatrixEffect;
