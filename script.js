// MochiDrop Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 15, 35, 0.98)';
        } else {
            navbar.style.background = 'rgba(15, 15, 35, 0.95)';
        }
    });

    // Pricing toggle functionality
    const pricingToggle = document.getElementById('pricing-toggle');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const annualPrices = document.querySelectorAll('.annual-price');

    if (pricingToggle) {
        pricingToggle.addEventListener('change', function() {
            if (this.checked) {
                // Show annual prices
                monthlyPrices.forEach(price => price.style.display = 'none');
                annualPrices.forEach(price => price.style.display = 'inline');
            } else {
                // Show monthly prices
                monthlyPrices.forEach(price => price.style.display = 'inline');
                annualPrices.forEach(price => price.style.display = 'none');
            }
        });
    }

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                // Show success message
                showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                
                // Reset form
                this.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(notificationStyles);

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .pricing-card, .doc-card, .demo-step');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Demo animation
    const demoSteps = document.querySelectorAll('.demo-step');
    let currentStep = 0;

    function animateDemo() {
        // Remove active class from all steps
        demoSteps.forEach(step => step.classList.remove('active'));
        
        // Add active class to current step
        if (demoSteps[currentStep]) {
            demoSteps[currentStep].classList.add('active');
        }
        
        // Move to next step
        currentStep = (currentStep + 1) % demoSteps.length;
    }

    // Start demo animation
    if (demoSteps.length > 0) {
        setInterval(animateDemo, 3000);
    }

    // Floating elements animation
    function createFloatingElement(emoji, container) {
        const element = document.createElement('div');
        element.textContent = emoji;
        element.style.cssText = `
            position: absolute;
            font-size: 2rem;
            opacity: 0.1;
            pointer-events: none;
            animation: floatRandom 10s linear infinite;
        `;
        
        // Random starting position
        element.style.left = Math.random() * 100 + '%';
        element.style.top = Math.random() * 100 + '%';
        
        container.appendChild(element);
        
        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
        }, 10000);
    }

    // Add floating animation styles
    const floatingStyles = document.createElement('style');
    floatingStyles.textContent = `
        @keyframes floatRandom {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0.1;
            }
            50% {
                opacity: 0.3;
            }
            100% {
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(floatingStyles);

    // Create floating elements periodically
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        const emojis = ['🍡', '💰', '🪙', '💎', '⭐', '🚀', '🎯', '🎁'];
        
        setInterval(() => {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            createFloatingElement(randomEmoji, heroBackground);
        }, 5000);
    }

    // Copy to clipboard functionality for code blocks
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre code, .terminal-body');
        
        codeBlocks.forEach(block => {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Copy to clipboard';
            
            copyButton.style.cssText = `
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 0.25rem;
                padding: 0.5rem;
                color: #cbd5e1;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.875rem;
            `;
            
            copyButton.addEventListener('click', async () => {
                const text = block.textContent || block.innerText;
                try {
                    await navigator.clipboard.writeText(text);
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    copyButton.style.color = '#10b981';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                        copyButton.style.color = '#cbd5e1';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    showNotification('Failed to copy to clipboard', 'error');
                }
            });
            
            copyButton.addEventListener('mouseenter', () => {
                copyButton.style.background = 'rgba(255, 255, 255, 0.15)';
                copyButton.style.color = '#fff';
            });
            
            copyButton.addEventListener('mouseleave', () => {
                copyButton.style.background = 'rgba(255, 255, 255, 0.1)';
                copyButton.style.color = '#cbd5e1';
            });
            
            // Make parent relative for absolute positioning
            const parent = block.parentElement;
            if (parent && getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }
            
            parent.appendChild(copyButton);
        });
    }

    // Add copy buttons after a short delay to ensure elements are rendered
    setTimeout(addCopyButtons, 1000);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to close mobile menu
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
        
        // Ctrl/Cmd + K to focus search (if implemented)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Focus search input if available
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // Performance optimization: Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add loading states for external links
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add loading indicator for external links
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening...';
            
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    });

    // Initialize tooltips for buttons and links
    function initTooltips() {
        const elementsWithTooltips = document.querySelectorAll('[title]');
        
        elementsWithTooltips.forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.title;
                tooltip.style.cssText = `
                    position: absolute;
                    background: rgba(0, 0, 0, 0.9);
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                `;
                
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                
                // Show tooltip
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 100);
                
                // Store reference for cleanup
                this._tooltip = tooltip;
                
                // Remove title to prevent default tooltip
                this._originalTitle = this.title;
                this.removeAttribute('title');
            });
            
            element.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    this._tooltip.remove();
                    this._tooltip = null;
                }
                
                // Restore title
                if (this._originalTitle) {
                    this.title = this._originalTitle;
                }
            });
        });
    }

    initTooltips();

    // Console message for developers
    console.log(`
    🍡 MochiDrop Website
    
    Interested in contributing? Check out our GitHub:
    https://github.com/dreyxd/MochiDrop
    
    Built with ❤️ for the Solana community
    `);

    // Analytics tracking (placeholder)
    function trackEvent(eventName, properties = {}) {
        // Replace with your analytics service
        console.log('Event tracked:', eventName, properties);
        
        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Example: Mixpanel
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(eventName, properties);
        }
    }

    // Track button clicks
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonHref = this.href || '';
            
            trackEvent('Button Click', {
                button_text: buttonText,
                button_href: buttonHref,
                page_url: window.location.href
            });
        });
    });

    // Track section views
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                trackEvent('Section View', {
                    section_id: entry.target.id,
                    page_url: window.location.href
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => sectionObserver.observe(section));

    // Error handling for failed resource loads
    window.addEventListener('error', function(e) {
        if (e.target !== window) {
            console.warn('Resource failed to load:', e.target.src || e.target.href);
            
            // Track failed resource loads
            trackEvent('Resource Load Error', {
                resource_url: e.target.src || e.target.href,
                resource_type: e.target.tagName.toLowerCase(),
                page_url: window.location.href
            });
        }
    }, true);

    // Page load performance tracking
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            trackEvent('Page Load Performance', {
                load_time: loadTime,
                dom_ready_time: perfData.domContentLoadedEventEnd - perfData.navigationStart,
                page_url: window.location.href
            });
        }, 0);
    });
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}