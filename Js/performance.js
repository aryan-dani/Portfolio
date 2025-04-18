document.addEventListener("DOMContentLoaded", function () {
	console.log("Performance.js: DOM loaded, initializing optimizations");
	const persistedToastData = sessionStorage.getItem("pendingInfoToast");
	if (persistedToastData) {
		try {
			const toastData = JSON.parse(persistedToastData);
			showToast(
				toastData.message,
				toastData.type,
				toastData.duration, // Use original duration or a default
				toastData.title,
				toastData.iconClass,
				false // Add a flag to prevent re-saving
			);
			sessionStorage.removeItem("pendingInfoToast"); // Clear after showing
		} catch (e) {
			console.error("Error parsing persisted toast data:", e);
			sessionStorage.removeItem("pendingInfoToast"); // Clear invalid data
		}
	}
	initLazyLoading();
	registerServiceWorker();
	initIntersectionObserver();
	applyReducedMotionPreferences();
});
let toastContainer = null;
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
function showToast(
	message,
	type = "info",
	duration = 5000,
	title = null,
	iconClass = null,
	persistInfo = true // Added parameter to control persistence saving
) {
	ensureToastContainer(); // Make sure the container exists
	if (type === "info" && persistInfo) {
		const toastData = { message, type, duration, title, iconClass };
		try {
			sessionStorage.setItem("pendingInfoToast", JSON.stringify(toastData));
		} catch (e) {
			console.error("Error saving toast data to sessionStorage:", e);
		}
	}
	const toast = document.createElement("div");
	toast.className = `toast ${type}`; // Add type class for styling
	toast.setAttribute("role", "alert");
	toast.setAttribute("aria-live", "assertive");
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
	requestAnimationFrame(() => {
		toast.classList.add("show");
	});
	let dismissTimeout = null;
	if (duration > 0 && isFinite(duration)) {
		dismissTimeout = setTimeout(() => {
			dismissToast(toast);
		}, duration);
	}
	const closeButton = toast.querySelector(".toast-close");
	closeButton.addEventListener("click", () => {
		if (dismissTimeout) {
			clearTimeout(dismissTimeout); // Prevent auto-dismiss if manually closed
		}
		dismissToast(toast);
	});
}
function dismissToast(toast) {
	toast.classList.remove("show");
	setTimeout(() => {
		if (toast.parentNode) {
			toast.parentNode.removeChild(toast);
		}
	}, 300); // Match animation duration in CSS
}
function initLazyLoading() {
	if ("loading" in HTMLImageElement.prototype) {
		const images = document.querySelectorAll("img:not([loading])");
		images.forEach((img) => {
			img.loading = "lazy";
		});
		console.log("Performance.js: Native lazy loading enabled for images.");
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
			console.log(
				"Performance.js: IntersectionObserver lazy loading initialized for images."
			);
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
		console.log(
			"Performance.js: IntersectionObserver lazy loading initialized for backgrounds."
		);
	}
}
function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
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
					registration.addEventListener("updatefound", () => {
						const newWorker = registration.installing;
						console.log("Service Worker update found. New worker installing.");
					});
					navigator.serviceWorker.addEventListener("controllerchange", () => {
						console.log("New Service Worker activated. Refreshing page...");
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
		console.log(
			`Performance.js: IntersectionObserver initialized for ${elementsToObserve.length} elements.`
		);
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
			console.log("Performance.js: Reduced motion enabled.");
		} else {
			document.documentElement.classList.remove("reduced-motion");
			console.log("Performance.js: Reduced motion disabled.");
		}
	}
	updateMotionPreference(mediaQuery);
	mediaQuery.addEventListener("change", updateMotionPreference);
}
