// Particles configuration - moved from inline HTML for better caching
function initParticles() {
  if (window.particlesJS) {
    particlesJS("particles-js", {
      "particles": {
        "number": { "value": 15 },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": {
          "value": 1.0,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1.5,
            "opacity_min": 0.3,
            "sync": false
          }
        },
        "size": {
          "value": 8,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 3,
            "size_min": 2,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 300,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1,
          "path": { "enable": true, "type": "particles" }
        },
        "move": {
          "enable": true,
          "speed": 3,
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
            "frequency": 0.3,
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
      "retina_detect": true
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
