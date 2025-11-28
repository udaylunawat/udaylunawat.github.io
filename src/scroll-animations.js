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

// Matrix effect trigger function
function checkMatrixEffectTrigger() {
    if (matrixEffectTriggered || brainLoaded) return;

    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const rect = skillsSection.getBoundingClientRect();
    const skillsTop = rect.top;
    const skillsHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // Calculate 80% into the skills section
    const triggerPoint = skillsTop + (skillsHeight * 0.8);

    // Check if we've scrolled to 80% into the skills section
    if (triggerPoint <= viewportHeight && triggerPoint >= 0) {
        matrixEffectTriggered = true;
        startMatrixEffect();
    }
}

function startMatrixEffect() {
    const brainHost = document.getElementById('brain-host');
    if (!brainHost) return;

    // Hide brain host immediately
    brainHost.classList.add('matrix-hidden');

    // Create matrix effect
    matrixEffect = new window.MatrixEffect(brainHost);

    // Start loading brain in background (immediately, don't wait for matrix effect to complete)
    loadBrain();

    // Start the matrix effect
    matrixEffect.start();
}

function loadBrain() {
    if (brainLoaded) return;

    brainLoaded = true;

    // Load the brain script dynamically
    const brainScript = document.createElement('script');
    brainScript.type = 'module';
    brainScript.textContent = `
        import { mountBrainSkills } from './src/brainSkills.js';

        const host = document.getElementById('brain-host');

        const clusters = [
            // Problem solving, agent design, planning, reasoning
            { key: 'frontal', title: 'Reasoning · Planning', items: [
              { label: 'Python' },
              { label: 'LangChain' },
              { label: 'LangGraph' },
              { label: 'Google ADK' },
              { label: 'Prompting' },
              { label: 'Agents' },
              { label: 'Evaluation' },
              { label: 'RAG' }
            ]},

            // UI, viz, human-facing outputs
            { key: 'visual', title: 'Visual Cortex', items: [
              { label: 'Streamlit' },
              { label: 'Gradio' },
              { label: 'Tableau' },
              { label: 'Plotly' },
              { label: 'Dash' },
              { label: 'Matplotlib' }
            ]},

            // Serving, deployment, CI/CD, observability
            { key: 'motor', title: 'Motor · Control', items: [
              { label: 'Docker' },
              { label: 'Kubeflow' },
              { label: 'Cloud Run' },
              { label: 'MLflow' },
              { label: 'GitHub Actions' },
              { label: 'Jenkins' },
              { label: 'Weights & Biases' },
              { label: 'Langfuse' }
            ]},

            // Data engineering, analysis, feature work, pipelines
            { key: 'temporalL', title: 'Temporal · L', items: [
              { label: 'Pandas' },
              { label: 'NumPy' },
              { label: 'SQLModel' },
              { label: 'Alembic' }
            ]},

            // Retrieval, memory, embeddings, knowledge access
            { key: 'temporalR', title: 'Temporal · R', items: [
              { label: 'Embeddings' },
              { label: 'Vector DBs' },
              { label: 'Redis' },
              { label: 'MongoDB' },
              { label: 'RAG Pipelines' }
            ]},

            // Infra, cloud, storage, OS/tooling
            { key: 'infra', title: 'Infrastructure', items: [
              { label: 'GCP Compute Engine' },
              { label: 'Cloud Storage' },
              { label: 'Cloud Functions' },
              { label: 'Vertex AI' },
              { label: 'MySQL' },
              { label: 'PostgreSQL' },
              { label: 'Linux' },
              { label: 'macOS' },
              { label: 'Windows' },
              { label: 'VS Code' },
              { label: 'Jupyter Notebook' }
            ]}
        ];

        // Mount brain with skills data
        const brain = mountBrainSkills({
          container: host,
          glbPath: './src/brain.glb',
          clusters,
          options: {
            carousel: { visibleCount: 3, switchMs: 3200, switchMsMobile: 4200 },
            baseOpacity: 0.005,
            edgeStrength: 0.10,
            hoverScale: 1.5,
            labelBaseScale: 0.8,
            particles: {
              enabled: true,
              count: 150,
              baseSize: 0.01,
              pulseAmp: 0.1,
              opacity: 0.95,
              linksPerNode: 3,
              linkDist: 3.8,
              rewireMs: 7000
            }
          }
        });

        if (matchMedia('(max-width: 768px)').matches) {
          brain.setOptions({
            baseOpacity: 0.04,
            particles: { count: 320, baseSize: 1.8, linksPerNode: 2, linkDist: 2.4, rewireMs: 1100 }
          });
        }
    `;

    document.head.appendChild(brainScript);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for page to fully load
    setTimeout(initLogoAnimations, 100);
});
