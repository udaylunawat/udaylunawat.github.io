/**
 * Modal Management Module
 * Handles project and experience modal functionality
 */

export class ModalManager {
  constructor() {
    this.currentProjectId = null;
    this.currentExperienceId = null;
    this.projectList = null;
    this.experienceList = null;

    this.init();
  }

  init() {
    this.attachEventListeners();
    this.initializeGalleries();
  }

  async attachEventListeners() {
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.currentProjectId) this.closeProjectModal();
        if (this.currentExperienceId) this.closeExperienceModal();
      }
    });

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Modal system initialized');
    });
  }

  async initializeGalleries() {
    // Attach click handlers to project cards
    const projectCards = document.querySelectorAll('.project-with-link');
    projectCards.forEach(card => {
      const projectId = card.getAttribute('data-project');
      if (projectId && !card.hasClickHandler) {
        card.hasClickHandler = true;
        card.style.cursor = 'pointer';
        this.attachCardClickHandler(card, projectId, true);
      }
    });

    // Attach click handlers to experience cards
    const experienceCards = document.querySelectorAll('.experience-with-link');
    experienceCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const experienceId = card.getAttribute('data-experience') || 'fractal';
        this.openExperienceModal(experienceId);
      });
    });
  }

  attachCardClickHandler(card, projectId, isProject = true) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isScrolling = false;

    // Mouse click
    card.addEventListener('click', (e) => {
      if (!isScrolling) {
        e.preventDefault();
        if (isProject) {
          this.openProjectModal(projectId);
        } else {
          this.openExperienceModal(projectId);
        }
      }
    });

    // Touch support for mobile
    card.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isScrolling = false;
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      if (!touchStartX || !touchStartY) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const deltaX = Math.abs(touchCurrentX - touchStartX);
      const deltaY = Math.abs(touchCurrentY - touchStartY);

      if (deltaX > deltaY && deltaX > 10) {
        isScrolling = true;
      }
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;

      if (!isScrolling && touchDuration < 300) {
        e.preventDefault();
        if (isProject) {
          this.openProjectModal(projectId);
        } else {
          this.openExperienceModal(projectId);
        }
      }

      // Reset touch tracking
      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
      isScrolling = false;
    }, { passive: false });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isProject) {
          this.openProjectModal(projectId);
        } else {
          this.openExperienceModal(projectId);
        }
      }
    });
  }

  // Project Modal Methods
  async openProjectModal(projectId) {
    const modal = document.getElementById('project-modal');
    const contentContainer = document.getElementById('modal-content-container');
    const modalTitle = document.getElementById('modal-title');
    const modalTags = document.getElementById('modal-tags');

    // Save current scroll position
    const projectsSection = document.getElementById('projects');
    modal.dataset.scrollY = window.scrollY;
    modal.dataset.projectsOffset = projectsSection ? projectsSection.offsetTop : 0;

    // Show loading state
    contentContainer.innerHTML = '<div class="loading">Loading project content...</div>';

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.currentProjectId = projectId;

    // Load content
    const rawContent = await this.loadProjectContent(projectId);
    const { title, tags, content } = this.extractTitleAndTags(rawContent);

    // Set title and tags in header
    modalTitle.textContent = title;
    modalTags.innerHTML = tags;

    // Set content in body
    contentContainer.innerHTML = content;

    // Update navigation buttons state
    this.updateProjectNavigationButtons();

    // Add close button functionality
    const closeBtn = contentContainer.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeProjectModal();
    }
  }

  closeProjectModal() {
    const modal = document.getElementById('project-modal');

    // Restore scroll position
    const scrollY = modal.dataset.scrollY || 0;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, parseInt(scrollY));

    modal.classList.remove('active');
    this.currentProjectId = null;
  }

  async loadProjectContent(projectId) {
    try {
      const response = await fetch(`./projects/${projectId}.html`);
      if (!response.ok) {
        throw new Error('Project content not found');
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading project content:', error);
      return this.getFallbackContent(projectId);
    }
  }

  extractTitleAndTags(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const title = doc.querySelector('h1')?.textContent || 'Project Title';
    const tagsElement = doc.querySelector('.tags');
    const tags = tagsElement ? tagsElement.innerHTML : '';

    // Remove title and tags from content
    const titleElement = doc.querySelector('h1');
    if (titleElement) titleElement.remove();
    if (tagsElement) tagsElement.remove();

    return {
      title,
      tags,
      content: doc.body.innerHTML
    };
  }

  getFallbackContent(projectId) {
    const fallbacks = {
      "rockreveal-ai": {
        title: "RockReveal AI",
        tags: '<span>Python</span><span>Telegram Bot</span><span>MLOps</span><span>W&B</span>',
        content: '<p>Image classification deployed as a Telegram bot. Integrated Weights & Biases for experiment & artifact tracking and a simple MLOps workflow for continuous improvements.</p>'
      },
      // Add other fallback content...
    };

    const fallback = fallbacks[projectId];
    if (fallback) {
      return `<h1>${fallback.title}</h1><div class="tags">${fallback.tags}</div>${fallback.content}`;
    }
    return '<h1>Project Content</h1><div class="tags"><span>Loading</span></div><p>Content loading...</p>';
  }

  // Project Navigation Methods
  async getProjectList() {
    if (this.projectList === null) {
      try {
        const response = await fetch('./projects.json');
        const data = await response.json();
        this.projectList = data.projects;
      } catch (error) {
        console.error('Error loading project list:', error);
        return [];
      }
    }
    return this.projectList;
  }

  async navigateProjectModal(direction) {
    if (!this.currentProjectId) return;

    const projects = await this.getProjectList();
    if (projects.length === 0) return;

    const currentIndex = projects.findIndex(project => project.id === this.currentProjectId);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    if (newIndex < 0 || newIndex >= projects.length) return;

    const newProjectId = projects[newIndex].id;
    await this.openProjectModal(newProjectId);
  }

  async updateProjectNavigationButtons() {
    if (!this.currentProjectId) return;

    const projects = await this.getProjectList();
    if (projects.length === 0) return;

    const currentIndex = projects.findIndex(project => project.id === this.currentProjectId);
    if (currentIndex === -1) return;

    const prevButton = document.getElementById('project-nav-prev');
    const nextButton = document.getElementById('project-nav-next');

    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentIndex === projects.length - 1;
    }
  }

  // Experience Modal Methods
  async openExperienceModal(experienceId) {
    const modal = document.getElementById('experience-modal');
    const contentContainer = document.getElementById('experience-modal-content-container');
    const modalTitle = document.getElementById('experience-modal-title');
    const modalTags = document.getElementById('experience-modal-tags');
    const modalHeader = document.querySelector('#experience-modal .modal-header');

    // Save current scroll position
    modal.dataset.scrollY = window.scrollY;

    // Show loading state
    contentContainer.innerHTML = '<div class="loading">Loading experience content...</div>';

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.currentExperienceId = experienceId;

    // Load content
    const rawContent = await this.loadExperienceContent(experienceId);
    const { title, tags, content } = this.extractExperienceTitleAndTags(rawContent);

    // Set title and tags in header
    modalTitle.textContent = title;
    modalTags.innerHTML = tags;

    // Set content in body
    contentContainer.innerHTML = content;

    // Find and display experience logo
    const experiences = await this.getExperienceList();
    const experienceData = experiences.find(exp => exp.id === experienceId);

    // Create and position logo in header
    let logoContainer = modalHeader.querySelector('.experience-logo');
    if (!logoContainer) {
      logoContainer = document.createElement('div');
      logoContainer.className = 'experience-logo';
      modalHeader.appendChild(logoContainer);
    }

    if (experienceData?.logo) {
      logoContainer.innerHTML = `<img src="${experienceData.logo}" alt="${title} logo">`;
    } else if (experienceData?.logos && experienceData.logos.length > 0) {
      logoContainer.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center;">
          ${experienceData.logos.map(logo => `<img src="${logo}" alt="${title} logo" style="width: 45px; height: 45px; object-fit: contain;">`).join('')}
        </div>
      `;
    } else {
      logoContainer.style.display = 'none';
    }

    // Update navigation buttons state
    this.updateExperienceNavigationButtons();

    // Add close button functionality
    const closeBtn = contentContainer.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeExperienceModal();
    }
  }

  closeExperienceModal() {
    const modal = document.getElementById('experience-modal');

    // Restore scroll position
    const scrollY = modal.dataset.scrollY || 0;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, parseInt(scrollY));

    modal.classList.remove('active');
    this.currentExperienceId = null;
  }

  async loadExperienceContent(experienceId) {
    try {
      const response = await fetch(`./experience/${experienceId}.html`);
      if (!response.ok) {
        throw new Error('Experience content not found');
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading experience content:', error);
      return this.getExperienceFallbackContent(experienceId);
    }
  }

  extractExperienceTitleAndTags(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const title = doc.querySelector('h1')?.textContent || 'Experience Title';
    const tagsElement = doc.querySelector('.tags');
    const tags = tagsElement ? tagsElement.innerHTML : '';

    // Remove title and tags from content
    const titleElement = doc.querySelector('h1');
    if (titleElement) titleElement.remove();
    if (tagsElement) tagsElement.remove();

    return {
      title,
      tags,
      content: doc.body.innerHTML
    };
  }

  getExperienceFallbackContent(experienceId) {
    const fallbacks = {
      "fractal": {
        title: "Senior Machine Learning Engineer & SWE — Fractal AI",
        tags: '<span>LangGraph</span><span>LangChain</span><span>Multi-Agent Orchestration</span>',
        content: '<p>Led engineering for a multi-agent orchestration platform...</p>'
      },
      // Add other fallback content...
    };

    const fallback = fallbacks[experienceId];
    if (fallback) {
      return `<h1>${fallback.title}</h1><div class="tags">${fallback.tags}</div>${fallback.content}`;
    }
    return '<h1>Experience Content</h1><div class="tags"><span>Loading</span></div><p>Content loading...</p>';
  }

  // Experience Navigation Methods
  async getExperienceList() {
    if (this.experienceList === null) {
      try {
        const response = await fetch('./content.json');
        const data = await response.json();
        this.experienceList = data.experience;
      } catch (error) {
        console.error('Error loading experience list:', error);
        return [];
      }
    }
    return this.experienceList;
  }

  async navigateExperienceModal(direction) {
    if (!this.currentExperienceId) return;

    const experiences = await this.getExperienceList();
    if (experiences.length === 0) return;

    const currentIndex = experiences.findIndex(exp => exp.id === this.currentExperienceId);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    if (newIndex < 0 || newIndex >= experiences.length) return;

    const newExperienceId = experiences[newIndex].id;
    await this.openExperienceModal(newExperienceId);
  }

  async updateExperienceNavigationButtons() {
    if (!this.currentExperienceId) return;

    const experiences = await this.getExperienceList();
    if (experiences.length === 0) return;

    const currentIndex = experiences.findIndex(exp => exp.id === this.currentExperienceId);
    if (currentIndex === -1) return;

    const prevButton = document.getElementById('experience-nav-prev');
    const nextButton = document.getElementById('experience-nav-next');

    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentIndex === experiences.length - 1;
    }
  }

  // Modal overlay click handlers
  initializeModalCloseHandlers() {
    // Project modal
    const projectModal = document.getElementById('project-modal');
    if (projectModal) {
      projectModal.addEventListener('click', (e) => {
        if (e.target.id === 'project-modal') {
          this.closeProjectModal();
        }
      });
    }

    // Experience modal
    const experienceModal = document.getElementById('experience-modal');
    if (experienceModal) {
      experienceModal.addEventListener('click', (e) => {
        if (e.target.id === 'experience-modal') {
          this.closeExperienceModal();
        }
      });
    }
  }
}

// Initialize modal system
const modalManager = new ModalManager();

// Export for global access
window.openProjectModal = (projectId) => modalManager.openProjectModal(projectId);
window.closeProjectModal = () => modalManager.closeProjectModal();
window.navigateProjectModal = (direction) => modalManager.navigateProjectModal(direction);

window.openExperienceModal = (experienceId) => modalManager.openExperienceModal(experienceId);
window.closeExperienceModal = () => modalManager.closeExperienceModal();
window.navigateExperienceModal = (direction) => modalManager.navigateExperienceModal(direction);
