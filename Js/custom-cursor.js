document.addEventListener("DOMContentLoaded", () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  console.log("[Cursor] Prefers Reduced Motion:", prefersReducedMotion); // DEBUG

  // Only run if motion is not reduced
  if (!prefersReducedMotion) {
    // Force hide default cursor via JS as well
    document.body.style.cursor = "none";

    const cursorElement = document.createElement("div");
    cursorElement.classList.add("custom-cursor");
    cursorElement.classList.add("theme-cursor");
    document.body.appendChild(cursorElement);
    console.log("[Cursor] Element appended:", cursorElement);

    const magneticElements = document.querySelectorAll(
      'button, a[href], [role="button"], input[type="submit"], input[type="button"], [data-interactive="true"]'
    );
    const magneticThreshold = 80; // Increased distance
    const magneticForce = 0.5; // Increased strength
    const magneticDamping = 0.5; // Smoothness of return (lower is faster)

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const speed = 1;

    // Store original positions and current offsets for magnetic elements
    const elementStates = new Map();
    magneticElements.forEach((el) => {
      elementStates.set(el, {
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
      });
      el.style.transition = `transform ${1 - magneticDamping}s ease-out`; // Add transition for smooth return
    });

    // Update mouse position
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animation loop for cursor and magnetic effect
    function animateCursor() {
      const dxCursor = mouseX - cursorX;
      const dyCursor = mouseY - cursorY;
      cursorX += dxCursor * speed;
      cursorY += dyCursor * speed;
      cursorElement.style.transform = `translate3d(${
        cursorX - cursorElement.offsetWidth / 2
      }px, ${cursorY - cursorElement.offsetHeight / 2}px, 0)`;

      elementStates.forEach((state, el) => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const dx = cursorX - elCenterX;
        const dy = cursorY - elCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let targetX = 0;
        let targetY = 0;

        if (distance < magneticThreshold) {
          // Calculate attraction force towards cursor
          targetX = dx * magneticForce * (1 - distance / magneticThreshold);
          targetY = dy * magneticForce * (1 - distance / magneticThreshold);
          // Ensure transition is fast when attracting
          el.style.transition = "transform 0.1s ease-out";
        } else {
          // Ensure transition is smooth when returning
          el.style.transition = `transform ${1 - magneticDamping}s ease-out`;
        }

        // Lerp the element's position towards the target (or 0,0)
        state.currentX += (targetX - state.currentX) * (1 - magneticDamping);
        state.currentY += (targetY - state.currentY) * (1 - magneticDamping);

        // Apply the transform
        el.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
      });

      requestAnimationFrame(animateCursor);
    }

    requestAnimationFrame(animateCursor);

    // ... (rest of the existing code for hover effects) ...

    // Define selectors for different interaction types
    const interactiveElementsSelector = `\
      a, button, [role="button"], input[type="submit"], input[type="button"],
      input[type="reset"], input[type="image"], select, label, summary, [onclick],
      .menu-btn, .skills__card, .project-card, .certificate-content,
      .certificate-image, .toast-close, .search-clear-btn, .retry-button,
      .cached-pages li a, .contact-btn, .submit-btn, .category-tab,
      .skill-modal__close, .preview-container .close-preview, .jobs-layout .Jobs h3 a,
      .project-links a, .tags-container h6, .social-icons a, .cta-button,
      .home__name, .project-card .content h3, [data-interactive]
    `;
    const textInputSelector = `\
      input[type="text"], input[type="email"], input[type="search"],
      input[type="password"], textarea
    `;

    // Use event delegation on the body for efficiency
    document.body.addEventListener("mouseover", (e) => {
      const target = e.target;
      if (target.closest(interactiveElementsSelector)) {
        cursorElement.classList.add("cursor--link-hovered");
        cursorElement.classList.remove("cursor--text-hovered");
      } else if (target.closest(textInputSelector)) {
        cursorElement.classList.add("cursor--text-hovered");
        cursorElement.classList.remove("cursor--link-hovered");
      } else {
        cursorElement.classList.remove(
          "cursor--link-hovered",
          "cursor--text-hovered"
        );
      }
    });

    document.body.addEventListener("mouseout", (e) => {
      const target = e.target;
      // Check if the element itself or its parent matches the selectors
      if (
        target.closest(interactiveElementsSelector) ||
        target.closest(textInputSelector)
      ) {
        // Check if the relatedTarget (where the mouse moved to) is outside the body or not interactive
        if (
          !document.body.contains(e.relatedTarget) ||
          (!e.relatedTarget?.closest(interactiveElementsSelector) &&
            !e.relatedTarget?.closest(textInputSelector))
        ) {
          cursorElement.classList.remove(
            "cursor--link-hovered",
            "cursor--text-hovered"
          );
        }
      }
    });

    // Hide cursor when leaving the window, show when entering
    document.addEventListener("mouseleave", () => {
      cursorElement.style.opacity = "0";

      // Reset magnetic elements
      elementStates.forEach((state, el) => {
        el.style.transition = `transform ${1 - magneticDamping}s ease-out`;
        el.style.transform = "translate(0px, 0px)";
        state.currentX = 0;
        state.currentY = 0;
      });
    });

    document.addEventListener("mouseenter", () => {
      cursorElement.style.opacity = "1";
    });
  } else {
    console.log("Custom cursor disabled due to reduced motion preference.");
    // Restore default cursors if motion is reduced
    document.body.style.cursor = "auto"; // Ensure default is restored
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input[type="submit"], input[type="button"], input[type="reset"], input[type="image"], select, label, summary, [onclick], .menu-btn, .skills__card, .project-card, .certificate-content, .certificate-image, .toast-close, .search-clear-btn, .retry-button, .cached-pages li a, .contact-btn, .submit-btn, .category-tab, .skill-modal__close, .preview-container .close-preview, .jobs-layout .Jobs h3 a, .project-links a, .tags-container h6, .social-icons a, .cta-button, .home__name, .project-card .content h3, [data-interactive]'
    );
    interactiveElements.forEach((el) => (el.style.cursor = "pointer"));
    const textInputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="search"], input[type="password"], textarea'
    );
    textInputs.forEach((el) => (el.style.cursor = "text"));
  }
});
