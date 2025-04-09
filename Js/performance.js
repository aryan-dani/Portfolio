/** @format */

// Performance Optimizations for Portfolio Website
// This file contains various optimizations for improving website performance
// without affecting the existing stylesheets and animations.

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

	// Initialize resource hints for faster navigation
	initResourceHints();

	// Initialize content visibility observer
	initContentVisibilityObserver();

	// Optimize font loading
	optimizeFontLoading();

	// Call preload function after a short delay
	setTimeout(preloadKeyPages, 1000);

	// Setup performance monitoring
	setupPerformanceMonitoring();

	// Optimize script loading
	optimizeScriptLoading();

	// Optimize memory usage
	optimizeMemoryUsage();

	// Implement event delegation for better performance
	implementEventDelegation();

	// Setup caching improvements
	setupCachingImprovements();

	// Optimize resource loading priorities
	optimizeResourcePriorities();

	// Initialize viewport-aware content loading
	initViewportAwareLoading();

	// Apply reduced motion preferences
	applyReducedMotionPreferences();
	
	// Initialize battery status detection
	detectBatteryStatus();
});

/**
 * Enhanced animation utility
 * Uses the Web Animation API for better performance over CSS animations
 */
function createAnimationHelper() {
	// Helper to check if requestAnimationFrame and Web Animation API are supported
	const isModernBrowser = "animate" in Element.prototype;

	// Store animation instances for proper cleanup
	const animationRegistry = new Map();

	// Animation presets with performance-optimized properties
	const presets = {
		fadeIn: {
			keyframes: [
				{ opacity: 0, transform: "translateY(20px)" },
				{ opacity: 1, transform: "translateY(0)" },
			],
			options: {
				duration: 600,
				easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
				fill: "forwards",
			},
		},
		fadeInLeft: {
			keyframes: [
				{ opacity: 0, transform: "translateX(-30px)" },
				{ opacity: 1, transform: "translateX(0)" },
			],
			options: {
				duration: 600,
				easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
				fill: "forwards",
			},
		},
		fadeInRight: {
			keyframes: [
				{ opacity: 0, transform: "translateX(30px)" },
				{ opacity: 1, transform: "translateX(0)" },
			],
			options: {
				duration: 600,
				easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
				fill: "forwards",
			},
		},
		pulse: {
			keyframes: [
				{ transform: "scale(1)" },
				{ transform: "scale(1.05)" },
				{ transform: "scale(1)" },
			],
			options: { duration: 1500, iterations: Infinity },
		},
		float: {
			keyframes: [
				{ transform: "translateY(0)" },
				{ transform: "translateY(-10px)" },
				{ transform: "translateY(0)" },
			],
			options: { duration: 3000, iterations: Infinity, easing: "ease-in-out" },
		},
		pop: {
			keyframes: [
				{ transform: "scale(0.8)", opacity: 0 },
				{ transform: "scale(1.1)", opacity: 1 },
				{ transform: "scale(0.95)" },
				{ transform: "scale(1)" },
			],
			options: {
				duration: 600,
				easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
				fill: "forwards",
			},
		},
		shimmer: {
			keyframes: [
				{ backgroundPosition: "-200% 0" },
				{ backgroundPosition: "200% 0" },
			],
			options: { duration: 3000, iterations: Infinity, easing: "linear" },
		},
	};

	// Public methods
	function animate(element, animation, options = {}) {
		if (!element) return null;

		// Remove any existing animation on this element
		clearAnimation(element);

		// If browser doesn't support modern animations, use classes
		if (!isModernBrowser) {
			if (typeof animation === "string") {
				element.classList.add("animated", animation);
				return null;
			}
			return null;
		}

		// Get animation details
		let keyframes, animationOptions;

		if (typeof animation === "string") {
			// Use a preset animation
			if (presets[animation]) {
				keyframes = presets[animation].keyframes;
				animationOptions = { ...presets[animation].options, ...options };
			} else {
				console.warn(`Animation preset "${animation}" not found`);
				return null;
			}
		} else if (typeof animation === "object") {
			// Use custom keyframes
			keyframes = animation;
			animationOptions = options;
		} else {
			console.warn("Invalid animation parameter");
			return null;
		}

		// Create and start the animation
		const animationInstance = element.animate(keyframes, animationOptions);

		// Store animation in registry for later cleanup
		animationRegistry.set(element, animationInstance);

		// Return animation instance for further control
		return animationInstance;
	}

	function clearAnimation(element) {
		if (!element) return;

		// Clear Web Animation API animations
		if (animationRegistry.has(element)) {
			const animation = animationRegistry.get(element);
			animation.cancel();
			animationRegistry.delete(element);
		}

		// Also clear CSS animations for compatibility
		element.classList.remove("animated");
		Object.keys(presets).forEach((preset) => {
			element.classList.remove(preset);
		});
	}

	function stagger(elements, animation, options = {}, delay = 100) {
		if (!elements || !elements.length) return;

		elements.forEach((element, index) => {
			const staggeredOptions = {
				...options,
				delay: options.delay || 0 + index * delay,
			};
			setTimeout(() => {
				animate(element, animation, staggeredOptions);
			}, index * delay);
		});
	}

	function animateOnScroll(
		selector,
		animation,
		options = {},
		observerOptions = {}
	) {
		const elements = document.querySelectorAll(selector);
		if (!elements.length) return;

		const defaultObserverOptions = {
			root: null,
			rootMargin: "0px 0px -50px 0px",
			threshold: 0.1,
		};

		const mergedObserverOptions = {
			...defaultObserverOptions,
			...observerOptions,
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					animate(entry.target, animation, options);
					observer.unobserve(entry.target);
				}
			});
		}, mergedObserverOptions);

		elements.forEach((element) => {
			// Set initial state for smooth animation
			if (typeof animation === "string" && presets[animation]) {
				const initialState = presets[animation].keyframes[0];
				for (const prop in initialState) {
					element.style[prop] = initialState[prop];
				}
			}

			observer.observe(element);
		});
	}

	function addInteractiveAnimation(
		selector,
		eventType,
		animation,
		options = {}
	) {
		const container = document.querySelector("body");

		// Use event delegation to reduce listeners
		container.addEventListener(eventType, (e) => {
			const target = e.target.closest(selector);
			if (target) {
				animate(target, animation, options);
			}
		});
	}

	// Clean up resources - call this when navigating away
	function cleanup() {
		animationRegistry.forEach((animation, element) => {
			animation.cancel();
		});
		animationRegistry.clear();
	}

	// Add window unload handler to clean up
	window.addEventListener("unload", cleanup);

	// Return the public API
	return {
		animate,
		clearAnimation,
		stagger,
		animateOnScroll,
		addInteractiveAnimation,
		presets,
		cleanup,
	};
}

// Initialize the animation helper
const Animate = createAnimationHelper();

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

	document.querySelector(".scroll-progress").style.width = scrolled + "%";
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
						element.style.backgroundImage = `url(${element.dataset.background})`;
						backgroundObserver.unobserve(element);
					}
				});
			},
			{
				rootMargin: "200px",
				threshold: 0,
			}
		);

		lazyBackgrounds.forEach((element) => {
			backgroundObserver.observe(element);
		});
	}
}

/**
 * Initialize service worker registration for offline capabilities
 */
function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/service-worker.js")
				.then((registration) => {
					console.log(
						"Service Worker registered successfully with scope:",
						registration.scope
					);

					// Check for service worker updates
					registration.addEventListener("updatefound", () => {
						const newWorker = registration.installing;

						// Show a toast notification when a new service worker is found
						showToast(
							"App Update Available",
							"Refresh to get the latest version",
							"fa-solid fa-arrow-rotate-right"
						);
					});
				})
				.catch((error) => {
					console.error("Service Worker registration failed:", error);
				});
		});
	}
}

/**
 * Initialize content visibility observer for better performance
 */
function initContentVisibilityObserver() {
	// Apply content-visibility to large sections - but NOT to the project cards that contain images
	const contentSections = document.querySelectorAll(".skills__group");

	if (contentSections.length > 0 && "IntersectionObserver" in window) {
		const options = {
			rootMargin: "400px 0px", // Start rendering before it's visible
			threshold: 0,
		};

		const contentObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Remove content-visibility: auto when in viewport
					entry.target.style.contentVisibility = "visible";
					contentObserver.unobserve(entry.target);
				}
			});
		}, options);

		contentSections.forEach((section) => {
			// Apply content-visibility: auto to all sections
			section.style.contentVisibility = "auto";
			section.style.containIntrinsicSize = "0 500px";
			contentObserver.observe(section);
		});
	}
}

/**
 * Initialize intersection observer for animation on scroll
 */
function initIntersectionObserver() {
	const elementsToAnimate = document.querySelectorAll(".animate-on-scroll");

	if (elementsToAnimate.length > 0 && "IntersectionObserver" in window) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{
				rootMargin: "0px 0px -100px 0px",
				threshold: 0.1,
			}
		);

		elementsToAnimate.forEach((element) => {
			observer.observe(element);
		});
	} else {
		// Fallback for browsers without IntersectionObserver
		elementsToAnimate.forEach((element) => {
			element.classList.add("visible");
		});
	}

	// Special handling for skill cards
	const skillCards = document.querySelectorAll(".skills__card");

	if (skillCards.length > 0 && "IntersectionObserver" in window) {
		const cardObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const card = entry.target;
						card.classList.add("is-visible");

						// Animate progress bar if exists
						const progressBar = card.querySelector(".skills__progress-bar");
						if (progressBar && progressBar.dataset.level) {
							setTimeout(() => {
								progressBar.style.width = `${progressBar.dataset.level}%`;
							}, 100);
						}

						cardObserver.unobserve(card);
					}
				});
			},
			{
				rootMargin: "0px 0px -50px 0px",
				threshold: 0.1,
			}
		);

		skillCards.forEach((card) => {
			cardObserver.observe(card);
		});
	}
}

/**
 * Initialize resource hints for faster navigation
 */
function initResourceHints() {
	// Preconnect to external domains
	const domains = [
		"https://fonts.googleapis.com",
		"https://kit.fontawesome.com",
		"https://cdn.jsdelivr.net",
	];

	domains.forEach((domain) => {
		if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
			const link = document.createElement("link");
			link.rel = "preconnect";
			link.href = domain;
			link.crossOrigin = "anonymous";
			document.head.appendChild(link);
		}
	});
}

/**
 * Optimize font loading with font-display
 */
function optimizeFontLoading() {
	// Create a style element to add font-display property to any custom fonts
	const style = document.createElement("style");
	style.textContent = `
    @font-face {
      font-display: swap !important;
    }
    
    /* Apply font-display to any Google Fonts */
    [data-google-font], 
    [data-font] {
      font-display: swap !important;
    }
  `;
	document.head.appendChild(style);

	// Find any font preload links and add onload handler
	const fontPreloads = document.querySelectorAll(
		'link[rel="preload"][as="font"]'
	);
	fontPreloads.forEach((link) => {
		if (!link.hasAttribute("onload")) {
			link.setAttribute("onload", "this.onload=null;this.rel='stylesheet'");
		}
	});
}

/**
 * Show toast notification
 */
function showToast(message, type = "info", duration = 5000) {
	const toastContainer =
		document.querySelector(".toast-container") || createToastContainer();

	const toast = document.createElement("div");
	toast.className = `toast toast-${type}`;
	toast.textContent = message;

	// Add close button
	const closeBtn = document.createElement("button");
	closeBtn.className = "toast-close";
	closeBtn.innerHTML = "&times;";
	closeBtn.addEventListener("click", () => {
		toast.classList.add("toast-hidden");
		setTimeout(() => toast.remove(), 300);
	});

	toast.appendChild(closeBtn);
	toastContainer.appendChild(toast);

	// Trigger reflow
	void toast.offsetWidth;

	// Show toast
	toast.classList.add("toast-visible");

	// Auto remove after duration
	if (duration > 0) {
		setTimeout(() => {
			if (toast.parentElement) {
				toast.classList.add("toast-hidden");
				setTimeout(() => toast.remove(), 300);
			}
		}, duration);
	}

	return toast;
}

/**
 * Create toast container if it doesn't exist
 */
function createToastContainer() {
	const container = document.createElement("div");
	container.className = "toast-container";
	document.body.appendChild(container);
	return container;
}

/**
 * Debounce function to improve performance
 */
function debounce(func, wait = 20, immediate = true) {
	let timeout;
	return function () {
		const context = this;
		const args = arguments;
		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

/**
 * Preload key pages for faster navigation
 */
function preloadKeyPages() {
	// Get current page path
	const currentPath = window.location.pathname;

	// Define pages to preload based on current page
	let pagesToPreload = [];

	if (currentPath.includes("index.html") || currentPath.endsWith("/")) {
		pagesToPreload = ["jobs.html", "projects.html"];
	} else if (currentPath.includes("jobs.html")) {
		pagesToPreload = ["index.html", "projects.html"];
	} else if (currentPath.includes("projects.html")) {
		pagesToPreload = ["jobs.html", "certification.html"];
	} else if (currentPath.includes("certification.html")) {
		pagesToPreload = ["projects.html", "skills.html"];
	} else if (currentPath.includes("skills.html")) {
		pagesToPreload = ["certification.html", "about.html"];
	} else if (currentPath.includes("about.html")) {
		pagesToPreload = ["skills.html", "index.html"];
	}

	// Preload each page
	pagesToPreload.forEach((page) => {
		const link = document.createElement("link");
		link.rel = "prefetch";
		link.href = page;
		document.head.appendChild(link);
	});
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
	if ("performance" in window && "PerformanceObserver" in window) {
		// Monitor important performance metrics
		try {
			// Create performance observer for Core Web Vitals
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry) => {
					// Log vital metrics
					console.log(`[Performance] ${entry.name}: ${entry.value}`);
				});
			});

			// Observe LCP, FID, CLS
			observer.observe({ type: "largest-contentful-paint", buffered: true });
			observer.observe({ type: "first-input", buffered: true });
			observer.observe({ type: "layout-shift", buffered: true });
		} catch (e) {
			console.log("Performance monitoring not supported", e);
		}
	}
}

/**
 * Optimize script loading with async and defer attributes
 */
function optimizeScriptLoading() {
	// Find all script tags without async or defer
	const scripts = document.querySelectorAll(
		"script[src]:not([async]):not([defer])"
	);

	scripts.forEach((script) => {
		// Create a new optimized script tag
		const newScript = document.createElement("script");
		newScript.src = script.src;

		// Add appropriate loading attribute based on script type
		if (
			script.src.includes("fontawesome") ||
			script.src.includes("analytics") ||
			script.src.includes("cdn") ||
			script.src.includes("tag")
		) {
			// Non-critical scripts use async
			newScript.async = true;
		} else {
			// Critical scripts use defer to maintain execution order
			newScript.defer = true;
		}

		// Replace original script with optimized version
		if (script.parentNode) {
			script.parentNode.replaceChild(newScript, script);
		}
	});
}

/**
 * Memory management optimizations
 */
function optimizeMemoryUsage() {
	// Periodic cleanup of any references that might cause memory leaks
	let cleanupInterval;

	function performCleanup() {
		// Clean up any animation references that are no longer needed
		const offScreenElements = document.querySelectorAll(".animated.is-visible");
		offScreenElements.forEach((element) => {
			// Check if element is far out of viewport
			const rect = element.getBoundingClientRect();
			if (rect.bottom < -500 || rect.top > window.innerHeight + 500) {
				// Remove any dynamic styles that might hold memory
				element.style.animation = "none";
				element.style.transform = "none";
				element.style.transition = "none";
			}
		});

		// Clear any stale toast notifications
		const oldToasts = document.querySelectorAll(".toast:not(.toast-visible)");
		oldToasts.forEach((toast) => {
			if (toast.parentNode) {
				toast.parentNode.removeChild(toast);
			}
		});
	}

	// Set up periodic cleanup based on user interaction
	function setupCleanup() {
		// Clear previous interval if exists
		if (cleanupInterval) {
			clearInterval(cleanupInterval);
		}

		// Run cleanup every 90 seconds while user is active
		cleanupInterval = setInterval(performCleanup, 90000);
	}

	// Start cleanup cycle
	setupCleanup();

	// Reset cleanup timer when user interacts with page
	["scroll", "click", "keydown", "mousemove"].forEach((eventType) => {
		window.addEventListener(
			eventType,
			debounce(() => {
				setupCleanup();
			}, 300),
			{ passive: true }
		);
	});

	// Run cleanup when page becomes hidden
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			performCleanup();
		} else {
			setupCleanup();
		}
	});
}

/**
 * Implement event delegation for better performance
 */
function implementEventDelegation() {
	// Get the main content container
	const mainContent = document.querySelector("main") || document.body;

	// Delegate common event types
	mainContent.addEventListener("click", handleDelegatedEvents, false);

	// Delegate hover effects for touch devices
	if ("ontouchstart" in window) {
		mainContent.addEventListener("touchstart", handleDelegatedEvents, {
			passive: true,
		});
	}
}

/**
 * Handle delegated events to reduce individual event listeners
 */
function handleDelegatedEvents(event) {
	// Handle clicks on various interactive elements
	const target = event.target;

	// Skills card click handler
	if (target.closest(".skills__card")) {
		const card = target.closest(".skills__card");
		const skillName =
			card.querySelector(".skills__name")?.textContent || "this skill";

		if (!card.classList.contains("card-clicked")) {
			card.classList.add("card-clicked");
			setTimeout(() => {
				card.classList.remove("card-clicked");
			}, 500);
		}
	}

	// Project card click handler
	if (target.closest(".Projects")) {
		const projectCard = target.closest(".Projects");

		// Toggle additional information or handle project clicks
		if (target.closest(".project__btn-view")) {
			// Handle view project button clicks
			const projectLink = target
				.closest(".project__btn-view")
				.getAttribute("href");
			if (projectLink) {
				// Track the click analytics if needed
				console.log(`Project view click: ${projectLink}`);
			}
		}
	}

	// Menu toggle handling
	if (target.closest(".menu-toggle")) {
		const menuToggle = target.closest(".menu-toggle");
		const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

		menuToggle.setAttribute("aria-expanded", !isExpanded);

		// Find the target menu by aria-controls
		const menuId = menuToggle.getAttribute("aria-controls");
		if (menuId) {
			const menu = document.getElementById(menuId);
			if (menu) {
				if (!isExpanded) {
					menu.classList.add("is-open");
				} else {
					menu.classList.remove("is-open");
				}
			}
		}
	}
}

/**
 * Setup caching improvements
 */
function setupCachingImprovements() {
	// Implement caching strategies for frequently accessed resources
	if ("caches" in window) {
		// Define different cache categories
		const staticCache = "portfolio-static-v1";
		const imagesCache = "portfolio-images-v1";
		const pagesCache = "portfolio-pages-v1";

		// Cache static assets that rarely change
		caches.open(staticCache).then((cache) => {
			cache
				.addAll(["/Js/main.js", "/Js/performance.js", "/SCSS/main.css"])
				.catch((error) => {
					console.error("Static caching failed:", error);
				});
		});

		// Cache images separately since they're larger
		caches.open(imagesCache).then((cache) => {
			cache
				.addAll(["/Images/Header.jpg", "/Images/Header_Phone.jpg"])
				.catch((error) => {
					console.error("Image caching failed:", error);
				});
		});
	}
}

/**
 * Optimize resource loading priorities
 * This helps the browser understand which resources are more important
 */
function optimizeResourcePriorities() {
	// Function to set fetch priority for resources
	function setPriority(selector, priority) {
		document.querySelectorAll(selector).forEach((el) => {
			if ("fetchPriority" in el) {
				el.fetchPriority = priority;
			} else {
				// Fallback for browsers that don't support fetchPriority
				el.setAttribute("importance", priority);
			}
		});
	}

	// Set high priority for critical resources
	setPriority('link[rel="stylesheet"]', "high");
	setPriority(".hero-image", "high");
	setPriority('script[src*="main.js"]', "high");
}

/**
 * Initialize viewport-aware content loading
 * This function loads content progressively as the user scrolls
 * to improve initial page load performance
 */
function initViewportAwareLoading() {
	// Elements that will be loaded when they approach the viewport
	const deferredElements = document.querySelectorAll("[data-defer-load]");

	if (deferredElements.length > 0) {
		const viewportObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const element = entry.target;

						// Get the data to load
						const dataType = element.getAttribute("data-defer-type") || "html";
						const dataSource = element.getAttribute("data-defer-src");

						if (dataSource) {
							// Handle different types of deferred content
							switch (dataType) {
								case "html":
									// Load HTML content with AbortController for better control
									const controller = new AbortController();
									const signal = controller.signal;

									// Set a timeout to abort fetch if it takes too long
									const timeoutId = setTimeout(() => controller.abort(), 5000);

									fetch(dataSource, { signal })
										.then((response) => {
											clearTimeout(timeoutId);
											if (!response.ok) {
												throw new Error(
													`Failed to load content: ${response.status}`
												);
											}
											return response.text();
										})
										.then((html) => {
											// Sanitize HTML content before inserting (simple version)
											const sanitizedHtml = sanitizeHtml(html);
											element.innerHTML = sanitizedHtml;
											element.removeAttribute("data-defer-load");
											element.dispatchEvent(new CustomEvent("content-loaded"));
										})
										.catch((error) => {
											if (error.name === "AbortError") {
												console.warn("Content loading aborted due to timeout");
											} else {
												console.error("Error loading deferred content:", error);
											}
											// Show fallback content
											element.innerHTML =
												element.getAttribute("data-defer-fallback") ||
												"<p>Content could not be loaded. Please try again later.</p>";
										});
									break;

								case "json":
									// Support for JSON data with templates
									fetch(dataSource)
										.then((response) => response.json())
										.then((data) => {
											const template = element.getAttribute(
												"data-defer-template"
											);
											if (template) {
												const templateElement =
													document.getElementById(template);
												if (templateElement) {
													element.innerHTML = processTemplate(
														templateElement.innerHTML,
														data
													);
												}
											} else {
												// Just display the JSON data as formatted text
												element.textContent = JSON.stringify(data, null, 2);
											}
											element.removeAttribute("data-defer-load");
											element.dispatchEvent(new CustomEvent("content-loaded"));
										})
										.catch((error) =>
											console.error("Error loading JSON content:", error)
										);
									break;
							}
						}

						viewportObserver.unobserve(element);
					}
				});
			},
			{
				rootMargin: "200px 0px",
				threshold: 0.1,
			}
		);

		deferredElements.forEach((element) => {
			viewportObserver.observe(element);
		});
	}

	// Check if we're on the projects page and adjust images to start from the top
	adjustProjectImages();
}

/**
 * Simple HTML sanitizer to prevent XSS in dynamically loaded content
 * This is a basic implementation - in production, use a proper library like DOMPurify
 */
function sanitizeHtml(html) {
	const tempDiv = document.createElement("div");
	tempDiv.textContent = html; // This escapes HTML entities

	// For a basic sanitizer, just return the escaped text content
	// For a more thorough approach that preserves safe tags:
	const doc = new DOMParser().parseFromString(html, "text/html");

	// Remove potentially dangerous elements and attributes
	const dangerousTags = ["script", "iframe", "object", "embed"];
	const dangerousAttrs = [
		"onerror",
		"onload",
		"onclick",
		"onmouseover",
		"onfocus",
		"onblur",
	];

	dangerousTags.forEach((tag) => {
		const elements = doc.querySelectorAll(tag);
		elements.forEach((el) => el.remove());
	});

	// Remove dangerous attributes from all elements
	const allElements = doc.querySelectorAll("*");
	allElements.forEach((el) => {
		dangerousAttrs.forEach((attr) => {
			if (el.hasAttribute(attr)) {
				el.removeAttribute(attr);
			}
		});

		// Remove javascript: URLs
		if (
			el.hasAttribute("href") &&
			el.getAttribute("href").toLowerCase().startsWith("javascript:")
		) {
			el.removeAttribute("href");
		}
	});

	return doc.body.innerHTML;
}

/**
 * Adjusts project images to start from the top instead of being centered
 * This makes sure images in the projects page start from the top
 */
function adjustProjectImages() {
	// Check if we're on the projects page
	if (window.location.pathname.includes("projects.html")) {
		// Select all project images
		const projectImages = document.querySelectorAll(".project-image img");

		// Change object-position to 'top' for all project images
		projectImages.forEach((img) => {
			img.style.objectPosition = "center top";
		});

		console.log(
			"Performance.js: Adjusted project images to start from the top"
		);
	}
}

/**
 * Process a template string with JSON data
 * Simple template processing for deferred JSON content
 */
function processTemplate(template, data) {
	let result = template;

	// Replace all {{property}} placeholders with actual data
	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];
			const regex = new RegExp(`{{${key}}}`, "g");
			result = result.replace(regex, value);
		}
	}

	return result;
}

/**
 * Apply reduced motion settings based on user preference
 */
function applyReducedMotionPreferences() {
	// Check if user prefers reduced motion
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	
	if (prefersReducedMotion) {
		// Apply reduced motion settings to the entire document
		document.documentElement.classList.add('reduced-motion');
		
		// Create a style element to add reduced-motion styles
		const style = document.createElement('style');
		style.textContent = `
			/* Apply reduced animations when user prefers reduced motion */
			.reduced-motion * {
				animation-duration: 0.001ms !important;
				transition-duration: 0.001ms !important;
				animation-iteration-count: 1 !important;
			}
			
			/* Special cases for essential animations */
			.reduced-motion .typing-cursor {
				animation: none !important;
			}
			
			/* Disable parallax effects */
			.reduced-motion .home,
			.reduced-motion .about, 
			.reduced-motion .jobs-layout, 
			.reduced-motion .project__project-image {
				background-attachment: scroll !important;
			}
			
			/* Disable 3D effects */
			.reduced-motion .skills__card,
			.reduced-motion .certificate-content {
				transform: none !important;
			}
		`;
		document.head.appendChild(style);
		
		// Show a toast notification to inform the user
		if (typeof showToast === 'function') {
			setTimeout(() => {
				showToast(
					'Reduced Motion Enabled',
					'Animations have been minimized for better accessibility',
					'fa-solid fa-universal-access'
				);
			}, 2000);
		}
	}
	
	// Listen for changes to the prefers-reduced-motion media query
	window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
		if (e.matches) {
			document.documentElement.classList.add('reduced-motion');
		} else {
			document.documentElement.classList.remove('reduced-motion');
		}
	});
}

/**
 * Detect battery status and apply battery-saving optimizations when needed
 * Uses the Battery API to improve performance on low-battery devices
 */
function detectBatteryStatus() {
	// Check if Battery API is supported
	if ('getBattery' in navigator) {
		navigator.getBattery().then(battery => {
			// Add performance-optimized class to enable optimizations
			document.documentElement.classList.add('performance-optimized');
			
			// Function to check battery level and apply optimizations
			const updateBatteryStatus = () => {
				// Apply battery-saving mode when battery level is low (below 30%) and not charging
				if (battery.level < 0.3 && !battery.charging) {
					document.documentElement.classList.add('battery-saving');
					console.log('Battery saving mode enabled: ' + Math.round(battery.level * 100) + '% battery remaining');
				} else {
					document.documentElement.classList.remove('battery-saving');
				}
			};
			
			// Initial battery check
			updateBatteryStatus();
			
			// Listen for battery status changes
			battery.addEventListener('levelchange', updateBatteryStatus);
			battery.addEventListener('chargingchange', updateBatteryStatus);
		}).catch(err => {
			console.warn('Battery API error:', err);
			// Still apply performance optimized class as fallback
			document.documentElement.classList.add('performance-optimized');
		});
	} else {
		// Battery API not supported - apply performance optimizations anyway as fallback
		console.log('Battery API not supported, applying default optimizations');
		document.documentElement.classList.add('performance-optimized');
	}
}
