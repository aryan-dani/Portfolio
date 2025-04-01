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
    } else if (pagePath.includes('skills.html')) {
        initSkillsPageAnimations();
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

// Skills page animations with interactive elements
function initSkillsPageAnimations() {
    // Initialize particles.js for background effect
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ff7b00"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 4,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ff7b00",
                    opacity: 0.2,
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
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
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

// Toast notification function - Fixed to ensure visibility
function showToast(title, message, iconClass) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        // Create the toast container if it doesn't exist
        const newToastContainer = document.createElement('div');
        newToastContainer.className = 'toast-container';
        document.body.appendChild(newToastContainer);
        
        // Now use the newly created container
        return showToast(title, message, iconClass);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div class="toast" id="${toastId}">
            <div class="toast-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentNode.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 500);
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
