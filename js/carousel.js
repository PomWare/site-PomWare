// Projects Carousel Functionality - Single Project Movement
class ProjectsCarousel {
    constructor() {
        this.container = document.getElementById('projectsContainer');
        this.indicatorsContainer = document.getElementById('carouselIndicators');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');

        // If any required element is missing, stop (prevents JS crash)
        if (!this.container || !this.indicatorsContainer || !this.prevBtn || !this.nextBtn) return;

        this.projects = this.container.querySelectorAll('.project-card');
        if (!this.projects.length) return;

        this.currentIndex = 0;
        this.projectsPerView = this.getProjectsPerView();
        this.totalProjects = this.projects.length;

        this.init();
        this.setupResponsive();
    }

    
    getProjectsPerView() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }
    
    setupResponsive() {
        window.addEventListener('resize', () => {
            const newProjectsPerView = this.getProjectsPerView();
            if (newProjectsPerView !== this.projectsPerView) {
                this.projectsPerView = newProjectsPerView;
                this.updateCarousel();
            }
        });
    }
    
    init() {
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Create indicators - one per project
        this.createIndicators();
        
        // Initialize
        this.updateCarousel();
    }
    
    createIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalProjects; i++) {
            const indicator = document.createElement('span');
            indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', i);
            indicator.addEventListener('click', () => this.goToIndex(i));
            this.indicatorsContainer.appendChild(indicator);
        }
        
        this.indicators = document.querySelectorAll('.indicator');
    }
    
    next() {
        if (this.currentIndex < this.totalProjects - this.projectsPerView) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }
    
    goToIndex(index) {
        // Ensure the index is valid and doesn't go beyond available projects
        const maxIndex = Math.max(0, this.totalProjects - this.projectsPerView);
        this.currentIndex = Math.min(Math.max(0, index), maxIndex);
        this.updateCarousel();
    }
    
    updateCarousel() {
        // Calculate translateX based on current index and card width
        const card = this.projects[0];
        const cardWidth = card.offsetWidth + 32; // width + gap
        const translateX = -this.currentIndex * cardWidth;
        this.container.style.transform = `translateX(${translateX}px)`;
        
        // Update indicators
        this.updateIndicators();
        
        // Update button states
        this.updateButtonStates();
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            // Highlight indicators for all visible projects
            const isVisible = index >= this.currentIndex && index < this.currentIndex + this.projectsPerView;
            indicator.classList.toggle('active', isVisible);
        });
    }
    
    updateButtonStates() {
        // Update previous button
        if (this.currentIndex === 0) {
            this.prevBtn.style.opacity = '0.3';
            this.prevBtn.disabled = true;
        } else {
            this.prevBtn.style.opacity = '1';
            this.prevBtn.disabled = false;
        }
        
        // Update next button
        if (this.currentIndex >= this.totalProjects - this.projectsPerView) {
            this.nextBtn.style.opacity = '0.3';
            this.nextBtn.disabled = true;
        } else {
            this.nextBtn.style.opacity = '1';
            this.nextBtn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProjectsCarousel();
});