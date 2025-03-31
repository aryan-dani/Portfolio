const menuBtn = document.querySelector('.menu-btn');
const hamburger = document.querySelector('.menu-btn__burger');
const nav = document.querySelector('.nav');
const menuNav = document.querySelector('.menu-nav');
const navItems = document.querySelectorAll('.menu-nav__item');

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

// Page transition and animation enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add page transition effect
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = '0';
        main.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
            main.style.opacity = '1';
        }, 200);
    }
    
    // Enhanced social icons animation
    const socialIcons = document.querySelectorAll('.link-title');
    if (socialIcons.length > 0) {
        socialIcons.forEach((icon, index) => {
            // Remove any existing animation that may be interfering
            icon.style.animation = 'none';
            icon.style.opacity = '0';
            icon.style.transform = 'translateY(20px)';
            
            // Force browser reflow
            void icon.offsetWidth;
            
            // Apply smooth staggered entrance
            icon.style.transition = `all 0.5s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${0.3 + index * 0.1}s`;
            setTimeout(() => {
                icon.style.opacity = '1';
                icon.style.transform = 'translateY(0)';
            }, 100);
        });
    }
    
    // Apply project card staggered animations
    const projectCards = document.querySelectorAll('.Projects');
    if (projectCards.length > 0) {
        projectCards.forEach((card, index) => {
            card.style.setProperty('--project-index', index);
        });
    }
    
    // Apply job card staggered animations
    const jobCards = document.querySelectorAll('.Jobs');
    if (jobCards.length > 0) {
        jobCards.forEach((job, index) => {
            job.style.setProperty('--job-index', index);
            
            // Also set indices for job description items
            const jobItems = job.querySelectorAll('.content ul li');
            if (jobItems.length > 0) {
                jobItems.forEach((item, itemIndex) => {
                    item.style.setProperty('--item-index', itemIndex);
                });
            }
        });
    }
    
    // Apply certificate card staggered animations
    const certCards = document.querySelectorAll('.certificate-content');
    if (certCards.length > 0) {
        certCards.forEach((cert, index) => {
            cert.style.setProperty('--cert-index', index);
        });
    }
    
    // Initialize scroll-triggered animations
    initScrollAnimations();
    
    // Ensure main heading subtext remains visible
    const mainHeading = document.querySelector('.home h2');
    if (mainHeading) {
        // Clear any animations when mouse enters to prevent issues
        mainHeading.addEventListener('mouseenter', () => {
            mainHeading.style.opacity = '1';
        });
    }
});

// Detect when elements are in viewport to trigger animations
function initScrollAnimations() {
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        // Create an observer to watch for elements entering viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If element is in view
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Optional: Stop observing after animation is triggered
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // viewport
            threshold: 0.1, // trigger when 10% of element is visible
            rootMargin: '0px'
        });
        
        // Start observing each element
        if (animatedElements.length > 0) {
            animatedElements.forEach(el => {
                observer.observe(el);
            });
        }
        
        // Apply parallax effect to background elements - smoother implementation
        let ticking = false;
        let lastScrollPosition = window.pageYOffset;
        
        function parallaxScroll() {
            const scrollPosition = window.pageYOffset;
            
            // Apply subtle parallax to backgrounds with smoother animation
            document.querySelectorAll('.project__project-image, .jobs-layout, .home, .about')
                .forEach(el => {
                    // Only apply if element exists
                    if (el) {
                        const speed = 0.3; // Lower value = smoother parallax
                        const yPos = -(scrollPosition * speed);
                        el.style.backgroundPositionY = `calc(top + ${yPos}px)`;
                    }
                });
                
            // Reset ticking flag to allow next animation frame
            ticking = false;
        }
        
        // Throttle scroll events for better performance
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    parallaxScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

// Handle page transitions for links
document.addEventListener('click', (e) => {
    // Find closest link that's not external and within our site
    const link = e.target.closest('a');
    
    if (link && 
        link.href && 
        link.href.startsWith(window.location.origin) && 
        !link.getAttribute('target') && 
        !e.ctrlKey && 
        !e.metaKey) {
        
        e.preventDefault();
        const main = document.querySelector('main');
        
        // Fade out current page
        if (main) {
            main.style.opacity = '0';
            
            // Navigate after transition completes
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        } else {
            // Fallback if main not found
            window.location.href = link.href;
        }
    }
});
