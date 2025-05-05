document.addEventListener("DOMContentLoaded", function () {
  initLazyLoading();
  registerServiceWorker();
  initIntersectionObserver(); // Keep this if used elsewhere
  applyReducedMotionPreferences();
});

function initLazyLoading() {
  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll("img:not([loading])");
    images.forEach((img) => {
      img.loading = "lazy";
    });
  } else {
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
    }
  }
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
  }
}
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      // Use root path for local development, adjust '/Portfolio/' prefix for deployment if needed
      const swPath = isLocal
        ? "service-worker.js" // Use relative path for local development
        : "/Portfolio/service-worker.js"; // Assuming deployment is in a /Portfolio/ subdirectory
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log(
            "Service Worker registered successfully with scope:",
            registration.scope
          );
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
          });
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            // Optionally, prompt the user to refresh or refresh automatically
            // window.location.reload();
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
function initIntersectionObserver(elements = null) {
  const elementsToObserve =
    elements ||
    document.querySelectorAll(
      ".animate-on-scroll, .skills__card" // Default selectors if no elements passed
    );
  if (elementsToObserve.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (entry.target.classList.contains("skills__card")) {
              const progressBar = entry.target.querySelector(
                ".skills__progress-bar"
              );
              if (
                progressBar &&
                progressBar.dataset.level &&
                (progressBar.style.width === "0%" || !progressBar.style.width)
              ) {
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
    elementsToObserve.forEach((element) => {
      if (element.classList.contains("skills__card")) {
        const progressBar = element.querySelector(".skills__progress-bar");
        if (progressBar && progressBar.dataset.level) {
          progressBar.style.width = "0%";
          progressBar.style.transition = "width 0.8s ease-out"; // Ensure transition is set
        }
      }
      observer.observe(element);
    });
  } else {
    elementsToObserve.forEach((element) => {
      element.classList.add("visible"); // Make elements visible immediately
    });
    if (!("IntersectionObserver" in window)) {
      console.warn(
        "IntersectionObserver not supported. Animations will show immediately."
      );
    }
  }
}
function applyReducedMotionPreferences() {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function updateMotionPreference(event) {
    if (event.matches) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  }
  updateMotionPreference(mediaQuery);
  mediaQuery.addEventListener("change", updateMotionPreference);
}
