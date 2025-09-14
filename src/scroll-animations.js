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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for page to fully load
    setTimeout(initLogoAnimations, 100);
});
