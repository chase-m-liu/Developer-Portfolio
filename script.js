// Skill level thresholds and labels
const SKILL_LEVELS = {
    EXPERT: { min: 90, label: 'Expert' },
    PROFICIENT: { min: 70, label: 'Proficient' }, 
    INTERMEDIATE: { min: 50, label: 'Intermediate' },
    BEGINNER: { min: 0, label: 'Beginner' }
};

const getSkillLevel = score => 
    Object.values(SKILL_LEVELS)
        .find(level => score >= level.min)?.label || SKILL_LEVELS.BEGINNER.label;

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

const loadSkills = async () => {
    try {
        const [languagesContainer, frameworksContainer] = ['languages-container', 'frameworks-container']
            .map(id => document.getElementById(id));

        if (!languagesContainer || !frameworksContainer) {
            throw new Error('Skill containers not found');
        }

        const { skills: { languages, frameworks } } = await fetch('data.json').then(res => res.json());
        
        const renderSkills = (container, skills) => {
            container.innerHTML = skills.map(createSkillItem).join('');
        };

        renderSkills(languagesContainer, languages);
        renderSkills(frameworksContainer, frameworks);

    } catch (error) {
        console.error('Error loading skills:', error);
    }
};

// Navbar scroll behavior
const SCROLL_CONFIG = {
    THRESHOLD: 300,
    IDLE_TIMEOUT: 2000
};

const navbar = document.getElementById('navbar');
let scrollTimer = null;

const toggleNavbar = (show) => {
    navbar.style.transform = `translateY(${show ? '0' : '-100%'})`;
    navbar.style.opacity = show ? '1' : '0';
};

const handleScroll = () => {
    toggleNavbar(true);
    clearTimeout(scrollTimer);
    
    if (window.scrollY > SCROLL_CONFIG.THRESHOLD) {
        scrollTimer = setTimeout(() => toggleNavbar(false), SCROLL_CONFIG.IDLE_TIMEOUT);
    }
};

// Theme management
const THEMES = {
    DARK: 'dark',
    LIGHT: 'light'
};

const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('#theme-toggle i').className = `fas fa-${theme === THEMES.DARK ? 'moon' : 'sun'}`;
};

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || THEMES.DARK;
    localStorage.setItem('theme', savedTheme);
    updateThemeUI(savedTheme);
};

const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    localStorage.setItem('theme', newTheme);
    updateThemeUI(newTheme);
};

// Back to top button
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    backToTopButton.classList.toggle('visible', window.scrollY > 300);
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        once: false,
        mirror: true,
        offset: 100
    });
    

    // Set animation indices
    const setAnimationIndices = (selector) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.setProperty('--index', index);
        });
    };

    // Initialize animation indices for various elements
    setAnimationIndices('.timeline-item');
    setAnimationIndices('.skill-category');
    setAnimationIndices('.skill-item');

    // Add scroll-triggered animations
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

    // Observe elements for animation
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

    loadSkills();
    initTheme();
    
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    window.addEventListener('scroll', handleScroll);
    toggleNavbar(true);
});

// Add navbar styles
document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: '#navbar { transition: transform 0.3s ease, opacity 0.3s ease; }'
}));

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Scroll Progress Bar
class ScrollProgressBar {
    constructor() {
        this.progressBar = document.getElementById('scrollBar');
        this.lastKnownScrollPosition = 0;
        this.ticking = false;
        this.init();
    }

    init() {
        this.updateProgress();

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

        window.addEventListener('resize', () => this.updateProgress());
        new ResizeObserver(() => this.updateProgress()).observe(document.body);
    }

    updateProgress() {
        if (!this.progressBar) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        this.progressBar.style.transform = `translateX(${progress - 100}%)`;
    }
}

// Contact Form
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.statusDiv = document.getElementById('form-status');
        this.submitButton = this.form.querySelector('.submit-btn');
        this.originalButtonText = this.submitButton.querySelector('.btn-text').textContent;
        
        this.emailjsPublicKey = '${{secrets.public_key}}';
        this.templateID = '${{secrets.template_id}}';
        this.serviceID = '${{secrets.service_id}}';
        this.toEmail = '${{secrets.email}}';
        
        this.init();
    }

    init() {
        emailjs.init(this.emailjsPublicKey);
        this.form.addEventListener('submit', e => this.handleSubmit(e));
        this.form.querySelectorAll('input, textarea').forEach(input => {
            ['input', 'blur'].forEach(event => 
                input.addEventListener(event, () => this.validateField(input))
            );
        });
    }

    validateField(field) {
        const errorElement = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let errorMessage = '';

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

        field.classList.toggle('invalid', !isValid);
        errorElement.textContent = errorMessage;
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (![...this.form.querySelectorAll('input, textarea')]
            .every(field => this.validateField(field))) return;

        this.setLoadingState(true);
        
        try {
            await emailjs.send(
                this.serviceID,
                this.templateID,
                {
                    to_email: this.toEmail,
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

            this.showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
        } catch (error) {
            console.error('Error:', error);
            this.showStatus('Sorry, something went wrong. Please try again later.', 'error');
        }

        this.setLoadingState(false);
    }

    setLoadingState(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.querySelector('.btn-text').textContent = isLoading ? 'Sending...' : this.originalButtonText;
        this.submitButton.querySelector('.spinner').style.display = isLoading ? 'inline-block' : 'none';
    }

    showStatus(message, type) {
        Object.assign(this.statusDiv, {
            textContent: message,
            className: `form-status ${type}`,
            style: { display: 'block' }
        });
        
        setTimeout(() => {
            this.statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    new ScrollProgressBar();
    new ContactForm();
});

// Language colors
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

// Load GitHub projects
async function loadGitHubProjects() {
    const username = 'chase-m-liu';
    const token = '${{secrets.account_token}}';
    const projectsContainer = document.getElementById('projects-container');
    
    try {
        projectsContainer.innerHTML = '<div class="loading">Loading projects...</div>';

        const response = await fetch(`https://api.github.com/users/${username}/repos`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const repos = await response.json();
        
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
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to load projects. Please check the console for details.</p>
            </div>
        `;
    }
}

const observerOptions = {
    threshold: 0.2,
    rootMargin: '50px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

document.addEventListener('DOMContentLoaded', loadGitHubProjects);
