/** @format */

// Debounce function (simple version)
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

document.addEventListener("DOMContentLoaded", () => {
	const cards = document.querySelectorAll(
		".project-card, .certificate-content, .skills__card" // Updated selector to include .project-card
	);

	// --- Throttled mouse move handler ---
	const handleMouseMove = debounce((e, card, intensity) => {
		const rect = card.getBoundingClientRect();
		const cardWidth = rect.width;
		const cardHeight = rect.height;
		const centerX = rect.left + cardWidth / 2;
		const centerY = rect.top + cardHeight / 2;
		const mouseX = e.clientX;
		const mouseY = e.clientY;
		const rotateX = ((mouseY - centerY) / (cardHeight / 2)) * -intensity; // Invert Y rotation
		const rotateY = ((mouseX - centerX) / (cardWidth / 2)) * intensity;

		// Use requestAnimationFrame for smoother updates
		requestAnimationFrame(() => {
			card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
		});
	}, 16); // Throttle to roughly 60fps (1000ms / 60fps ≈ 16ms)

	cards.forEach((card) => {
		card.setAttribute("data-enhanced", "true"); // Mark card for CSS to ignore hover transform
		const intensity = 2;

		card.addEventListener("mousemove", (e) => {
			handleMouseMove(e, card, intensity);
			card.style.transition = "transform 0.05s linear"; // Faster, linear transition during move
		});

		card.addEventListener("mouseleave", () => {
			// Use requestAnimationFrame for smoother reset
			requestAnimationFrame(() => {
				card.style.transform =
					"perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
				card.style.transition =
					"transform 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)"; // Reset transition from mixin
			});
		});
	});
});
