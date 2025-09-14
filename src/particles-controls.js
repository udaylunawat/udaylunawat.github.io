// Particles and background controls management - moved from inline HTML for better caching and performance
let particlesInitialized = false;
let backgroundInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎮 Initializing enhanced particles control panel with tabs...');

  // Wait for both particles and background to be ready
  function initializeWhenReady() {
    const particlesReady = window.pJSDom && window.pJSDom.length > 0;
    const backgroundReady = window.backgroundControls;

    if (particlesReady && !particlesInitialized) {
      initializeParticlesControls();
      particlesInitialized = true;
    }

    if (backgroundReady && !backgroundInitialized) {
      initializeBackgroundControls();
      backgroundInitialized = true;
    }

    if (particlesReady && backgroundReady) {
      console.log('✅ Both particles and background controls ready');
    }
  }

  // Check every 100ms for readiness
  const readinessCheck = setInterval(() => {
    initializeWhenReady();

    // Stop checking after 10 seconds
    if (particlesInitialized && backgroundInitialized) {
      clearInterval(readinessCheck);
    }
  }, 100);

  // Also check immediately
  setTimeout(initializeWhenReady, 50);

  // HTML element references
  const toggleBtn = document.getElementById('particles-control-toggle');
  const controlPanel = document.getElementById('particles-control-panel');
  const closeBtn = document.getElementById('particles-panel-close');
  const particlesTab = document.getElementById('particles-tab');
  const backgroundTab = document.getElementById('background-tab');
  const particlesContent = document.getElementById('particles-content');
  const backgroundContent = document.getElementById('background-content');

  // Particles sliders and displays
  const numberSlider = document.getElementById('particles-number');
  const numberDisplay = document.getElementById('particles-number-display');
  const speedSlider = document.getElementById('particles-speed');
  const speedDisplay = document.getElementById('particles-speed-display');
  const sizeSlider = document.getElementById('particles-size');
  const sizeDisplay = document.getElementById('particles-size-display');
  const linkOpacitySlider = document.getElementById('particles-link-opacity');
  const linkOpacityDisplay = document.getElementById('particles-link-opacity-display');
  const opacitySlider = document.getElementById('particles-opacity');
  const opacityDisplay = document.getElementById('particles-opacity-display');
  const colorPicker = document.getElementById('particles-color');

  // Background sliders and displays
  const backgroundSpeedSlider = document.getElementById('background-speed');
  const backgroundSpeedDisplay = document.getElementById('background-speed-display');
  const backgroundDistortionSlider = document.getElementById('background-distortion');
  const backgroundDistortionDisplay = document.getElementById('background-distortion-display');
  const backgroundPhaseSlider = document.getElementById('background-phase');
  const backgroundPhaseDisplay = document.getElementById('background-phase-display');
  const backgroundFrequencySlider = document.getElementById('background-frequency');
  const backgroundFrequencyDisplay = document.getElementById('background-frequency-display');

  // Control panel functions
  function toggleControlPanel() {
    if (controlPanel.classList.contains('hidden')) {
      showControlPanel();
    } else {
      hideControlPanel();
    }
  }

  function showControlPanel() {
    controlPanel.classList.remove('hidden');
    console.log('✨ Particles control panel shown');
  }

  function hideControlPanel() {
    controlPanel.classList.add('hidden');
    console.log('✨ Particles control panel hidden');
  }

  function switchTab(targetTab) {
    console.log('🔄 Switching to tab:', targetTab);

    [particlesTab, backgroundTab].forEach(tab => tab.classList.remove('active'));
    [particlesContent, backgroundContent].forEach(panel => panel.classList.remove('active'));

    if (targetTab === 'particles') {
      particlesTab.classList.add('active');
      particlesContent.classList.add('active');
      console.log('✨ Switched to Particles tab');
    } else if (targetTab === 'background') {
      backgroundTab.classList.add('active');
      backgroundContent.classList.add('active');
      console.log('🌊 Switched to Background tab');
    }
  }

  // Particles controls initialization
  function initializeParticlesControls() {
    if (window.pJSDom && window.pJSDom.length > 0) {
      if (window.pJSDom[0].pJS && window.pJSDom[0].pJS.particles) {
        const pJS = window.pJSDom[0].pJS;
        if (numberDisplay) numberDisplay.textContent = pJS.particles.number.value;
        if (speedDisplay) speedDisplay.textContent = pJS.particles.move.speed;
        if (sizeDisplay) sizeDisplay.textContent = pJS.particles.size.value;
        if (linkOpacityDisplay) linkOpacityDisplay.textContent = pJS.particles.line_linked.opacity;
        if (opacityDisplay) opacityDisplay.textContent = pJS.particles.opacity.value;

        console.log('✨ Particles controls initialized successfully');
      }
    }
  }

  // Background controls initialization
  function initializeBackgroundControls() {
    window.currentDistortion = 35 / 100.0;
    window.currentPhase = 0;
    window.currentFrequency = 1.0;
    console.log('🌊 Background controls initialized');
  }

  // Particles parameter updates
  function updateParticlesParameter(parameter, value) {
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;

      // Update sliders and displays
      switch(parameter) {
        case 'number':
          if (numberSlider) numberSlider.value = value;
          if (numberDisplay) numberDisplay.textContent = value;
          break;
        case 'speed':
          if (speedSlider) speedSlider.value = value;
          if (speedDisplay) speedDisplay.textContent = value;
          break;
        case 'size':
          if (sizeSlider) sizeSlider.value = value;
          if (sizeDisplay) sizeDisplay.textContent = value;
          break;
        case 'linkOpacity':
          if (linkOpacitySlider) linkOpacitySlider.value = value;
          if (linkOpacityDisplay) linkOpacityDisplay.textContent = value;
          break;
      }

      // Reinitialize particles.js with updated configuration
      const updatedConfig = {
        particles: {
          number: { value: parseInt(numberSlider ? numberSlider.value : 15) },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: {
            value: parseFloat(opacitySlider ? opacitySlider.value : 1.0),
            random: true,
            anim: {
              enable: true,
              speed: 1.5,
              opacity_min: 0.3,
              sync: false
            }
          },
          size: {
            value: parseInt(sizeSlider ? sizeSlider.value : 8),
            random: true,
            anim: {
              enable: true,
              speed: 3,
              size_min: 2,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 300,
            color: "#ffffff",
            opacity: parseFloat(linkOpacitySlider ? linkOpacitySlider.value : 0.4),
            width: 1,
            path: { enable: true, type: "particles" }
          },
          move: {
            enable: true,
            speed: parseFloat(speedSlider ? speedSlider.value : 3),
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
          }
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: "bubble",
              duration: 0.1
            },
            onclick: {
              enable: true,
              mode: "push"
            }
          },
          modes: {
            bubble: {
              distance: 100,
              size: 30,
              duration: 2,
              opacity: 1.0
            }
          }
        },
        retina_detect: true
      };

      if (window.pJSDom[0].pJS.fn && window.pJSDom[0].pJS.fn.particlesEmpty) {
        window.pJSDom[0].pJS.fn.particlesEmpty();
        if (typeof particlesJS === 'function') {
          particlesJS("particles-js", updatedConfig);
        }
      }

      console.log(`✨ Particles ${parameter} updated to:`, value, 'Full config reloaded');
    } else {
      console.log('⚠️ Particles.js not ready yet, cannot update');
      switch(parameter) {
        case 'number':
          if (numberDisplay) numberDisplay.textContent = value;
          break;
        case 'speed':
          if (speedDisplay) speedDisplay.textContent = value;
          break;
        case 'size':
          if (sizeDisplay) sizeDisplay.textContent = value;
          break;
        case 'linkOpacity':
          if (linkOpacityDisplay) linkOpacityDisplay.textContent = value;
          break;
      }
    }
  }

  // Background parameter updates
  function updateBackgroundParameter(parameter, value) {
    if (window.backgroundControls) {
      try {
        switch(parameter) {
          case 'speed':
            window.backgroundControls.setAnimationSpeed(value, undefined);
            if (backgroundSpeedDisplay) backgroundSpeedDisplay.textContent = value;
            console.log(`🌊 Background animation speed updated to:`, value);
            break;
          case 'distortion':
            window.currentDistortion = value / 100.0;
            if (backgroundDistortionDisplay) backgroundDistortionDisplay.textContent = value;
            console.log(`🌊 Background distortion updated to:`, value);
            if (window.backgroundControls.updateBackgroundDistortion) {
              window.backgroundControls.updateBackgroundDistortion(window.currentDistortion);
            }
            break;
          case 'phase':
            window.currentPhase = value;
            if (backgroundPhaseDisplay) backgroundPhaseDisplay.textContent = value;
            console.log(`🌊 Background phase updated to:`, value);
            if (window.backgroundControls.updateBackgroundPhase) {
              window.backgroundControls.updateBackgroundPhase(window.currentPhase);
            }
            break;
          case 'frequency':
            window.currentFrequency = value;
            if (backgroundFrequencyDisplay) backgroundFrequencyDisplay.textContent = value;
            console.log(`🌊 Background frequency updated to:`, value);
            if (window.backgroundControls.updateBackgroundFrequency) {
              window.backgroundControls.updateBackgroundFrequency(window.currentFrequency);
            }
            break;
        }
      } catch (error) {
        console.log('⚠️ Background controls not yet available:', error);
      }
    } else {
      console.log('⚠️ Background controls not ready yet');
      switch(parameter) {
        case 'speed':
          if (backgroundSpeedDisplay) backgroundSpeedDisplay.textContent = value;
          break;
        case 'distortion':
          if (backgroundDistortionDisplay) backgroundDistortionDisplay.textContent = value;
          window.currentDistortion = value / 100.0;
          break;
        case 'phase':
          if (backgroundPhaseDisplay) backgroundPhaseDisplay.textContent = value;
          window.currentPhase = value;
          break;
        case 'frequency':
          if (backgroundFrequencyDisplay) backgroundFrequencyDisplay.textContent = value;
          window.currentFrequency = value;
          break;
      }
    }
  }

  // Particles opacity update
  function updateParticlesOpacity(opacityValue) {
    if (opacityDisplay) opacityDisplay.textContent = opacityValue;
    updateParticlesParameter('opacity', opacityValue);
    console.log('✨ Particles opacity updated to:', opacityValue);
  }

  // Particles color update
  function updateParticlesColor(colorValue) {
    const colorDisplay = document.getElementById('particles-color-display');
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;
      if (pJS.particles.color) {
        pJS.particles.color.value = colorValue;
        if (typeof particlesJS === 'function') {
          pJS.fn.particlesEmpty();
          particlesJS("particles-js", {...pJS.particles});
        }
      }
    }
    if (colorDisplay) colorDisplay.textContent = colorValue;
    console.log('✨ Particles color updated to:', colorValue);
  }

  // Event listeners
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleControlPanel();
    });
    console.log('✅ Toggle button event listener attached');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      hideControlPanel();
    });
    console.log('✅ Close button event listener attached');
  }

  if (particlesTab) {
    particlesTab.addEventListener('click', function(e) {
      e.preventDefault();
      switchTab('particles');
    });
    console.log('✅ Particles tab event listener attached');
  }

  if (backgroundTab) {
    backgroundTab.addEventListener('click', function(e) {
      e.preventDefault();
      switchTab('background');
    });
    console.log('✅ Background tab event listener attached');
  }

  // Particles slider event listeners
  if (numberSlider) {
    numberSlider.addEventListener('input', function(e) {
      const newValue = parseInt(e.target.value);
      updateParticlesParameter('number', newValue);
    });
    console.log('✅ Number slider event listener attached');
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', function(e) {
      const newValue = parseFloat(e.target.value);
      updateParticlesParameter('speed', newValue);
    });
    console.log('✅ Speed slider event listener attached');
  }

  if (sizeSlider) {
    sizeSlider.addEventListener('input', function(e) {
      const newValue = parseInt(e.target.value);
      updateParticlesParameter('size', newValue);
    });
    console.log('✅ Size slider event listener attached');
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', function(e) {
      const newValue = parseFloat(e.target.value);
      updateParticlesOpacity(newValue);
    });
    console.log('✅ Opacity slider event listener attached');
  }

  if (linkOpacitySlider) {
    linkOpacitySlider.addEventListener('input', function(e) {
      const newValue = parseFloat(e.target.value);
      updateParticlesParameter('linkOpacity', newValue);
    });
    console.log('✅ Link opacity slider event listener attached');
  }

  if (colorPicker) {
    colorPicker.addEventListener('input', function(e) {
      const newColor = e.target.value;
      updateParticlesColor(newColor);
    });
    console.log('✅ Color picker event listener attached');
  }

  // Background slider event listeners
  if (backgroundSpeedSlider) {
    backgroundSpeedSlider.addEventListener('input', function(e) {
      const newValue = parseFloat(e.target.value);
      updateBackgroundParameter('speed', newValue);
    });
    console.log('✅ Background speed slider event listener attached');
  }

  if (backgroundDistortionSlider) {
    backgroundDistortionSlider.addEventListener('input', function(e) {
      const newValue = parseInt(e.target.value);
      updateBackgroundParameter('distortion', newValue);
    });
    console.log('✅ Background distortion slider event listener attached');
  }

  if (backgroundPhaseSlider) {
    backgroundPhaseSlider.addEventListener('input', function(e) {
      const newValue = parseFloat(e.target.value);
      updateBackgroundParameter('phase', newValue);
    });
    console.log('✅ Background phase slider event listener attached');
  }

  if (backgroundFrequencySlider) {
    backgroundFrequencySlider.addEventListener('input', function(e) {
      const newValue = parseFloat(e.target.value);
      updateBackgroundParameter('frequency', newValue);
    });
    console.log('✅ Background frequency slider event listener attached');
  }

  // Global function for background.js
  window.updateBackgroundDistortion = function(distortionValue) {
    console.log('🌊 updateBackgroundDistortion called with:', distortionValue);
    window.currentDistortion = distortionValue;
    if (backgroundDistortionDisplay) {
      backgroundDistortionDisplay.textContent = (window.currentDistortion * 100).toFixed(0);
    }
    if (window.backgroundControls && typeof window.backgroundControls.setUniformValue === 'function') {
      window.backgroundControls.setUniformValue('u_distortion', distortionValue * 10.0);
    }
    return true;
  };

  // Keyboard and click outside handlers
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !controlPanel.classList.contains('hidden')) {
      hideControlPanel();
    }
  });

  document.addEventListener('click', function(e) {
    if (!controlPanel.classList.contains('hidden') &&
        !controlPanel.contains(e.target) &&
        e.target !== toggleBtn) {
      hideControlPanel();
    }
  });

  console.log('✅ Enhanced particles and background control panel initialized');
});
