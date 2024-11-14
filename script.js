// Define skill level thresholds and their corresponding labels
const SKILL_LEVELS = {
    EXPERT: { min: 90, label: 'Expert' },
    PROFICIENT: { min: 70, label: 'Proficient' }, 
    INTERMEDIATE: { min: 50, label: 'Intermediate' },
    BEGINNER: { min: 0, label: 'Beginner' }
};

// Helper function to determine skill level based on numeric score
const getSkillLevel = score => 
    Object.values(SKILL_LEVELS)
        .find(level => score >= level.min)?.label || SKILL_LEVELS.BEGINNER.label;

// Generate HTML for an individual skill item with name and progress bar
const createSkillItem = ({ name, score }) => `
    <div class="skill-item" data-aos="fade-up">
        <div class="skill-header">
            <span class="skill-name">${name}</span>
            <span class="skill-level-text">${getSkillLevel(score)}</span>
        </div>
        <div class="skill-bar">
            <div class="skill-progress" style="width: ${score}%"></div>
        </div>
    </div>
`;

// Load and render skills from data.json into their respective containers
const loadSkills = async () => {
    try {
        // Get container elements for languages and frameworks
        const [languagesContainer, frameworksContainer] = ['languages-container', 'frameworks-container']
            .map(id => document.getElementById(id));

        if (!languagesContainer || !frameworksContainer) {
            throw new Error('Skill containers not found');
        }

        // Fetch skills data from data.json
        const { skills: { languages, frameworks } } = await fetch('data.json').then(res => res.json());
        
        // Helper function to render skills in a container
        const renderSkills = (container, skills) => {
            container.innerHTML = skills.map(createSkillItem).join('');
        };

        // Render both language and framework skills
        renderSkills(languagesContainer, languages);
        renderSkills(frameworksContainer, frameworks);

    } catch (error) {
        console.error('Error loading skills:', error);
    }
};

// Configuration for navbar scroll behavior
const SCROLL_CONFIG = {
    THRESHOLD: 300,        // Scroll distance before hiding navbar
    IDLE_TIMEOUT: 2000    // Time to wait before hiding navbar (ms)
};

const navbar = document.getElementById('navbar');
let scrollTimer = null;

// Toggle navbar visibility with animation
const toggleNavbar = (show) => {
    navbar.style.transform = `translateY(${show ? '0' : '-100%'})`;
    navbar.style.opacity = show ? '1' : '0';
};

// Handle scroll events for navbar visibility
const handleScroll = () => {
    toggleNavbar(true);
    clearTimeout(scrollTimer);
    
    if (window.scrollY > SCROLL_CONFIG.THRESHOLD) {
        scrollTimer = setTimeout(() => toggleNavbar(false), SCROLL_CONFIG.IDLE_TIMEOUT);
    }
};

// Theme constants and management
const THEMES = {
    DARK: 'dark',
    LIGHT: 'light'
};

// Update UI elements for theme changes
const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('#theme-toggle i').className = `fas fa-${theme === THEMES.DARK ? 'moon' : 'sun'}`;
};

// Initialize theme from localStorage or default to dark
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || THEMES.DARK;
    localStorage.setItem('theme', savedTheme);
    updateThemeUI(savedTheme);
};

// Toggle between light and dark themes
const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
};

// Back to top button functionality
const backToTopButton = document.getElementById('back-to-top');

// Show/hide back to top button based on scroll position
window.addEventListener('scroll', () => {
    backToTopButton.classList.toggle('visible', window.scrollY > 300);
});

// Smooth scroll to top when button is clicked
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Initialize all components and animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate On Scroll) library
    AOS.init({
        duration: 800,
        once: false,
        mirror: true,
        offset: 100
    });
    
    // Helper function to set animation delay indices
    const setAnimationIndices = (selector) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.setProperty('--index', index);
        });
    };

    // Set animation indices for various elements
    setAnimationIndices('.timeline-item');
    setAnimationIndices('.skill-category');
    setAnimationIndices('.skill-item');

    // Setup intersection observer for scroll animations
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(animateOnScroll, {
        threshold: 0.2,
        rootMargin: '50px'
    });

    // Add scroll animation observers to elements
    document.querySelectorAll('.bio-text, .timeline-item, .skill-category, .skill-item')
        .forEach(el => scrollObserver.observe(el));

    // Add hover animations for skill items
    document.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px) scale(1.02)';
            item.style.boxShadow = `0 10px 20px rgba(var(--primary-rgb), 0.2)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) scale(1)';
            item.style.boxShadow = 'none';
        });
    });

    // Initialize components
    loadSkills();
    initTheme();
    
    // Add event listeners
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    window.addEventListener('scroll', handleScroll);
    toggleNavbar(true);
});

// Add transition styles for navbar
document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: '#navbar { transition: transform 0.3s ease, opacity 0.3s ease; }'
}));

// Add scrolled class to navbar when scrolling
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Scroll Progress Bar Component
class ScrollProgressBar {
    constructor() {
        this.progressBar = document.getElementById('scrollBar');
        this.lastKnownScrollPosition = 0;
        this.ticking = false;
        this.init();
    }

    // Initialize scroll progress bar
    init() {
        this.updateProgress();

        // Update on scroll with requestAnimationFrame for performance
        window.addEventListener('scroll', () => {
            this.lastKnownScrollPosition = window.scrollY;
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.updateProgress();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });

        // Update on window resize and content changes
        window.addEventListener('resize', () => this.updateProgress());
        new ResizeObserver(() => this.updateProgress()).observe(document.body);
    }

    // Update progress bar width based on scroll position
    updateProgress() {
        if (!this.progressBar) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        this.progressBar.style.transform = `translateX(${progress - 100}%)`;
    }
}

// Contact Form Component
class ContactForm {
    constructor() {
        // Initialize form elements and configuration
        this.form = document.getElementById('contact-form');
        this.statusDiv = document.getElementById('form-status');
        this.submitButton = this.form.querySelector('.submit-btn');
        this.originalButtonText = this.submitButton.querySelector('.btn-text').textContent;
        
        // EmailJS configuration
        this.emailjsPublicKey = 'Yg1wzIuPwYIWTIDIu';
        this.templateID = 'chaseliutemplateid';
        this.serviceID = 'chaseliuserviceid';
        
        this.init();
    }

    // Initialize form functionality
    init() {
        emailjs.init(this.emailjsPublicKey);
        this.form.addEventListener('submit', e => this.handleSubmit(e));
        this.form.querySelectorAll('input, textarea').forEach(input => {
            ['input', 'blur'].forEach(event => 
                input.addEventListener(event, () => this.validateField(input))
            );
        });
    }

    // Validate individual form fields
    validateField(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let errorMessage = '';

        // Validation rules for each field
        const validations = {
            name: () => field.value.length >= 2 || 'Name must be at least 2 characters long',
            email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) || 'Please enter a valid email address',
            message: () => field.value.length >= 10 || 'Message must be at least 10 characters long'
        };

        const validation = validations[field.id]?.();
        if (validation !== true) {
            isValid = false;
            errorMessage = validation;
        }

        // Update UI with validation results
        field.classList.toggle('invalid', !isValid);
        errorElement.textContent = errorMessage;
        return isValid;
    }

    // Handle form submission
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields before submission
        if (![...this.form.querySelectorAll('input, textarea')]
            .every(field => this.validateField(field))) return;

        this.setLoadingState(true);
        
        try {
            // Send email using EmailJS
            await emailjs.send(
                this.serviceID,
                this.templateID,
                {
                    from_name: this.form.name.value,
                    from_email: this.form.email.value,
                    message: this.form.message.value,
                    reply_to: this.form.email.value,
                    subject: `New Contact from ${this.form.name.value} via Portfolio`,
                    site_name: window.location.hostname,
                    timestamp: new Date().toISOString()
                },
                this.emailjsPublicKey
            );

            // Show success message and reset form
            this.showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Error:', error);
            this.showStatus('Sorry, something went wrong. Please try again later.', 'error');
        }

        this.setLoadingState(false);
    }

    // Update UI during form submission
    setLoadingState(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.querySelector('.btn-text').textContent = isLoading ? 'Sending...' : this.originalButtonText;
        this.submitButton.querySelector('.spinner').style.display = isLoading ? 'inline-block' : 'none';
    }

    // Display status messages
    showStatus(message, type) {
        Object.assign(this.statusDiv, {
            textContent: message,
            className: `form-status ${type}`,
            style: { display: 'block' }
        });
        
        // Hide status message after delay
        setTimeout(() => {
            this.statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize ScrollProgressBar and ContactForm components
document.addEventListener('DOMContentLoaded', () => {
    new ScrollProgressBar();
    new ContactForm();
});

// Define colors for different programming languages
const LANGUAGE_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572a5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Ruby: '#c92c2c',
    Go: '#00add8',
    Swift: '#ffac45',
    'C++': '#f34b7d',
    PHP: '#4F5D95',
    Rust: '#dea584',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Vue: '#41b883',
    React: '#61dafb'
};

// Load and display GitHub projects
async function loadGitHubProjects() {
    const username = 'chase-m-liu';
    const projectsContainer = document.getElementById('projects-container');
    
    try {
        // Show loading state
        projectsContainer.innerHTML = '<div class="loading">Loading projects...</div>';

        // Fetch GitHub repositories
        const response = await fetch(`https://api.github.com/users/${username}/repos`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const repos = await response.json();
        
        // Generate HTML for each project
        projectsContainer.innerHTML = repos
            .filter(project => !project.fork)
            .map(project => {
                const language = project.language || 'Various';
                const languageClass = language.replace(/[^a-zA-Z0-9]/g, '');
                
                return `
                    <div class="project-card" data-aos="fade-up">
                        <div class="project-header">
                            <div class="project-title-wrapper">
                                <h3 class="project-title">${project.name}</h3>
                                <span class="tech-tag ${languageClass}">
                                    <i class="fas fa-code"></i>
                                    ${language}
                                </span>
                            </div>
                        </div>
                        <div class="project-content">
                            <p class="project-description">${project.description || 'No description available'}</p>
                            ${project.topics?.length ? `
                                <div class="project-topics">
                                    ${project.topics.slice(0, 3).map(topic => 
                                        `<span class="tech-tag default">
                                            <i class="fas fa-tag"></i> ${topic}
                                        </span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="project-footer">
                            <div class="project-stats">
                                <span>
                                    <i class="far fa-star"></i>
                                    ${project.stargazers_count}
                                </span>
                                <span>
                                    <i class="fas fa-code-fork"></i>
                                    ${project.forks_count}
                                </span>
                            </div>
                            <div class="project-links">
                                <a href="${project.html_url}" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   class="btn">
                                    <i class="far fa-eye"></i>
                                    View Code
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

    } catch (error) {
        // Show error message if loading fails
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to load projects. Please check the console for details.</p>
            </div>
        `;
    }
}

// Configuration for intersection observer
const observerOptions = {
    threshold: 0.2,
    rootMargin: '50px'
};

// Create intersection observer for section animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Load GitHub projects when DOM is ready
document.addEventListener('DOMContentLoaded', loadGitHubProjects);
