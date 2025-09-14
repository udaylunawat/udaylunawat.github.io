/**
 * Unified Modal Management Module
 * Handles both project and experience modal functionality with improved reusability
 */

export class ModalManager {
  constructor() {
    this.currentModalData = {
      type: null, // 'project' or 'experience'
      id: null
    };
    this.lists = {
      projects: null,
      experience: null
    };

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
        this.closeModal();
      }
    });

    // Close modal on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
    });

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Unified modal system initialized');
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
        this.attachCardClickHandler(card, projectId, 'project');
      }
    });

    // Attach click handlers to experience cards
    const experienceCards = document.querySelectorAll('.experience-with-link');
    experienceCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const experienceId = card.getAttribute('data-experience') || 'fractal';
        this.openModal('experience', experienceId);
      });
    });
  }

  attachCardClickHandler(card, id, type) {
    // Enhanced touch support for mobile with swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isScrolling = false;
    let touchMoved = false;

    // Mouse click
    card.addEventListener('click', (e) => {
      if (!isScrolling) {
        e.preventDefault();
        this.openModal(type, id);
      }
    });

    card.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isScrolling = false;
      touchMoved = false;
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      if (!touchStartX || !touchStartY) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const deltaX = Math.abs(touchCurrentX - touchStartX);
      const deltaY = Math.abs(touchCurrentY - touchStartY);

      // Mark as scrolling if significant movement
      if (deltaX > 10 || deltaY > 10) {
        touchMoved = true;
      }

      // If horizontal movement dominates, consider it scrolling
      if (deltaX > deltaY && deltaX > 10) {
        isScrolling = true;
      }
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;

      // Only trigger modal if it's a quick tap without significant movement
      if (!isScrolling && !touchMoved && touchDuration < 300) {
        e.preventDefault();
        this.openModal(type, id);
      }

      // Reset touch tracking
      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
      isScrolling = false;
      touchMoved = false;
    }, { passive: false });

    // Enhanced keyboard support for accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openModal(type, id);
      }
    });

    // Add mobile-specific enhancements
    if ('ontouchstart' in window) {
      // Remove hover states on touch devices to prevent sticky hover
      card.style.cursor = 'pointer';
      card.addEventListener('touchstart', () => {}, { passive: true });
    }
  }

  // Unified Modal Methods

  /**
   * Unified modal opening method
   * @param {string} type - 'project' or 'experience'
   * @param {string} id - Content identifier
   */
  async openModal(type, id) {
    if (!['project', 'experience'].includes(type)) {
      console.error(`Invalid modal type: ${type}`);
      return;
    }

    // Store current modal state
    this.currentModalData = { type, id };

    const modalConfig = this.getModalConfig(type);
    const modal = document.getElementById(modalConfig.id);
    if (!modal) {
      console.error(`Modal element not found: ${modalConfig.id}`);
      return;
    }

    // Save current scroll position
    modal.dataset.scrollY = window.scrollY;
    if (type === 'project') {
      const projectsSection = document.getElementById('projects');
      modal.dataset.projectsOffset = projectsSection ? projectsSection.offsetTop : 0;
    }

    // Show loading state
    const contentContainer = document.getElementById(modalConfig.contentContainerId);
    contentContainer.innerHTML = `<div class="loading">Loading ${type} content...</div>`;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load content
    const rawContent = await this.loadContent(type, id);
    const { title, tags, content } = this.extractContent(rawContent);

    // Set title in header
    const titleElement = document.getElementById(modalConfig.titleId);
    titleElement.textContent = title;

    // Handle tags (empty for header)
    const tagsElement = document.getElementById(modalConfig.tagsId);
    if (tagsElement) tagsElement.innerHTML = '';

    // Set content in body
    contentContainer.innerHTML = content;

    // Handle experience-specific features (logo)
    if (type === 'experience') {
      await this.handleExperienceLogo(modal, id, title);
    }

    // Update navigation buttons
    await this.updateNavigationButtons();

    // Setup keyboard navigation (desktop & mobile)
    this.setupKeyboardNavigation(type);

    // Setup swipe navigation for mobile
    this.setupSwipeNavigation(modal);

    // Setup desktop navigation buttons
    this.setupDesktopNavigation(type, modal);

    // Add visual navigation indicators
    this.setupNavigationIndicators(type, modal);
  }

  /**
   * Unified modal closing method
   */
  closeModal() {
    const { type } = this.currentModalData;
    if (!type) return;

    const modalConfig = this.getModalConfig(type);
    const modal = document.getElementById(modalConfig.id);

    // Restore scroll position
    const scrollY = modal.dataset.scrollY || 0;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, parseInt(scrollY));

    modal.classList.remove('active');
    this.currentModalData = { type: null, id: null };
  }

  /**
   * Get modal configuration for a type
   */
  getModalConfig(type) {
    const configs = {
      project: {
        id: 'project-modal',
        contentContainerId: 'modal-content-container',
        titleId: 'modal-title',
        tagsId: 'modal-tags',
        fallbackContentPath: './projects.json'
      },
      experience: {
        id: 'experience-modal',
        contentContainerId: 'experience-modal-content-container',
        titleId: 'experience-modal-title',
        tagsId: 'experience-modal-tags',
        fallbackContentPath: './content.json'
      }
    };
    return configs[type];
  }

  /**
   * Unified content loading method
   */
  async loadContent(type, id) {
    try {
      const path = type === 'project' ? `./projects/${id}.html` : `./experience/${id}.html`;
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`${type} content not found`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading ${type} content:`, error);
      return this.getFallbackContent(type, id);
    }
  }

  /**
   * Unified content extraction method
   */
  extractContent(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const title = doc.querySelector('h1')?.textContent || `${this.currentModalData.type} Title`;
    let titleElement = doc.querySelector('h1');
    if (titleElement) titleElement.remove();

    // Remove all tags from content
    const tagsElements = doc.querySelectorAll('.tags');
    tagsElements.forEach(tag => tag.remove());

    return {
      title,
      tags: '', // Don't extract tags for header
      content: doc.body.innerHTML
    };
  }

  /**
   * Unified fallback content method
   */
  getFallbackContent(type, id) {
    const fallbacks = {
      project: {
        "rockreveal-ai": {
          title: "RockReveal AI",
          content: '<p>Image classification deployed as a Telegram bot. Integrated Weights & Biases for experiment & artifact tracking and a simple MLOps workflow for continuous improvements.</p>'
        }
      },
      experience: {
        "fractal": {
          title: "Senior Machine Learning Engineer & SWE — Fractal AI",
          content: '<p>Led engineering for a multi-agent orchestration platform...</p>'
        }
      }
    };

    const fallback = fallbacks[type]?.[id];
    if (fallback) {
      return `<h1>${fallback.title}</h1>${fallback.content}`;
    }
    return `<h1>${type} Content</h1><p>Content loading...</p>`;
  }

  /**
   * Handle experience-specific logo display
   */
  async handleExperienceLogo(modal, experienceId, title) {
    const experiences = await this.getList('experience');
    const experienceData = experiences.find(exp => exp.id === experienceId);

    const modalHeader = modal.querySelector('.modal-header');
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
  }

  /**
   * Unified list getter
   */
  async getList(type) {
    if (this.lists[type]) return this.lists[type];

    try {
      const path = type === 'project' ? './projects.json' : './content.json';
      const response = await fetch(path);
      const data = await response.json();
      this.lists[type] = type === 'project' ? data.projects : data.experience;
      return this.lists[type];
    } catch (error) {
      console.error(`Error loading ${type} list:`, error);
      return [];
    }
  }

  /**
   * Unified navigation method
   */
  async navigateModal(direction) {
    const { type, id } = this.currentModalData;
    if (!type || !id) return;

    const list = await this.getList(type);
    if (list.length === 0) return;

    const currentIndex = list.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev') {
      newIndex = currentIndex - 1;
    } else {
      return;
    }

    if (newIndex < 0 || newIndex >= list.length) return;

    const newId = list[newIndex].id;
    await this.openModal(type, newId);
  }

  /**
   * Unified navigation button updater
   */
  async updateNavigationButtons() {
    const { type, id } = this.currentModalData;
    if (!type || !id) return;

    const list = await this.getList(type);
    if (list.length === 0) return;

    const currentIndex = list.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const prevButton = document.getElementById(`${type}-nav-prev`);
    const nextButton = document.getElementById(`${type}-nav-next`);

    if (prevButton) {
      prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled = currentIndex === list.length - 1;
    }
  }

  /**
   * Setup swipe navigation for mobile devices
   */
  setupSwipeNavigation(modal) {
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwipeGesture = false;
    let swipeThreshold = 50; // Minimum distance for swipe
    let maxVerticalMovement = 100; // Maximum vertical movement allowed

    modalContent.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isSwipeGesture = false;
    }, { passive: true });

    modalContent.addEventListener('touchmove', (e) => {
      if (!touchStartX || !touchStartY) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const deltaX = touchCurrentX - touchStartX;
      const deltaY = Math.abs(touchCurrentY - touchStartY);

      // Check if this is primarily a horizontal swipe
      if (Math.abs(deltaX) > swipeThreshold && deltaY < maxVerticalMovement) {
        isSwipeGesture = true;
        // Prevent default scrolling behavior during swipe
        e.preventDefault();
      }
    }, { passive: false });

    modalContent.addEventListener('touchend', async (e) => {
      if (!isSwipeGesture) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const deltaX = touchEndX - touchStartX;
      const deltaTime = touchEndTime - touchStartTime;

      // Only process if swipe was fast enough and long enough
      if (Math.abs(deltaX) > swipeThreshold && deltaTime < 500) {
        const { type, id } = this.currentModalData;
        if (!type || !id) return;

        const list = await this.getList(type);
        if (list.length === 0) return;

        const currentIndex = list.findIndex(item => item.id === id);
        if (currentIndex === -1) return;

        // Determine swipe direction
        if (deltaX > 0) {
          // Swipe right - go to previous item
          if (currentIndex > 0) {
            await this.navigateModal('prev');
          }
        } else {
          // Swipe left - go to next item
          if (currentIndex < list.length - 1) {
            await this.navigateModal('next');
          }
        }
      }

      // Reset touch tracking
      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
      isSwipeGesture = false;
    }, { passive: true });
  }

  /**
   * Setup keyboard navigation for desktop and mobile
   */
  setupKeyboardNavigation(type) {
    const { id } = this.currentModalData;
    if (!id) return;

    // Remove any existing keyboard event listeners
    document.removeEventListener('keydown', this.keyboardHandler);

    // Create keyboard handler
    this.keyboardHandler = async (e) => {
      if (!this.currentModalData.id) {
        document.removeEventListener('keydown', this.keyboardHandler);
        return;
      }

      // Arrow key navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (await this.canNavigate('prev')) {
          await this.navigateModal('prev');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (await this.canNavigate('next')) {
          await this.navigateModal('next');
        }
      }

      // ESC key handling is already done in attachEventListeners
    };

    // Add keyboard event listener
    document.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Check if navigation is possible in a direction
   */
  async canNavigate(direction) {
    const { type, id } = this.currentModalData;
    if (!type || !id) return false;

    const list = await this.getList(type);
    if (list.length === 0) return false;

    const currentIndex = list.findIndex(item => item.id === id);
    if (currentIndex === -1) return false;

    if (direction === 'prev') {
      return currentIndex > 0;
    } else if (direction === 'next') {
      return currentIndex < list.length - 1;
    }

    return false;
  }

  /**
   * Setup desktop navigation buttons
   */
  async setupDesktopNavigation(type, modal) {
    const { id } = this.currentModalData;
    if (!id) return;

    const list = await this.getList(type);
    if (list.length === 0 || list.length === 1) return;

    const currentIndex = list.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    // Remove existing navigation buttons if any
    this.removeDesktopNavigation(modal);

    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'modal-navigation';
    navContainer.innerHTML = `
      <button class="nav-arrow nav-prev" aria-label="Previous ${type}" ${currentIndex === 0 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="nav-indicators">
        ${list.map((_, index) =>
          `<span class="nav-indicator ${index === currentIndex ? 'active' : ''}" data-index="${index}"></span>`
        ).join('')}
      </div>
      <button class="nav-arrow nav-next" aria-label="Next ${type}" ${currentIndex === list.length - 1 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    // Add click handlers
    const prevBtn = navContainer.querySelector('.nav-prev');
    const nextBtn = navContainer.querySelector('.nav-next');
    const indicators = navContainer.querySelectorAll('.nav-indicator');

    prevBtn.addEventListener('click', async () => {
      if (await this.canNavigate('prev')) {
        await this.navigateModal('prev');
      }
    });

    nextBtn.addEventListener('click', async () => {
      if (await this.canNavigate('next')) {
        await this.navigateModal('next');
      }
    });

    // Indicator click handlers (for desktop)
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', async () => {
        const { type } = this.currentModalData;
        const list = await this.getList(type);
        if (list[index]) {
          await this.openModal(type, list[index].id);
        }
      });
    });

    // Insert navigation into modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.appendChild(navContainer);
    }

    // Store reference for cleanup
    modal.dataset.hasNav = 'true';
  }

  /**
   * Remove desktop navigation
   */
  removeDesktopNavigation(modal) {
    const existingNav = modal.querySelector('.modal-navigation');
    if (existingNav) {
      existingNav.remove();
    }
  }

  /**
   * Setup visual navigation indicators
   */
  setupNavigationIndicators(type, modal) {
    // For mobile, we'll rely on swipe gestures and tap zones
    // Desktop navigation is handled by setupDesktopNavigation
  }

  // Legacy Project Modal Methods (wrappers for unified system)
  async openProjectModal(projectId) {
    return this.openModal('project', projectId);
  }

  closeProjectModal() {
    return this.closeModal();
  }

  async navigateProjectModal(direction) {
    return this.navigateModal(direction);
  }

  async getProjectList() {
    return this.getList('project');
  }

  async updateProjectNavigationButtons() {
    return this.updateNavigationButtons();
  }

  // Legacy Experience Modal Methods (wrappers for unified system)
  async openExperienceModal(experienceId) {
    return this.openModal('experience', experienceId);
  }

  closeExperienceModal() {
    return this.closeModal();
  }

  async navigateExperienceModal(direction) {
    return this.navigateModal(direction);
  }

  async getExperienceList() {
    return this.getList('experience');
  }

  async updateExperienceNavigationButtons() {
    return this.updateNavigationButtons();
  }

  // Legacy methods for backward compatibility
  async loadProjectContent(projectId) {
    return this.loadContent('project', projectId);
  }

  extractTitleAndTags(content) {
    return this.extractContent(content);
  }

  getFallbackContent(projectId) {
    return this.getFallbackContent('project', projectId);
  }

  async loadExperienceContent(experienceId) {
    return this.loadContent('experience', experienceId);
  }

  extractExperienceTitleAndTags(content) {
    return this.extractContent(content);
  }

  getExperienceFallbackContent(experienceId) {
    return this.getFallbackContent('experience', experienceId);
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

// Unified API exports
window.openUnifiedModal = (type, id) => modalManager.openModal(type, id);
window.navigateModal = (direction) => modalManager.navigateModal(direction);
window.closeModal = () => modalManager.closeModal();

// Export modal manager instance for advanced usage
window.modalManager = modalManager;
