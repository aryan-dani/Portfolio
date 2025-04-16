/** @format */

// Performance Optimizations for Portfolio Website
// This file contains various optimizations for improving website performance.

// Initialize performance optimizations when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
	console.log("Performance.js: DOM loaded, initializing optimizations");

	// Add scroll progress indicator
	initScrollProgress();

	// Handle lazy loading of images - safely
	initLazyLoading();

	// Register service worker for offline capabilities if supported
	registerServiceWorker();

	// Add intersection observer for animation on scroll
	initIntersectionObserver();

	// Apply reduced motion preferences (class toggle only)
	applyReducedMotionPreferences();
});

// Global toast container reference
let toastContainer = null;

/**
 * Ensures the toast container exists in the DOM.
 */
function ensureToastContainer() {
	if (!toastContainer) {
		toastContainer = document.querySelector(".toast-container");
		if (!toastContainer) {
			toastContainer = document.createElement("div");
			toastContainer.className = "toast-container";
			document.body.appendChild(toastContainer);
		}
	}
}

/**
 * Displays a toast notification.
 * @param {string} message - The main message to display.
 * @param {string} type - Type of toast ('success', 'error', 'info', 'warning'). Determines icon and color.
 * @param {number} duration - How long the toast should be visible in milliseconds.
 * @param {string} title - Optional title for the toast.
 * @param {string} iconClass - Optional Font Awesome icon class (e.g., 'fa-solid fa-check-circle').
 */
function showToast(
	message,
	type = "info",
	duration = 5000,
	title = null,
	iconClass = null
) {
	ensureToastContainer(); // Make sure the container exists

	const toast = document.createElement("div");
	toast.className = `toast ${type}`; // Add type class for styling
	toast.setAttribute("role", "alert");
	toast.setAttribute("aria-live", "assertive");

	// Determine icon based on type or provided class
	let iconHtml = "";
	if (iconClass) {
		iconHtml = `<i class="${iconClass}"></i>`;
	} else {
		switch (type) {
			case "success":
				iconHtml = '<i class="fa-solid fa-check-circle"></i>';
				title = title || "Success";
				break;
			case "error":
				iconHtml = '<i class="fa-solid fa-times-circle"></i>';
				title = title || "Error";
				break;
			case "warning":
				iconHtml = '<i class="fa-solid fa-exclamation-triangle"></i>';
				title = title || "Warning";
				break;
			case "info":
			default:
				iconHtml = '<i class="fa-solid fa-info-circle"></i>';
				title = title || "Information";
				break;
		}
	}

	const toastContent = `
        <div class="toast-icon">
            ${iconHtml}
        </div>
        <div class="toast-content">
            ${title ? `<h4>${title}</h4>` : ""}
            <p>${message}</p>
        </div>
        <button class="toast-close" aria-label="Close notification">
            <i class="fa-solid fa-times"></i>
        </button>
    `;

	toast.innerHTML = toastContent;
	toastContainer.appendChild(toast);

	// Trigger animation
	requestAnimationFrame(() => {
		toast.classList.add("show");
	});

	// Auto-dismiss
	const dismissTimeout = setTimeout(() => {
		dismissToast(toast);
	}, duration);

	// Close button functionality
	const closeButton = toast.querySelector(".toast-close");
	closeButton.addEventListener("click", () => {
		clearTimeout(dismissTimeout); // Prevent auto-dismiss if manually closed
		dismissToast(toast);
	});
}

/**
 * Dismisses a specific toast notification with animation.
 * @param {HTMLElement} toast - The toast element to dismiss.
 */
function dismissToast(toast) {
	toast.classList.remove("show");
	// Remove the element after the fade-out animation completes
	setTimeout(() => {
		if (toast.parentNode) {
			toast.parentNode.removeChild(toast);
		}
	}, 300); // Match animation duration in CSS
}

/**
 * Create and update scroll progress indicator
 */
function initScrollProgress() {
	// Create progress bar if it doesn't exist
	if (!document.querySelector(".scroll-progress")) {
		const progressBar = document.createElement("div");
		progressBar.className = "scroll-progress";
		document.body.appendChild(progressBar);
	}

	// Use throttled scroll handler for better performance
	let lastKnownScrollPosition = 0;
	let ticking = false;

	window.addEventListener(
		"scroll",
		function () {
			lastKnownScrollPosition = window.scrollY;

			if (!ticking) {
				window.requestAnimationFrame(function () {
					updateScrollProgress(lastKnownScrollPosition);
					ticking = false;
				});

				ticking = true;
			}
		},
		{ passive: true }
	);
}

/**
 * Update scroll progress value - separated for better performance
 */
function updateScrollProgress(scrollPos) {
	const scrollHeight = document.documentElement.scrollHeight;
	const clientHeight = document.documentElement.clientHeight;
	const scrolled = (scrollPos / (scrollHeight - clientHeight)) * 100;

	const progressBar = document.querySelector(".scroll-progress");
	if (progressBar) {
		progressBar.style.width = scrolled + "%";
	}
}

/**
 * Initialize lazy loading for images safely without changing source paths
 */
function initLazyLoading() {
	// If the browser supports native lazy loading, use it
	if ("loading" in HTMLImageElement.prototype) {
		const images = document.querySelectorAll("img:not([loading])");
		images.forEach((img) => {
			img.loading = "lazy";
		});
		console.log("Performance.js: Native lazy loading enabled for images.");
	} else {
		// Otherwise use Intersection Observer for lazy loading
		// Only apply to images with data-src attribute to avoid breaking existing images
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
			console.log(
				"Performance.js: IntersectionObserver lazy loading initialized for images."
			);
		}
	}

	// Also apply lazy loading to background images with data-background attribute
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
		console.log(
			"Performance.js: IntersectionObserver lazy loading initialized for backgrounds."
		);
	}
}

/**
 * Initialize service worker registration for offline capabilities
 */
function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			// Determine the correct path based on hostname
			const isLocal =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1";
			const swPath = isLocal
				? "/service-worker.js"
				: "/Portfolio/service-worker.js"; // Adjust '/Portfolio/' if your repo name is different

			console.log(`Registering Service Worker from: ${swPath}`); // Log the path being used

			navigator.serviceWorker
				.register(swPath)
				.then((registration) => {
					console.log(
						"Service Worker registered successfully with scope:",
						registration.scope
					);

					// Listen for updates to the service worker
					registration.addEventListener("updatefound", () => {
						const newWorker = registration.installing;
						console.log("Service Worker update found. New worker installing.");
						// Optionally, notify the user about the update
						// Example: showToast("App Update Available", "Refresh to get the latest version", "fa-solid fa-arrow-rotate-right");
					});

					// Optionally, handle controller change (when new SW takes control)
					navigator.serviceWorker.addEventListener("controllerchange", () => {
						console.log("New Service Worker activated. Refreshing page...");
						// Optionally, reload the page or show a prompt
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

/**
 * Initialize intersection observer for animation on scroll
 * Adds a 'visible' class to elements when they enter the viewport.
 * CSS should handle the actual animation/transition based on this class.
 */
function initIntersectionObserver(elements = null) {
	// Accept optional elements
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

						// Special handling for skill cards progress bars
						if (entry.target.classList.contains("skills__card")) {
							const progressBar = entry.target.querySelector(
								".skills__progress-bar"
							);
							if (
								progressBar &&
								progressBar.dataset.level &&
								(progressBar.style.width === "0%" || !progressBar.style.width)
							) {
								// Animate progress bar width
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
			// Initialize progress bars to 0 width initially for skill cards
			if (element.classList.contains("skills__card")) {
				const progressBar = element.querySelector(".skills__progress-bar");
				if (progressBar && progressBar.dataset.level) {
					progressBar.style.width = "0%";
					progressBar.style.transition = "width 0.8s ease-out"; // Ensure transition is set
				}
			}
			observer.observe(element);
		});
		console.log(
			`Performance.js: IntersectionObserver initialized for ${elementsToObserve.length} elements.`
		);
	} else {
		// Fallback for browsers without IntersectionObserver or no elements found
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

/**
 * Apply reduced motion settings based on user preference by toggling a class.
 * Recommendation: Define corresponding styles in CSS using the `.reduced-motion` class
 * and `@media (prefers-reduced-motion: reduce)`.
 */
function applyReducedMotionPreferences() {
	const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

	function updateMotionPreference(event) {
		if (event.matches) {
			document.documentElement.classList.add("reduced-motion");
			console.log("Performance.js: Reduced motion enabled.");
			// Optionally show a toast notification (ensure showToast function exists)
			// if (typeof showToast === "function") {
			//   showToast("Reduced Motion Enabled", "Animations minimized.", "fa-solid fa-universal-access");
			// }
		} else {
			document.documentElement.classList.remove("reduced-motion");
			console.log("Performance.js: Reduced motion disabled.");
		}
	}

	// Initial check
	updateMotionPreference(mediaQuery);

	// Listen for changes
	mediaQuery.addEventListener("change", updateMotionPreference);
}
