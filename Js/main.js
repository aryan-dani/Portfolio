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
        hamburger.classList.add('open');
        nav.classList.add('open');
        menuNav.classList.add('open');
        navItems.forEach(item => item.classList.add('open'));
        
        showMenu = true;
    }
    else
    {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        menuNav.classList.remove('open');
        navItems.forEach(item => item.classList.remove('open'));
        showMenu = false;
    }
}

// Enhanced portfolio animations
document.addEventListener('DOMContentLoaded', () => {
    // Determine page type and add appropriate body class
    const pagePath = window.location.pathname;
    const isHomePage = pagePath.includes('index.html') || pagePath.endsWith('/');
    
    // Add class to body element to help with page-specific styling
    if (isHomePage) {
        document.body.classList.add('home-page');
    }
    
    // Initialize page transitions
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
    } else if (pagePath.includes('about.html')) {
        initAboutPageAnimations();
    }
    
    // Initialize universal animations
    initUniversalAnimations();
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

// Home page-specific animations
function initHomePageAnimations() {
    // Name animation with a more sophisticated effect - no bounce
    const name = document.querySelector('.home__name');
    if (name) {
        // Reset any existing animations
        name.style.animation = 'none';
        name.style.opacity = '0';
        name.style.transform = 'perspective(1000px) translateZ(-20px)';
        name.style.transition = 'all 1s cubic-bezier(0.165, 0.84, 0.44, 1)';
        
        // Animated text reveal effect - smooth and professional
        setTimeout(() => {
            name.style.opacity = '1';
            name.style.transform = 'perspective(1000px) translateZ(0)';
            
            // Add subtle shadow effect instead of bounce
            name.style.textShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        }, 300);
        
        // Add hover effect
        name.addEventListener('mouseenter', () => {
            name.style.transform = 'perspective(1000px) translateZ(15px)';
            name.style.textShadow = '0 15px 40px rgba(0, 0, 0, 0.4)';
        });
        
        name.addEventListener('mouseleave', () => {
            name.style.transform = 'perspective(1000px) translateZ(0)';
            name.style.textShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        });
    }
    
    // 3D perspective for the subtitle
    const subtitle = document.querySelector('.home h2');
    if (subtitle) {
        subtitle.style.animation = 'none';
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'perspective(1000px) rotateX(10deg) translateZ(-50px)';
        subtitle.style.transition = 'all 0.8s cubic-bezier(0.26, 0.86, 0.44, 0.985)';
        
        setTimeout(() => {
            subtitle.style.opacity = '1';
            subtitle.style.transform = 'perspective(1000px) rotateX(0) translateZ(0)';
            
            // Set permanent styles to prevent flickering
            subtitle.addEventListener('mouseenter', () => {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'perspective(1000px) rotateX(0) translateZ(20px)';
                subtitle.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
            });
            
            subtitle.addEventListener('mouseleave', () => {
                subtitle.style.transform = 'perspective(1000px) rotateX(0) translateZ(0)';
                subtitle.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });
        }, 600);
    }
    
    // Enhanced social icons reveal - Fixed to prevent leftward movement
    const socialIconsList = document.querySelector('.social-icons .link-list');
    if (socialIconsList) {
        // Ensure the list doesn't move from its original position
        socialIconsList.style.position = 'relative';
        socialIconsList.style.left = '0';
        socialIconsList.style.opacity = '0';
        socialIconsList.style.transition = 'opacity 0.8s ease';
        
        setTimeout(() => {
            socialIconsList.style.opacity = '1';
        }, 600);
    }
    
    const socialIcons = document.querySelectorAll('.link-title');
    if (socialIcons.length > 0) {
        socialIcons.forEach((icon, index) => {
            // Remove any existing inline styles that might be causing left movement
            icon.style.removeProperty('transform');
            icon.style.removeProperty('animation');
            
            // Set initial state - only use opacity and Y translation
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(20px)';
            icon.style.position = 'relative';
            icon.style.left = '0';
            icon.style.transition = `opacity 0.5s ease, transform 0.5s ease ${0.3 + index * 0.1}s`;
            
            // Force browser reflow
            void icon.offsetWidth;
            
            // Apply fade in animation without horizontal movement
            setTimeout(() => {
                icon.style.opacity = '1';
                icon.style.transform = 'translateY(0)';
            }, 800 + index * 100);
            
            // Add hover effect without horizontal movement
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'translateY(-5px)';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Add parallax effect to background
    initParallaxEffect();
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
            
            // Add 3D data attributes for mouse movement effect
            card.setAttribute('data-depth', '0.1');
            card.setAttribute('data-hover-depth', '0.2');
            
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
