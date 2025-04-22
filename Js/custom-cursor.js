/** @format */

document.addEventListener("DOMContentLoaded", () => {
	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;
	// console.log("[Cursor] Prefers Reduced Motion:", prefersReducedMotion); // DEBUG - Removed

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
		// Adjusted speed for smoother cursor movement
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
			// Use lerp for smoother cursor following
			cursorX += (mouseX - cursorX) * speed;
			cursorY += (mouseY - cursorY) * speed;

			// Round values to avoid subpixel rendering issues that might cause blur/lag
			const roundedCursorX = Math.round(cursorX);
			const roundedCursorY = Math.round(cursorY);

			cursorElement.style.transform = `translate3d(${
				roundedCursorX - cursorElement.offsetWidth / 2
			}px, ${roundedCursorY - cursorElement.offsetHeight / 2}px, 0)`;

			elementStates.forEach((state, el) => {
				const rect = el.getBoundingClientRect();
				const elCenterX = rect.left + rect.width / 2;
				const elCenterY = rect.top + rect.height / 2;

				const dx = roundedCursorX - elCenterX; // Use rounded cursor position
				const dy = roundedCursorY - elCenterY; // Use rounded cursor position
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

				// Apply the transform - round values here too
				el.style.transform = `translate(${Math.round(
					state.currentX
				)}px, ${Math.round(state.currentY)}px)`;
			});

			requestAnimationFrame(animateCursor);
		}

		// Start the animation loop
		animateCursor();
	} else {
		// If reduced motion is preferred, ensure the default cursor is visible
		document.body.style.cursor = "auto";
	}
});
