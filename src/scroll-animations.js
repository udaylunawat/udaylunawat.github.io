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