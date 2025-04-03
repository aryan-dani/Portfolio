const menuBtn = document.querySelector('.menu-btn');
const hamburger = document.querySelector('.menu-btn__burger');
const nav = document.querySelector('.nav');
const menuNav = document.querySelector('.menu-nav');
const navItems = document.querySelectorAll('.menu-nav__item');
const main = document.querySelector('main');

let showMenu = false;

menuBtn.addEventListener('click', toggleMenu);

function toggleMenu()
{
    if(!showMenu)
    {
        // First prepare elements before showing them
        menuNav.style.opacity = '0';
        nav.style.visibility = 'visible';
        
        // Add open classes
        hamburger.classList.add('open');
        nav.classList.add('open');
        menuNav.classList.add('open');
        
        // Animate menu items in the original order
        setTimeout(() => {
            menuNav.style.opacity = '1';
            
            // Add open class to all menu items - CSS will handle the animation timing
            navItems.forEach(item => item.classList.add('open'));
            
            // Get the menu height and apply it as margin to main content
            setTimeout(() => {
                const menuHeight = menuNav.offsetHeight;
                main.style.marginTop = `${menuHeight}px`;
            }, 50);
        }, 50);
        
        showMenu = true;
    }
    else
    {
        // First fade out menu items
        menuNav.style.opacity = '0';
        
        // Immediately reset margin to prevent the weird shift
        main.style.marginTop = '0';
        
        // Remove open classes from menu items
        navItems.forEach(item => item.classList.remove('open'));
        
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

// Welcome notifications for each page
document.addEventListener('DOMContentLoaded', () => {
    // Determine page type and add appropriate body class
    const pagePath = window.location.pathname;
    const isHomePage = pagePath.includes('index.html') || pagePath.endsWith('/');
    
    // Add welcome toast based on page
    setTimeout(() => {
        if (isHomePage) {
            showToast('Welcome to My Portfolio', 'Explore my work and get to know me better', 'fa-solid fa-house-user');
        } else if (pagePath.includes('jobs.html')) {
            showToast('Professional Experience', 'Learn about my career journey and achievements', 'fa-solid fa-briefcase');
        } else if (pagePath.includes('projects.html')) {
            showToast('Portfolio Projects', 'Discover the projects I\'ve worked on', 'fa-solid fa-code');
        } else if (pagePath.includes('certification.html')) {
            showToast('My Certifications', 'Check out my professional qualifications', 'fa-solid fa-certificate');
        } else if (pagePath.includes('skills.html')) {
            showToast('Technical Skills', 'Explore my expertise across different technologies', 'fa-solid fa-laptop-code');
        } else if (pagePath.includes('about.html')) {
            showToast('About Me', 'Get to know me better', 'fa-solid fa-user');
        }
    }, 1000);
    
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
    
    // Add a particle background effect if not on a low-power device
    if (!isLowPowerDevice && typeof particlesJS !== 'undefined') {
        // Create particles container if it doesn't exist
        if (!document.getElementById('particles-home')) {
            const particlesContainer = document.createElement('div');
            particlesContainer.id = 'particles-home';
            particlesContainer.style.position = 'absolute';
            particlesContainer.style.top = '0';
            particlesContainer.style.left = '0';
            particlesContainer.style.width = '100%';
            particlesContainer.style.height = '100%';
            particlesContainer.style.zIndex = '0';
            particlesContainer.style.opacity = '0';
            particlesContainer.style.transition = 'opacity 2s ease';
            
            const homeSection = document.querySelector('.home');
            if (homeSection) {
                homeSection.style.position = 'relative';
                homeSection.insertBefore(particlesContainer, homeSection.firstChild);
                
                // Initialize particles with a subtle, professional effect
                setTimeout(() => {
                    particlesJS('particles-home', {
                        particles: {
                            number: { value: 80, density: { enable: true, value_area: 800 } },
                            color: { value: "#f0f8ff" },
                            shape: { type: "circle" },
                            opacity: { 
                                value: 0.3, 
                                random: true,
                                anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false }
                            },
                            size: { 
                                value: 3, 
                                random: true,
                                anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
                            },
                            line_linked: {
                                enable: true,
                                distance: 150,
                                color: "#f0f8ff",
                                opacity: 0.2,
                                width: 1
                            },
                            move: {
                                enable: true,
                                speed: 1,
                                direction: "none",
                                random: true,
                                straight: false,
                                out_mode: "out",
                                bounce: false
                            }
                        },
                        interactivity: {
                            detect_on: "canvas",
                            events: {
                                onhover: { enable: true, mode: "grab" },
                                onclick: { enable: true, mode: "push" },
                                resize: true
                            },
                            modes: {
                                grab: { distance: 140, line_linked: { opacity: 0.5 } },
                                push: { particles_nb: 3 }
                            }
                        },
                        retina_detect: true
                    });
                    
                    // Fade in the particles
                    particlesContainer.style.opacity = '0.7';
                }, 800);
            }
        }
    }
    
    // Enhanced name animation without the translucent rectangle
    const name = document.querySelector('.home__name');
    if (name) {
        // More dramatic entrance for the name
        name.style.animation = 'none';
        name.style.opacity = '0';
        name.style.transform = isLowPowerDevice ? 
            'translateY(-25px)' : 
            'perspective(1000px) translateZ(-30px) rotateX(10deg)';
        name.style.transition = 'all 1s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
        
        // Add a subtle glow/shadow without the translucent rectangle
        requestAnimationFrame(() => {
            setTimeout(() => {
                name.style.opacity = '1';
                name.style.transform = isLowPowerDevice ? 
                    'translateY(0)' : 
                    'perspective(1000px) translateZ(0) rotateX(0)';
                name.style.textShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                
                // Remove any existing nameRevealEffect if present
                const existingEffect = name.querySelector('div');
                if (existingEffect) {
                    existingEffect.remove();
                }
            }, 300);
        });
        
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
    
    // Improved subtitle animation with growing background for individual characters
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
        
        // Type characters one by one
        let charIndex = 0;
        const typingDelay = 100; // delay between characters in ms
        
        function typeNextChar() {
            if (charIndex < originalText.length) {
                // Add the next character to the text
                textSpan.textContent += originalText.charAt(charIndex);
                
                // Calculate width including a buffer for the cursor
                const newWidth = textSpan.offsetWidth + 15;
                
                // Grow the container to fit the text
                animContainer.style.width = `${newWidth}px`;
                
                // Move cursor to end of text
                cursor.style.left = `${newWidth - 10}px`;
                
                charIndex++;
                setTimeout(typeNextChar, typingDelay);
            } else {
                // Remove cursor after animation completes
                setTimeout(() => {
                    cursor.style.display = 'none';
                }, 2000);
            }
        }
        
        // Start typing after name animation completes
        setTimeout(typeNextChar, 1000);
    }
    
    // Advanced social icons animation
    const socialIconsList = document.querySelector('.social-icons .link-list');
    if (socialIconsList) {
        socialIconsList.style.position = 'relative';
        socialIconsList.style.opacity = '0';
        socialIconsList.style.transform = 'translateY(20px)';
        socialIconsList.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            socialIconsList.style.opacity = '1';
            socialIconsList.style.transform = 'translateY(0)';
        }, 1200);
    }
    
    // Enhanced staggered animation for social icons
    const socialIcons = document.querySelectorAll('.link-title');
    if (socialIcons.length > 0) {
        // Improved icon animations
        socialIcons.forEach((icon, index) => {
            // Clear any existing animations
            icon.style.animation = 'none';
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(20px) scale(0.9)';
            icon.style.transition = `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${1.2 + index * 0.1}s`;
            
            // Animate icons with a slight delay and spring effect
            setTimeout(() => {
                icon.style.opacity = '1';
                icon.style.transform = 'translateY(0) scale(1)';
            }, 1300);
            
            // Add an advanced hover effect with scale and 3D rotation
            icon.addEventListener('mouseenter', () => {
                // Get the social icon
                const iconElement = icon.querySelector('i');
                if (iconElement) {
                    iconElement.style.transform = 'scale(1.3)'; // Removed rotation, keeping only the scale effect
                    iconElement.style.color = 'rgba(240, 248, 255, 1)'; // Full brightness
                    iconElement.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease';
                    iconElement.style.textShadow = '0 0 15px rgba(240, 248, 255, 0.5)';
                }
                
                icon.style.transform = 'translateY(-5px)';
                icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
            
            icon.addEventListener('mouseleave', () => {
                const iconElement = icon.querySelector('i');
                if (iconElement) {
                    iconElement.style.transform = 'scale(1)';
                    iconElement.style.color = '';
                    iconElement.style.textShadow = 'none';
                }
                
                icon.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Background parallax effect
    const homeSection = document.querySelector('.home');
    if (homeSection) {
        // Add floating animation to the background
        homeSection.style.backgroundPosition = 'center top';
        homeSection.style.transition = 'background-position 0.1s ease-out';
        
        // Mouse move parallax effect for the background
        if (!isLowPowerDevice) {
            document.addEventListener('mousemove', (e) => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                homeSection.style.backgroundPosition = `calc(center + ${moveX}px) calc(top + ${moveY}px)`;
            });
        }
        
        // Smooth scroll parallax
        window.addEventListener('scroll', () => {
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
        });
    }
    
    // Use a more efficient parallax effect for older devices
    if (isLowPowerDevice) {
        initOptimizedParallaxEffect();
    }
    
    // Add pulse animation to CTA button if it exists
    const ctaButton = document.querySelector('.home .cta-button');
    if (ctaButton) {
        setTimeout(() => {
            ctaButton.style.animation = 'pulse 2s infinite';
            ctaButton.style.opacity = '0';
            ctaButton.style.transform = 'translateY(20px)';
            ctaButton.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                ctaButton.style.opacity = '1';
                ctaButton.style.transform = 'translateY(0)';
            }, 1800);
            
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
        }, 1500);
    }
}

// Optimized parallax effect that's more performance-friendly
function initOptimizedParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.home, .about, .jobs-layout, .project__project-image');
    
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    // Check if this is a low-power device
    const isLowPowerDevice = window.navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i) !== null;
    
    // Skip parallax on mobile/low-power devices
    if (isLowPowerDevice) {
        return;
    }
    
    // Use a throttled scroll handler
    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        
        if (!ticking) {
            requestAnimationFrame(() => {
                parallaxElements.forEach(element => {
                    const speed = parseFloat(element.getAttribute('data-parallax-speed') || 0.1); // Lower default speed
                    const yPos = -(lastScrollY * speed);
                    element.style.backgroundPositionY = `calc(center + ${yPos}px)`;
                });
                
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Set parallax speed attributes - using lower speeds
    parallaxElements.forEach(element => {
        if (!element.getAttribute('data-parallax-speed')) {
            element.setAttribute('data-parallax-speed', '0.1'); // Lower default speed
        }
    });
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

// Skills page animations with interactive elements
function initSkillsPageAnimations() {
    // Initialize particles.js for background effect with improved colors
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 100,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#f0f8ff" // Using DeepSkyBlue for better visibility
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 4,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 3,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#f0f8ff",
                    opacity: 0.3,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.8
                        }
                    },
                    push: {
                        particles_nb: 4
                    },
                    bubble: {
                        distance: 400,
                        size: 6,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3
                    }
                }
            },
            retina_detect: true
        });
    }

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
    
    // Show welcome toast notification
    setTimeout(() => {
        showToast('Welcome to Skills Section', 'Explore my technical abilities and expertise', 'fa-solid fa-rocket');
    }, 1000);
    
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
                
                // Show toast notification for category change
                const categoryName = tab.textContent.trim();
                showToast('Category Changed', `Now viewing ${categoryName} skills`, 'fa-solid fa-layer-group');
                
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
                if (technology && technology[1]) {
                    showToast(technology[1], 'One of my favorite technologies!', 'fa-solid fa-code');
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
                
                if (skillName) {
                    showToast(skillName, 'Click on the skill cards to learn more!', 'fa-solid fa-lightbulb');
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
            
            // Show toast message
            showToast('Skills Overview', 'Interactive visualization of my key skills', 'fa-solid fa-globe');
            
            // Add pulse animation
            globeCore.classList.add('globe-pulse');
            setTimeout(() => {
                globeCore.classList.remove('globe-pulse');
            }, 1000);
        });
    }
    
    // Initialize progress bars animation
    initProgressBars();
}

// Toast notification function - Fixed to ensure visibility across all pages
function showToast(title, message, iconClass) {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.maxWidth = '280px'; // Reduced from 350px
        toastContainer.style.zIndex = '9999';
        toastContainer.style.pointerEvents = 'none';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '8px'; // Reduced from 10px
        document.body.appendChild(toastContainer);
    }
    
    // Generate unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast element directly with JavaScript instead of using innerHTML
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.style.background = 'rgba(15, 15, 15, 0.9)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.color = '#fff';
    toast.style.padding = '10px'; // Reduced from 15px
    toast.style.borderRadius = '6px'; // Reduced from 8px
    toast.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)'; // Lighter shadow
    toast.style.marginBottom = '8px'; // Reduced from 10px
    toast.style.display = 'flex';
    toast.style.pointerEvents = 'auto';
    toast.style.overflow = 'hidden';
    toast.style.position = 'relative';
    toast.style.borderLeft = '3px solid #f0f8ff'; // aliceblue
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    toast.style.fontSize = '0.9rem'; // Added to make text smaller
    
    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.marginRight = '10px'; // Reduced from 15px
    iconContainer.style.fontSize = '1.2rem'; // Reduced from 1.5rem
    iconContainer.style.color = '#f0f8ff'; // aliceblue
    iconContainer.style.flexShrink = '0';
    iconContainer.style.width = '24px'; // Reduced from 30px
    iconContainer.style.height = '24px'; // Reduced from 30px
    
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
    titleElement.style.margin = '0 0 3px 0'; // Reduced margin
    titleElement.style.fontSize = '0.9rem'; // Reduced from default
    titleElement.style.fontWeight = '600';
    contentContainer.appendChild(titleElement);
    
    // Create message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.margin = '0';
    messageElement.style.fontSize = '0.8rem'; // Reduced from default
    messageElement.style.opacity = '0.8';
    contentContainer.appendChild(messageElement);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'rgba(255, 255, 255, 0.5)';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.marginLeft = '8px'; // Reduced from 10px
    closeButton.style.fontSize = '0.8rem'; // Reduced from 1rem
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
    toast.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)'; // Faster animation
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
    
    // Auto-remove toast after 4 seconds (reduced from 5)
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.remove();
                }
            }, 300); // Reduced from 500
        }
    }, 4000); // Reduced from 5000
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
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'perspective(1000px) rotateY(5deg) translateZ(-20px)';
            card.style.transition = `all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.1 + index * 0.1}s`;
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'perspective(1000px) rotateY(0) translateZ(0)';
                
                // Add expand card functionality instead of flip
                addExpandCardEffect(card);
            }, 200 + index * 100);
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
    // Only process shortcuts if Alt key is pressed (to avoid interfering with normal typing)
    if (e.altKey) {
        switch (e.key) {
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
        }
    }
});

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
