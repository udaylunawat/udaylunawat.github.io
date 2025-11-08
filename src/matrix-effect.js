// Authentic Matrix Effect for Skills Section - Based on classic Matrix design
class MatrixEffect {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.overlay = null;
    this.typedElement = null;
    this.cursorElement = null;

    // Matrix rain properties
    this.glyphs = 'アカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズヅブプエケセテネヘメレヱゲゼデベペオコソトノホモヨロゴゾドボポヴヵヶABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-*/=%<>|&^~';
    this.fontSize = 18;
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
      '    |  |  /  .-".  |  .-"-.  \\ |  |      ',
      '    ;  ; |  /  _  \\ | /  _  \\ | ;  ;      ',
      '     \\  \\\\ |  ( )  |||  ( )  | /  /       ',
      '      \\  `.|\\     /|||\\     /|.`  /       ',
      '       `-.  `"-.  |  .-"`  .-"        ',
      '          `-._   _.-^ -._   _.-`          ',
      '               `"         `"            '
    ];

    // Animation state
    this.animationDuration = 8000; // 5 seconds total as requested
    this.startTime = 0;
    this.isAnimating = false;
    this.isComplete = false;
    this.onComplete = null;
    this.animationTimer = null;

    // Typing state
    this.line = 0;
    this.col = 0;
    this.buffer = '';
    this.typingActive = false;

    // Glitch state
    this.lastGlitchTime = 0;
    this.glitchInterval = 1500; // Glitch every 1.5 seconds

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
    this.glitch = this.glitch.bind(this);

    // Add resize listener
    window.addEventListener('resize', this.resize);

    // Add keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'g') this.glitch();
    });

    // Add click to toggle rain
    window.addEventListener('click', () => {
      this.running = !this.running;
      if (this.running) requestAnimationFrame(this.animate);
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
        display: grid;
        place-items: center;
        pointer-events: none;
        padding: 6vmin;
        z-index: 10001;
      }

      .matrix-terminal {
        pointer-events: auto;
        background: rgba(0, 20, 10, 0.28);
        border: 1px solid rgba(0, 255, 65, 0.18);
        border-radius: 16px;
        padding: clamp(12px, 2vmin, 24px);
        box-shadow: 0 0 0 1px rgba(0, 255, 65, 0.08), 0 10px 40px rgba(0,0,0,0.6);
        backdrop-filter: blur(6px) saturate(120%);
        width: min(900px, 90vw);
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
        font-size: clamp(10px, 1.9vmin, 16px);
        text-shadow: var(--glow);
        white-space: pre;
        color: var(--matrix);
        min-height: 260px;
      }

      .matrix-status {
        margin-top: 8px;
        font-size: clamp(12px, 2vmin, 18px);
        letter-spacing: 0.06em;
        color: #8effc1;
        text-shadow: var(--glow);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .matrix-bar {
        --w: 240px;
        position: relative;
        width: var(--w);
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
        background: linear-gradient(to right, rgba(0,255,65,0.2), rgba(0,255,65,0.85));
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

      .matrix-cursor {
        opacity: 1;
        animation: matrix-blink 1s infinite;
      }

      @keyframes matrix-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  createOverlay() {
    // Add classes to body
    document.body.classList.add('matrix-active', 'scanlines', 'vignette');

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'matrix-overlay';

    // Create terminal
    const terminal = document.createElement('div');
    terminal.className = 'matrix-terminal';

    terminal.innerHTML = `
      <div class="matrix-terminal-header">
        <span class="matrix-dot"></span>
        <span class="matrix-title">NEURAL CONSOLE</span>
      </div>
      <pre class="matrix-typed" id="matrix-typed"></pre>
      <div class="matrix-status">
        <span>Generating AI brain</span>
        <div class="matrix-bar"><i></i></div>
        <span class="matrix-cursor" aria-hidden="true">▌</span>
      </div>
      <div class="matrix-hint">Click anywhere to toggle rain. Press <kbd>G</kbd> to glitch.</div>
    `;

    this.overlay.appendChild(terminal);
    document.body.appendChild(this.overlay);

    // Get references
    this.typedElement = document.getElementById('matrix-typed');
  }

  resize() {
    if (!this.canvas) return;

    // Use full viewport dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Recalculate columns for denser effect
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = new Array(this.columns);

    // Initialize drops with random starting positions
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -100); // Start higher for more dramatic effect
    }
  }

  start() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.isComplete = false;
    this.startTime = performance.now();
    this.lastGlitchTime = this.startTime;
    this.canvas.style.opacity = '1';

    // Start Matrix rain
    this.animate();

    // Start typing animation after a brief delay
    setTimeout(() => {
      this.typeNext();
    }, 500);

    // Set timer to complete animation after 5 seconds
    this.animationTimer = setTimeout(() => {
      this.complete();
    }, this.animationDuration);
  }

  // Non-linear opacity easing function
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  animate() {
    if (!this.running) return;

    const currentTime = performance.now();

    // Trigger automatic glitches
    if (currentTime - this.lastGlitchTime > this.glitchInterval) {
      this.glitch();
      this.lastGlitchTime = currentTime;
    }

    // Faint trails for Matrix effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.11)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Matrix rain
    for (let i = 0; i < this.columns; i++) {
      const txt = this.glyphs[(Math.random() * this.glyphs.length) | 0];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Bright head character
      this.ctx.fillStyle = '#00ff41';
      this.ctx.fillText(txt, x, y);

      // Dim trailing character
      this.ctx.fillStyle = 'rgba(0,255,65,0.15)';
      this.ctx.fillText(txt, x, y - this.fontSize);

      // Reset when off screen
      if (y > this.canvas.height + Math.random() * 1000) {
        this.drops[i] = -Math.random() * 50;
      }
      this.drops[i]++;
    }

    requestAnimationFrame(this.animate);
  }

  typeNext() {
    if (this.line >= this.brain.length) {
      // Brain is fully typed - complete the animation
      setTimeout(() => {
        this.complete();
      }, 2000); // Brief pause before completing
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
      setTimeout(this.typeNext, 60);
    } else {
      setTimeout(this.typeNext, 10 + Math.random() * 25);
    }
  }

  glitch() {
    if (!this.typedElement) return;

    const text = this.typedElement.textContent.split('');
    const swaps = 12;

    // Corrupt random characters
    for (let i = 0; i < swaps; i++) {
      const idx = (Math.random() * text.length) | 0;
      text[idx] = this.glyphs[(Math.random() * this.glyphs.length) | 0];
    }

    const original = this.typedElement.textContent;
    this.typedElement.textContent = text.join('');

    // Restore after brief corruption (no automatic re-trigger since we do it in animate now)
    setTimeout(() => {
      if (this.typedElement) this.typedElement.textContent = original;
    }, 90);
  }

  complete() {
    this.isAnimating = false;
    this.isComplete = true;

    // Clear the animation timer
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    // Fade out canvas and overlay
    this.canvas.style.opacity = '0';
    if (this.overlay) {
      this.overlay.style.opacity = '0';
    }

    // Remove elements after fade
    setTimeout(() => {
      // Remove Matrix-specific classes from body
      document.body.classList.remove('matrix-active', 'scanlines', 'vignette');

      // Remove canvas
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }

      // Remove overlay
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
    }, 500);

    // Call completion callback
    if (this.onComplete) {
      this.onComplete();
    }
  }

  destroy() {
    this.isAnimating = false;

    // Clear the animation timer
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    // Remove Matrix-specific classes from body
    document.body.classList.remove('matrix-active', 'scanlines', 'vignette');

    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    // Remove overlay
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    window.removeEventListener('resize', this.resize);
  }
}

// Export for use in other modules
window.MatrixEffect = MatrixEffect;
