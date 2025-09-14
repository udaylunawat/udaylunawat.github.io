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
// LOGO ZOOM, COLOR, AND GREYSCALE ANIMATIONS FOR PROJECTS AND EXPERIENCE SECTIONS
//
let experienceCards = [];
let projectCards = [];
let isMobile = false;
let isTablet = false;

function checkDeviceType() {
    const width = window.innerWidth;
    isMobile = width <= 768; // Mobile: <= 768px
    isTablet = width > 768 && width <= 1024; // Tablet: 769px - 1024px
    return { isMobile, isTablet };
}

function initializeLogoAnimations() {
    // Get all gallery cards
    experienceCards = document.querySelectorAll('.experience-gallery .gallery-item');
    projectCards = document.querySelectorAll('.infinite-gallery .gallery-item');

    if (experienceCards.length === 0 && projectCards.length === 0) return;

    // Check device type
    checkDeviceType();

    // Set up scroll animations for both sections
    setupLogoScrollAnimations();

    // Also listen for window resize to handle orientation changes
    window.addEventListener('resize', handleResize);
}

function setupLogoScrollAnimations() {
    // Create intersection observer for logo animations
    const logoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const card = entry.target;
            // Handle both single logos and dual logos (TCS/Infosys case)
            const logos = card.querySelectorAll('.symbolic-icon, .tcs-logo, .infosys-logo');

            if (logos.length === 0) return;

            if (entry.isIntersecting) {
                // Card is entering viewport - apply zoom and highlight to all logos
                logos.forEach(logo => {
                    logo.style.transform = isMobile ? 'scale(1.3)' : 'scale(1.5)'; // Smaller scale on mobile
                    logo.style.filter = 'grayscale(0%) brightness(110%)';
                    logo.style.transition = isMobile ?
                        'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : // Faster on mobile
                        'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                });

                // Add enhanced glow effect to the card
                card.style.boxShadow = '0 15px 40px rgba(0, 255, 0, 0.3)';
                card.style.borderColor = 'rgba(0, 255, 0, 0.6)';
                card.style.borderTopColor = 'rgba(0, 255, 0, 0.6)'; // Ensure top border is visible
                card.style.transition = isMobile ?
                    'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : // Faster on mobile
                    'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                // Card is leaving viewport - reset to original state
                logos.forEach(logo => {
                    logo.style.transform = 'scale(1)';
                    logo.style.filter = 'grayscale(100%) brightness(70%) opacity(0.7)';
                    logo.style.transition = isMobile ?
                        'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : // Faster on mobile
                        'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                });

                // Reset card effects
                card.style.boxShadow = '';
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.borderTopColor = 'rgba(255, 255, 255, 0.1)'; // Reset top border
                card.style.transition = isMobile ?
                    'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : // Faster on mobile
                    'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }
        });
    }, {
        threshold: isMobile ? 0.3 : 0.7, // Lower threshold for mobile for better trigger
        rootMargin: isMobile ? '-20px 0px -20px 0px' : '-80px 0px -80px 0px', // Smaller margins for mobile
        root: null // Use viewport as root
    });

    // Observe all experience cards
    experienceCards.forEach(card => {
        logoObserver.observe(card);
    });

    // Observe all project cards
    projectCards.forEach(card => {
        logoObserver.observe(card);
    });
}

function handleResize() {
    const wasMobile = isMobile;
    checkDeviceType();

    // If device type changed, reinitialize animations
    if (wasMobile !== isMobile) {
        // Reset all logo styles for both sections
        const allCards = [...experienceCards, ...projectCards];
        allCards.forEach(card => {
            const logos = card.querySelectorAll('.symbolic-icon, .tcs-logo, .infosys-logo');
            logos.forEach(logo => {
                logo.style.transform = '';
                logo.style.filter = '';
                logo.style.transition = '';
            });
            card.style.boxShadow = '';
            card.style.borderColor = '';
            card.style.borderTopColor = '';
            card.style.transition = '';
        });

        // Reinitialize with new device state
        setupLogoScrollAnimations();
    }
}

// Initialize logo animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeLogoAnimations();
});
