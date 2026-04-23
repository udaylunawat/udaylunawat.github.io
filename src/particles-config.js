import { getPerformanceMode } from './performance-mode.js';

// Particles configuration - moved from inline HTML for better caching
function initParticles() {
  if (window.particlesJS) {
    const performanceMode = getPerformanceMode();
    const particleDefaults = performanceMode.adaptive
      ? {
          count: 8,
          opacity: 0.42,
          opacityMin: 0.12,
          size: 4,
          sizeMin: 1,
          speed: 1.2,
          linkOpacity: 0.16,
          linkDistance: 210,
          twinkleFrequency: 0.15
        }
      : {
          count: 15,
          opacity: 1.0,
          opacityMin: 0.3,
          size: 8,
          sizeMin: 2,
          speed: 3,
          linkOpacity: 0.4,
          linkDistance: 300,
          twinkleFrequency: 0.3
        };

    window.particlesRuntimeDefaults = particleDefaults;
    window.particlesJS("particles-js", {
      "particles": {
        "number": { "value": particleDefaults.count },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": {
          "value": particleDefaults.opacity,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1.5,
            "opacity_min": particleDefaults.opacityMin,
            "sync": false
          }
        },
        "size": {
          "value": particleDefaults.size,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 3,
            "size_min": particleDefaults.sizeMin,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": particleDefaults.linkDistance,
          "color": "#ffffff",
          "opacity": particleDefaults.linkOpacity,
          "width": 1,
          "path": { "enable": true, "type": "particles" }
        },
        "move": {
          "enable": true,
          "speed": particleDefaults.speed,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 }
        },
        "twinkle": {
          "lines": {
            "enable": true,
            "frequency": 0.5,
            "opacity": 1.0,
            "color": "#ffffff",
            "wave": {
              "travel": false,
              "speed": 0.5
            }
          },
          "particles": {
            "enable": true,
            "frequency": particleDefaults.twinkleFrequency,
            "opacity": 1.0,
            "color": "#ffffff",
            "wave": {
              "travel": false,
              "speed": 0.8
            }
          }
        }
      },
      "interactivity": {
        "events": {
          "onhover": { "enable": true, "mode": "bubble", "duration": 0.1 },
          "onclick": { "enable": true, "mode": "push" }
        },
        "modes": {
          "bubble": {
            "distance": 100,
            "size": 30,
            "duration": 2,
            "opacity": 1.0
          }
        }
      },
      "retina_detect": !performanceMode.adaptive
    });
  }
}

// Auto-initialize when particles.js loads
document.addEventListener('DOMContentLoaded', () => {
  // Try to initialize particles immediately
  initParticles();

  // If particles.js isn't loaded yet, wait for it
  if (!window.particlesJS) {
    const checkParticles = setInterval(() => {
      if (window.particlesJS) {
        clearInterval(checkParticles);
        initParticles();
      }
    }, 50);
  }
});
