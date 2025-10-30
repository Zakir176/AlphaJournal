// js/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initThemeToggle();
    initNavigation();
    initScrollAnimations();
    initHeroAnimations();
    initParallax();
    initChart();
    initCounterAnimations();
    
    // Set up CTA buttons
    document.querySelector('.hero-actions .primary').addEventListener('click', function() {
        document.getElementById('pricing').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
});

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Check for saved theme or prefer color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
        
        // Update chart colors when theme changes
        initChart();
    });
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'var(--glass-bg)';
            navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// Parallax Scrolling
function initParallax() {
    const layers = document.querySelectorAll('.parallax-layer');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        layers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
}

// Chart.js Implementation
function initChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, isDark ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.3)');
    gradient.addColorStop(1, isDark ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.1)');
    
    // Destroy existing chart if it exists
    if (window.performanceChartInstance) {
        window.performanceChartInstance.destroy();
    }
    
    window.performanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Portfolio Value',
                data: [10000, 12000, 11500, 13500, 12500, 14500, 16000],
                borderColor: isDark ? '#0A84FF' : '#007AFF',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: isDark ? '#0A84FF' : '#007AFF',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#1d1d1f' : '#ffffff',
                    titleColor: isDark ? '#f5f5f7' : '#1d1d1f',
                    bodyColor: isDark ? '#a1a1a6' : '#86868b',
                    borderColor: isDark ? '#424245' : '#d2d2d7',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderColor: isDark ? '#424245' : '#d2d2d7'
                    },
                    ticks: {
                        color: isDark ? '#a1a1a6' : '#86868b'
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderColor: isDark ? '#424245' : '#d2d2d7'
                    },
                    ticks: {
                        color: isDark ? '#a1a1a6' : '#86868b',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart',
                delay: 1600
            }
        }
    });
}

// Counter Animations for Stats
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-value[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.getAttribute('data-target'));
                const isDecimal = target % 1 !== 0;
                
                animateCounter(counter, target, isDecimal ? 1000 : 2000, isDecimal);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, duration, isDecimal = false) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = isDecimal ? target.toFixed(1) + '/5' : 
                              target >= 1000 ? Math.floor(target).toLocaleString() + '+' : 
                              '+' + Math.floor(target) + '%';
            clearInterval(timer);
        } else {
            element.textContent = isDecimal ? current.toFixed(1) + '/5' : 
                              target >= 1000 ? Math.floor(current).toLocaleString() + '+' : 
                              '+' + Math.floor(current) + '%';
        }
    }, 16);
}

// Scroll animations for elements
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe all feature cards and pricing cards
    document.querySelectorAll('.feature-card, .pricing-card').forEach(el => {
        observer.observe(el);
    });
}

// Hero section animations
function initHeroAnimations() {
    // Set initial styles for staggered animations
    const heroElements = {
        badge: document.querySelector('.hero-badge'),
        title: document.querySelector('.hero-title'),
        subtitle: document.querySelector('.hero-subtitle'),
        actions: document.querySelector('.hero-actions'),
        stats: document.querySelector('.hero-stats'),
        visual: document.querySelector('.hero-visual')
    };
    
    // Reset initial states
    Object.values(heroElements).forEach(el => {
        if (el) {
            el.style.opacity = '0';
        }
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize smooth scrolling
initSmoothScrolling();

// Add loading animation for better perceived performance
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

// Form submission handler
document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simple form validation
    const inputs = this.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--accent-primary)';
        }
    });
    
    if (isValid) {
        // Show success message (in a real app, you'd send to server)
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you within 24 hours.');
            this.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
});