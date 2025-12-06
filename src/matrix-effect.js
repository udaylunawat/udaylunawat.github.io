// Authentic Matrix Effect for Skills Section - smoothed & slowed
class MatrixEffect {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.overlay = null;
    this.typedElement = null;

    // Matrix rain properties
    this.glyphs =
      'アカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズヅブプエケセテネヘメレヱゲゼデベペオコソトノホモヨロゴゾドボポヴヵヶABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/=%<>|&^~';

    // Bigger glyphs for “larger” feel
    this.fontSize = 26; // was 18
    this.columns = 0;
    this.drops = [];
    this.running = true;

    // ASCII Brain art
    this.brain = [
      '                 ___    ___                 ',
      '            _.-"   `--`   "-._             ',
      '         .-"   ._  .-.  _.   "-.           ',
      '       ."    _( )\\/   \\/( )_    ".         ',
      '      /    .-`  \\\\  _  //  `-.    \\        ',
      '     /   .`      \\\\(_)//      `.   \\       ',
      '    ;   /    _.-._>   <_.-._    \\   ;      ',
      '    |  |   ."     .\\_/..     ".  |  |      ',
      '    |  |  /  .-".  |  .-"-.  \\ |  |        ',
      '    ;  ; |  /  _  \\ | /  _  \\ | ;  ;      ',
      '     \\  \\\\ |  ( )  |||  ( )  | /  /       ',
      '      \\  `.|\\     /|||\\     /|.`  /       ',
      '       `-.  `"-.  |  .-"`  .-"            ',
      '          `-._   _.-^ -._   _.-`          ',
      '               `"         `"              '
    ];

    // Animation state
    this.animationDuration = 7000; // total time before auto-complete
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

    // Glitch state
    this.lastGlitchTime = 0;
    this.glitchInterval = 3500; // not auto-used anymore, kept for manual use

    // Speed controls
    this.rainSpeed = 0.55; // rows per frame; lower = slower
    this.trailFade = 0.07; // alpha for fade; lower = longer trails

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
      filter: contrast(115%);
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

    // 🔽 ADD THIS: start rain + typing as soon as everything is ready
    requestAnimationFrame(() => {
      this.start();
    });
  }



  addMatrixStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg: #050807;
        --matrix: #00ff41;
        --matrix-dim: rgba(0, 255, 65, 0.15);
        --glow: 0 0 8px rgba(0, 255, 65, 0.6), 0 0 32px rgba(0, 255, 65, 0.35);
        --scanline: rgba(255,255,255,0.04);
      }

      .matrix-active {
        background: radial-gradient(1200px 800px at 50% 40%, #06110c 0%, var(--bg) 60%);
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
        opacity: 0.25;
        z-index: 9999;
      }

      .matrix-active .vignette::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(80% 70% at 50% 45%, transparent 60%, rgba(0,0,0,0.9) 100%);
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
        pointer-events: auto;
        background: rgba(0, 20, 10, 0.28);
        border: 1px solid rgba(0, 255, 65, 0.18);
        border-radius: 16px;
        padding: clamp(10px, 2.5vmin, 20px);
        box-shadow: 0 0 0 1px rgba(0, 255, 65, 0.08),
          0 10px 40px rgba(0,0,0,0.6);
        backdrop-filter: blur(6px) saturate(120%);
        width: min(900px, 100%);
        max-width: 100%;
        box-sizing: border-box;
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
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.9;
        margin-bottom: 10px;
      }

      @media (max-width: 576px) {
        .matrix-terminal-header {
          font-size: 10px;
          margin-bottom: 6px;
        }
      }

      .matrix-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: var(--glow);
        background: var(--matrix);
        opacity: 0.85;
        animation: matrix-pulse 2.2s ease-in-out infinite;
      }

      .matrix-title {
        filter: drop-shadow(0 0 8px rgba(0,255,65,0.45));
      }

      @keyframes matrix-pulse {
        50% { opacity: 0.55; }
      }

      .matrix-typed {
        margin: 0;
        line-height: 1.05;
        font-size: clamp(10px, 2.1vmin, 17px);
        text-shadow: var(--glow);
        white-space: pre;
        color: var(--matrix);
        min-height: 220px;
        max-height: 60vh;
        overflow-y: auto;
      }

      @media (max-width: 576px) {
        .matrix-typed {
          min-height: 180px;
          max-height: 50vh;
          font-size: 11px;
        }
      }

      .matrix-status {
        margin-top: 8px;
        font-size: clamp(11px, 2vmin, 16px);
        letter-spacing: 0.06em;
        color: #8effc1;
        text-shadow: var(--glow);
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .matrix-bar {
        --w: 260px;
        position: relative;
        width: var(--w);
        max-width: 60vw;
        height: 8px;
        border: 1px solid rgba(0,255,65,0.4);
        border-radius: 999px;
        overflow: hidden;
        box-shadow: inset 0 0 12px rgba(0,255,65,0.25);
      }

      .matrix-bar > i {
        position: absolute;
        inset: 0;
        display: block;
        transform: translateX(-100%);
        background: linear-gradient(to right,
          rgba(0,255,65,0.2),
          rgba(0,255,65,0.85)
        );
        animation: matrix-load 7s linear infinite;
      }

      @keyframes matrix-load {
        to { transform: translateX(0%); }
      }

      .matrix-hint {
        margin-top: 8px;
        opacity: 0.7;
        font-size: 11px;
      }

      @media (max-width: 576px) {
        .matrix-hint {
          font-size: 10px;
        }
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
      </div>
      <pre class="matrix-typed" id="matrix-typed"></pre>
      <div class="matrix-status">
        <span>Generating Latest Brain Scans</span>
        <div class="matrix-bar"><i></i></div>
        <span class="matrix-cursor" aria-hidden="true">▌</span>
      </div>
      <div class="matrix-hint">Click to toggle rain. Press <kbd>G</kbd> to glitch.</div>
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
    this.drops = new Array(this.columns);

    for (let i = 0; i < this.columns; i++) {
      // Start above screen so streams flow in smoothly
      this.drops[i] = -Math.random() * 40;
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

    // Smooth fading trails
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.trailFade})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.columns; i++) {
      const char = this.glyphs[(Math.random() * this.glyphs.length) | 0];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // bright head
      this.ctx.fillStyle = '#00ff41';
      this.ctx.fillText(char, x, y);

      // dim trail
      this.ctx.fillStyle = 'rgba(0,255,65,0.15)';
      this.ctx.fillText(char, x, y - this.fontSize);

      if (y > this.canvas.height + this.fontSize * 2) {
        this.drops[i] = -Math.random() * 30;
      } else {
        // slower, smoother movement
        this.drops[i] += this.rainSpeed * delta;
      }
    }

    requestAnimationFrame(this.animate);
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
      setTimeout(() => this.typeNext(), 70);
    } else {
      setTimeout(() => this.typeNext(), 16 + Math.random() * 22);
    }
  }

  glitch() {
    if (!this.typedElement) return;

    const original = this.typedElement.textContent;
    const chars = original.split('');
    const swaps = 8; // fewer swaps for subtle glitch

    for (let i = 0; i < swaps; i++) {
      const idx = (Math.random() * chars.length) | 0;
      chars[idx] = this.glyphs[(Math.random() * this.glyphs.length) | 0];
    }

    this.typedElement.textContent = chars.join('');

    setTimeout(() => {
      if (this.typedElement) this.typedElement.textContent = original;
    }, 70);
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
    if (this.overlay) this.overlay.style.opacity = '0';

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