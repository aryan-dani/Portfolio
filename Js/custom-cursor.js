/** @format */

document.addEventListener("DOMContentLoaded", () => {
	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;

	// Only run if motion is not reduced
	if (!prefersReducedMotion) {
		const cursorElement = document.createElement("div");
		cursorElement.classList.add("custom-cursor");
		cursorElement.classList.add("theme-cursor");
		// Enable hardware acceleration for the cursor
		cursorElement.style.willChange = "transform";
		cursorElement.style.pointerEvents = "none";
		document.body.appendChild(cursorElement);

		// Hide default cursor after custom cursor is appended
		document.body.style.cursor = "none";

		const magneticElements = document.querySelectorAll(
			'button, a[href], [role="button"], input[type="submit"], input[type="button"], [data-interactive="true"]'
		);
		const magneticThreshold = 80;
		const magneticForce = 0.5;
		const magneticDamping = 0.1;

		let mouseX = 0;
		let mouseY = 0;
		let cursorX = 0;
		let cursorY = 0;

		const elementStates = new Map();
		magneticElements.forEach((el) => {
			elementStates.set(el, {
				currentX: 0,
				currentY: 0,
				targetX: 0,
				targetY: 0,
			});
			// Enable hardware acceleration for magnetic elements
			el.style.willChange = "transform";
		});

		document.addEventListener("mousemove", (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		function animateCursor() {
			// Instantly follow the mouse for native-like speed
			cursorX = mouseX;
			cursorY = mouseY;

			cursorElement.style.transform = `translate3d(${
				cursorX - cursorElement.offsetWidth / 2
			}px, ${cursorY - cursorElement.offsetHeight / 2}px, 0)`;

			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			elementStates.forEach((state, el) => {
				const rect = el.getBoundingClientRect();
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
					const dx = cursorX - elCenterX;
					const dy = cursorY - elCenterY;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < magneticThreshold) {
						targetX = dx * magneticForce * (1 - distance / magneticThreshold);
						targetY = dy * magneticForce * (1 - distance / magneticThreshold);
						// Remove transition for instant response
						el.style.transition = "none";
					} else {
						if (state.currentX !== 0 || state.currentY !== 0) {
							el.style.transition = "none";
						}
					}
				} else {
					if (state.currentX !== 0 || state.currentY !== 0) {
						el.style.transition = "none";
					}
				}

				state.currentX += (targetX - state.currentX) * (1 - magneticDamping);
				state.currentY += (targetY - state.currentY) * (1 - magneticDamping);

				if (
					Math.abs(state.currentX) > 0.01 ||
					Math.abs(state.currentY) > 0.01 ||
					targetX !== 0 ||
					targetY !== 0
				) {
					el.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0)`;
				} else if (
					el.style.transform !== "translate3d(0px, 0px, 0px)" &&
					el.style.transform !== ""
				) {
					el.style.transform = "translate3d(0px, 0px, 0px)";
				}
			});

			requestAnimationFrame(animateCursor);
		}

		animateCursor();
	} else {
		document.body.style.cursor = "auto";
	}
});
