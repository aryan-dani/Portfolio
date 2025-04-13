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
