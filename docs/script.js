// Navigation and Interactive Elements
document.addEventListener('DOMContentLoaded', function() {
    // Add cache-busting timestamp to prevent caching issues
    const cacheBuster = Date.now();
    console.log('MochiDrop Documentation loaded at:', new Date().toISOString(), 'Cache buster:', cacheBuster);
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Smooth scroll to top of main content
                document.querySelector('.main-content').scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile menu toggle (for future mobile implementation)
    const createMobileMenuToggle = () => {
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.style.cssText = `
            display: none;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1000;
            background: linear-gradient(135deg, #ff6b9d, #c084fc);
            border: none;
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: white;
            font-size: 1.125rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        mobileToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('open');
        });
        
        document.body.appendChild(mobileToggle);
        
        // Show mobile toggle on small screens
        const checkScreenSize = () => {
            if (window.innerWidth <= 1024) {
                mobileToggle.style.display = 'block';
            } else {
                mobileToggle.style.display = 'none';
                document.querySelector('.sidebar').classList.remove('open');
            }
        };
        
        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();
    };
    
    createMobileMenuToggle();
    
    // Add search functionality
    const addSearchFunctionality = () => {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search documentation..." class="search-input">
            </div>
        `;
        
        // Add search styles
        const searchStyles = document.createElement('style');
        searchStyles.textContent = `
            .search-container {
                padding: 0 2rem 1rem;
                margin-bottom: 1rem;
            }
            
            .search-box {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-box i {
                position: absolute;
                left: 1rem;
                color: #64748b;
                z-index: 1;
            }
            
            .search-input {
                width: 100%;
                padding: 0.75rem 1rem 0.75rem 2.5rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.5rem;
                color: #e2e8f0;
                font-size: 0.875rem;
                transition: all 0.2s ease;
            }
            
            .search-input:focus {
                outline: none;
                border-color: #ff6b9d;
                background: rgba(255, 255, 255, 0.08);
            }
            
            .search-input::placeholder {
                color: #64748b;
            }
        `;
        document.head.appendChild(searchStyles);
        
        // Insert search after sidebar header
        const sidebarHeader = document.querySelector('.sidebar-header');
        sidebarHeader.after(searchContainer);
        
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const navSections = document.querySelectorAll('.nav-section');
            
            navSections.forEach(section => {
                const links = section.querySelectorAll('.nav-link');
                let hasVisibleLinks = false;
                
                links.forEach(link => {
                    const text = link.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        link.style.display = 'block';
                        hasVisibleLinks = true;
                    } else {
                        link.style.display = searchTerm ? 'none' : 'block';
                    }
                });
                
                // Hide section if no visible links
                const sectionTitle = section.querySelector('h3');
                if (searchTerm && !hasVisibleLinks) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
        });
    };
    
    addSearchFunctionality();
    
    // Add smooth animations for cards
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe cards and sections
        document.querySelectorAll('.overview-card, .feature-category, .update-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    };
    
    observeElements();
    
    // Add copy functionality to code blocks
    const addCopyButtons = () => {
        document.querySelectorAll('.code-block').forEach(block => {
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
                const code = block.querySelector('code').textContent;
                try {
                    await navigator.clipboard.writeText(code);
                    copyButton.innerHTML = '<i class="fas fa-check"></i>';
                    copyButton.style.color = '#10b981';
                    setTimeout(() => {
                        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                        copyButton.style.color = '#cbd5e1';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
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
            
            block.style.position = 'relative';
            block.appendChild(copyButton);
        });
    };
    
    addCopyButtons();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('.search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.blur();
            }
        }
    });
    
    // Add loading animation
    const addLoadingAnimation = () => {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="mochi-loader">🍡</div>
                <div class="loader-text">Loading MochiDrop Docs...</div>
            </div>
        `;
        
        const loaderStyles = document.createElement('style');
        loaderStyles.textContent = `
            .page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 0.5s ease;
            }
            
            .loader-content {
                text-align: center;
            }
            
            .mochi-loader {
                font-size: 4rem;
                animation: loaderFloat 2s ease-in-out infinite;
                margin-bottom: 1rem;
            }
            
            .loader-text {
                color: #94a3b8;
                font-size: 1.125rem;
                font-weight: 500;
            }
            
            @keyframes loaderFloat {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(10deg); }
            }
        `;
        document.head.appendChild(loaderStyles);
        document.body.appendChild(loader);
        
        // Hide loader after page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }, 1000);
        });
    };
    
    addLoadingAnimation();
    
    // Add theme toggle (for future implementation)
    const addThemeToggle = () => {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Toggle theme (Coming soon)';
        
        themeToggle.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 3rem;
            height: 3rem;
            color: #cbd5e1;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.125rem;
            z-index: 999;
        `;
        
        themeToggle.addEventListener('click', () => {
            // Theme toggle functionality can be added here
            console.log('Theme toggle clicked - feature coming soon!');
        });
        
        themeToggle.addEventListener('mouseenter', () => {
            themeToggle.style.background = 'rgba(255, 255, 255, 0.15)';
            themeToggle.style.color = '#fff';
        });
        
        themeToggle.addEventListener('mouseleave', () => {
            themeToggle.style.background = 'rgba(255, 255, 255, 0.1)';
            themeToggle.style.color = '#cbd5e1';
        });
        
        document.body.appendChild(themeToggle);
    };
    
    addThemeToggle();
});

// Utility functions
const utils = {
    // Smooth scroll to element
    scrollToElement: (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },
    
    // Debounce function for search
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Format code for better display
    formatCode: (code) => {
        return code.trim().replace(/^\s+/gm, '');
    }
};

// Export utils for potential external use
window.MochiDocsUtils = utils;