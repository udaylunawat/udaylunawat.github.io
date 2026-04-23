let particlesReady = false;
let backgroundReady = false;

const state = {
  count: 15,
  speed: 1.4,
  size: 3,
  opacity: 0.28,
  linkOpacity: 0.18,
  color: "#d7fff0",
};

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    toggle: document.getElementById("particles-control-toggle"),
    panel: document.getElementById("particles-control-panel"),
    close: document.getElementById("particles-panel-close"),
    particlesTab: document.getElementById("particles-tab"),
    backgroundTab: document.getElementById("background-tab"),
    particlesContent: document.getElementById("particles-content"),
    backgroundContent: document.getElementById("background-content"),
    count: document.getElementById("particles-number"),
    countDisplay: document.getElementById("particles-number-display"),
    speed: document.getElementById("particles-speed"),
    speedDisplay: document.getElementById("particles-speed-display"),
    size: document.getElementById("particles-size"),
    sizeDisplay: document.getElementById("particles-size-display"),
    opacity: document.getElementById("particles-opacity"),
    opacityDisplay: document.getElementById("particles-opacity-display"),
    linkOpacity: document.getElementById("particles-link-opacity"),
    linkOpacityDisplay: document.getElementById("particles-link-opacity-display"),
    color: document.getElementById("particles-color"),
    colorDisplay: document.getElementById("particles-color-display"),
    backgroundSpeed: document.getElementById("background-speed"),
    backgroundSpeedDisplay: document.getElementById("background-speed-display"),
    distortion: document.getElementById("background-distortion"),
    distortionDisplay: document.getElementById("background-distortion-display"),
    phase: document.getElementById("background-phase"),
    phaseDisplay: document.getElementById("background-phase-display"),
    frequency: document.getElementById("background-frequency"),
    frequencyDisplay: document.getElementById("background-frequency-display"),
  };

  if (!elements.toggle || !elements.panel) return;

  const readParticles = () => {
    const pJS = window.pJSDom?.[0]?.pJS;
    if (!pJS?.particles) return;

    syncParticleDisplays(elements);
    reloadParticles();
  };

  const checkReady = window.setInterval(() => {
    if (!particlesReady && window.pJSDom?.[0]?.pJS) {
      particlesReady = true;
      readParticles();
    }

    if (!backgroundReady && window.backgroundControls?.getState?.().ready) {
      backgroundReady = true;
      syncBackgroundDisplays(elements);
    }

    if (particlesReady && backgroundReady) window.clearInterval(checkReady);
  }, 100);

  window.setTimeout(() => window.clearInterval(checkReady), 10000);

  elements.toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    elements.panel.classList.contains("active") ? hidePanel(elements) : showPanel(elements);
  });

  elements.close?.addEventListener("click", (event) => {
    event.preventDefault();
    hidePanel(elements);
  });

  elements.particlesTab?.addEventListener("click", () => switchTab(elements, "particles"));
  elements.backgroundTab?.addEventListener("click", () => switchTab(elements, "background"));

  bindParticleSlider(elements.count, elements.countDisplay, "count", parseInt);
  bindParticleSlider(elements.speed, elements.speedDisplay, "speed", parseFloat);
  bindParticleSlider(elements.size, elements.sizeDisplay, "size", parseInt);
  bindParticleSlider(elements.opacity, elements.opacityDisplay, "opacity", parseFloat);
  bindParticleSlider(elements.linkOpacity, elements.linkOpacityDisplay, "linkOpacity", parseFloat);

  elements.color?.addEventListener("input", (event) => {
    state.color = event.target.value;
    if (elements.colorDisplay) elements.colorDisplay.textContent = state.color;
    reloadParticles();
  });

  bindBackgroundSlider(elements.backgroundSpeed, elements.backgroundSpeedDisplay, (value) => {
    window.backgroundControls?.setAnimationSpeed(value, undefined);
  });

  bindBackgroundSlider(elements.distortion, elements.distortionDisplay, (value) => {
    window.currentDistortion = value / 10;
    window.backgroundControls?.updateBackgroundDistortion?.(window.currentDistortion);
  }, parseInt);

  bindBackgroundSlider(elements.phase, elements.phaseDisplay, (value) => {
    window.currentPhase = value;
    window.backgroundControls?.updateBackgroundPhase?.(value);
  });

  bindBackgroundSlider(elements.frequency, elements.frequencyDisplay, (value) => {
    window.currentFrequency = value;
    window.backgroundControls?.updateBackgroundFrequency?.(value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.panel.classList.contains("active")) {
      hidePanel(elements);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      elements.panel.classList.contains("active") &&
      !elements.panel.contains(event.target) &&
      event.target !== elements.toggle
    ) {
      hidePanel(elements);
    }
  });
});

function showPanel({ panel, toggle }) {
  panel.classList.remove("hidden");
  panel.classList.add("active");
  toggle.setAttribute("aria-expanded", "true");
}

function hidePanel({ panel, toggle }) {
  panel.classList.remove("active");
  panel.classList.add("hidden");
  toggle.setAttribute("aria-expanded", "false");
}

function switchTab(elements, tab) {
  const particlesActive = tab === "particles";
  elements.particlesTab?.classList.toggle("active", particlesActive);
  elements.backgroundTab?.classList.toggle("active", !particlesActive);
  elements.particlesContent?.classList.toggle("active", particlesActive);
  elements.backgroundContent?.classList.toggle("active", !particlesActive);
  elements.particlesTab?.setAttribute("aria-selected", String(particlesActive));
  elements.backgroundTab?.setAttribute("aria-selected", String(!particlesActive));
}

function bindParticleSlider(input, output, key, parser) {
  input?.addEventListener("input", (event) => {
    state[key] = parser(event.target.value);
    if (output) output.textContent = formatControlValue(state[key]);
    reloadParticles();
  });
}

function bindBackgroundSlider(input, output, update, parser = parseFloat) {
  input?.addEventListener("input", (event) => {
    const value = parser(event.target.value);
    if (output) output.textContent = formatControlValue(value);
    update(value);
  });
}

function syncParticleDisplays(elements) {
  setControlValue(elements.count, elements.countDisplay, state.count);
  setControlValue(elements.speed, elements.speedDisplay, state.speed);
  setControlValue(elements.size, elements.sizeDisplay, state.size);
  setControlValue(elements.opacity, elements.opacityDisplay, state.opacity);
  setControlValue(elements.linkOpacity, elements.linkOpacityDisplay, state.linkOpacity);
  setControlValue(elements.color, elements.colorDisplay, state.color);
}

function syncBackgroundDisplays(elements) {
  const state = window.backgroundControls?.getState?.() || {};
  setControlValue(elements.backgroundSpeed, elements.backgroundSpeedDisplay, state.timeSpeed ?? 0.01);
  setControlValue(elements.distortion, elements.distortionDisplay, Math.round((state.distortion ?? 3.5) * 10));
  setControlValue(elements.phase, elements.phaseDisplay, state.phase ?? 0);
  setControlValue(elements.frequency, elements.frequencyDisplay, state.frequency ?? 1);
}

function setControlValue(input, output, value) {
  if (input) input.value = String(value);
  if (output) output.textContent = formatControlValue(value);
}

function formatControlValue(value) {
  if (typeof value !== "number") return String(value);
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(3)));
}

function reloadParticles() {
  const pJS = window.pJSDom?.[0]?.pJS;
  if (!pJS?.particles) return;

  const nextConfig = buildParticlesConfig().particles;
  pJS.particles.number.value = nextConfig.number.value;
  pJS.particles.color.value = nextConfig.color.value;
  pJS.particles.opacity.value = nextConfig.opacity.value;
  pJS.particles.opacity.anim = nextConfig.opacity.anim;
  pJS.particles.size.value = nextConfig.size.value;
  pJS.particles.size.anim = nextConfig.size.anim;
  pJS.particles.line_linked.color = nextConfig.line_linked.color;
  pJS.particles.line_linked.opacity = nextConfig.line_linked.opacity;
  pJS.particles.line_linked.distance = nextConfig.line_linked.distance;
  pJS.particles.move.speed = nextConfig.move.speed;

  if (typeof pJS.fn.particlesRefresh === "function") {
    pJS.fn.particlesRefresh();
  }
}

function buildParticlesConfig() {
  return {
    particles: {
      number: { value: state.count },
      color: { value: state.color },
      shape: { type: "circle" },
      opacity: {
        value: state.opacity,
        random: true,
        anim: { enable: true, speed: 0.8, opacity_min: 0.08, sync: false },
      },
      size: {
        value: state.size,
        random: true,
        anim: { enable: true, speed: 1.2, size_min: 1, sync: false },
      },
      line_linked: {
        enable: true,
        distance: 260,
        color: state.color,
        opacity: state.linkOpacity,
        width: 1,
        path: { enable: true, type: "particles" },
      },
      move: {
        enable: true,
        speed: state.speed,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 1200 },
      },
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "bubble", duration: 0.1 },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        bubble: { distance: 120, size: 18, duration: 1.6, opacity: 0.65 },
      },
    },
    retina_detect: true,
  };
}
