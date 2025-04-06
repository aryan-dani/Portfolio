const menuBtn = document.querySelector('.menu-btn');
const hamburger = document.querySelector('.menu-btn__burger');
const nav = document.querySelector('.nav');
const menuNav = document.querySelector('.menu-nav');
const navItems = document.querySelectorAll('.menu-nav__item');
const main = document.querySelector('main');

let showMenu = false;

menuBtn.addEventListener('click', toggleMenu);

// When the menu is opened
function toggleMenu() {
    if(!showMenu) {
        // First prepare elements before showing them
        menuNav.style.opacity = '0';
        nav.style.visibility = 'visible';
        
        // Add open classes - these will trigger the CSS styles we defined in _menu.scss
        hamburger.classList.add('open');
        nav.classList.add('open');
        menuNav.classList.add('open');
        
        // Add a class to the body to prevent scrolling when menu is open
        document.body.classList.add('menu-open');
        
        // Animate menu items in the original order
        setTimeout(() => {
            menuNav.style.opacity = '1';
            
            // Add open class to all menu items - CSS will handle the animation timing
            navItems.forEach(item => item.classList.add('open'));
        }, 50);
        
        showMenu = true;
    } else {
        // First fade out menu items
        menuNav.style.opacity = '0';
        
        // Remove open classes from menu items
        navItems.forEach(item => item.classList.remove('open'));
        
        // Remove menu-open class from body
        document.body.classList.remove('menu-open');
        
        // Then after a short delay, close the menu
        setTimeout(() => {
            hamburger.classList.remove('open');
            nav.classList.remove('open');
            menuNav.classList.remove('open');
            
            // Hide menu after animation completes
            setTimeout(() => {
                if (!showMenu) { // Check again in case menu was reopened
                    nav.style.visibility = 'hidden';
                }
            }, 300);
        }, 100);
        
        showMenu = false;
    }
}

// Modernized menu button with clean animation effects
function initModernMenu() {
    // Get the elements
    const menuBtn = document.querySelector('.menu-btn');
    const hamburger = document.querySelector('.menu-btn__burger');
    
    // Add a wrapper for the burger to create cleaner effects
    if (!document.querySelector('.menu-btn__wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'menu-btn__wrapper';
        hamburger.parentNode.insertBefore(wrapper, hamburger);
        wrapper.appendChild(hamburger);
        
        // Add style for the wrapper with clean transitions
        const style = document.createElement('style');
        style.textContent = `
            .menu-btn__wrapper {
                position: relative;
                width: 28px;
                height: 28px;
            }
            
            .menu-btn__burger {
                position: absolute;
                top: 50%;
                left: 0;
                transform: translateY(-50%);
                transition: background-color 0.3s ease;
            }
            
            .menu-btn__burger::before,
            .menu-btn__burger::after {
                transition: transform 0.4s ease,
                            background-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Remove all hover event listeners to prevent any rotation
    menuBtn.removeEventListener('mouseenter', menuBtnHoverIn);
    menuBtn.removeEventListener('mouseleave', menuBtnHoverOut);
}

function menuBtnHoverIn() {
    // Empty functions to replace any existing listeners
}

function menuBtnHoverOut() {
    // Empty functions to replace any existing listeners
}

// Welcome notifications for each page - FIXED implementation
document.addEventListener('DOMContentLoaded', () => {
    // Create page loader if it doesn't exist
    if (!document.querySelector('.page-loader')) {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = '<div class="page-loader__spinner"></div>';
        document.body.appendChild(loader);
        
        // Show loader for a minimum time to avoid flashing
        setTimeout(() => {
            loader.classList.add('loaded');
            
            // Remove from DOM after transition completes
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }, 800); // Show for at least 800ms
    }
    
    // Add header background on scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Determine page type and add appropriate body class
    const pagePath = window.location.pathname;
    const isHomePage = pagePath.includes('index.html') || pagePath.endsWith('/');
    
    // Determine page name for tracking first-time visits
    let pageName = 'home';
    if (pagePath.includes('jobs.html')) pageName = 'jobs';
    else if (pagePath.includes('projects.html')) pageName = 'projects';
    else if (pagePath.includes('certification.html')) pageName = 'certification';
    else if (pagePath.includes('skills.html')) pageName = 'skills';
    else if (pagePath.includes('about.html')) pageName = 'about';
    
    // Add welcome toast based on page - but only on first visit
    // Delay increased to 1200ms to ensure it appears after social icons start animating
    setTimeout(() => {
        // Only show welcome toasts on first visit to each page
        if (checkFirstTimeVisit(pageName)) {
            if (isHomePage) {
                showToast('Welcome to My Portfolio', 'Explore my work and get to know me better', 'fa-solid fa-house-user');
            } else if (pageName === 'jobs') {
                showToast('Professional Experience', 'Learn about my career journey and achievements', 'fa-solid fa-briefcase');
            } else if (pageName === 'projects') {
                showToast('Portfolio Projects', 'Discover the projects I\'ve worked on', 'fa-solid fa-code');
            } else if (pageName === 'certification') {
                showToast('My Certifications', 'Check out my professional qualifications', 'fa-solid fa-certificate');
            } else if (pageName === 'skills') {
                showToast('Technical Skills', 'Explore my expertise across different technologies', 'fa-solid fa-laptop-code');
            } else if (pageName === 'about') {
                showToast('About Me', 'Get to know me better', 'fa-solid fa-user');
            }
        }
    }, 1200);
    
    // Continue with the rest of the initialization
    initPageTransition();
    
    // Initialize page-specific animations
    if (isHomePage) {
        initHomePageAnimations();
    } else if (pagePath.includes('jobs.html')) {
        initJobsPageAnimations();
    } else if (pagePath.includes('projects.html')) {
        initProjectsPageAnimations();
    } else if (pagePath.includes('certification.html')) {
        initCertificationsPageAnimations();
    } else if (pagePath.includes('skills.html')) {
        initSkillsPageAnimations();
    } else if (pagePath.includes('about.html')) {
        initAboutPageAnimations();
    }
    
    // Initialize universal animations
    initUniversalAnimations();
    
    // Initialize modern menu
    initModernMenu();
});

// Smooth page transitions
function initPageTransition() {
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = '0';
        main.style.transform = 'translateY(20px)';
        main.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        setTimeout(() => {
            main.style.opacity = '1';
            main.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Home page-specific animations - Optimized for performance
function initHomePageAnimations() {
    // Track if this is a low-power device (most mobile devices qualify)
    const isLowPowerDevice = window.navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i) !== null;
    
    // REMOVED: We're no longer initializing particles.js here as requested
    
    // COORDINATED ANIMATION SEQUENCE
    // This ensures elements animate in the correct order with proper timing
    
    // Step 1: Prepare all animations but don't start them yet
    prepareHomeAnimations();
    
    // Step 2: Execute animations in sequence with proper timing
    executeHomeAnimationSequence();
}

// Prepare all home page animations without starting them
function prepareHomeAnimations() {
    const isLowPowerDevice = window.navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i) !== null;
    
    // 1. Prepare name animation
    const name = document.querySelector('.home__name');
    if (name) {
        name.style.animation = 'none';
        name.style.opacity = '0';
        name.style.transform = isLowPowerDevice ? 
            'translateY(-25px)' : 
            'perspective(1000px) translateZ(-30px) rotateX(10deg)';
        name.style.transition = 'all 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
        
        // Remove any existing nameRevealEffect if present
        const existingEffect = name.querySelector('div');
        if (existingEffect) {
            existingEffect.remove();
        }
    }
    
    // 2. Prepare subtitle animation
    const subtitle = document.querySelector('.home h2');
    if (subtitle) {
        // Store the original subtitle text
        const originalText = subtitle.textContent;
        
        // Get original styling from computed style
        const originalBgColor = getComputedStyle(subtitle).backgroundColor;
        const originalColor = getComputedStyle(subtitle).color;
        const originalBorderRadius = getComputedStyle(subtitle).borderRadius;
        const originalPadding = getComputedStyle(subtitle).padding;
        
        // Clear the subtitle and reset its background
        subtitle.textContent = '';
        subtitle.style.background = 'transparent';
        subtitle.style.opacity = '1';
        subtitle.style.padding = '0';
        
        // Create a container for the typing animation
        const animContainer = document.createElement('div');
        animContainer.className = 'subtitle-typing-container';
        animContainer.style.display = 'inline-block';
        animContainer.style.position = 'relative';
        animContainer.style.backgroundColor = originalBgColor;
        animContainer.style.color = originalColor;
        animContainer.style.borderRadius = originalBorderRadius;
        animContainer.style.padding = originalPadding;
        animContainer.style.width = '0';
        animContainer.style.whiteSpace = 'nowrap';
        animContainer.style.overflow = 'hidden';
        animContainer.style.transition = 'width 0.1s ease-out';
        subtitle.appendChild(animContainer);
        
        // Create a text span to hold the typed text
        const textSpan = document.createElement('span');
        textSpan.className = 'typed-text';
        animContainer.appendChild(textSpan);
        
        // Add a blinking cursor element
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.innerHTML = '|';
        cursor.style.display = 'inline-block';
        cursor.style.color = originalColor;
        cursor.style.animation = 'blink-cursor 0.8s step-end infinite';
        cursor.style.marginLeft = '2px';
        cursor.style.position = 'absolute';
        cursor.style.right = '5px';
        animContainer.appendChild(cursor);
        
        // Add CSS for cursor animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink-cursor {
                from, to { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Store original text for later use in animation sequence
        subtitle.dataset.originalText = originalText;
    }
    
    // 3. Prepare social icons animation - make them ready but invisible
    const socialIconsList = document.querySelector('.social-icons .link-list');
    if (socialIconsList) {
        socialIconsList.style.position = 'relative';
        socialIconsList.style.opacity = '1'; // We show the container immediately
        socialIconsList.style.transform = 'translateY(0)'; // No initial transform
    }
    
    // 4. Prepare individual social icons for sequential animation
    const socialIcons = document.querySelectorAll('.link-title');
    if (socialIcons.length > 0) {
        socialIcons.forEach((icon, index) => {
            // Clear any existing animations and prepare for new animation
            icon.style.animation = 'none';
            icon.style.opacity = '0';
            icon.style.transform = 'translateX(-20px)'; // Start from left side
            icon.style.transition = 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'; // More pronounced spring effect
            
            // Prepare icon element for animation
            const iconElement = icon.querySelector('i');
            if (iconElement) {
                iconElement.style.opacity = '0';
                iconElement.style.transform = 'scale(0.5)';
                iconElement.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease, color 0.3s ease';
            }
            
            // Prepare text element for separate animation
            const textElement = icon.querySelector('a span, a');
            if (textElement) {
                textElement.style.opacity = '0';
                textElement.style.transform = 'translateX(-15px)';
                textElement.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.5s ease 0.2s';
            }
        });
    }
    
    // 5. Prepare CTA button animation
    const ctaButton = document.querySelector('.home .cta-button');
    if (ctaButton) {
        ctaButton.style.animation = 'pulse 2s infinite';
        ctaButton.style.opacity = '0';
        ctaButton.style.transform = 'translateY(20px)';
        ctaButton.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Add ripple effect on click
        ctaButton.addEventListener('click', (e) => {
            const rect = ctaButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.position = 'absolute';
            ripple.style.top = `${y}px`;
            ripple.style.left = `${x}px`;
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            ripple.style.borderRadius = '50%';
            ripple.style.transition = 'all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
            
            ctaButton.appendChild(ripple);
            
            // Animate the ripple
            setTimeout(() => {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                ripple.style.opacity = '0';
            }, 10);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
}

// Execute home animations in proper sequence
function executeHomeAnimationSequence() {
    const isLowPowerDevice = window.navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i) !== null;
    
    // ANIMATION SEQUENCE TIMELINE:
    // T+0ms: Name animation starts
    // T+300ms: Name animation completes
    // T+500ms: Subtitle typing starts
    // T+700ms: Individual social icons start appearing one by one
    // T+1300ms: CTA button appears
    
    // 1. Start name animation (immediately)
    const name = document.querySelector('.home__name');
    if (name) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                name.style.opacity = '1';
                name.style.transform = isLowPowerDevice ? 
                    'translateY(0)' : 
                    'perspective(1000px) translateZ(0) rotateX(0)';
                name.style.textShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                
                // Add enhanced hover effect after animation completes
                setTimeout(() => {
                    addNameHoverEffect(name, isLowPowerDevice);
                }, 300);
            }, 0);
        });
    }
    
    // 2. Start subtitle typing animation (delay 500ms)
    const subtitle = document.querySelector('.home h2');
    if (subtitle) {
        setTimeout(() => {
            startTypingAnimation(subtitle);
        }, 500);
    }
    
    // 3. Animate individual social icons with elegant sequential reveal
    const socialIcons = document.querySelectorAll('.link-title');
    if (socialIcons.length > 0) {
        socialIcons.forEach((icon, index) => {
            // Enhanced staggered animation with choreographed timing
            setTimeout(() => {
                // First animate the container position
                icon.style.opacity = '1';
                icon.style.transform = 'translateX(0)';
                
                // Then animate the icon with a slight delay
                const iconElement = icon.querySelector('i');
                if (iconElement) {
                    setTimeout(() => {
                        iconElement.style.opacity = '1';
                        iconElement.style.transform = 'scale(1.2)';
                        
                        // Return to normal scale with a bounce effect
                        setTimeout(() => {
                            iconElement.style.transform = 'scale(1)';
                        }, 150);
                    }, 100);
                }
                
                // Finally reveal the text with another slight delay
                const textElement = icon.querySelector('a span, a');
                if (textElement) {
                    setTimeout(() => {
                        textElement.style.opacity = '1';
                        textElement.style.transform = 'translateX(0)';
                    }, 200);
                }
                
                // Add hover effect after animation completes
                setTimeout(() => {
                    addIconHoverEffect(icon);
                }, 350);
            }, 1000 + (index * 300)); // Longer 200ms stagger for more noticeable sequence
        });
    }
    
    // 4. Animate CTA button (delay 1300ms - after all social icons)
    const ctaButton = document.querySelector('.home .cta-button');
    if (ctaButton) {
        setTimeout(() => {
            ctaButton.style.opacity = '1';
            ctaButton.style.transform = 'translateY(0)';
        }, socialIcons.length * 200 + 1200); // Dynamic timing based on number of social icons
    }
    
    // 5. Initialize background parallax for home section
    initHomeParallax(isLowPowerDevice);
}

// Helper function to start typing animation with true letter-by-letter effect
function startTypingAnimation(subtitle) {
    if (!subtitle || !subtitle.dataset.originalText) return;
    
    const originalText = subtitle.dataset.originalText;
    const animContainer = subtitle.querySelector('.subtitle-typing-container');
    const textSpan = subtitle.querySelector('.typed-text');
    const cursor = subtitle.querySelector('.typing-cursor');
    
    if (!animContainer || !textSpan || !cursor) return;
    
    // Reset everything first to ensure clean animation
    textSpan.textContent = '';
    animContainer.style.width = '20px'; // Start with just enough width for cursor
    
    // Type characters one by one
    let charIndex = 0;
    const typingDelay = 100; // Slower typing for more dramatic effect
    
    // Disable transition temporarily for initial setup
    const originalTransition = animContainer.style.transition;
    animContainer.style.transition = 'none';
    
    // Force a reflow to apply the style changes immediately
    void animContainer.offsetWidth;
    
    // Restore the transition for smooth animations during typing
    setTimeout(() => {
        animContainer.style.transition = 'width 0.05s ease-out';
        
        // Start the letter-by-letter typing sequence
        function typeNextChar() {
            if (charIndex < originalText.length) {
                // Add exactly one character
                textSpan.textContent += originalText.charAt(charIndex);
                
                // Calculate new width for container with a bit of buffer for cursor
                const newWidth = textSpan.offsetWidth + 20;
                
                // Expand container to fit text
                animContainer.style.width = `${newWidth}px`;
                
                // Update cursor position
                if (cursor) {
                    cursor.style.left = '';
                    cursor.style.right = '5px';
                }
                
                // Move to next character
                charIndex++;
                
                // Schedule typing of next character with a visible delay
                setTimeout(typeNextChar, typingDelay);
            } else {
                // Animation complete - keep cursor blinking for a while then hide it
                setTimeout(() => {
                    if (cursor) cursor.style.display = 'none';
                }, 2000);
            }
        }
        
        // Start typing the first character
        typeNextChar();
    }, 50);
}

// Add hover effect to name element
function addNameHoverEffect(name, isLowPowerDevice) {
    // Enhanced hover effect with subtle 3D movement
    const enhancedHoverHandler = debounce(function(e) {
        const rect = name.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate the rotation based on mouse position
        const rotateY = isLowPowerDevice ? 0 : ((mouseX - rect.width / 2) / rect.width) * 5;
        const rotateX = isLowPowerDevice ? 0 : -((mouseY - rect.height / 2) / rect.height) * 5;
        
        if (e.type === 'mouseenter') {
            name.style.transform = isLowPowerDevice ? 
                'translateY(-5px)' : 
                `perspective(1000px) translateZ(15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            name.style.textShadow = '0 15px 35px rgba(0, 0, 0, 0.25)';
            name.style.transition = 'transform 0.3s ease, text-shadow 0.3s ease';
        } else if (e.type === 'mousemove') {
            if (!isLowPowerDevice) {
                name.style.transform = `perspective(1000px) translateZ(15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                name.style.transition = 'transform 0.1s ease-out';
            }
        } else {
            name.style.transform = isLowPowerDevice ? 
                'translateY(0)' : 
                'perspective(1000px) translateZ(0) rotateX(0) rotateY(0)';
            name.style.textShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            name.style.transition = 'transform 0.5s ease, text-shadow 0.5s ease';
        }
    }, 10);
    
    name.addEventListener('mouseenter', enhancedHoverHandler);
    name.addEventListener('mousemove', enhancedHoverHandler);
    name.addEventListener('mouseleave', enhancedHoverHandler);
}

// Improved social icon animation and hover effects
function addIconHoverEffect(icon) {
    // First remove any existing event listeners to prevent duplication
    const iconClone = icon.cloneNode(true);
    icon.parentNode.replaceChild(iconClone, icon);
    
    // Add an advanced hover effect with scale and 3D rotation
    iconClone.addEventListener('mouseenter', () => {
        // Get the social icon element
        const iconElement = iconClone.querySelector('i');
        if (iconElement) {
            iconElement.style.transform = 'scale(1.3)'; 
            iconElement.style.color = 'rgba(240, 248, 255, 1)'; // Full brightness
            iconElement.style.textShadow = '0 0 15px rgba(240, 248, 255, 0.5)';
        }
        
        // Apply 3D effect to the entire icon container
        iconClone.style.transform = 'perspective(800px) translateY(-5px) translateZ(10px)';
    });
    
    iconClone.addEventListener('mouseleave', () => {
        const iconElement = iconClone.querySelector('i');
        if (iconElement) {
            iconElement.style.transform = 'scale(1)';
            iconElement.style.color = '';
            iconElement.style.textShadow = 'none';
        }
        
        // Smooth return to original position
        iconClone.style.transform = 'perspective(800px) translateY(0) translateZ(0)';
    });
    
    // Add click feedback effect
    iconClone.addEventListener('click', (e) => {
        // Create ripple effect for tactile feedback
        const rect = iconClone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'icon-ripple';
        ripple.style.position = 'absolute';
        ripple.style.top = `${y}px`;
        ripple.style.left = `${x}px`;
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.backgroundColor = 'rgba(240, 248, 255, 0.4)';
        ripple.style.borderRadius = '50%';
        ripple.style.transition = 'all 0.4s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        iconClone.appendChild(ripple);
        
        // Animate the ripple
        setTimeout(() => {
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.opacity = '0';
        }, 10);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 400);
    });
}

// Initialize parallax effect for home section
function initHomeParallax(isLowPowerDevice) {
    const homeSection = document.querySelector('.home');
    if (!homeSection) return;
    
    // Add floating animation to the background
    homeSection.style.backgroundPosition = 'center top';
    homeSection.style.transition = 'background-position 0.1s ease-out';
    
    // Mouse move parallax effect for the background
    if (!isLowPowerDevice) {
        const parallaxHandler = throttle((e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            homeSection.style.backgroundPosition = `calc(center + ${moveX}px) calc(top + ${moveY}px)`;
        }, 10); // Throttle to improve performance
        
        document.addEventListener('mousemove', parallaxHandler);
    }
    
    // Smooth scroll parallax
    const scrollHandler = throttle(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            homeSection.style.backgroundPositionY = `calc(top + ${scrollY * 0.4}px)`;
            
            // Fade out elements as user scrolls down
            const contentWrapper = homeSection.querySelector('.content-wrapper');
            if (contentWrapper) {
                contentWrapper.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
                contentWrapper.style.transform = `translateY(${scrollY * 0.2}px)`;
            }
        }
    }, 10); // Throttle to improve performance
    
    window.addEventListener('scroll', scrollHandler);
}

// Throttle function for better performance with frequent events
function throttle(func, wait) {
    let lastTime = 0;
    return function() {
        const now = Date.now();
        if (now - lastTime >= wait) {
            func.apply(this, arguments);
            lastTime = now;
        }
    };
}

// Debounce helper function to improve performance of event handlers
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Jobs page animations
function initJobsPageAnimations() {
    // Animate jobs title
    const jobsTitle = document.querySelector('.jobs-layout .heading .text-secondary');
    if (jobsTitle) {
        jobsTitle.style.animation = 'none';
        jobsTitle.style.opacity = '0';
        jobsTitle.style.transform = 'translateY(-20px)';
        jobsTitle.style.transition = 'all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        setTimeout(() => {
            jobsTitle.style.opacity = '1';
            jobsTitle.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Animate job cards with 3D perspective
    const jobCards = document.querySelectorAll('.Jobs');
    if (jobCards.length > 0) {
        jobCards.forEach((card, index) => {
            card.style.animation = 'none';
            card.style.opacity = '0';
            card.style.transform = 'perspective(1000px) rotateX(5deg) translateY(50px)';
            card.style.transition = `all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.3 + index * 0.15}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'perspective(1000px) rotateX(0) translateY(0)';
            }, 300 + index * 150);
            
            // Add 3D hover effect
            add3DHoverEffect(card);
        });
    }
    
    // Initialize parallax effect
    initParallaxEffect();
}

// Projects page animations
function initProjectsPageAnimations() {
    const projectCards = document.querySelectorAll('.Projects');
    
    if (projectCards.length > 0) {
        projectCards.forEach((card, index) => {
            card.style.animation = 'none';
            card.style.opacity = '0';
            card.style.transform = 'perspective(1000px) rotateY(10deg) translateZ(-50px)';
            card.style.transition = `all 0.8s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.3 + index * 0.1}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'perspective(1000px) rotateY(0) translateZ(0)';
            }, 300 + index * 100);
            
            // Add 3D hover effect
            add3DHoverEffect(card);
        });
    }
    
    // Animate project header
    const projectHeader = document.querySelector('.project__project-image');
    if (projectHeader) {
        projectHeader.style.animation = 'none';
        projectHeader.style.opacity = '0.6';
        projectHeader.style.transform = 'scale(0.98)';
        projectHeader.style.transition = 'all 1.2s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        setTimeout(() => {
            projectHeader.style.opacity = '1';
            projectHeader.style.transform = 'scale(1)';
        }, 200);
    }
}

// Certifications page animations
function initCertificationsPageAnimations() {
    // Animate certification cards with staggered 3D reveal
    const certCards = document.querySelectorAll('.certificate-content');
    
    if (certCards.length > 0) {
        certCards.forEach((card, index) => {
            card.style.animation = 'none';
            card.style.opacity = '0';
            card.style.transform = 'perspective(1000px) rotateX(10deg) translateY(50px)';
            card.style.transition = `all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.3 + index * 0.15}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'perspective(1000px) rotateX(0) translateY(0)';
            }, 400 + index * 150);
            
            // Add 3D hover effect
            add3DHoverEffect(card);
        });
    }
    
    // Animate certification heading
    const heading = document.querySelector('.certification #heading');
    if (heading) {
        heading.style.animation = 'none';
        heading.style.opacity = '0';
        heading.style.transform = 'translateY(-30px)';
        heading.style.transition = 'all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        setTimeout(() => {
            heading.style.opacity = '1';
            heading.style.transform = 'translateY(0)';
        }, 300);
    }
}

// About page animations
function initAboutPageAnimations() {
    // Animate about headings and content
    const aboutElements = document.querySelectorAll('.about h2, .about p, .about .about-details, .about .contact-email');
    
    if (aboutElements.length > 0) {
        aboutElements.forEach((element, index) => {
            element.style.animation = 'none';
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.3 + index * 0.1}s`;
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 300 + index * 100);
        });
    }
    
    // Initialize parallax effect
    initParallaxEffect();
}

// Universal animations and effects for all pages
function initUniversalAnimations() {
    // Smooth page transitions for internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        
        if (link && 
            link.href && 
            link.href.startsWith(window.location.origin) && 
            !link.getAttribute('target') && 
            !e.ctrlKey && 
            !e.metaKey) {
            
            e.preventDefault();
            const main = document.querySelector('main');
            
            if (main) {
                main.style.opacity = '0';
                main.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    window.location.href = link.href;
                }, 400);
            } else {
                window.location.href = link.href;
            }
        }
    });
    
    // Add scroll animations
    window.addEventListener('scroll', () => {
        animateOnScroll();
    });
    
    // Trigger initial scroll animations
    animateOnScroll();
}

// Create 3D hover effect for cards
function add3DHoverEffect(element) {
    const depth = parseFloat(element.getAttribute('data-depth') || 0.1);
    const hoverDepth = parseFloat(element.getAttribute('data-hover-depth') || 0.2);
    
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -hoverDepth * 10; 
        const rotateY = (x - centerX) / centerX * hoverDepth * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        element.style.transition = 'transform 0.1s ease-out';
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        element.style.transition = 'transform 0.6s ease';
    });
}

// Parallax effect for background elements
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.home, .about, .jobs-layout, .project__project-image');
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                
                parallaxElements.forEach(element => {
                    const speed = element.getAttribute('data-parallax-speed') || 0.2;
                    const yPos = -(scrollY * speed);
                    element.style.backgroundPositionY = `calc(center + ${yPos}px)`;
                });
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Set parallax speed attributes
    parallaxElements.forEach(element => {
        if (!element.getAttribute('data-parallax-speed')) {
            element.setAttribute('data-parallax-speed', '0.2');
        }
    });
}

// Animate elements when they come into view during scrolling
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        elements.forEach(element => {
            element.classList.add('in-view');
        });
    }
}

// Skills page animations with interactive elements - Modified to reduce toast notifications
function initSkillsPageAnimations() {
    // Check if this is the first visit to skills page
    const isFirstVisit = checkFirstTimeVisit('skills-page');
    
    // Animate skills heading with fade in and slide up
    const skillsHeading = document.querySelector('.skills__heading');
    if (skillsHeading) {
        skillsHeading.style.animation = 'none';
        skillsHeading.style.opacity = '0';
        skillsHeading.style.transform = 'translateY(20px)';
        skillsHeading.style.transition = 'all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        setTimeout(() => {
            skillsHeading.style.opacity = '1';
            skillsHeading.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Initialize VanillaTilt for 3D card hover effect
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".skills__card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            scale: 1.05
        });
    }
    
    // Automatically click the "All" tab when the page loads
    setTimeout(() => {
        const allTab = document.querySelector('.category-tab[data-category="all"]');
        if (allTab) {
            allTab.click();
        }
    }, 300);
    
    // Animate category tabs with staggered fade in
    const categoryTabs = document.querySelectorAll('.category-tab');
    if (categoryTabs.length > 0) {
        categoryTabs.forEach((tab, index) => {
            tab.style.animation = 'none';
            tab.style.opacity = '0';
            tab.style.transform = 'translateY(20px)';
            tab.style.transition = `all 0.5s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.4 + index * 0.1}s`;
            
            setTimeout(() => {
                tab.style.opacity = '1';
                tab.style.transform = 'translateY(0)';
            }, 500 + index * 100);
            
            // Add click event to show relevant skill group
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                categoryTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get category to display
                const category = tab.getAttribute('data-category');
                
                // Only show category change toast once per session
                const categoryToastShown = sessionStorage.getItem('skillsCategoryToastShown');
                if (!categoryToastShown) {
                    const categoryName = tab.textContent.trim();
                    showToast('Category Changed', `Now viewing ${categoryName} skills`, 'fa-solid fa-layer-group');
                    sessionStorage.setItem('skillsCategoryToastShown', 'true');
                }
                
                // Hide all skill groups initially
                const skillGroups = document.querySelectorAll('.skills__group');
                skillGroups.forEach(group => {
                    group.classList.remove('active');
                    group.classList.remove('active-all');
                    group.style.opacity = '0';
                    group.style.transform = 'translateY(20px)';
                });
                
                // If "All" is selected, show all skill groups with special formatting
                if (category === 'all') {
                    // Create a container for all skills if it doesn't exist
                    let allSkillsContainer = document.getElementById('all-skills');
                    if (!allSkillsContainer) {
                        allSkillsContainer = document.createElement('div');
                        allSkillsContainer.id = 'all-skills';
                        allSkillsContainer.className = 'skills__group';
                        document.querySelector('.skills__container').appendChild(allSkillsContainer);
                    }
                    
                    // Clear the all skills container
                    allSkillsContainer.innerHTML = '';
                    
                    // Collect all skill cards from different categories
                    let allCards = [];
                    skillGroups.forEach(group => {
                        if (group.id !== 'all-skills') {
                            const cards = group.querySelectorAll('.skills__card');
                            cards.forEach(card => {
                                allCards.push(card.cloneNode(true));
                            });
                        }
                    });
                    
                    // Add all cards to the all skills container
                    allCards.forEach(card => {
                        allSkillsContainer.appendChild(card);
                    });
                    
                    // Show the all skills container with proper spacing
                    allSkillsContainer.classList.add('active', 'active-all');
                    setTimeout(() => {
                        allSkillsContainer.style.opacity = '1';
                        allSkillsContainer.style.transform = 'translateY(0)';
                        animateSkillCards(allSkillsContainer);
                    }, 100);
                } else {
                    // Hide the all skills container if it exists
                    const allSkillsContainer = document.getElementById('all-skills');
                    if (allSkillsContainer) {
                        allSkillsContainer.classList.remove('active', 'active-all');
                    }
                    
                    // Show selected skill group with animation
                    const selectedGroup = document.getElementById(category);
                    if (selectedGroup) {
                        selectedGroup.classList.add('active');
                        setTimeout(() => {
                            selectedGroup.style.opacity = '1';
                            selectedGroup.style.transform = 'translateY(0)';
                            
                            // Animate cards within the active group
                            animateSkillCards(selectedGroup);
                        }, 100);
                    }
                }
            });
        });
    }
    
    // Animate skill cards with staggered fadeIn and 3D effect for initial active group
    const activeGroup = document.querySelector('.skills__group.active');
    if (activeGroup) {
        setTimeout(() => {
            animateSkillCards(activeGroup);
        }, 800);
    }
    
    // Add interactions for tech stack badges
    const techStackBadges = document.querySelectorAll('.tech-stack__badges img');
    if (techStackBadges.length > 0) {
        techStackBadges.forEach(badge => {
            badge.addEventListener('click', () => {
                const technology = badge.getAttribute('src').match(/badge\/([^-]+)/);
                // Only show badge toast once per session
                if (technology && technology[1] && !sessionStorage.getItem('techBadgeToastShown')) {
                    showToast(technology[1], 'One of my favorite technologies!', 'fa-solid fa-code');
                    sessionStorage.setItem('techBadgeToastShown', 'true');
                }
            });
        });
    }
    
    // Add 3D effect to skills globe elements
    const skillOrbitElements = document.querySelectorAll('.skill-orbit');
    if (skillOrbitElements.length > 0) {
        skillOrbitElements.forEach(element => {
            element.addEventListener('click', () => {
                // Get the name of the skill from icon class
                let skillName = '';
                const iconElement = element.querySelector('i');
                if (iconElement) {
                    if (iconElement.classList.contains('fa-react')) skillName = 'React';
                    else if (iconElement.classList.contains('fa-python')) skillName = 'Python';
                    else if (iconElement.classList.contains('fa-js')) skillName = 'JavaScript';
                    else if (iconElement.classList.contains('fa-node-js')) skillName = 'Node.js';
                    else if (iconElement.classList.contains('fa-html5')) skillName = 'HTML5';
                    else if (iconElement.classList.contains('fa-css3-alt')) skillName = 'CSS3';
                    else if (iconElement.classList.contains('fa-database')) skillName = 'Database';
                    else if (iconElement.classList.contains('fa-cloud')) skillName = 'Cloud Services';
                }
                
                // Only show orbit element toast once per session
                if (skillName && !sessionStorage.getItem('skillOrbitToastShown')) {
                    showToast(skillName, 'Click on the skill cards to learn more!', 'fa-solid fa-lightbulb');
                    sessionStorage.setItem('skillOrbitToastShown', 'true');
                }
                
                // Add pulse animation
                element.classList.add('pulse-animation');
                setTimeout(() => {
                    element.classList.remove('pulse-animation');
                }, 1000);
            });
        });
    }
    
    // Add click interaction to globe core
    const globeCore = document.querySelector('.skills__globe-core');
    const globeText = document.querySelector('.skills__globe-text');
    if (globeCore && globeText) {
        globeCore.addEventListener('click', () => {
            // Change text content
            if (globeText.textContent === 'Explore Skills') {
                globeText.textContent = 'Click Icons';
            } else if (globeText.textContent === 'Click Icons') {
                globeText.textContent = 'Awesome!';
            } else {
                globeText.textContent = 'Explore Skills';
            }
            
            // Only show globe core toast once per session
            if (!sessionStorage.getItem('globeCoreToastShown')) {
                showToast('Skills Overview', 'Interactive visualization of my key skills', 'fa-solid fa-globe');
                sessionStorage.setItem('globeCoreToastShown', 'true');
            }
            
            // Add pulse animation
            globeCore.classList.add('globe-pulse');
            setTimeout(() => {
                globeCore.classList.remove('globe-pulse');
            }, 1000);
        });
    }
    
    // Initialize progress bars animation
    initProgressBars();
    
    // Show keyboard shortcut hint only for first-time visitors
    if (isFirstVisit) {
        setTimeout(() => {
            const keyboardHint = document.createElement('div');
            keyboardHint.className = 'keyboard-hint';
            keyboardHint.innerHTML = `
                <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                    background: rgba(15, 15, 15, 0.8); color: white; padding: 10px 15px;
                    border-radius: 8px; font-size: 0.9rem; z-index: 9999; max-width: 90%;
                    text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3); opacity: 0;
                    transition: opacity 0.5s ease;">
                    <span style="font-weight: bold;">Pro Tip:</span> Use <kbd style="background: #444; padding: 2px 5px; border-radius: 3px;">Alt</kbd> + <kbd style="background: #444; padding: 2px 5px; border-radius: 3px;">Arrow Keys</kbd> to navigate between pages
                </div>
            `;
            document.body.appendChild(keyboardHint);
            
            // Show hint with animation after a delay
            setTimeout(() => {
                const hintElement = keyboardHint.querySelector('div');
                if (hintElement) {
                    hintElement.style.opacity = '1';
                    
                    // Auto-hide after a while
                    setTimeout(() => {
                        hintElement.style.opacity = '0';
                        
                        // Remove from DOM after fade out
                        setTimeout(() => {
                            if (keyboardHint.parentNode) {
                                keyboardHint.parentNode.removeChild(keyboardHint);
                            }
                        }, 500);
                    }, 5000);
                }
            }, 2000);
        }, 3000);
    }
}

// Toast notification function - Optimized for visibility and performance
function showToast(title, message, iconClass) {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.maxWidth = '280px';
        toastContainer.style.zIndex = '10000'; // Higher z-index to ensure visibility
        toastContainer.style.pointerEvents = 'none';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '8px';
        document.body.appendChild(toastContainer);
    }
    
    // Generate unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast element directly with JavaScript instead of using innerHTML
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.style.background = 'rgba(15, 15, 15, 0.95)'; // More opaque background
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.color = '#fff';
    toast.style.padding = '12px'; // Slightly larger padding
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)'; // Increased shadow for visibility
    toast.style.marginBottom = '8px';
    toast.style.display = 'flex';
    toast.style.pointerEvents = 'auto';
    toast.style.overflow = 'hidden';
    toast.style.position = 'relative';
    toast.style.borderLeft = '4px solid #f0f8ff'; // Thicker border
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    toast.style.fontSize = '0.9rem';
    toast.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)'; // Add transition here
    
    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.marginRight = '10px';
    iconContainer.style.fontSize = '1.2rem';
    iconContainer.style.color = '#f0f8ff';
    iconContainer.style.flexShrink = '0';
    iconContainer.style.width = '24px';
    iconContainer.style.height = '24px';
    
    // Create icon
    const icon = document.createElement('i');
    icon.className = iconClass;
    iconContainer.appendChild(icon);
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.justifyContent = 'center';
    contentContainer.style.color = '#fff';
    contentContainer.style.flex = '1';
    
    // Create title
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    titleElement.style.margin = '0 0 3px 0';
    titleElement.style.fontSize = '0.95rem'; // Slightly larger title
    titleElement.style.fontWeight = '600';
    contentContainer.appendChild(titleElement);
    
    // Create message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.margin = '0';
    messageElement.style.fontSize = '0.85rem'; // Slightly larger message
    messageElement.style.opacity = '0.9'; // More visible text
    contentContainer.appendChild(messageElement);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'rgba(255, 255, 255, 0.7)';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.marginLeft = '8px';
    closeButton.style.fontSize = '0.9rem';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.innerHTML = '<i class="fa-solid fa-times"></i>';
    closeButton.onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };
    
    // Add toast to container
    toast.appendChild(iconContainer);
    toast.appendChild(contentContainer);
    toast.appendChild(closeButton);
    toastContainer.appendChild(toast);
    
    // Force a reflow to ensure the toast animates properly
    void toast.offsetWidth;
    
    // Apply animation
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
    
    // Auto-remove toast after 5 seconds (increased from 4 for better visibility)
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Initialize progress bars
function initProgressBars() {
    // Find all skill cards in active group
    const activeGroup = document.querySelector('.skills__group.active');
    if (activeGroup) {
        const cards = activeGroup.querySelectorAll('.skills__card');
        cards.forEach(card => {
            addExpandCardEffect(card);
        });
    }
}

// Animate skill cards with staggered fadeIn and 3D effect
function animateSkillCards(container) {
    const cards = container.querySelectorAll('.skills__card');
    if (cards.length > 0) {
        // Use requestAnimationFrame to batch animations and avoid layout thrashing
        requestAnimationFrame(() => {
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'perspective(1000px) rotateY(5deg) translateZ(-20px)';
                card.style.transition = `all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.05 + index * 0.05}s`;
                
                // Use setTimeout to stagger animations efficiently
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'perspective(1000px) rotateY(0) translateZ(0)';
                    
                    // Add expand card functionality instead of flip
                    addExpandCardEffect(card);
                }, 150 + index * 50); // Reduced timing for better performance
            });
        });
    }
}

// Add expand effect to skill cards instead of flip
function addExpandCardEffect(card) {
    // Make sure the card has only one click event listener
    card.removeEventListener('click', cardClickHandler);
    card.addEventListener('click', cardClickHandler);
    
    // Create a data attribute to store the skill level for reference
    const progressBar = card.querySelector('.skills__progress-bar');
    if (progressBar) {
        const level = progressBar.getAttribute('data-level');
        card.setAttribute('data-skill-level', level);
        
        // Make the percentage text visible immediately
        const percentText = document.createElement('span');
        percentText.className = 'skills__progress-percent';
        percentText.textContent = level + '%';
        percentText.style.position = 'absolute';
        percentText.style.right = '10px';
        percentText.style.top = '-25px';
        percentText.style.color = '#fff';
        percentText.style.fontSize = '14px';
        percentText.style.fontWeight = 'bold';
        
        // Add it to the progress bar container
        const progressContainer = progressBar.parentElement;
        if (progressContainer && !progressContainer.querySelector('.skills__progress-percent')) {
            progressContainer.style.position = 'relative';
            progressContainer.appendChild(percentText);
        }
    }
}

// Card click handler function to avoid duplicate listeners
function cardClickHandler(e) {
    const card = this;
    
    // Check if this card is already expanded
    const isExpanded = card.classList.contains('expanded');
    
    // First collapse all expanded cards
    const allExpandedCards = document.querySelectorAll('.skills__card.expanded');
    allExpandedCards.forEach(expandedCard => {
        expandedCard.classList.remove('expanded');
        // Reset progress bar when card is collapsed
        const progressBar = expandedCard.querySelector('.skills__progress-bar');
        if (progressBar) {
            progressBar.style.width = '0';
        }
    });
    
    // If the clicked card wasn't already expanded, expand it
    if (!isExpanded) {
        card.classList.add('expanded');
        
        // Show toast notification about the skill
        const skillName = card.querySelector('h3').textContent.trim();
        const skillLevel = card.getAttribute('data-skill-level');
        showToast(skillName, `Proficiency: ${skillLevel}%`, 'fa-solid fa-chart-line');
        
        // Animate the progress bar
        const progressBar = card.querySelector('.skills__progress-bar');
        if (progressBar) {
            const level = progressBar.getAttribute('data-level');
            setTimeout(() => {
                progressBar.style.width = `${level}%`;
            }, 300);
        }
    }
}

// Add keyboard shortcuts for navigation
document.addEventListener('keydown', (e) => {
    // Process shortcuts if Alt key is pressed (to avoid interfering with normal typing)
    if (e.altKey) {
        switch (e.key) {
            // Existing letter shortcuts
            case 'h': // Alt+H for Home
                e.preventDefault();
                navigateTo('index.html');
                break;
            case 'j': // Alt+J for Jobs
                e.preventDefault();
                navigateTo('jobs.html');
                break;
            case 'p': // Alt+P for Projects
                e.preventDefault();
                navigateTo('projects.html');
                break;
            case 'c': // Alt+C for Certifications
                e.preventDefault();
                navigateTo('certification.html');
                break;
            case 's': // Alt+S for Skills
                e.preventDefault();
                navigateTo('skills.html');
                break;
            case 'a': // Alt+A for About
                e.preventDefault();
                navigateTo('about.html');
                break;
            case 'm': // Alt+M to toggle menu
                e.preventDefault();
                toggleMenu();
                break;
                
            // Add Arrow key shortcuts
            case 'ArrowRight': // Alt+Right Arrow for next page
                e.preventDefault();
                navigateNextPage();
                break;
            case 'ArrowLeft': // Alt+Left Arrow for previous page
                e.preventDefault();
                navigatePreviousPage();
                break;
            case 'ArrowUp': // Alt+Up Arrow for Home
                e.preventDefault();
                navigateTo('index.html');
                break;
            case 'ArrowDown': // Alt+Down Arrow for About (last page)
                e.preventDefault();
                navigateTo('about.html');
                break;
        }
    }
});

// Function to determine the next page in the navigation sequence
function navigateNextPage() {
    const pages = ['index.html', 'jobs.html', 'projects.html', 'certification.html', 'skills.html', 'about.html'];
    const currentPath = window.location.pathname;
    
    // Find current page index
    let currentIndex = -1;
    for (let i = 0; i < pages.length; i++) {
        if (currentPath.includes(pages[i]) || 
            (pages[i] === 'index.html' && currentPath.endsWith('/'))) {
            currentIndex = i;
            break;
        }
    }
    
    // Navigate to next page or loop back to first
    if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % pages.length;
        navigateTo(pages[nextIndex]);
    } else {
        // Default to home if page not found in sequence
        navigateTo('index.html');
    }
}

// Function to determine the previous page in the navigation sequence
function navigatePreviousPage() {
    const pages = ['index.html', 'jobs.html', 'projects.html', 'certification.html', 'skills.html', 'about.html'];
    const currentPath = window.location.pathname;
    
    // Find current page index
    let currentIndex = -1;
    for (let i = 0; i < pages.length; i++) {
        if (currentPath.includes(pages[i]) || 
            (pages[i] === 'index.html' && currentPath.endsWith('/'))) {
            currentIndex = i;
            break;
        }
    }
    
    // Navigate to previous page or loop back to last
    if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
        navigateTo(pages[prevIndex]);
    } else {
        // Default to home if page not found in sequence
        navigateTo('index.html');
    }
}

// Helper function for keyboard navigation
function navigateTo(url) {
    const main = document.querySelector('main');
    
    if (main) {
        // Show a toast notification about the navigation
        showToast('Keyboard Navigation', `Navigating to ${url.replace('.html', '')}`, 'fa-solid fa-keyboard');
        
        // Animate transition
        main.style.opacity = '0';
        main.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            window.location.href = url;
        }, 400);
    } else {
        window.location.href = url;
    }
}

// Add persistent session storage to track first-time visits
function checkFirstTimeVisit(pageName) {
    // Get or initialize the visitedPages object in sessionStorage
    let visitedPages = JSON.parse(sessionStorage.getItem('portfolioVisitedPages')) || {};
    
    // Check if this is the first visit to this page
    const isFirstVisit = !visitedPages[pageName];
    
    // If it's the first visit, mark the page as visited for future checks
    if (isFirstVisit) {
        visitedPages[pageName] = true;
        sessionStorage.setItem('portfolioVisitedPages', JSON.stringify(visitedPages));
    }
    
    return isFirstVisit;
}
