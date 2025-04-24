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
		// Adjusted damping for even faster return
		const magneticDamping = 0.1; // Smoothness of return (lower is faster, was 0.05)

		let mouseX = 0;
		let mouseY = 0;
		let cursorX = 0;
		let cursorY = 0;
		// Speed remains 1 for direct following - removed lerp below
		// const speed = 1;

		// Store original positions and current offsets for magnetic elements
		const elementStates = new Map();
		magneticElements.forEach((el) => {
			elementStates.set(el, {
				currentX: 0,
				currentY: 0,
				targetX: 0,
				targetY: 0,
			});
			// Removed setting transition here, will be set dynamically
			// el.style.transition = `transform ${1 - magneticDamping}s ease-out`;
		});

		// Update mouse position
		document.addEventListener("mousemove", (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		// Animation loop for cursor and magnetic effect
		function animateCursor() {
			// Direct assignment for immediate following (removed lerp)
			cursorX = mouseX;
			cursorY = mouseY;

			// Remove rounding for potentially smoother movement
			cursorElement.style.transform = `translate3d(${
				cursorX - cursorElement.offsetWidth / 2
			}px, ${cursorY - cursorElement.offsetHeight / 2}px, 0)`;

			// --- Optimization: Only check visible elements ---
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			elementStates.forEach((state, el) => {
				const rect = el.getBoundingClientRect();

				// Check if element is roughly within the viewport before calculating distance
				const isVisible =
					rect.top < viewportHeight &&
					rect.bottom > 0 &&
					rect.left < viewportWidth &&
					rect.right > 0;

				let targetX = 0;
				let targetY = 0;

				if (isVisible) {
					const elCenterX = rect.left + rect.width / 2;
					const elCenterY = rect.top + rect.height / 2;

					// Use direct cursor position (no rounding)
					const dx = cursorX - elCenterX;
					const dy = cursorY - elCenterY;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < magneticThreshold) {
						// Calculate attraction force towards cursor
						targetX = dx * magneticForce * (1 - distance / magneticThreshold);
						targetY = dy * magneticForce * (1 - distance / magneticThreshold);
						// Ensure transition is very fast when attracting
						el.style.transition = "transform 0.05s ease-out";
					} else {
						// Ensure transition is faster when returning
						if (state.currentX !== 0 || state.currentY !== 0) {
							el.style.transition = "transform 0.08s ease-out"; // Faster return (was 0.15s)
						}
					}
				} else {
					// If not visible, ensure it returns to 0,0 with the faster return transition
					if (state.currentX !== 0 || state.currentY !== 0) {
						el.style.transition = "transform 0.08s ease-out"; // Faster return (was 0.15s)
					}
				}

				// Lerp the element's position towards the target (or 0,0)
				// magneticDamping controls the return speed
				state.currentX += (targetX - state.currentX) * (1 - magneticDamping);
				state.currentY += (targetY - state.currentY) * (1 - magneticDamping);

				// Apply the transform only if needed (avoids unnecessary style changes)
				// Remove rounding here too
				if (
					Math.abs(state.currentX) > 0.01 || // Use a small threshold instead of 0.1
					Math.abs(state.currentY) > 0.01 ||
					targetX !== 0 ||
					targetY !== 0
				) {
					el.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
				} else if (
					el.style.transform !== "translate(0px, 0px)" &&
					el.style.transform !== ""
				) {
					// Explicitly reset transform if it's close to zero and not already reset
					el.style.transform = "translate(0px, 0px)";
				}
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
