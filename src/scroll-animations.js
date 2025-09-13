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
// EXPERIENCE LOGO ZOOM AND HIGHLIGHT ANIMATIONS FOR MOBILE
//
let experienceCards = [];
let isMobile = false;

function checkMobile() {
    isMobile = window.innerWidth <= 768; // Consider mobile if width <= 768px
    return isMobile;
}

function initializeExperienceAnimations() {
    // Get all experience gallery cards
    experienceCards = document.querySelectorAll('.experience-gallery .gallery-item');

    if (experienceCards.length === 0) return;

    // Check if we're on mobile
    checkMobile();

    // Set up scroll listener for mobile animations
    if (isMobile) {
        setupMobileScrollAnimations();
    }

    // Also listen for window resize to handle orientation changes
    window.addEventListener('resize', handleResize);
}

function setupMobileScrollAnimations() {
    // Create intersection observer for mobile scroll animations
    const mobileObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const card = entry.target;
            // Handle both single logos and dual logos (TCS/Infosys case)
            const logos = card.querySelectorAll('.symbolic-icon, .tcs-logo, .infosys-logo');

            if (logos.length === 0) return;

            if (entry.isIntersecting) {
                // Card is entering viewport - apply zoom and highlight to all logos
                logos.forEach(logo => {
                    logo.style.transform = 'scale(1.1)';
                    logo.style.filter = 'grayscale(0%) brightness(100%)';
                    logo.style.transition = 'all 0.6s ease-out';
                });

                // Add a subtle glow effect to the card
                card.style.boxShadow = '0 8px 25px rgba(0, 255, 0, 0.2)';
                card.style.borderColor = 'rgba(0, 255, 0, 0.4)';
                card.style.transition = 'all 0.6s ease-out';
            } else {
                // Card is leaving viewport - reset to original state
                logos.forEach(logo => {
                    logo.style.transform = 'scale(1)';
                    logo.style.filter = 'grayscale(100%) brightness(70%)';
                    logo.style.transition = 'all 0.6s ease-out';
                });

                // Reset card effects
                card.style.boxShadow = '';
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.transition = 'all 0.6s ease-out';
            }
        });
    }, {
        threshold: 0.6, // Trigger when 60% of the card is visible
        rootMargin: '-50px 0px -50px 0px' // Add some margin for smoother transitions
    });

    // Observe all experience cards
    experienceCards.forEach(card => {
        mobileObserver.observe(card);
    });
}

function handleResize() {
    const wasMobile = isMobile;
    checkMobile();

    // If mobile state changed, reinitialize animations
    if (wasMobile !== isMobile) {
        // Reset all logo styles
        experienceCards.forEach(card => {
            const logos = card.querySelectorAll('.symbolic-icon, .tcs-logo, .infosys-logo');
            logos.forEach(logo => {
                logo.style.transform = '';
                logo.style.filter = '';
                logo.style.transition = '';
            });
            card.style.boxShadow = '';
            card.style.borderColor = '';
            card.style.transition = '';
        });

        // Reinitialize with new mobile state
        if (isMobile) {
            setupMobileScrollAnimations();
        }
    }
}

// Initialize experience animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeExperienceAnimations();
});
