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
  
  // Call preload function after a short delay
  setTimeout(preloadKeyPages, 1000);
  
  // Setup performance monitoring
  setupPerformanceMonitoring();
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