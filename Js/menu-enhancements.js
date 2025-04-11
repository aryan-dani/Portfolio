/**
 * Enhanced menu functionality
 */

document.addEventListener("DOMContentLoaded", () => {
  // Calculate scrollbar width once to avoid layout shifts
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    scrollbarWidth + "px"
  );
  // Get the current page to display specific messages
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  // Initialize toast system and show page-specific messages
  setTimeout(() => {
    const pageName = currentPage.split(".")[0];
    switch (pageName) {
      case "index":
        window.toast.custom(
          "Welcome to my portfolio. Use the menu to navigate.",
          "home"
        );
        break;
      case "about":
        window.toast.custom(
          "Learn about my background and career journey.",
          "about"
        );
        break;
      case "projects":
        window.toast.custom(
          "Explore my featured projects. Click any card for details.",
          "projects"
        );
        break;
      case "skills":
        window.toast.custom(
          "Browse my technical skills and proficiency levels.",
          "skills"
        );
        break;
      case "jobs":
        window.toast.custom(
          "View my professional experience and work history.",
          "jobs"
        );
        break;
      case "certification":
        window.toast.custom(
          "Check out my professional certifications and credentials.",
          "certification"
        );
        break;
      default:
        window.toast.custom("Thanks for visiting my portfolio.", "default");
    }
  }, 1000);

  const menuBtn = document.querySelector(".menu-btn");
  const hamburger = document.querySelector(".menu-btn__burger");
  const nav = document.querySelector(".nav");
  const menuNav = document.querySelector(".menu-nav");
  const navItems = document.querySelectorAll(".menu-nav__item");

  let showMenu = false;

  // Improved menu toggle with better animation handling
  function toggleMenu() {
    if (!showMenu) {
      // Open menu

      // First make nav visible but menu items invisible
      menuNav.style.opacity = "0";
      nav.style.visibility = "visible";

      // Add classes for animations
      hamburger.classList.add("open");
      nav.classList.add("open");
      menuNav.classList.add("open");

      // Prevent body scrolling with proper scrollbar handling
      document.body.classList.add("menu-open");

      // Animate menu items staggered
      setTimeout(() => {
        menuNav.style.opacity = "1";

        // Staggered animation for items
        navItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("open");
          }, index * 60);
        });
      }, 100);

      showMenu = true;
    } else {
      // Close menu

      // First fade out menu items
      menuNav.style.opacity = "0";

      // Remove open class from menu items
      navItems.forEach((item) => item.classList.remove("open"));

      // Re-enable body scrolling
      document.body.classList.remove("menu-open");

      // Then after a short delay, close the menu
      setTimeout(() => {
        hamburger.classList.remove("open");
        nav.classList.remove("open");
        menuNav.classList.remove("open");

        // Hide menu after animation completes
        setTimeout(() => {
          if (!showMenu) {
            nav.style.visibility = "hidden";
          }
        }, 300);
      }, 100);

      showMenu = false;
    }
  }

  // Close menu when clicking on menu items
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (showMenu) {
        toggleMenu();
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      showMenu &&
      !e.target.closest(".menu-btn") &&
      !e.target.closest(".nav") &&
      !e.target.closest(".menu-nav")
    ) {
      toggleMenu();
    }
  });

  // Escape key to close menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showMenu) {
      toggleMenu();
    }
  });

  // Initialize menu button click handler
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });
});

/**
 * Enhanced toast notification system
 */
const toastSystem = {
  container: null,

  initialize() {
    // Create toast container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  },

  show(message, type = "info", duration = 5000) {
    this.initialize();

    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    // Create toast content
    const icon =
      type === "success"
        ? "check_circle"
        : type === "error"
        ? "error"
        : type === "warning"
        ? "warning"
        : "info";

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="material-icons">${icon}</i>
      </div>
      <div class="toast-content">
        <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
        <p>${message}</p>
      </div>
      <button class="toast-close">×</button>
    `;

    // Add to container
    this.container.appendChild(toast);

    // Add show class after a small delay (for animation)
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Add close functionality
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => this.close(toast));

    // Auto-close after duration
    if (duration) {
      setTimeout(() => {
        this.close(toast);
      }, duration);
    }

    // Return the toast element for potential further manipulation
    return toast;
  },

  close(toast) {
    if (!toast) return;

    toast.classList.remove("show");

    // Remove after animation completes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },
  success(message, duration) {
    return this.show(message, "success", duration);
  },

  error(message, duration) {
    return this.show(message, "error", duration);
  },

  warning(message, duration) {
    return this.show(message, "warning", duration);
  },

  info(message, duration) {
    return this.show(message, "info", duration);
  },
  // Custom toast to match portfolio's design and colors
  custom(message, type = "default", duration = 5000) {
    this.initialize();

    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast custom ${type}`;

    // Set icon and subtitle based on page type
    let icon = "star";
    let title = "Welcome";
    let subtitle = "Thanks for visiting my portfolio";

    if (type === "home") {
      icon = "home";
      title = "Home Page";
      subtitle = "Navigation options are in the menu";
    } else if (type === "projects") {
      icon = "code";
      title = "Projects Gallery";
      subtitle = "Click on any project to learn more";
    } else if (type === "skills") {
      icon = "construction";
      title = "Skills Overview";
      subtitle = "Technologies and tools I'm proficient with";
    } else if (type === "jobs") {
      icon = "work";
      title = "Work Experience";
      subtitle = "My professional journey so far";
    } else if (type === "about") {
      icon = "person";
      title = "About Me";
      subtitle = "Learn about my background and interests";
    } else if (type === "certification") {
      icon = "military_tech";
      title = "Certifications";
      subtitle = "My professional credentials and achievements";
    } // Create toast with portfolio-matching styling - simplified structure without subtitle
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="material-icons">${icon}</i>
      </div>
      <div class="toast-content">
        <p>${message}</p>
      </div>
      <button class="toast-close">×</button>
    `;

    // Add to container
    this.container.appendChild(toast);

    // Add show class after a small delay (for animation)
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Add close functionality
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => this.close(toast));

    // Auto-close after duration
    if (duration) {
      setTimeout(() => {
        this.close(toast);
      }, duration);
    }

    return toast;
  },
};

// Make toast system available globally
window.toast = toastSystem;
