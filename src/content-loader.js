class ContentLoader {
    enableMarqueeIfOverflow(containerSelector = '.gallery-grid, #experience-gallery-grid') {
        document.querySelectorAll(`${containerSelector} .card-title-marquee`).forEach(titleDiv => {
            const span = titleDiv.querySelector('.marquee-inner');

            if (!span) return;

            span.style.animation = 'none';
            if (span.scrollWidth > titleDiv.clientWidth) {
                span.style.animation = '';
                titleDiv.classList.add('marquee-active');
            } else {
                titleDiv.classList.remove('marquee-active');
            }
        });
    }

    async initialize() {
        this.enableMarqueeIfOverflow('#experience-gallery-grid');
        this.enableMarqueeIfOverflow('.gallery-grid');
        window.modalManager?.initializeGalleries();

        window.contentLoaderInitialized = true;
        document.dispatchEvent(new CustomEvent('contentLoaderReady'));

        return { success: true };
    }
}

window.ContentLoader = ContentLoader;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const contentLoader = new ContentLoader();
        contentLoader.initialize().catch(console.error);
    });
}
