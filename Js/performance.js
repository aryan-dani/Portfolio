/**
 * Performance Optimizations for Portfolio Website
 * This file contains various optimizations for improving website performance
 * without affecting the existing stylesheets and animations.
 */

// Execute when DOM is fully loaded - with safety checks
document.addEventListener('DOMContentLoaded', () => {
    console.log("Performance.js: DOM loaded, initializing optimizations");
    // Initialize with a small delay to allow the main script to run first
    setTimeout(() => {
        initPerformanceOptimizations();
    }, 100);
});

/**
 * Main function to initialize all performance optimizations
 */
function initPerformanceOptimizations() {
    try {
        console.log("Initializing performance optimizations");
        
        // First remove any page loader that might be blocking the view
        const pageLoader = document.querySelector('.page-loader');
        if (pageLoader) {
            pageLoader.classList.add('loaded');
            setTimeout(() => {
                if (pageLoader.parentNode) {
                    pageLoader.parentNode.removeChild(pageLoader);
                }
            }, 300);
        }
        
        // Apply image optimizations
        optimizeImages();
        
        // Apply lazy loading for off-screen content
        setupLazyLoading();
        
        // Optimize animation performance
        optimizeAnimations();
        
        // Optimize scroll events
        optimizeScrollEvents();
        
        // Preload critical resources
        preloadCriticalResources();
        
        // Enable resource hints
        setupResourceHints();
        
        // Performance metrics tracking
        trackPerformanceMetrics();
        
        // Set up intersection observer for element visibility
        setupIntersectionObserver();
        
        // Set up appropriate debounce and throttle for event handlers
        setupEventOptimization();
        
        // Memory management optimizations
        setupMemoryManagement();
        
        // Service worker registration (for caching and offline use)
        registerServiceWorker();
        
        console.log("Performance optimizations initialized successfully");
    } catch (error) {
        console.error("Error initializing performance optimizations:", error);
    }
}

/**
 * Optimize image loading and rendering
 */
function optimizeImages() {
    try {
        // Find all images on the page
        const images = document.querySelectorAll('img:not([loading="lazy"])');
        
        // Add loading="lazy" to images that don't already have it
        images.forEach(img => {
            // Skip small images or images that should load immediately (like logos)
            if (!img.classList.contains('critical-image')) {
                img.setAttribute('loading', 'lazy');
                
                // Store original src
                if (img.src && !img.dataset.src) {
                    img.dataset.src = img.src;
                    
                    // For non-visible images, remove the src to prevent loading until needed
                    // DISABLED for now to prevent display issues
                    // if (!isElementInViewport(img)) {
                    //     img.removeAttribute('src');
                    // }
                }
            }
            
            // Ensure all images have width and height attributes to prevent layout shifts
            if (!img.hasAttribute('width') && !img.hasAttribute('height') && img.naturalWidth && img.naturalHeight) {
                img.setAttribute('width', img.naturalWidth);
                img.setAttribute('height', img.naturalHeight);
            }
        });
        
        // Convert background images to <picture> elements where appropriate
        optimizeBackgroundImages();
    } catch (error) {
        console.error("Error in optimizeImages:", error);
    }
}

/**
 * Function to optimize background images by providing responsive options
 */
function optimizeBackgroundImages() {
    // Look for elements with data-bg-image attribute
    const bgElements = document.querySelectorAll('[data-bg-image]');
    
    bgElements.forEach(el => {
        const imagePath = el.getAttribute('data-bg-image');
        const mobilePath = el.getAttribute('data-bg-image-mobile') || imagePath;
        
        // Apply background image styles optimized for device width
        if (window.innerWidth <= 768) {
            el.style.backgroundImage = `url(${mobilePath})`;
        } else {
            el.style.backgroundImage = `url(${imagePath})`;
        }
        
        // Add event listener for resize (with debounce)
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth <= 768) {
                el.style.backgroundImage = `url(${mobilePath})`;
            } else {
                el.style.backgroundImage = `url(${imagePath})`;
            }
        }, 250));
    });
    
    // Special handling for home section to preserve gradient
    const homeSection = document.querySelector('.home');
    if (homeSection && !homeSection.hasAttribute('data-bg-image')) {
        if (window.innerWidth <= 768) {
            homeSection.style.background = `linear-gradient(to right, rgba(39, 39, 39, 0.9), rgba(39, 39, 39, 0)), url("Images/Header_Phone.jpg") center top`;
        } else {
            homeSection.style.background = `linear-gradient(to right, rgba(39, 39, 39, 0.9), rgba(39, 39, 39, 0)), url("Images/Header.jpg") center top`;
        }
        homeSection.style.backgroundSize = 'cover';
        homeSection.style.backgroundRepeat = 'no-repeat';
        homeSection.style.backgroundAttachment = 'fixed';
        
        // Update on resize
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth <= 768) {
                homeSection.style.background = `linear-gradient(to right, rgba(39, 39, 39, 0.9), rgba(39, 39, 39, 0)), url("Images/Header_Phone.jpg") center top`;
            } else {
                homeSection.style.background = `linear-gradient(to right, rgba(39, 39, 39, 0.9), rgba(39, 39, 39, 0)), url("Images/Header.jpg") center top`;
            }
            homeSection.style.backgroundSize = 'cover';
            homeSection.style.backgroundRepeat = 'no-repeat';
            homeSection.style.backgroundAttachment = 'fixed';
        }, 250));
    }
}

/**
 * Set up lazy loading for content that starts off-screen
 */
function setupLazyLoading() {
    // Check if the browser supports Intersection Observer
    if ('IntersectionObserver' in window) {
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Handle lazy loading for different element types
                    if (element.tagName === 'IMG') {
                        // For images
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                    } else if (element.tagName === 'IFRAME') {
                        // For iframes
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                    } else {
                        // For other elements with background images
                        if (element.dataset.background) {
                            element.style.backgroundImage = `url(${element.dataset.background})`;
                            element.removeAttribute('data-background');
                        }
                        
                        // For elements that should receive their content when visible
                        if (element.dataset.content) {
                            element.innerHTML = element.dataset.content;
                            element.removeAttribute('data-content');
                        }
                    }
                    
                    // Add a visible class for optional CSS effects
                    element.classList.add('lazy-loaded');
                    
                    // Stop observing the element after it's loaded
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '200px 0px', // Start loading when element is 200px from viewport
            threshold: 0.01 // Trigger when at least 1% of the target is visible
        });
        
        // Observe all elements with data-lazy attribute
        document.querySelectorAll('[data-lazy]').forEach(element => {
            lazyLoadObserver.observe(element);
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyLoadObserver.observe(img);
        });
        
        // Observe all iframes with data-src
        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            lazyLoadObserver.observe(iframe);
        });
    } else {
        // Fallback for browsers without Intersection Observer
        console.log('Intersection Observer not supported. Using fallback lazy loading.');
        setupLazyLoadingFallback();
    }
}

/**
 * Fallback lazy loading for browsers without Intersection Observer
 */
function setupLazyLoadingFallback() {
    // Function to check if elements are in viewport and load them
    const lazyLoadCheck = throttle(() => {
        const lazyElements = document.querySelectorAll('[data-lazy], img[data-src], iframe[data-src]');
        
        lazyElements.forEach(element => {
            if (isElementInViewport(element)) {
                if (element.tagName === 'IMG' && element.dataset.src) {
                    element.src = element.dataset.src;
                    element.removeAttribute('data-src');
                } else if (element.tagName === 'IFRAME' && element.dataset.src) {
                    element.src = element.dataset.src;
                    element.removeAttribute('data-src');
                } else if (element.dataset.background) {
                    element.style.backgroundImage = `url(${element.dataset.background})`;
                    element.removeAttribute('data-background');
                }
                
                element.classList.add('lazy-loaded');
            }
        });
    }, 200);
    
    // Attach to scroll and resize events
    window.addEventListener('scroll', lazyLoadCheck);
    window.addEventListener('resize', lazyLoadCheck);
    
    // Initial check
    lazyLoadCheck();
}

/**
 * Optimize animations for performance
 */
function optimizeAnimations() {
    // Use requestAnimationFrame for animations instead of setTimeout
    const animatedElements = document.querySelectorAll('.animate-me');
    
    animatedElements.forEach(element => {
        // Only start animations when element is near viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use the GPU for animations where possible
                    element.style.willChange = 'transform, opacity';
                    element.classList.add('animate-active');
                    
                    // Remove will-change after animation completes to free up resources
                    element.addEventListener('animationend', () => {
                        element.style.willChange = 'auto';
                    }, { once: true });
                    
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(element);
    });
    
    // Detect low-power devices and reduce animation complexity
    if (isLowPowerDevice()) {
        document.body.classList.add('reduce-animations');
    }
    
    // Disable animations during window resize for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        document.body.classList.add('resize-active');
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            document.body.classList.remove('resize-active');
        }, 200);
    });
}

/**
 * Optimize scroll events for performance
 */
function optimizeScrollEvents() {
    // Store scroll position for later use
    let lastScrollPosition = window.scrollY;
    let scrollDirection = 'down';
    let ticking = false;
    
    // Handle scroll events with throttle and requestAnimationFrame
    window.addEventListener('scroll', () => {
        // Determine scroll direction
        const currentScrollPosition = window.scrollY;
        scrollDirection = currentScrollPosition > lastScrollPosition ? 'down' : 'up';
        lastScrollPosition = currentScrollPosition;
        
        // Use requestAnimationFrame to ensure smooth performance
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Update scroll-based animations or elements
                updateOnScroll(currentScrollPosition, scrollDirection);
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

/**
 * Function to update elements based on scroll position
 */
function updateOnScroll(scrollPosition, direction) {
    // Only add the scroll class when actually scrolled down
    if (scrollPosition > 50) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
    
    // Add scroll direction class for directional animations
    document.body.classList.toggle('scroll-up', direction === 'up');
    document.body.classList.toggle('scroll-down', direction === 'down');
    
    // Optimize header visibility (show on scroll up, hide on scroll down)
    const header = document.querySelector('header');
    if (header) {
        if (direction === 'up') {
            header.classList.remove('header-hidden');
        } else if (direction === 'down' && scrollPosition > 200) {
            header.classList.add('header-hidden');
        }
    }
    
    // Calculate and set scroll progress if indicator exists
    const scrollIndicator = document.querySelector('.scroll-progress');
    if (scrollIndicator) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
        scrollIndicator.style.width = `${scrollPercentage}%`;
    }
}

/**
 * Preload critical resources needed for initial rendering
 */
function preloadCriticalResources() {
    // Preload critical images
    const criticalImages = [
        '/Images/Header.jpg',
        '/Images/Header_Phone.jpg'
    ];
    
    criticalImages.forEach(imageSrc => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = imageSrc;
        document.head.appendChild(preloadLink);
    });
    
    // Preload critical fonts
    const criticalFonts = [
        'https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap'
    ];
    
    criticalFonts.forEach(fontSrc => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'style';
        preloadLink.href = fontSrc;
        document.head.appendChild(preloadLink);
    });
}

/**
 * Set up resource hints for faster loading
 */
function setupResourceHints() {
    // DNS prefetch for external domains
    const domains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'kit.fontawesome.com',
        'cdn.jsdelivr.net'
    ];
    
    domains.forEach(domain => {
        const hint = document.createElement('link');
        hint.rel = 'dns-prefetch';
        hint.href = `//${domain}`;
        document.head.appendChild(hint);
        
        // Also add preconnect for important domains
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = `//${domain}`;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
    });
    
    // Prefetch next likely pages based on current page
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        prefetchLikelyNextPages(['projects.html', 'skills.html']);
    }
}

/**
 * Prefetch likely next pages
 */
function prefetchLikelyNextPages(pages) {
    pages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
    });
}

/**
 * Track and report performance metrics
 */
function trackPerformanceMetrics() {
    // Only run if Performance API is available
    if (window.performance && 'getEntriesByType' in performance) {
        // Report navigation timing metrics
        if (performance.getEntriesByType('navigation').length > 0) {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            const pageLoadTime = navigationEntry.loadEventEnd - navigationEntry.startTime;
            const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime;
            
            console.log(`Page Load Time: ${Math.round(pageLoadTime)}ms`);
            console.log(`DOM Content Loaded: ${Math.round(domContentLoaded)}ms`);
        }
        
        // Report resource timing metrics
        const resourceEntries = performance.getEntriesByType('resource');
        const largeResources = resourceEntries.filter(entry => entry.decodedBodySize > 100000);
        
        if (largeResources.length > 0) {
            console.log('Large resources that might need optimization:');
            largeResources.forEach(resource => {
                console.log(`${resource.name}: ${Math.round(resource.decodedBodySize / 1024)}KB`);
            });
        }
        
        // Check for long tasks (if available)
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log(`Long task detected: ${Math.round(entry.duration)}ms`);
                    });
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task observation not supported
            }
        }
    }
}

/**
 * Setup IntersectionObserver for optimized handling of element visibility
 */
function setupIntersectionObserver() {
    // Skip if not supported
    if (!('IntersectionObserver' in window)) return;
    
    // Create observer for elements that need visibility tracking
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Handle visible elements
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // Handle countup animations when elements become visible
                if (entry.target.classList.contains('countup')) {
                    animateCountUp(entry.target);
                }
                
                // Handle progress bars
                if (entry.target.classList.contains('skills__progress-bar')) {
                    const level = entry.target.getAttribute('data-level') || '0';
                    setTimeout(() => {
                        entry.target.style.width = `${level}%`;
                    }, 100);
                }
            } else {
                // Optionally remove visible class when element leaves viewport
                if (!entry.target.classList.contains('persist-animation')) {
                    entry.target.classList.remove('is-visible');
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    });
    
    // Observe elements that should animate on visibility
    document.querySelectorAll('.animate-on-scroll, .countup, .skills__progress-bar').forEach(el => {
        visibilityObserver.observe(el);
    });
}

/**
 * Animate count up effect when elements become visible
 */
function animateCountUp(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = parseInt(element.getAttribute('data-duration'), 10) || 2000;
    const startTime = performance.now();
    let currentCount = 0;
    
    function updateCount(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutExpo for smooth deceleration
        const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        currentCount = Math.floor(easedProgress * target);
        
        element.textContent = currentCount.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCount);
}

/**
 * Set up debounce and throttle for event handlers
 */
function setupEventOptimization() {
    // Optimize resize events
    const resizeHandlers = [];
    let resizeThrottleTimer;
    
    // Custom optimized resize listener
    function addOptimizedResizeListener(callback) {
        resizeHandlers.push(callback);
        
        // Make sure we only have one resize listener
        if (resizeHandlers.length === 1) {
            window.addEventListener('resize', handleOptimizedResize);
        }
    }
    
    function handleOptimizedResize() {
        // Use throttle to limit execution
        if (!resizeThrottleTimer) {
            resizeThrottleTimer = setTimeout(() => {
                resizeThrottleTimer = null;
                
                // Call all resize handlers with current dimensions
                const width = window.innerWidth;
                const height = window.innerHeight;
                
                resizeHandlers.forEach(handler => handler(width, height));
            }, 100);
        }
    }
    
    // Add any specific resize handlers needed
    addOptimizedResizeListener((width, height) => {
        // Update any elements that need to know about viewport changes
        updateResponsiveElements(width, height);
    });
    
    // Optimize scroll events in a similar way if needed
    optimizeScrollEvents();
}

/**
 * Update elements that need to respond to viewport changes
 */
function updateResponsiveElements(width, height) {
    // Update responsive elements based on current viewport
    const deviceClass = width <= 768 ? 'mobile' : (width <= 1024 ? 'tablet' : 'desktop');
    
    // Update device class on body
    document.body.classList.remove('mobile', 'tablet', 'desktop');
    document.body.classList.add(deviceClass);
    
    // Adjust hero sections based on viewport size
    const heroSections = document.querySelectorAll('.home, .project__project-image');
    heroSections.forEach(section => {
        // Optimize background image size based on viewport
        if (width <= 768) {
            section.style.backgroundImage = section.style.backgroundImage.replace('Header.jpg', 'Header_Phone.jpg');
        } else {
            section.style.backgroundImage = section.style.backgroundImage.replace('Header_Phone.jpg', 'Header.jpg');
        }
    });
    
    // Adjust any other elements that need to respond to viewport changes
}

/**
 * Set up memory management to prevent leaks
 */
function setupMemoryManagement() {
    // Keep track of event listeners for possible cleanup
    const listeners = [];
    
    // Enhanced addEventListener function that tracks listeners
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        listeners.push({ target: this, type, listener, options });
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Function to remove listeners when they're no longer needed
    window.cleanupEventListeners = function(selector) {
        const elements = document.querySelectorAll(selector);
        const toRemove = [];
        
        // Find listeners to remove
        listeners.forEach((item, index) => {
            elements.forEach(element => {
                if (item.target === element) {
                    // Remove the event listener
                    element.removeEventListener(item.type, item.listener, item.options);
                    toRemove.unshift(index); // Add index to removal list in reverse order
                }
            });
        });
        
        // Remove tracked listeners from our array
        toRemove.forEach(index => {
            listeners.splice(index, 1);
        });
    };
    
    // Clean up resources when page unloads
    window.addEventListener('unload', () => {
        // Clear any timeouts or intervals
        (window._timeouts || []).forEach(clearTimeout);
        (window._intervals || []).forEach(clearInterval);
        
        // Force browser to drop references
        listeners.length = 0;
    });
    
    // Create enhanced setTimeout that tracks IDs
    window._timeouts = [];
    window._setTimeoutOriginal = window.setTimeout;
    window.setTimeout = function(callback, delay) {
        const id = window._setTimeoutOriginal(callback, delay);
        window._timeouts.push(id);
        return id;
    };
    
    // Create enhanced clearTimeout that removes from tracking
    window._clearTimeoutOriginal = window.clearTimeout;
    window.clearTimeout = function(id) {
        const index = window._timeouts.indexOf(id);
        if (index !== -1) {
            window._timeouts.splice(index, 1);
        }
        return window._clearTimeoutOriginal(id);
    };
    
    // Similarly track intervals
    window._intervals = [];
    window._setIntervalOriginal = window.setInterval;
    window.setInterval = function(callback, delay) {
        const id = window._setIntervalOriginal(callback, delay);
        window._intervals.push(id);
        return id;
    };
    
    window._clearIntervalOriginal = window.clearInterval;
    window.clearInterval = function(id) {
        const index = window._intervals.indexOf(id);
        if (index !== -1) {
            window._intervals.splice(index, 1);
        }
        return window._clearIntervalOriginal(id);
    };
}

/**
 * Register a service worker for offline capabilities and caching
 * With added safety checks and error handling
 */
function registerServiceWorker() {
    try {
        if ('serviceWorker' in navigator) {
            // Delay service worker registration to ensure it doesn't block initial rendering
            setTimeout(() => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            }, 3000); // Increased delay to 3 seconds
        }
    } catch (error) {
        console.error("Error registering service worker:", error);
    }
}

/**
 * Utility function to check if an element is in viewport
 */
function isElementInViewport(el) {
    try {
        if (!el || el.nodeType !== 1) return false;
        
        const rect = el.getBoundingClientRect();
        
        return (
            rect.top >= -rect.height && 
            rect.left >= -rect.width && 
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + rect.width &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height
        );
    } catch (error) {
        console.error("Error in isElementInViewport:", error);
        return true; // Default to visible in case of error
    }
}

/**
 * Check if the device is a low-power device
 */
function isLowPowerDevice() {
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for battery info if available
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            // If battery is discharging and below 15%, consider it low power
            if (battery.dischargingTime < Infinity && battery.level < 0.15) {
                document.body.classList.add('low-power-mode');
            }
        });
    }
    
    // Check for connection type if available
    if ('connection' in navigator && navigator.connection.saveData) {
        document.body.classList.add('save-data-mode');
    }
    
    return isMobile;
}

/**
 * Utility throttle function to limit function execution frequency
 */
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

/**
 * Utility debounce function to delay execution until after events stop
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Ensure the page is visible immediately
window.addEventListener('load', () => {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
});