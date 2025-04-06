/**
 * Performance Optimizations for Portfolio Website
 * This file contains various optimizations for improving website performance
 * without affecting the existing stylesheets and animations.
 */

// Initialize performance optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("Performance.js: DOM loaded, initializing optimizations");
  
  // Add scroll progress indicator
  initScrollProgress();
  
  // Handle lazy loading of images
  initLazyLoading();
  
  // Register service worker for offline capabilities if supported
  registerServiceWorker();
  
  // Add intersection observer for animation on scroll
  initIntersectionObserver();
  
  // Initialize resource hints for faster navigation
  initResourceHints();
  
  // Initialize content visibility observer
  initContentVisibilityObserver();
  
  // Optimize font loading
  optimizeFontLoading();
  
  // Call preload function after a short delay
  setTimeout(preloadKeyPages, 1000);
  
  // Setup performance monitoring
  setupPerformanceMonitoring();
  
  // Optimize script loading
  optimizeScriptLoading();
  
  // Add image optimization
  optimizeImages();
  
  // Optimize memory usage
  optimizeMemoryUsage();
  
  // Implement event delegation for better performance
  implementEventDelegation();
  
  // Setup caching improvements
  setupCachingImprovements();
  
  // Optimize resource loading priorities
  optimizeResourcePriorities();
  
  // Initialize viewport-aware content loading
  initViewportAwareLoading();
  
  // Initialize performance debugging tools in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    initPerformanceDebugging();
  }
});

/**
 * Create and update scroll progress indicator
 */
function initScrollProgress() {
  // Create progress bar if it doesn't exist
  if (!document.querySelector('.scroll-progress')) {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
  }
  
  // Use throttled scroll handler for better performance
  let lastKnownScrollPosition = 0;
  let ticking = false;
  
  window.addEventListener('scroll', function() {
    lastKnownScrollPosition = window.scrollY;
    
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateScrollProgress(lastKnownScrollPosition);
        ticking = false;
      });
      
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Update scroll progress value - separated for better performance
 */
function updateScrollProgress(scrollPos) {
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  const scrolled = (scrollPos / (scrollHeight - clientHeight)) * 100;
  
  document.querySelector('.scroll-progress').style.width = scrolled + '%';
}

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
  // If the browser supports native lazy loading, use it
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    // Otherwise use Intersection Observer for lazy loading
    const lazyImages = document.querySelectorAll('img.lazy-load');
    
    if (lazyImages.length > 0) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              // Create a new image object to preload
              const tempImage = new Image();
              tempImage.src = img.dataset.src;
              
              // When the image is loaded, replace the src and add loaded class
              tempImage.onload = function() {
                img.src = img.dataset.src;
                img.classList.add('lazy-loaded');
              };
              
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '200px',
        threshold: 0
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
  
  // Also apply lazy loading to background images with data-background attribute
  const lazyBackgrounds = document.querySelectorAll('[data-background]');
  
  if (lazyBackgrounds.length > 0) {
    const backgroundObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          element.style.backgroundImage = `url(${element.dataset.background})`;
          backgroundObserver.unobserve(element);
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0
    });
    
    lazyBackgrounds.forEach(element => {
      backgroundObserver.observe(element);
    });
  }
}

/**
 * Register service worker for offline capabilities
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available, show update notification
                showToast('Portfolio updated! Refresh for latest version.', 'info', 10000);
              }
            });
          });
        })
        .catch(function(error) {
          console.log('ServiceWorker registration failed: ', error);
        });
        
      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker has taken control
        showToast('New content available! Please refresh the page.', 'info', 10000);
      });
    });
  }
}

/**
 * Initialize content visibility observer for better performance
 */
function initContentVisibilityObserver() {
  // Apply content-visibility to large sections
  const contentSections = document.querySelectorAll('.skills__group, .project-grid > .Projects');
  
  if (contentSections.length > 0 && 'IntersectionObserver' in window) {
    const options = {
      rootMargin: '400px 0px', // Start rendering before it's visible
      threshold: 0
    };
    
    const contentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Remove content-visibility: auto when in viewport
          entry.target.style.contentVisibility = 'visible';
          contentObserver.unobserve(entry.target);
        }
      });
    }, options);
    
    contentSections.forEach(section => {
      // Apply content-visibility: auto to all sections
      section.style.contentVisibility = 'auto';
      section.style.containIntrinsicSize = '0 500px';
      contentObserver.observe(section);
    });
  }
}

/**
 * Initialize intersection observer for animation on scroll
 */
function initIntersectionObserver() {
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  
  if (elementsToAnimate.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    });
    
    elementsToAnimate.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    elementsToAnimate.forEach(element => {
      element.classList.add('is-visible');
    });
  }
  
  // Special handling for skill cards
  const skillCards = document.querySelectorAll('.skills__card');
  
  if (skillCards.length > 0 && 'IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.classList.add('is-visible');
          
          // Animate progress bar if exists
          const progressBar = card.querySelector('.skills__progress-bar');
          if (progressBar && progressBar.dataset.level) {
            setTimeout(() => {
              progressBar.style.width = `${progressBar.dataset.level}%`;
            }, 100);
          }
          
          cardObserver.unobserve(card);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });
    
    skillCards.forEach(card => {
      cardObserver.observe(card);
    });
  }
}

/**
 * Initialize resource hints for faster navigation
 */
function initResourceHints() {
  // Preconnect to external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://kit.fontawesome.com',
    'https://cdn.jsdelivr.net'
  ];
  
  domains.forEach(domain => {
    if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

/**
 * Optimize font loading with font-display
 */
function optimizeFontLoading() {
  // Create a style element to add font-display property to any custom fonts
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap !important;
    }
    
    /* Apply font-display to any Google Fonts */
    [data-google-font], 
    [data-font] {
      font-display: swap !important;
    }
  `;
  document.head.appendChild(style);
  
  // Find any font preload links and add onload handler
  const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
  fontPreloads.forEach(link => {
    if (!link.hasAttribute('onload')) {
      link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
    }
  });
}

/**
 * Show toast notification 
 */
function showToast(message, type = 'info', duration = 5000) {
  const toastContainer = document.querySelector('.toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    toast.classList.add('toast-hidden');
    setTimeout(() => toast.remove(), 300);
  });
  
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);
  
  // Trigger reflow
  void toast.offsetWidth;
  
  // Show toast
  toast.classList.add('toast-visible');
  
  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-hidden');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }
  
  return toast;
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Debounce function to improve performance
 */
function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Preload key pages for faster navigation
 */
function preloadKeyPages() {
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Define pages to preload based on current page
  let pagesToPreload = [];
  
  if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
    pagesToPreload = ['jobs.html', 'projects.html'];
  } else if (currentPath.includes('jobs.html')) {
    pagesToPreload = ['index.html', 'projects.html'];
  } else if (currentPath.includes('projects.html')) {
    pagesToPreload = ['jobs.html', 'certification.html'];
  } else if (currentPath.includes('certification.html')) {
    pagesToPreload = ['projects.html', 'skills.html'];
  } else if (currentPath.includes('skills.html')) {
    pagesToPreload = ['certification.html', 'about.html'];
  } else if (currentPath.includes('about.html')) {
    pagesToPreload = ['skills.html', 'index.html'];
  }
  
  // Preload each page
  pagesToPreload.forEach(page => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = page;
    document.head.appendChild(link);
  });
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Monitor important performance metrics
    try {
      // Create performance observer for Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Log vital metrics
          console.log(`[Performance] ${entry.name}: ${entry.value}`);
          
          // Report to analytics (if implemented)
          // reportPerformance(entry.name, entry.value);
        });
      });
      
      // Observe LCP, FID, CLS
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
      
    } catch (e) {
      console.log('Performance monitoring not supported', e);
    }
  }
}

/**
 * Optimize script loading with async and defer attributes
 */
function optimizeScriptLoading() {
  // Find all script tags without async or defer
  const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
  
  scripts.forEach(script => {
    // Create a new optimized script tag
    const newScript = document.createElement('script');
    newScript.src = script.src;
    
    // Add appropriate loading attribute based on script type
    if (script.src.includes('fontawesome') || 
        script.src.includes('analytics') || 
        script.src.includes('cdn') ||
        script.src.includes('tag')) {
      // Non-critical scripts use async
      newScript.async = true;
    } else {
      // Critical scripts use defer to maintain execution order
      newScript.defer = true;
    }
    
    // Replace original script with optimized version
    if (script.parentNode) {
      script.parentNode.replaceChild(newScript, script);
    }
  });
}

/**
 * Optimize images to improve performance and reduce CLS
 */
function optimizeImages() {
  // Find all images without width/height attributes
  const images = document.querySelectorAll('img:not([width]):not([height])');
  
  images.forEach(img => {
    // If the image is already loaded, use its natural dimensions
    if (img.complete) {
      // Only set dimensions if they're not already specified
      if (!img.style.width && !img.style.height) {
        // Keep aspect ratio by setting just height or width
        img.style.height = 'auto';
        img.width = img.naturalWidth;
      }
    } else {
      // For images not yet loaded, set a listener to apply dimensions
      img.addEventListener('load', () => {
        if (!img.style.width && !img.style.height) {
          img.style.height = 'auto';
          img.width = img.naturalWidth;
        }
      });
    }
  });
  
  // Apply aspect ratio container to prevent layout shifts
  const imageContainers = document.querySelectorAll('.image-container');
  imageContainers.forEach(container => {
    const img = container.querySelector('img');
    if (img) {
      // If image has dimensions, set aspect ratio container
      if (img.complete && img.naturalWidth > 0) {
        const aspectRatio = (img.naturalHeight / img.naturalWidth) * 100;
        container.style.paddingBottom = `${aspectRatio}%`;
        container.style.position = 'relative';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
      } else {
        // For images not yet loaded
        img.addEventListener('load', () => {
          const aspectRatio = (img.naturalHeight / img.naturalWidth) * 100;
          container.style.paddingBottom = `${aspectRatio}%`;
          container.style.position = 'relative';
          img.style.position = 'absolute';
          img.style.top = '0';
          img.style.left = '0';
          img.style.width = '100%';
          img.style.height = '100%';
        });
      }
    }
  });
  
  // Check for supported image formats
  checkImageFormats();
}

/**
 * Check for modern image format support and optimize accordingly
 */
function checkImageFormats() {
  // Create a function to check support for specific formats
  const checkSupport = (format) => {
    const elem = document.createElement('canvas');
    if (!elem.getContext || !elem.getContext('2d')) {
      return false;
    }
    
    switch (format) {
      case 'webp':
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      case 'avif':
        return elem.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      default:
        return false;
    }
  };
  
  // Check for WebP and AVIF support
  const supportsWebP = checkSupport('webp');
  const supportsAVIF = checkSupport('avif');
  
  // Add classes to document root indicating support
  if (supportsWebP) {
    document.documentElement.classList.add('webp-support');
  }
  
  if (supportsAVIF) {
    document.documentElement.classList.add('avif-support');
  }
  
  // Replace JPG/PNG images with WebP/AVIF where possible
  if (supportsWebP || supportsAVIF) {
    const images = document.querySelectorAll('img[src$=".jpg"], img[src$=".png"], img[src$=".jpeg"]');
    
    images.forEach(img => {
      const currentSrc = img.src;
      const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('.'));
      const extension = currentSrc.substring(currentSrc.lastIndexOf('.'));
      
      // Set the most optimal format available
      if (supportsAVIF) {
        // Try to load AVIF version first
        const avifVersion = `${basePath}.avif`;
        
        // Create a test image to verify AVIF version exists
        const testImg = new Image();
        testImg.onload = () => { img.src = avifVersion; };
        testImg.onerror = () => {
          // Fallback to WebP if AVIF doesn't exist
          if (supportsWebP) {
            img.src = `${basePath}.webp`;
          }
        };
        testImg.src = avifVersion;
      } 
      // If only WebP is supported, use it directly
      else if (supportsWebP) {
        img.src = `${basePath}.webp`;
      }
    });
  }
}

/**
 * Memory management optimizations
 */
function optimizeMemoryUsage() {
  // Periodic cleanup of any references that might cause memory leaks
  let cleanupInterval;
  
  function performCleanup() {
    // Clean up any animation references that are no longer needed
    const offScreenElements = document.querySelectorAll('.animated.is-visible');
    offScreenElements.forEach(element => {
      // Check if element is far out of viewport
      const rect = element.getBoundingClientRect();
      if (rect.bottom < -500 || rect.top > window.innerHeight + 500) {
        // Remove any dynamic styles that might hold memory
        element.style.animation = 'none';
        element.style.transform = 'none';
        element.style.transition = 'none';
      }
    });
    
    // Clear any stale toast notifications
    const oldToasts = document.querySelectorAll('.toast:not(.toast-visible)');
    oldToasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
  
  // Set up periodic cleanup based on user interaction
  function setupCleanup() {
    // Clear previous interval if exists
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }
    
    // Run cleanup every 90 seconds while user is active
    cleanupInterval = setInterval(performCleanup, 90000);
  }
  
  // Start cleanup cycle
  setupCleanup();
  
  // Reset cleanup timer when user interacts with page
  ['scroll', 'click', 'keydown', 'mousemove'].forEach(eventType => {
    window.addEventListener(eventType, debounce(() => {
      setupCleanup();
    }, 300), { passive: true });
  });
  
  // Run cleanup when page becomes hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      performCleanup();
    } else {
      setupCleanup();
    }
  });
}

/**
 * Implement event delegation for better performance
 */
function implementEventDelegation() {
  // Get the main content container
  const mainContent = document.querySelector('main') || document.body;
  
  // Delegate common event types
  mainContent.addEventListener('click', handleDelegatedEvents, false);
  
  // Delegate hover effects for touch devices
  if ('ontouchstart' in window) {
    mainContent.addEventListener('touchstart', handleDelegatedEvents, { passive: true });
  }
}

/**
 * Handle delegated events to reduce individual event listeners
 */
function handleDelegatedEvents(event) {
  // Handle clicks on various interactive elements
  const target = event.target;
  
  // Skills card click handler
  if (target.closest('.skills__card')) {
    const card = target.closest('.skills__card');
    const skillName = card.querySelector('.skills__name')?.textContent || 'this skill';
    
    if (!card.classList.contains('card-clicked')) {
      card.classList.add('card-clicked');
      setTimeout(() => {
        card.classList.remove('card-clicked');
      }, 500);
    }
  }
  
  // Project card click handler
  if (target.closest('.Projects')) {
    const projectCard = target.closest('.Projects');
    
    // Toggle additional information or handle project clicks
    if (target.closest('.project__btn-view')) {
      // Handle view project button clicks
      const projectLink = target.closest('.project__btn-view').getAttribute('href');
      if (projectLink) {
        // Track the click analytics if needed
        console.log(`Project view click: ${projectLink}`);
      }
    }
  }
  
  // Menu toggle handling
  if (target.closest('.menu-toggle')) {
    const menuToggle = target.closest('.menu-toggle');
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    
    // Find the target menu by aria-controls
    const menuId = menuToggle.getAttribute('aria-controls');
    if (menuId) {
      const menu = document.getElementById(menuId);
      if (menu) {
        if (!isExpanded) {
          menu.classList.add('is-open');
        } else {
          menu.classList.remove('is-open');
        }
      }
    }
  }
}

/**
 * Setup caching improvements
 */
function setupCachingImprovements() {
  // Implement caching strategies for frequently accessed resources
  if ('caches' in window) {
    // Define different cache categories
    const staticCache = 'portfolio-static-v1';
    const imagesCache = 'portfolio-images-v1';
    const pagesCache = 'portfolio-pages-v1';
    
    // Cache static assets that rarely change
    caches.open(staticCache).then(cache => {
      cache.addAll([
        '/Js/main.js',
        '/Js/performance.js',
        '/SCSS/main.css'
      ]).catch(error => {
        console.error('Static caching failed:', error);
      });
    });
    
    // Cache images separately since they're larger
    caches.open(imagesCache).then(cache => {
      cache.addAll([
        '/Images/Header.jpg',
        '/Images/Header_Phone.jpg'
      ]).catch(error => {
        console.error('Image caching failed:', error);
      });
    });
    
    // Improve page navigation with dynamic page caching
    window.addEventListener('load', () => {
      // After page loads, prefetch and cache other main pages
      caches.open(pagesCache).then(cache => {
        const pagesToCache = [
          '/index.html',
          '/jobs.html',
          '/projects.html',
          '/skills.html',
          '/about.html',
          '/certification.html'
        ];
        
        // Don't cache the current page again
        const currentPath = window.location.pathname;
        const filteredPages = pagesToCache.filter(page => 
          !currentPath.endsWith(page) && 
          !(currentPath === '/' && page === '/index.html')
        );
        
        // Add all filtered pages to cache
        cache.addAll(filteredPages).catch(error => {
          console.error('Page caching failed:', error);
        });
      });
    });
    
    // Clean up old caches periodically
    const cacheAllowlist = [staticCache, imagesCache, pagesCache];
    
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            // Delete old cache versions
            return caches.delete(cacheName);
          }
        })
      );
    });
  }
}

/**
 * Optimize resource loading priorities
 * This helps the browser understand which resources are more important
 */
function optimizeResourcePriorities() {
  // Function to set fetch priority for resources
  function setPriority(selector, priority) {
    document.querySelectorAll(selector).forEach(el => {
      if ('fetchPriority' in el) {
        el.fetchPriority = priority;
      } else {
        // Fallback for browsers that don't support fetchPriority
        el.setAttribute('importance', priority);
      }
    });
  }
  
  // Set high priority for critical resources
  setPriority('link[rel="stylesheet"]', 'high');
  setPriority('.hero-image', 'high');
  setPriority('script[src*="main.js"]', 'high');
  
  // Set low priority for below-the-fold images
  setPriority('.below-fold img', 'low');
  
  // Modify resource loading based on network conditions
  if ('connection' in navigator) {
    const conn = navigator.connection;
    
    if (conn.saveData) {
      console.log('Data saver enabled - loading low resolution images');
      document.documentElement.classList.add('data-saver-mode');
    }
    
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      console.log('Slow connection detected - deferring non-critical resources');
      document.documentElement.classList.add('slow-connection');
      
      // Defer loading of non-critical resources
      document.querySelectorAll('img:not(.critical)').forEach(img => {
        img.loading = 'lazy';
        if (!img.hasAttribute('importance')) {
          img.setAttribute('importance', 'low');
        }
      });
    }
  }
}

/**
 * Initialize viewport-aware content loading
 * This function loads content progressively as the user scrolls
 * to improve initial page load performance
 */
function initViewportAwareLoading() {
  // Elements that will be loaded when they approach the viewport
  const deferredElements = document.querySelectorAll('[data-defer-load]');
  
  if (deferredElements.length > 0) {
    const viewportObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Get the data to load
          const dataType = element.getAttribute('data-defer-type') || 'html';
          const dataSource = element.getAttribute('data-defer-src');
          
          if (dataSource) {
            // Handle different types of deferred content
            switch (dataType) {
              case 'html':
                // Load HTML content
                fetch(dataSource)
                  .then(response => response.text())
                  .then(html => {
                    element.innerHTML = html;
                    element.removeAttribute('data-defer-load');
                    element.dispatchEvent(new CustomEvent('content-loaded'));
                  })
                  .catch(error => console.error('Error loading deferred content:', error));
                break;
                
              case 'component':
                // Load reusable component
                fetch(dataSource)
                  .then(response => response.text())
                  .then(html => {
                    element.innerHTML = html;
                    // Initialize any scripts in the component
                    const scripts = element.querySelectorAll('script');
                    scripts.forEach(script => {
                      const newScript = document.createElement('script');
                      if (script.src) {
                        newScript.src = script.src;
                      } else {
                        newScript.textContent = script.textContent;
                      }
                      document.head.appendChild(newScript);
                    });
                    element.removeAttribute('data-defer-load');
                    element.dispatchEvent(new CustomEvent('component-loaded'));
                  })
                  .catch(error => console.error('Error loading component:', error));
                break;
                
              case 'json':
                // Load and process JSON data
                fetch(dataSource)
                  .then(response => response.json())
                  .then(data => {
                    // Find the template to use
                    const templateId = element.getAttribute('data-template');
                    const template = document.getElementById(templateId);
                    
                    if (template) {
                      // Process template with JSON data
                      let html = '';
                      if (Array.isArray(data)) {
                        data.forEach(item => {
                          html += processTemplate(template.innerHTML, item);
                        });
                      } else {
                        html = processTemplate(template.innerHTML, data);
                      }
                      element.innerHTML = html;
                    } else {
                      // Just store the data for custom processing
                      element.dataset.jsonData = JSON.stringify(data);
                      element.dispatchEvent(new CustomEvent('json-loaded', { detail: data }));
                    }
                    element.removeAttribute('data-defer-load');
                  })
                  .catch(error => console.error('Error loading JSON data:', error));
                break;
            }
          }
          
          viewportObserver.unobserve(element);
        }
      });
    }, {
      rootMargin: '200px 0px',
      threshold: 0.1
    });
    
    deferredElements.forEach(element => {
      viewportObserver.observe(element);
    });
  }
}

/**
 * Process a template string with JSON data
 * Simple template processing for deferred JSON content
 */
function processTemplate(template, data) {
  let result = template;
  
  // Replace all {{property}} placeholders with actual data
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
  }
  
  return result;
}

/**
 * Initialize performance debugging tools
 */
function initPerformanceDebugging() {
  console.log('Performance debugging tools initialized');
  
  // Add visual indicators for Core Web Vitals
  createPerformanceDebugPanel();
  
  // Log detailed performance metrics
  if ('performance' in window) {
    // Log navigation timing
    setTimeout(() => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      console.group('📊 Page Load Performance');
      console.log(`🔄 DOM Content Loaded: ${Math.round(navEntry.domContentLoadedEventEnd)}ms`);
      console.log(`⚡ Load Time: ${Math.round(navEntry.loadEventEnd)}ms`);
      console.log(`⏱️ Time to First Byte: ${Math.round(navEntry.responseStart)}ms`);
      console.log(`🖼️ DOM Interactive: ${Math.round(navEntry.domInteractive)}ms`);
      console.groupEnd();
    }, 1000);
    
    // Track and report long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            console.warn(`🚨 Long Task detected: ${Math.round(entry.duration)}ms`, entry);
          });
        });
        
        longTaskObserver.observe({entryTypes: ['longtask']});
      } catch (e) {
        console.log('Long task observation not supported', e);
      }
    }
  }
  
  // Add keyboard shortcut to toggle performance panel
  document.addEventListener('keydown', event => {
    // Ctrl+Shift+P to toggle performance panel
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      togglePerformanceDebugPanel();
    }
  });
}

/**
 * Create visual debug panel for performance metrics
 */
function createPerformanceDebugPanel() {
  // Create panel container if it doesn't exist
  if (!document.getElementById('performance-debug-panel')) {
    const panel = document.createElement('div');
    panel.id = 'performance-debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      z-index: 9999;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      border-top-left-radius: 5px;
    `;
    
    // Add header with controls
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    `;
    header.innerHTML = `
      <strong>Performance Monitor</strong>
      <span id="perf-panel-toggle" style="cursor:pointer">Show</span>
    `;
    panel.appendChild(header);
    
    // Add sections for metrics
    const metricsContainer = document.createElement('div');
    metricsContainer.id = 'perf-metrics';
    metricsContainer.innerHTML = `
      <div>
        <span>FPS: </span><span id="fps-value">-</span>
      </div>
      <div>
        <span>LCP: </span><span id="lcp-value">-</span>
      </div>
      <div>
        <span>CLS: </span><span id="cls-value">-</span>
      </div>
      <div>
        <span>Memory: </span><span id="memory-value">-</span>
      </div>
      <div>
        <span>JS Heap: </span><span id="heap-value">-</span>
      </div>
    `;
    panel.appendChild(metricsContainer);
    
    // Add to document
    document.body.appendChild(panel);
    
    // Attach toggle event
    document.getElementById('perf-panel-toggle').addEventListener('click', () => {
      togglePerformanceDebugPanel();
    });
    
    // Start monitoring metrics
    startPerformanceMonitoring();
  }
}

/**
 * Toggle performance debug panel visibility
 */
function togglePerformanceDebugPanel() {
  const panel = document.getElementById('performance-debug-panel');
  const toggle = document.getElementById('perf-panel-toggle');
  
  if (panel) {
    const isVisible = panel.style.transform !== 'translateY(100%)';
    
    if (isVisible) {
      panel.style.transform = 'translateY(100%)';
      toggle.textContent = 'Show';
    } else {
      panel.style.transform = 'translateY(0)';
      toggle.textContent = 'Hide';
    }
  }
}

/**
 * Start continuous monitoring of performance metrics
 */
function startPerformanceMonitoring() {
  // FPS monitoring
  let lastFrameTime = performance.now();
  let frameCount = 0;
  
  // CLS monitoring
  let clsValue = 0;
  if ('PerformanceObserver' in window) {
    try {
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            document.getElementById('cls-value').textContent = clsValue.toFixed(3);
          }
        });
      });
      clsObserver.observe({type: 'layout-shift', buffered: true});
      
      // LCP monitoring
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        document.getElementById('lcp-value').textContent = `${Math.round(lastEntry.startTime)}ms`;
      });
      lcpObserver.observe({type: 'largest-contentful-paint', buffered: true});
    } catch (e) {
      console.log('Performance observation not supported', e);
    }
  }
  
  // Update metrics regularly
  function updateMetrics() {
    // Calculate FPS
    const now = performance.now();
    frameCount++;
    
    if (now - lastFrameTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
      document.getElementById('fps-value').textContent = fps;
      frameCount = 0;
      lastFrameTime = now;
      
      // Update memory usage if available
      if (performance.memory) {
        const memoryUsed = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        const memoryTotal = Math.round(performance.memory.totalJSHeapSize / (1024 * 1024));
        document.getElementById('memory-value').textContent = `${memoryUsed}MB / ${memoryTotal}MB`;
        document.getElementById('heap-value').textContent = `${Math.round(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100)}%`;
      }
    }
    
    requestAnimationFrame(updateMetrics);
  }
  
  // Start updating metrics
  requestAnimationFrame(updateMetrics);
}