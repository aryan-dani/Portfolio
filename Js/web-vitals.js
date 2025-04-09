/**
 * Web Vitals Optimization Script
 * Helps collect and optimize Core Web Vitals metrics
 *
 * @format
 */

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
	console.log("Web Vitals optimization initialized");

	// Track CLS (Cumulative Layout Shift)
	let cumulativeLayoutShift = 0;
	let layoutShiftObserver;

	// Track LCP (Largest Contentful Paint)
	let largestContentfulPaint = 0;

	// Track FID (First Input Delay)
	let firstInputDelay = 0;

	// Initialize web vitals tracking
	initWebVitalsTracking();

	// Apply optimizations based on device capabilities
	applyOptimizations();

	/**
	 * Set up observers to track web vitals metrics
	 */
	function initWebVitalsTracking() {
		// Only track if the Performance Observer is available
		if ("PerformanceObserver" in window) {
			// Track Largest Contentful Paint
			try {
				const lcpObserver = new PerformanceObserver((entryList) => {
					const entries = entryList.getEntries();
					const lastEntry = entries[entries.length - 1];
					largestContentfulPaint = lastEntry.startTime;
					console.log(`LCP: ${Math.round(largestContentfulPaint)}ms`);

					// If LCP is slow, apply immediate optimizations
					if (largestContentfulPaint > 2500) {
						applyLCPOptimizations();
					}
				});

				lcpObserver.observe({
					type: "largest-contentful-paint",
					buffered: true,
				});
			} catch (e) {
				console.warn("LCP tracking not supported", e);
			}

			// Track Cumulative Layout Shift
			try {
				layoutShiftObserver = new PerformanceObserver((entryList) => {
					for (const entry of entryList.getEntries()) {
						// Only count layout shifts without recent user input
						if (!entry.hadRecentInput) {
							cumulativeLayoutShift += entry.value;
						}
					}

					console.log(`Current CLS: ${cumulativeLayoutShift.toFixed(3)}`);

					// If CLS is high, apply immediate fixes
					if (cumulativeLayoutShift > 0.1) {
						applyCLSOptimizations();
					}
				});

				layoutShiftObserver.observe({ type: "layout-shift", buffered: true });
			} catch (e) {
				console.warn("CLS tracking not supported", e);
			}

			// Track First Input Delay
			try {
				const fidObserver = new PerformanceObserver((entryList) => {
					for (const entry of entryList.getEntries()) {
						// This will be the first input delay
						firstInputDelay = entry.processingStart - entry.startTime;
						console.log(`FID: ${Math.round(firstInputDelay)}ms`);

						// Stop observing after first input
						fidObserver.disconnect();

						// If FID is high, apply fixes
						if (firstInputDelay > 100) {
							applyFIDOptimizations();
						}
					}
				});

				fidObserver.observe({ type: "first-input", buffered: true });
			} catch (e) {
				console.warn("FID tracking not supported", e);
			}
		}
	}
	/**
	 * Apply general optimizations based on device capabilities
	 */
	function applyOptimizations() {
		// Check if this is a low-end device or has a slow connection
		const isLowEndDevice = navigator.hardwareConcurrency < 4;
		const isSlowConnection =
			navigator.connection &&
			(navigator.connection.saveData ||
				navigator.connection.effectiveType.includes("2g") ||
				navigator.connection.effectiveType.includes("slow"));

		// Apply optimizations for low-end devices
		if (isLowEndDevice || isSlowConnection) {
			console.log(
				"Low-end device or slow connection detected, applying optimizations"
			);

			// Reduce animation complexity
			document.documentElement.classList.add("reduced-motion");

			// Disable heavy background effects
			const particlesContainer = document.getElementById("particles-js");
			if (particlesContainer) {
				particlesContainer.style.opacity = "0.3";

				// If particles.js is initialized, reduce particle count
				if (window.pJSDom && window.pJSDom.length > 0) {
					try {
						window.pJSDom[0].pJS.particles.number.value = 20;
						window.pJSDom[0].pJS.particles.move.speed = 1;
						window.pJSDom[0].pJS.fn.particlesRefresh();
					} catch (e) {
						console.warn("Could not optimize particles.js", e);
					}
				}
			}

			// Reduce image quality where appropriate
			document.querySelectorAll("img").forEach((img) => {
				if (!img.classList.contains("critical-image")) {
					img.style.imageRendering = "auto";
				}
			});
		}

		// Apply optimizations regardless of device
		// Note: We skip prefetchNextPages here as it's now handled by resource-hints.js
		optimizeImageLoading();

		// Add page transition class by default
		document.body.classList.add("transitions-enabled");

		// Let users disable animations if they want
		addAnimationToggle();
	}

	/**
	 * Apply optimizations to fix slow Largest Contentful Paint
	 */
	function applyLCPOptimizations() {
		console.log("Applying LCP optimizations");

		// Find the largest element (likely hero image or heading)
		const lcpElement = findLCPElement();

		if (lcpElement) {
			// Prioritize this element
			if (lcpElement.tagName === "IMG") {
				lcpElement.loading = "eager";
				lcpElement.fetchPriority = "high";

				// If image is background, try to inline it
				const imgUrl = lcpElement.src;
				if (imgUrl && lcpElement.complete && lcpElement.naturalWidth > 0) {
					inlineImageAsBackground(lcpElement);
				}
			}

			// Add a highlight effect to show the user something is happening
			lcpElement.classList.add("optimized-element");
		}

		// Reduce priority of non-critical elements
		document.querySelectorAll("img:not(.optimized-element)").forEach((img) => {
			if (!isElementInViewport(img)) {
				img.loading = "lazy";
			}
		});

		// Disable some animations temporarily
		document.body.classList.add("loading-critical-content");
		setTimeout(() => {
			document.body.classList.remove("loading-critical-content");
		}, 1000);
	}

	/**
	 * Apply optimizations to fix high Cumulative Layout Shift
	 */
	function applyCLSOptimizations() {
		console.log("Applying CLS optimizations");

		// Set explicit dimensions on images that don't have them
		document.querySelectorAll("img").forEach((img) => {
			if (!img.getAttribute("width") && !img.getAttribute("height")) {
				if (img.complete) {
					img.setAttribute("width", img.naturalWidth);
					img.setAttribute("height", img.naturalHeight);
				}
			}
		});

		// Add position:relative to parent containers to avoid shifts
		document
			.querySelectorAll(".content-wrapper, .container, section")
			.forEach((container) => {
				const style = window.getComputedStyle(container);
				if (style.position === "static") {
					container.style.position = "relative";
				}
			});

		// Hold space for web fonts
		const style = document.createElement("style");
		style.textContent = `
      body {
        font-display: swap !important;
      }
      
      .font-loading {
        display: block;
        visibility: hidden;
      }
    `;
		document.head.appendChild(style);
	}

	/**
	 * Apply optimizations to fix slow First Input Delay
	 */
	function applyFIDOptimizations() {
		console.log("Applying FID optimizations");

		// Remove unnecessary event listeners
		const eventTypes = ["mousemove", "mouseover", "mouseenter"];
		let removed = 0;

		// Clean up heavy mousemove event listeners (but keep important ones)
		eventTypes.forEach((type) => {
			const originalAddEventListener = Element.prototype.addEventListener;
			Element.prototype.addEventListener = function (
				eventType,
				handler,
				options
			) {
				if (eventType === type) {
					// Add data attribute to mark this is using the optimized handler
					this.setAttribute("data-optimized-events", "true");

					// Wrap handler in a debounced function for better performance
					const optimizedHandler = debounce(handler, 50);
					return originalAddEventListener.call(
						this,
						eventType,
						optimizedHandler,
						options
					);
				}

				return originalAddEventListener.call(this, eventType, handler, options);
			};

			removed++;
		});

		console.log(`Optimized ${removed} event listener types`);

		// Break up long tasks into smaller chunks
		if (window.requestIdleCallback) {
			const originalSetTimeout = window.setTimeout;
			window.setTimeout = function (handler, timeout, ...args) {
				if (timeout < 100) {
					// Use requestIdleCallback for short timeouts to yield to user input
					return window.requestIdleCallback(
						() => {
							handler(...args);
						},
						{ timeout: timeout || 100 }
					);
				}

				return originalSetTimeout(handler, timeout, ...args);
			};
		}
	}

	/**
	 * Helper function to find the likely LCP element
	 */
	function findLCPElement() {
		// Common LCP elements: large images, hero text, etc.
		const candidates = [
			document.querySelector(".home__name"), // Home page hero text
			document.querySelector(".hero-image"), // Hero image
			document.querySelector("h1"), // Main heading
			document.querySelector(".project__project-image"), // Project image
			document.querySelector("header img"), // Header logo
			document.querySelector('img[src*="Header"]'), // Header background
		];

		// Return the first visible candidate
		for (const element of candidates) {
			if (element && isElementInViewport(element)) {
				return element;
			}
		}

		// Fallback: find largest image in viewport
		let largestImage = null;
		let largestArea = 0;

		document.querySelectorAll("img").forEach((img) => {
			if (img.complete && isElementInViewport(img)) {
				const area = img.offsetWidth * img.offsetHeight;
				if (area > largestArea) {
					largestArea = area;
					largestImage = img;
				}
			}
		});

		return largestImage;
	}

	/**
	 * Prefetch likely next pages for faster navigation
	 */
	function prefetchNextPages() {
		// Get current page path
		const currentPath = window.location.pathname;

		// Define pages to prefetch based on current page
		let pagesToPrefetch = [];

		if (currentPath.includes("index.html") || currentPath.endsWith("/")) {
			pagesToPrefetch = ["jobs.html", "projects.html"];
		} else if (currentPath.includes("jobs.html")) {
			pagesToPrefetch = ["index.html", "projects.html"];
		} else if (currentPath.includes("projects.html")) {
			pagesToPrefetch = ["jobs.html", "certification.html"];
		} else if (currentPath.includes("certification.html")) {
			pagesToPrefetch = ["projects.html", "skills.html"];
		} else if (currentPath.includes("skills.html")) {
			pagesToPrefetch = ["certification.html", "about.html"];
		} else if (currentPath.includes("about.html")) {
			pagesToPrefetch = ["skills.html", "index.html"];
		}

		// Prefetch each page
		pagesToPrefetch.forEach((page) => {
			const link = document.createElement("link");
			link.rel = "prefetch";
			link.href = page;
			document.head.appendChild(link);
		});
	}

	/**
	 * Optimize image loading for better performance
	 */
	function optimizeImageLoading() {
		// Set up responsive images with srcset where possible
		document.querySelectorAll("img").forEach((img) => {
			// Don't modify images that already have srcset
			if (!img.srcset && img.src) {
				const src = img.src;

				// Only process local images (not external ones)
				if (src.startsWith(window.location.origin) || src.startsWith("/")) {
					const isHeroImage =
						src.includes("Header") ||
						img.classList.contains("hero-image") ||
						img.width > 800;

					if (isHeroImage) {
						// Mark as a critical image
						img.classList.add("critical-image");

						// Ensure proper loading priority
						img.loading = "eager";
						if ("fetchPriority" in img) {
							img.fetchPriority = "high";
						}
					} else if ("loading" in HTMLImageElement.prototype) {
						// Use native lazy loading for non-critical images
						img.loading = "lazy";
					}
				}
			}
		});
	}

	/**
	 * Add toggle for users to disable animations
	 */
	function addAnimationToggle() {
		// Only add the toggle if it doesn't already exist
		if (!document.getElementById("animation-toggle")) {
			// Create toggle button
			const toggle = document.createElement("button");
			toggle.id = "animation-toggle";
			toggle.className = "animation-toggle";
			toggle.setAttribute("aria-label", "Toggle animations");
			toggle.setAttribute("title", "Toggle animations");
			toggle.innerHTML = '<i class="fa-solid fa-film"></i>';

			// Style the toggle button
			toggle.style.position = "fixed";
			toggle.style.bottom = "20px";
			toggle.style.left = "20px";
			toggle.style.zIndex = "9999";
			toggle.style.background = "rgba(15, 15, 15, 0.7)";
			toggle.style.color = "#fff";
			toggle.style.border = "none";
			toggle.style.borderRadius = "50%";
			toggle.style.width = "40px";
			toggle.style.height = "40px";
			toggle.style.display = "flex";
			toggle.style.alignItems = "center";
			toggle.style.justifyContent = "center";
			toggle.style.cursor = "pointer";
			toggle.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
			toggle.style.transition = "all 0.3s ease";

			// Add the toggle to the body
			document.body.appendChild(toggle);

			// Check if animations are currently disabled
			const areAnimationsDisabled =
				localStorage.getItem("disable-animations") === "true";

			// Apply initial state
			if (areAnimationsDisabled) {
				document.body.classList.add("animations-disabled");
				toggle.innerHTML = '<i class="fa-solid fa-film-slash"></i>';
				toggle.style.background = "rgba(200, 0, 0, 0.7)";
			}

			// Add click event listener
			toggle.addEventListener("click", () => {
				const nowDisabled = !document.body.classList.contains(
					"animations-disabled"
				);

				// Toggle the class
				if (nowDisabled) {
					document.body.classList.add("animations-disabled");
					toggle.innerHTML = '<i class="fa-solid fa-film-slash"></i>';
					toggle.style.background = "rgba(200, 0, 0, 0.7)";
					localStorage.setItem("disable-animations", "true");

					// Show toast notification
					if (typeof showToast === "function") {
						showToast(
							"Animations Disabled",
							"Page performance improved",
							"fa-solid fa-bolt"
						);
					}
				} else {
					document.body.classList.remove("animations-disabled");
					toggle.innerHTML = '<i class="fa-solid fa-film"></i>';
					toggle.style.background = "rgba(15, 15, 15, 0.7)";
					localStorage.setItem("disable-animations", "false");

					// Show toast notification
					if (typeof showToast === "function") {
						showToast(
							"Animations Enabled",
							"Enjoy the full experience",
							"fa-solid fa-wand-magic-sparkles"
						);
					}
				}
			});

			// Hover effect
			toggle.addEventListener("mouseenter", () => {
				toggle.style.transform = "scale(1.1)";
			});

			toggle.addEventListener("mouseleave", () => {
				toggle.style.transform = "scale(1)";
			});
		}
	}

	/**
	 * Check if an element is in the viewport
	 */
	function isElementInViewport(el) {
		const rect = el.getBoundingClientRect();
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}

	/**
	 * Turn an image into a CSS background for better CLS performance
	 */
	function inlineImageAsBackground(img) {
		// Only proceed if the image is loaded
		if (!img.complete || img.naturalWidth === 0) return;

		// Create a new div with the same dimensions
		const container = document.createElement("div");
		container.style.width = `${img.offsetWidth}px`;
		container.style.height = `${img.offsetHeight}px`;
		container.style.backgroundImage = `url(${img.src})`;
		container.style.backgroundSize = "cover";
		container.style.backgroundPosition = "center center";
		container.style.borderRadius = getComputedStyle(img).borderRadius;
		container.className = img.className;
		container.classList.add("image-to-background");

		// Replace image with div
		if (img.parentNode) {
			img.parentNode.replaceChild(container, img);
		}
	}

	/**
	 * Debounce function for performance optimization
	 */
	function debounce(func, wait) {
		let timeout;
		return function () {
			const context = this;
			const args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
		};
	}
});
