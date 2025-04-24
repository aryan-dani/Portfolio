/** @format */

document.addEventListener("DOMContentLoaded", () => {
	const cards = document.querySelectorAll(
		".project-card, .certificate-content, .skills__card" // Updated selector to include .project-card
	);
	cards.forEach((card) => {
		card.setAttribute("data-enhanced", "true"); // Mark card for CSS to ignore hover transform
		const intensity = 2;
		card.addEventListener("mousemove", (e) => {
			const rect = card.getBoundingClientRect();
			const cardWidth = rect.width;
			const cardHeight = rect.height;
			const centerX = rect.left + cardWidth / 2;
			const centerY = rect.top + cardHeight / 2;
			const mouseX = e.clientX;
			const mouseY = e.clientY;
			const rotateX = ((mouseY - centerY) / (cardHeight / 2)) * -intensity; // Invert Y rotation
			const rotateY = ((mouseX - centerX) / (cardWidth / 2)) * intensity;
			card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
			card.style.transition = "transform 0.1s ease-out"; // Smooth transition for mouse move
		});
		card.addEventListener("mouseleave", () => {
			card.style.transform =
				"perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
			card.style.transition =
				"transform 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)"; // Reset transition from mixin
		});
	});
});
