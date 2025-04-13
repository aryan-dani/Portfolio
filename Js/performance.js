/** @format */

// Performance Optimizations for Portfolio Website
// This file contains various optimizations for improving website performance.

// Initialize performance optimizations when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("Performance.js: DOM loaded, initializing optimizations");

  // Add scroll progress indicator
  initScrollProgress();

  // Handle lazy loading of images - safely
  initLazyLoading();

  // Register service worker for offline capabilities if supported
  registerServiceWorker();

  // Add intersection observer for animation on scroll
  initIntersectionObserver();

  // Optimize font loading (preload links only)
  optimizeFontLoading();

  // Implement event delegation for better performance
  implementEventDelegation();

  // Apply reduced motion preferences (class toggle only)
  applyReducedMotionPreferences();
});

/**
 * Create and update scroll progress indicator
 */
function initScrollProgress() {
  // Create progress bar if it doesn't exist
  if (!document.querySelector(".scroll-progress")) {
    const progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    document.body.appendChild(progressBar);
  }

  // Use throttled scroll handler for better performance
  let lastKnownScrollPosition = 0;
  let ticking = false;

  window.addEventListener(
    "scroll",
    function () {
      lastKnownScrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateScrollProgress(lastKnownScrollPosition);
          ticking = false;
        });

        ticking = true;
      }
    },
    { passive: true }
  );
}

/**
 * Update scroll progress value - separated for better performance
 */
function updateScrollProgress(scrollPos) {
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  const scrolled = (scrollPos / (scrollHeight - clientHeight)) * 100;

  const progressBar = document.querySelector(".scroll-progress");
  if (progressBar) {
    progressBar.style.width = scrolled + "%";
  }
}

/**
 * Initialize lazy loading for images safely without changing source paths
 */
function initLazyLoading() {
  // If the browser supports native lazy loading, use it
  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll("img:not([loading])");
    images.forEach((img) => {
      img.loading = "lazy";
    });
    console.log("Performance.js: Native lazy loading enabled for images.");
  } else {
    // Otherwise use Intersection Observer for lazy loading
    // Only apply to images with data-src attribute to avoid breaking existing images
    const lazyImages = document.querySelectorAll("img[data-src]");

    if (lazyImages.length > 0) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.add("lazy-loaded");
                img.removeAttribute("data-src"); // Clean up attribute
                imageObserver.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: "200px",
          threshold: 0,
        }
      );

      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
      console.log(
        "Performance.js: IntersectionObserver lazy loading initialized for images."
      );
    }
  }

  // Also apply lazy loading to background images with data-background attribute
  const lazyBackgrounds = document.querySelectorAll("[data-background]");

  if (lazyBackgrounds.length > 0) {
    const backgroundObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            if (element.dataset.background) {
              element.style.backgroundImage = `url(${element.dataset.background})`;
              element.removeAttribute("data-background"); // Clean up attribute
              backgroundObserver.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: "200px 0px",
        threshold: 0,
      }
    );

    lazyBackgrounds.forEach((element) => {
      backgroundObserver.observe(element);
    });
    console.log(
      "Performance.js: IntersectionObserver lazy loading initialized for backgrounds."
    );
  }
}

/**
 * Initialize service worker registration for offline capabilities
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered successfully with scope:",
            registration.scope
          );

          // Check for service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            console.log("Service Worker update found. New worker installing.");
            // Optionally, show a notification to the user
            // Example: showToast("App Update Available", "Refresh to get the latest version", "fa-solid fa-arrow-rotate-right");
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  } else {
    console.log("Service Workers not supported in this browser.");
  }
}

/**
 * Initialize intersection observer for animation on scroll
 * Adds a 'visible' class to elements when they enter the viewport.
 * CSS should handle the actual animation/transition based on this class.
 */
function initIntersectionObserver() {
  const elementsToAnimate = document.querySelectorAll(
    ".animate-on-scroll, .skills__card" // Include relevant selectors
  );

  if (elementsToAnimate.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");

            // Special handling for skill cards progress bars
            if (entry.target.classList.contains("skills__card")) {
              const progressBar = entry.target.querySelector(
                ".skills__progress-bar"
              );
              if (
                progressBar &&
                progressBar.dataset.level &&
                (progressBar.style.width === "0%" || !progressBar.style.width)
              ) {
                // Animate progress bar width
                setTimeout(() => {
                  progressBar.style.width = `${progressBar.dataset.level}%`;
                }, 300); // Small delay for visual effect
              }
            }

            observer.unobserve(entry.target); // Stop observing once visible
          }
        });
      },
      {
        rootMargin: "0px 0px -100px 0px", // Trigger slightly before element is fully visible
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    elementsToAnimate.forEach((element) => {
      // Initialize progress bars to 0 width initially for skill cards
      if (element.classList.contains("skills__card")) {
        const progressBar = element.querySelector(".skills__progress-bar");
        if (progressBar && progressBar.dataset.level) {
          progressBar.style.width = "0%";
          progressBar.style.transition = "width 0.8s ease-out"; // Ensure transition is set
        }
      }
      observer.observe(element);
    });
    console.log(
      "Performance.js: IntersectionObserver for scroll animations initialized."
    );
  } else {
    // Fallback for browsers without IntersectionObserver or no elements found
    elementsToAnimate.forEach((element) => {
      element.classList.add("visible"); // Make elements visible immediately
    });
    if (!("IntersectionObserver" in window)) {
      console.warn(
        "IntersectionObserver not supported. Animations will show immediately."
      );
    }
  }
}

/**
 * Optimize font loading by ensuring preload links switch to stylesheet on load.
 * Recommendation: Add `onload="this.onload=null;this.rel='stylesheet'"` directly to the <link> tag in HTML.
 */
function optimizeFontLoading() {
  // Find any font preload links and add onload handler if missing
  const fontPreloads = document.querySelectorAll(
    'link[rel="preload"][as="font"]'
  );
  fontPreloads.forEach((link) => {
    if (!link.hasAttribute("onload")) {
      link.setAttribute("onload", "this.onload=null;this.rel='stylesheet'");
      console.log(
        `Performance.js: Added onload handler to font preload: ${link.href}`
      );
    }
  });
}

/**
 * Implement event delegation for better performance
 */
function implementEventDelegation() {
  // Get the main content container or body
  const mainContainer = document.querySelector("main") || document.body;

  // Delegate common event types like 'click'
  mainContainer.addEventListener("click", handleDelegatedEvents, false);

  // Delegate hover effects for touch devices if needed (example)
  // if ("ontouchstart" in window) {
  //   mainContainer.addEventListener("touchstart", handleDelegatedTouchEvents, { passive: true });
  // }
  console.log("Performance.js: Event delegation setup on main container.");
}

/**
 * Handle delegated events to reduce individual event listeners.
 * Focus on events that benefit most from delegation.
 */
function handleDelegatedEvents(event) {
  const target = event.target;

  // Example: Menu toggle handling (Consider moving to menu-specific JS if complex)
  if (target.closest(".menu-toggle")) {
    const menuToggle = target.closest(".menu-toggle");
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    const menuId = menuToggle.getAttribute("aria-controls");

    menuToggle.setAttribute("aria-expanded", !isExpanded);

    if (menuId) {
      const menu = document.getElementById(menuId);
      if (menu) {
        menu.classList.toggle("is-open", !isExpanded);
        console.log(
          `Menu ${menuId} toggled: ${!isExpanded ? "open" : "closed"}`
        );
      }
    }
  }

  // Add other delegated event handlers here as needed
  // e.g., handling clicks on dynamically added elements
}

/**
 * Apply reduced motion settings based on user preference by toggling a class.
 * Recommendation: Define corresponding styles in CSS using the `.reduced-motion` class
 * and `@media (prefers-reduced-motion: reduce)`.
 */
function applyReducedMotionPreferences() {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function updateMotionPreference(event) {
    if (event.matches) {
      document.documentElement.classList.add("reduced-motion");
      console.log("Performance.js: Reduced motion enabled.");
      // Optionally show a toast notification (ensure showToast function exists)
      // if (typeof showToast === "function") {
      //   showToast("Reduced Motion Enabled", "Animations minimized.", "fa-solid fa-universal-access");
      // }
    } else {
      document.documentElement.classList.remove("reduced-motion");
      console.log("Performance.js: Reduced motion disabled.");
    }
  }

  // Initial check
  updateMotionPreference(mediaQuery);

  // Listen for changes
  mediaQuery.addEventListener("change", updateMotionPreference);
}
