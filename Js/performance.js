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
  
  // Call preload function after a short delay
  setTimeout(preloadKeyPages, 1000);
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
  
  // Update progress bar width based on scroll position
  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    
    requestAnimationFrame(function() {
      document.querySelector('.scroll-progress').style.width = scrolled + '%';
    });
  }, { passive: true });
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
        rootMargin: '100px',
        threshold: 0.1
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }
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
        })
        .catch(function(error) {
          console.log('ServiceWorker registration failed: ', error);
        });
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