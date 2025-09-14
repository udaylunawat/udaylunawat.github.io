// Reusable Content Loader Module
// Loads content from JSON files and populates DOM elements

class ContentLoader {
    constructor() {
        this.content = {};
        this.projects = {};
    }

    // Load content from JSON files
    async loadContent() {
        try {
            const [contentResponse, projectsResponse] = await Promise.all([
                fetch('./content.json'),
                fetch('./projects.json')
            ]);

            if (!contentResponse.ok) throw new Error('Failed to load content.json');
            if (!projectsResponse.ok) throw new Error('Failed to load projects.json');

            this.content = await contentResponse.json();
            this.projects = await projectsResponse.json();

            return { success: true };
        } catch (error) {
            console.error('Error loading content:', error);
            return { success: false, error: error.message };
        }
    }

    // Populate home section
    populateHome() {
        const homeData = this.content.home;

        if (homeData) {
            const title1Element = document.getElementById('homeTitle1');
            const title2Element = document.getElementById('homeTitle2');
            const taglineElement = document.querySelector('.tagline');

            if (title1Element) title1Element.textContent = homeData.title1;
            if (title2Element) title2Element.textContent = homeData.title2;
            if (taglineElement) taglineElement.innerHTML = homeData.tagline;
        }
    }

    // Populate about section
    populateAbout() {
        const aboutData = this.content.about;

        if (aboutData) {
            const aboutSection = document.getElementById('about');
            const textBox = aboutSection?.querySelector('.text-box');

            if (textBox) {
                textBox.innerHTML = `
                    <h2>
                        <img src="${aboutData.icon}" alt="">
                        ${aboutData.title}
                    </h2>
                    <p>
                        ${aboutData.content}
                    </p>
                `;
            }
        }
    }

    // Populate skills section
    populateSkills() {
        const skillsData = this.content.skills;

        if (skillsData && skillsData.length > 0) {
            const skillsGrid = document.querySelector('.skills .grid');

            if (skillsGrid) {
                skillsGrid.innerHTML = skillsData.map(skill => {
                    if (skill.img) {
                        return `
                            <div class="flex-container">
                                <img src="${skill.img}" />
                                <p>${skill.name}</p>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="flex-container">
                                <i class="${skill.icon}"></i>
                                <p>${skill.name}</p>
                            </div>
                        `;
                    }
                }).join('');
            }
        }
    }

    // Populate experience section
    populateExperience() {
        const experienceData = this.content.experience;

        if (experienceData && experienceData.length > 0) {
            const galleryGrid = document.getElementById('experience-gallery-grid');

            if (galleryGrid) {
                galleryGrid.innerHTML = experienceData.map(exp => {
                    const tagsHTML = exp.tags.map(tag => `<span>${tag}</span>`).join('');
                    const badgesHTML = exp.badges && exp.badges.length > 0
                        ? `<div class="badges" aria-hidden="true">${exp.badges.map(badge => `<span class="badge">${badge}</span>`).join('')}</div>`
                        : '';

                    let logoHTML = '';
                    if (exp.logos && exp.logos.length > 0) {
                        logoHTML = `
                            <div class="logo-container">
                                ${exp.logos.map(logo => `<img class="symbolic-icon" src="${logo}" alt="">`).join('')}
                            </div>
                        `;
                    } else if (exp.logo) {
                        logoHTML = `<img class="symbolic-icon" src="${exp.logo}" alt="">`;
                    }

                    return `
                        <div class="gallery-item experience-with-link" data-experience="${exp.id}">
                            <div class="gallery-card">
                                <div class="img-container">
                                    ${logoHTML}
                                </div>
                                <div class="text-box">
                                    <h4 class="tags">${tagsHTML}</h4>
                                    <h3>${exp.title}</h3>
                                    <h4 class="dates">${exp.dates}</h4>
                                </div>
                                <p>${exp.description}</p>
                                ${badgesHTML}
                                <button class="secondary-btn">
                                    View Details
                                    <img src="src/img/icon-open.svg" alt="">
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // Populate projects section
    populateProjects() {
        const projectsData = this.projects.projects;

        if (projectsData && projectsData.length > 0) {
            const galleryGrid = document.getElementById('gallery-grid');

            if (galleryGrid) {
                galleryGrid.innerHTML = projectsData.map(project => {
                    const tagsHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');

                    return `
                        <div class="gallery-item project-with-link" data-project="${project.id}">
                            <div class="gallery-card">
                                <div class="img-container">
                                    <img class="symbolic-icon" src="${project.icon}" alt="${project.title}">
                                </div>
                                <div class="text-box">
                                    <h4 class="tags">${tagsHTML}</h4>
                                    <h3>${project.title}</h3>
                                </div>
                                <p>${project.description}</p>
                                <button class="secondary-btn">
                                    View Details
                                    <img src="src/img/icon-open.svg" alt="">
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // Populate contact section
    populateContact() {
        const contactData = this.content.contact;

        if (contactData) {
            // Update profile photo
            const profilePhoto = document.querySelector('.profile-photo');
            if (profilePhoto) {
                profilePhoto.src = contactData.photo;
                profilePhoto.alt = `Photo of ${contactData.name}`;
            }

            // Update contact description
            const contactDescription = document.querySelector('.contact-col p');
            if (contactDescription) {
                contactDescription.innerHTML = contactData.description;
            }

            // Update contact form title
            const contactTitle = document.querySelector('.contact-form-container h4');
            if (contactTitle) {
                contactTitle.textContent = contactData.title;
            }

            // Create contact action buttons dynamically
            const flexContainer = document.querySelector('.flex-container:has(a button)');
            if (flexContainer && contactData) {
                // Update email button
                const emailLink = flexContainer.querySelector('a[href*="mailto"]');
                const emailButton = emailLink?.querySelector('button');
                if (emailLink && emailButton) {
                    emailLink.href = `mailto:${contactData.email}`;
                    emailButton.textContent = contactData.email;
                }

                // Update phone button
                const phoneLink = flexContainer.querySelector('a[href*="tel"]');
                const phoneButton = phoneLink?.querySelector('button');
                if (phoneLink && phoneButton) {
                    phoneLink.href = `tel:${contactData.phone.replace(/[^+\d]/g, '')}`;
                    phoneButton.textContent = contactData.phone;
                }

                // Update social link buttons
                if (contactData.links && contactData.links.length > 0) {
                    const socialLinks = Array.from(flexContainer.querySelectorAll('a')).filter(a =>
                        !a.href.includes('mailto') && !a.href.includes('tel')
                    );

                    contactData.links.forEach((link, index) => {
                        if (socialLinks[index]) {
                            socialLinks[index].href = link.url;
                            const button = socialLinks[index].querySelector('button');
                            if (button) {
                                button.textContent = link.text;
                            }
                        }
                    });
                }
            }

            // Update resume link
            const resumeLink = document.getElementById('resume-link');
            if (resumeLink) {
                resumeLink.href = contactData.resume;
                resumeLink.target = '_blank';
            }
        }
    }

    // Initialize all sections
    async initialize() {
        const result = await this.loadContent();

        if (result.success) {
            this.populateHome();
            this.populateAbout();
            this.populateSkills();
            this.populateExperience();
            this.populateProjects();
            this.populateContact();

            // Initialize event listeners after content is loaded
            this.initializeEventListeners();

            console.log('Content loaded successfully');
        } else {
            console.error('Failed to load content:', result.error);
        }

        return result;
    }

    // Initialize event listeners for dynamic content
    initializeEventListeners() {
        // Re-attach experience modal listeners
        const experienceCards = document.querySelectorAll('.experience-with-link');
        experienceCards.forEach((card) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const experienceId = card.getAttribute('data-experience');
                if (typeof openExperienceModal === 'function') {
                    openExperienceModal(experienceId);
                }
            });
        });

        // Re-attach project modal listeners
        const projectCards = document.querySelectorAll('.project-with-link');
        projectCards.forEach((card) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = card.getAttribute('data-project');
                if (typeof initializeGallery === 'function') {
                    // Call the existing gallery initialization function
                    attachCardClickHandlers();
                } else if (typeof openProjectModal === 'function') {
                    openProjectModal(projectId);
                }
            });
        });

        // Re-attach other dynamic listeners as needed
        console.log('Event listeners initialized');
    }
}

// Export for use in other files
window.ContentLoader = ContentLoader;

// Auto-initialize when DOM is ready if this script is loaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const contentLoader = new ContentLoader();
        contentLoader.initialize().catch(console.error);
    });
}
