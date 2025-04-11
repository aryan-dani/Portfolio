/**
 * Resource Hints Optimization
 * This script dynamically adds resource hints to improve page loading performance
 * without modifying existing HTML files
 *
 * @format
 */

(function () {
  // Execute when DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Resource hints optimization initialized");

    // Add preconnect hints for common external domains
    addPreconnect("https://fonts.googleapis.com");
    addPreconnect("https://fonts.gstatic.com");
    addPreconnect("https://kit.fontawesome.com");
    addPreconnect("https://cdn.jsdelivr.net");

    // Preload critical assets based on the current page
    preloadCriticalAssets();

    // Prefetch likely next pages
    prefetchNextPages();

    // Add other performance improvements
    enhanceImageLoading();
    optimizeThirdPartyScripts();
  });

  /**
   * Add preconnect hint for external domain
   * @param {string} url - The URL to preconnect to
   */
  function addPreconnect(url) {
    // Check if preconnect already exists
    if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = url;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }

  /**
   * Preload critical assets for the current page
   */
  function preloadCriticalAssets() {
    const currentPath = window.location.pathname;

    // Common critical assets for all pages
    const criticalCSS = ["/SCSS/main.css"];

    // Add common CSS files
    criticalCSS.forEach((url) => {
      preloadAsset(url, "style");
    });
    // Page-specific critical assets
    if (currentPath.includes("index.html") || currentPath.endsWith("/")) {
      // Home page
      preloadAsset("/Images/Header.jpg", "image", "(min-width: 501px)");
      preloadAsset("/Images/Header_Phone.jpg", "image", "(max-width: 500px)");
    } else if (currentPath.includes("projects.html")) {
      // Projects page - preload first project image
      preloadAsset("/Images/Home_Page.jpg", "image");
    } else if (currentPath.includes("skills.html")) {
      // Skills page has skill cards that could benefit from preloaded icons
      preloadAsset("https://kit.fontawesome.com/1267cf2b7d.js", "script");
    }
  }

  /**
   * Preload an asset with proper attributes
   * @param {string} url - The URL to preload
   * @param {string} type - The type of asset (style, script, image, font)
   * @param {string} media - Optional media query for the preload
   */
  function preloadAsset(url, type, media = "") {
    // Check if already preloaded
    if (document.querySelector(`link[rel="preload"][href="${url}"]`)) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = type;

    if (media) {
      link.media = media;
    }

    if (type === "font") {
      link.crossOrigin = "anonymous";
      link.type = "font/woff2"; // Adjust if using different font types
    }

    document.head.appendChild(link);
  }

  /**
   * Prefetch likely next pages based on current page
   */
  function prefetchNextPages() {
    const currentPath = window.location.pathname;
    let pagesToPrefetch = [];

    // Determine which pages to prefetch based on current page
    if (currentPath.includes("index.html") || currentPath.endsWith("/")) {
      pagesToPrefetch = ["jobs.html", "projects.html"];
    } else if (currentPath.includes("jobs.html")) {
      pagesToPrefetch = ["projects.html", "certification.html"];
    } else if (currentPath.includes("projects.html")) {
      pagesToPrefetch = ["skills.html", "about.html"];
    } else if (currentPath.includes("certification.html")) {
      pagesToPrefetch = ["skills.html", "about.html"];
    } else if (currentPath.includes("skills.html")) {
      pagesToPrefetch = ["about.html", "index.html"];
    } else if (currentPath.includes("about.html")) {
      pagesToPrefetch = ["index.html", "jobs.html"];
    }

    // Add prefetch links for the determined pages
    pagesToPrefetch.forEach((page) => {
      if (!document.querySelector(`link[rel="prefetch"][href="${page}"]`)) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = page;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Enhance image loading with loading="lazy" attribute
   * and responsive image handling
   */
  function enhanceImageLoading() {
    // Add loading="lazy" to images that don't already have it
    if ("loading" in HTMLImageElement.prototype) {
      document.querySelectorAll("img:not([loading])").forEach((img) => {
        // Don't lazy load images in the viewport or hero images
        if (!isInViewport(img) && !img.classList.contains("hero-image")) {
          img.loading = "lazy";
        }
      });
    }

    // Add image decode handling for smoother rendering
    document.querySelectorAll("img").forEach((img) => {
      if ("decode" in img) {
        img.decode().catch(() => {
          // Fallback if decode fails - do nothing, let the image load normally
        });
      }
    });
  }

  /**
   * Optimize loading of third-party scripts
   */
  function optimizeThirdPartyScripts() {
    // Find scripts that could be deferred or async
    document
      .querySelectorAll("script[src]:not([defer]):not([async])")
      .forEach((script) => {
        // Don't modify critical scripts
        if (
          script.src.includes("main.js") ||
          script.src.includes("performance.js")
        ) {
          return;
        }

        // Create a new script element with optimized loading
        const optimizedScript = document.createElement("script");
        optimizedScript.src = script.src;

        // Use defer for most third-party scripts to not block rendering
        optimizedScript.defer = true;

        // Analytics and tracking scripts can use async
        if (
          script.src.includes("analytics") ||
          script.src.includes("tag-manager")
        ) {
          optimizedScript.async = true;
        }

        // Replace the original script if possible
        if (script.parentNode) {
          script.parentNode.replaceChild(optimizedScript, script);
        }
      });
  }

  /**
   * Check if an element is in the viewport
   * @param {Element} element - The element to check
   * @return {boolean} - True if the element is in the viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
})();
