//
// ANIMATED BACKGROUND FADE ANIMATION
//
const colorBackground = document.getElementById('colorBackground');
const homeTitle = document.getElementById('homeTitle');
const about = document.getElementById('about');
let y = window.scrollY;
let viewporHeight = window.innerHeight;
let homeTitleFade = () => homeTitle.style.opacity = 'calc(1 - ' + y/300 + ')';
homeTitleFade()
let aboutFadeIn = () => about.style.opacity = 'calc(0 + ' + (y - viewporHeight/3)/50 + ')';
// let aboutFadeOut = () => about.style.opacity = 'calc(1 - ' + (y - viewporHeight)/300 + ')';

// Matrix effect state
let matrixEffectTriggered = false;
let matrixEffect = null;
let brainLoaded = false;

// hold preloaded brain instance (if mounted hidden)
window.preloadedBrain = null;
window.preloadedBrainPromise = null;

window.onscroll = () => {
    y = window.scrollY;
    colorBackground.style.opacity = 'calc(0 + ' + y/4000 + ')';
    homeTitleFade();
    if (y >= viewporHeight / 3) {
        aboutFadeIn();
        // if (y >= viewporHeight)
        //     aboutFadeOut();
    }
    else about.style.opacity = 0;

    // Check for matrix effect trigger at 80% into skills section
    checkMatrixEffectTrigger();
}

//
// SCROLL-INTO-VIEW ANIMATIONS
//
const viewportWidth = window.innerWidth

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.target.classList.contains('animate') && !entry.target.classList.contains('animated')) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animating');
                entry.target.classList.add('animated');
            }
            else return;
        } else return;
    });
});

const elementsToAnimate = document.querySelectorAll('.animate');
elementsToAnimate.forEach((el) => observer.observe(el));

//
// CLEAN MOBILE HORIZONTAL SCROLL LOGO ANIMATIONS
//

// Simple device detection
let isMobileDevice = false;

function detectMobile() {
    const screenWidth = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    // More reliable mobile detection
    const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'mobile', 'tablet'];
    const isMobileByAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isMobileByWidth = screenWidth <= 768;

    isMobileDevice = isMobileByAgent && isMobileByWidth;
    console.log('Mobile detection:', { width: screenWidth, isMobile: isMobileDevice, agent: userAgent.substring(0, 50) });

    return isMobileDevice;
}

// Track scroll state
let scrollState = {
    isScrollingHorizontally: false,
    lastScrollX: 0,
    scrollTimeout: null,
    activeCards: new Set()
};

function initLogoAnimations() {
    // Only initialize for mobile devices
    if (!detectMobile()) {
        console.log('Desktop device detected - skipping mobile animations');
        return;
    }

    // Find all gallery sections
    const gallerySections = document.querySelectorAll('.experience-gallery, .infinite-gallery');

    if (gallerySections.length === 0) {
        console.log('No gallery sections found');
        return;
    }

    console.log('Initializing mobile horizontal scroll animations');

    // Set up horizontal scroll detection
    setupMobileScrollDetection();
}

function setupMobileScrollDetection() {
    // Throttle scroll detection to reduce performance impact
    let scrollTimeout;
    let lastDetectionTime = 0;

    function checkScrollDirection() {
        const now = Date.now();
        if (now - lastDetectionTime < 50) return; // Limit to 20 detections per second

        const currentScrollX = window.scrollX || window.pageXOffset || 0;
        const deltaX = Math.abs(currentScrollX - scrollState.lastScrollX);
        const deltaY = Math.abs(window.scrollY - (window.pageYOffset || 0));

        // If significant horizontal movement is detected
        if (deltaX > 20 && deltaX > deltaY * 2) { // Horizontal movement > 20px AND 2x vertical movement
            triggerEnhancedAnimations();

            // Clear previous timeout
            clearTimeout(scrollState.scrollTimeout);

            // Reset after scrolling stops
            scrollState.scrollTimeout = setTimeout(() => {
                scrollState.isScrollingHorizontally = false;
                resetAllAnimations();
                console.log('Scroll stopped - resetting animations');
            }, 250); // 250ms delay
        }

        scrollState.lastScrollX = currentScrollX;
        lastDetectionTime = now;
    }

    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', checkScrollDirection, { passive: true });

    console.log('Mobile scroll detection activated');
}

function triggerEnhancedAnimations() {
    if (scrollState.isScrollingHorizontally) return; // Already active

    scrollState.isScrollingHorizontally = true;

    // Find all gallery cards and their logos
    const allCards = document.querySelectorAll('.experience-gallery .gallery-item, .infinite-gallery .gallery-item');

    if (allCards.length === 0) return;

    console.log('Enhancing', allCards.length, 'gallery cards');

    allCards.forEach(card => {
        const logos = card.querySelectorAll('.symbolic-icon, .tcs-logo, .infosys-logo, img');
        if (logos.length === 0) return;

        // Apply 300% zoom and full color saturation
        logos.forEach(logo => {
            logo.style.transform = 'scale(3.0)';
            logo.style.filter = 'grayscale(0%) brightness(120%) saturate(150%) contrast(110%)';
            logo.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            logo.style.zIndex = '10';
        });

        // Enhanced card effects
        card.style.boxShadow = '0 20px 50px rgba(0, 255, 0, 0.5)';
        card.style.borderColor = 'rgba(0, 255, 0, 0.8)';
        card.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';

        scrollState.activeCards.add(card);
    });

    console.log('Applied enhanced animations to all gallery cards');
}

function resetAllAnimations() {
    if (scrollState.activeCards.size === 0) return;

    console.log('Resetting animations for', scrollState.activeCards.size, 'cards');

    scrollState.activeCards.forEach(card => {
        const logos = card.querySelectorAll('.symbolic-icon, .tcs-logo, .infosys-logo, img');

        logos.forEach(logo => {
            logo.style.transform = 'scale(1)';
            logo.style.filter = 'grayscale(100%) brightness(70%)';
            logo.style.transition = 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
            logo.style.zIndex = '';
        });

        // Reset card effects
        card.style.boxShadow = '';
        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
    });

    scrollState.activeCards.clear();
}

// Matrix effect trigger function (deprecated by observer, keep as fallback)
function checkMatrixEffectTrigger() {
    if (matrixEffectTriggered || brainLoaded) return;

    // Prevent triggering if UI not revealed (still loading)
    if (!document.body.classList.contains('show-ui')) return;

    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const rect = skillsSection.getBoundingClientRect();
    const skillsTop = rect.top;
    const skillsHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // Only trigger if the top of the skills section is at least halfway into the viewport
    if (skillsTop <= viewportHeight * 0.5 && skillsTop + skillsHeight > 0) {
        // Now check if we've scrolled at least 80% into the section
        const triggerPoint = skillsTop + (skillsHeight * 0.8);
        if (triggerPoint <= viewportHeight && triggerPoint >= 0) {
            matrixEffectTriggered = true;
            startMatrixEffect();
        }
    }
}

// New: robust IntersectionObserver to trigger matrix when ~80% of #skills is visible
let skillsObserver = null;
function createSkillsObserver() {
    if (skillsObserver) return;
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // intersectionRatio approximates how much of the element is visible
            if (entry.isIntersecting && (entry.intersectionRatio >= 0.9 || entry.intersectionRatio > 0.5 && window.scrollY > 0)) {
                if (!matrixEffectTriggered && !brainLoaded) {
                    matrixEffectTriggered = true;
                    try { startMatrixEffect(); } catch (e) { console.error(e); }
                    if (skillsObserver) skillsObserver.disconnect();
                }
            }
        });
    }, { threshold: [0, 0.2, 0.5, 0.8, 1] });

    skillsObserver.observe(skillsSection);
}

async function startMatrixEffect() {
    if (matrixEffect || brainLoaded) return;

    const brainHost = document.getElementById('brain-host');
    if (!brainHost) return;

    // Ensure brain is marked hidden while matrix runs (matrix.complete will remove this)
    brainHost.classList.add('matrix-hidden');

    // Create and start the matrix effect (if available)
    if (window.MatrixEffect) {
        // instantiate the effect so the console + rain actually appear
        try {
            matrixEffect = new window.MatrixEffect(document.body);
            // when matrix completes, reveal the brain (preloaded or mount now)
            matrixEffect.onComplete = async () => {
                try {
                    if (window.preloadedBrain) {
                        const b = window.preloadedBrain;
                        b.container.classList.add('brain-visible');
                        b.container.style.opacity = '1';
                        try { b.tuneForViewport(); } catch (e) {}
                        brainLoaded = true;
                    } else {
                        // fallback: import + mount now (autoReveal default true)
                        const mod = await import('./brainSkills.deep.js');
                        await mod.mountBrainDeepSkills({ container: brainHost });
                        brainLoaded = true;
                    }
                } catch (err) {
                    console.error('Error revealing brain after matrix complete:', err);
                } finally {
                    // cleanup reference so we can re-run if needed
                    matrixEffect = null;
                    document.body.classList.remove('show-loader', 'loading-block');
                }
            };
        } catch (err) {
            console.error('Failed to start MatrixEffect:', err);
            matrixEffect = null;
        }

        // small delay so user sees transition; MatrixEffect starts itself in its init()
        setTimeout(() => {
          // safety: if MatrixEffect failed to instantiate, still try to reveal
          if (!matrixEffect && !brainLoaded) {
            (async () => {
              try {
                if (window.preloadedBrain) {
                  const b = window.preloadedBrain;
                  b.container.classList.add('brain-visible');
                  b.container.style.opacity = '1';
                  try { b.tuneForViewport(); } catch (e) {}
                  brainLoaded = true;
                } else {
                  const mod = await import('./brainSkills.deep.js');
                  await mod.mountBrainDeepSkills({ container: brainHost });
                  brainLoaded = true;
                }
              } catch (err) {
                console.error('Fallback reveal error:', err);
              } finally {
                document.body.classList.remove('show-loader', 'loading-block');
              }
            })();
          }
        }, 100);
    } else {
        // If MatrixEffect not present, directly reveal the brain as fallback
        try {
            if (window.preloadedBrain) {
                const b = window.preloadedBrain;
                b.container.classList.add('brain-visible');
                b.container.style.opacity = '1';
                try { b.tuneForViewport(); } catch (e) {}
                brainLoaded = true;
            } else {
                const mod = await import('./brainSkills.deep.js');
                await mod.mountBrainDeepSkills({ container: brainHost });
                brainLoaded = true;
            }
        } catch (err) {
            console.error('Error mounting/revealing brain (no MatrixEffect):', err);
        } finally {
            document.body.classList.remove('show-loader', 'loading-block');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for page to fully load
    setTimeout(initLogoAnimations, 100);

    // Create observer for skills trigger (more reliable than manual bounding checks)
    createSkillsObserver();

    // Preload + mount the brain hidden so it's ready to show instantly when matrix triggers.
    const brainHost = document.getElementById('brain-host');
    if (brainHost) {
        // ensure only one preload
        if (!window.preloadedBrainPromise) {
            window.preloadedBrainPromise = import('./brainSkills.deep.js')
                .then(mod => mod.mountBrainDeepSkills({ container: brainHost, options: { autoReveal: false, disableNeuralPulse: false } }))
                .then(brain => {
                    window.preloadedBrain = brain;
                    console.log('Brain preloaded and mounted hidden.');
                })
                .catch(err => {
                    console.warn('Brain preload failed:', err);
                    window.preloadedBrain = null;
                });
        }
    }
});