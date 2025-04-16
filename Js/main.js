/** @format */

// Calculate scrollbar width once to avoid layout shifts
const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
document.documentElement.style.setProperty(
	"--scrollbar-width",
	scrollbarWidth + "px"
);

const menuBtn = document.querySelector(".menu-btn");
const hamburger = document.querySelector(".menu-btn__burger");
const nav = document.querySelector(".nav");
const menuNav = document.querySelector(".menu-nav");
const navItems = document.querySelectorAll(".menu-nav__item");
let showMenu = false;

menuBtn.addEventListener("click", toggleMenu);
// Add title attribute for tooltip hint
menuBtn.title = "Click to open navigation menu (Alt+M)";
// When the menu is opened
function toggleMenu() {
	if (!showMenu) {
		// First prepare elements before showing them
		menuNav.style.opacity = "0";
		nav.style.visibility = "visible";

		// Add open classes - these will trigger the CSS styles we defined in _menu.scss
		hamburger.classList.add("open");
		nav.classList.add("open");
		menuNav.classList.add("open");

		// Calculate menu height and set it as a CSS variable for content shifting
		setTrackedTimeout(
			() => {
				// Get the actual height of the menu
				const menuHeight = menuNav.offsetHeight;
				// Set it as a CSS variable on the document
				document.documentElement.style.setProperty(
					"--menu-height",
					menuHeight + "px"
				);
			},
			10,
			"calculateMenuHeight"
		);

		// Add a class to the body to prevent scrolling when menu is open
		document.body.classList.add("menu-open");
		document.documentElement.style.background = "transparent"; // Prevent black border

		// Animate menu items in the original order
		setTrackedTimeout(
			() => {
				menuNav.style.opacity = "1";

				// Add open class to all menu items - CSS will handle the animation timing
				navItems.forEach((item) => item.classList.add("open"));
			},
			50,
			"menuOpenAnimation"
		);

		showMenu = true;
	} else {
		// First fade out menu items
		menuNav.style.opacity = "0";

		// Remove open classes from menu items
		navItems.forEach((item) => item.classList.remove("open"));

		// Remove menu-open class from body
		document.body.classList.remove("menu-open");
		document.documentElement.style.background = ""; // Restore background

		// Then after a short delay, close the menu
		setTrackedTimeout(
			() => {
				hamburger.classList.remove("open");
				nav.classList.remove("open");
				menuNav.classList.remove("open");

				// Hide menu after animation completes
				setTrackedTimeout(
					() => {
						if (!showMenu) {
							// Check again in case menu was reopened
							nav.style.visibility = "hidden";
						}
					},
					300,
					"menuHideAnimation"
				);
			},
			100,
			"menuCloseAnimation"
		);

		showMenu = false;
	}
}

// Close menu when clicking on menu items
navItems.forEach((item) => {
	item.addEventListener("click", () => {
		if (showMenu) {
			toggleMenu();
		}
	});
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
	if (
		showMenu &&
		!e.target.closest(".menu-btn") &&
		!e.target.closest(".nav") &&
		!e.target.closest(".menu-nav")
	) {
		toggleMenu();
	}
});

// Welcome notifications for each page - FIXED implementation
document.addEventListener("DOMContentLoaded", () => {
	// Create page loader if it doesn't exist
	if (!document.querySelector(".page-loader")) {
		const loader = document.createElement("div");
		loader.className = "page-loader";
		loader.innerHTML = '<div class="page-loader__spinner"></div>';
		document.body.appendChild(loader);

		// Show loader for a minimum time to avoid flashing
		setTrackedTimeout(
			() => {
				loader.classList.add("loaded");

				// Remove from DOM after transition completes
				setTrackedTimeout(
					() => {
						if (loader.parentNode) {
							loader.parentNode.removeChild(loader);
						}
					},
					500,
					"loaderRemove"
				);
			},
			800,
			"loaderShow"
		);
	}

	// Add header background on scroll
	const header = document.querySelector("header");
	if (header) {
		window.addEventListener("scroll", () => {
			if (window.scrollY > 50) {
				header.classList.add("scrolled");
			} else {
				header.classList.remove("scrolled");
			}
		});
	}

	// Determine page type and add appropriate body class
	const pagePath = window.location.pathname;
	const isHomePage = pagePath.includes("index.html") || pagePath.endsWith("/");

	// Determine page name for tracking first-time visits
	let pageName = "home";
	if (pagePath.includes("jobs.html")) pageName = "jobs";
	else if (pagePath.includes("projects.html")) pageName = "projects";
	else if (pagePath.includes("certification.html")) pageName = "certification";
	else if (pagePath.includes("skills.html")) pageName = "skills";
	else if (pagePath.includes("about.html")) pageName = "about";

	// Add welcome toast based on page - but only on first visit
	// Delay increased to 1200ms to ensure it appears after social icons start animating
	setTrackedTimeout(
		() => {
			// --- Global First Visit Check for Navigation Hint ---
			const globalFirstVisitKey = "portfolioGlobalFirstVisit";
			if (!sessionStorage.getItem(globalFirstVisitKey)) {
				showToast(
					"Navigation Tip",
					"Use Alt + Arrow keys or Alt + [Letter] (H, J, P, C, S, A) to navigate between pages.",
					"fa-solid fa-keyboard"
				);
				sessionStorage.setItem(globalFirstVisitKey, "true"); // Mark as visited globally
			}
			// --- End Global First Visit Check ---

			// Only show welcome toasts on first visit to each page
			if (checkFirstTimeVisit(pageName)) {
				// Use the new showToast function
				if (typeof showToast === "function") {
					if (isHomePage) {
						showToast(
							"Explore my work and get to know me better", // Message
							"info", // Type
							6000, // Duration
							"Welcome to My Portfolio", // Title
							"fa-solid fa-house-user" // Icon
						);
					} else if (pageName === "jobs") {
						showToast(
							"Learn about my career journey and achievements",
							"info",
							6000,
							"Professional Experience",
							"fa-solid fa-briefcase"
						);
					} else if (pageName === "projects") {
						showToast(
							"Discover the projects I've worked on",
							"info",
							6000,
							"Portfolio Projects",
							"fa-solid fa-code"
						);
					} else if (pageName === "certification") {
						showToast(
							"Check out my professional qualifications",
							"info",
							6000,
							"My Certifications",
							"fa-solid fa-certificate"
						);
					} else if (pageName === "skills") {
						showToast(
							"Explore my expertise across different technologies",
							"info",
							6000,
							"Technical Skills",
							"fa-solid fa-laptop-code"
						);
					} else if (pageName === "about") {
						showToast(
							"Get to know me better",
							"info",
							6000,
							"About Me",
							"fa-solid fa-user"
						);
					}
				} else {
					console.error("showToast function is not defined in performance.js");
				}
			}
		},
		1200, // Keep the original delay for welcome toasts
		"welcomeToast"
	);

	// Continue with the rest of the initialization
	initPageTransition();

	// Initialize page-specific animations
	if (isHomePage) {
		initHomePageAnimations();
	} else if (pagePath.includes("jobs.html")) {
		initJobsPageAnimations();
	} else if (pagePath.includes("projects.html")) {
		initProjectsPageAnimations();
	} else if (pagePath.includes("certification.html")) {
		initCertificationsPageAnimations();
	} else if (pagePath.includes("skills.html")) {
		initSkillsPageAnimations();
	} else if (pagePath.includes("about.html")) {
		initAboutPageAnimations();
	}

	// Initialize universal animations and effects
	initUniversalAnimations();

	// Initialize parallax effect once for relevant pages
	if (
		isHomePage ||
		pagePath.includes("jobs.html") ||
		pagePath.includes("about.html") ||
		pagePath.includes("projects.html") // Assuming parallax is used here too based on initParallaxEffect querySelector
	) {
		initParallaxEffect();
	}
}); // <-- Added closing parenthesis and semicolon

// Smooth page transitions
function initPageTransition() {
	const main = document.querySelector("main");
	if (main) {
		main.style.opacity = "0";
		main.style.transform = "translateY(20px)";
		main.style.transition =
			"opacity 0.6s ease, transform 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)";

		setTrackedTimeout(
			() => {
				main.style.opacity = "1";
				main.style.transform = "translateY(0)";
			},
			100,
			"pageTransition"
		);
	}
}

// Store timeouts for proper cleanup
const timeoutMap = new Map();

// Set a tracked timeout that can be cleared later
function setTrackedTimeout(callback, delay, id) {
	// Clear any existing timeout with this ID
	clearTrackedTimeout(id);

	// Create a new timeout and store its ID
	const timeoutId = setTimeout(() => {
		// Remove from map once executed
		timeoutMap.delete(id);
		callback();
	}, delay);

	// Store in our map
	timeoutMap.set(id, timeoutId);

	return timeoutId;
}

// Clear a tracked timeout
function clearTrackedTimeout(id) {
	if (timeoutMap.has(id)) {
		clearTimeout(timeoutMap.get(id));
		timeoutMap.delete(id);
	}
}

// Home page-specific animations - Optimized for performance
function initHomePageAnimations() {
	// Track if this is a low-power device (most mobile devices qualify)
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;

	// REMOVED: We're no longer initializing particles.js here as requested

	// COORDINATED ANIMATION SEQUENCE
	// This ensures elements animate in the correct order with proper timing

	// Step 1: Prepare all animations but don't start them yet
	prepareHomeAnimations();

	// Step 2: Execute animations in sequence with proper timing
	executeHomeAnimationSequence();
}

// Prepare all home page animations without starting them
function prepareHomeAnimations() {
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;

	// 1. Prepare name animation
	const name = document.querySelector(".home__name");
	if (name) {
		name.style.animation = "none";
		name.style.opacity = "0";
		name.style.transform = isLowPowerDevice
			? "translateY(-25px)"
			: "perspective(1000px) translateZ(-30px) rotateX(10deg)";
		name.style.transition = "all 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)";

		// Remove any existing nameRevealEffect if present
		const existingEffect = name.querySelector("div");
		if (existingEffect) {
			existingEffect.remove();
		}
	}

	// 2. Prepare subtitle animation
	const subtitle = document.querySelector(".home h2");
	if (subtitle) {
		// Store the original subtitle text
		const originalText = subtitle.textContent;

		// Get original styling from computed style
		const originalBgColor = getComputedStyle(subtitle).backgroundColor;
		const originalColor = getComputedStyle(subtitle).color;
		const originalBorderRadius = getComputedStyle(subtitle).borderRadius;
		const originalPadding = getComputedStyle(subtitle).padding;

		// Clear the subtitle and reset its background
		subtitle.textContent = "";
		subtitle.style.background = "transparent";
		subtitle.style.opacity = "1";
		subtitle.style.padding = "0";

		// Create a container for the typing animation
		const animContainer = document.createElement("div");
		animContainer.className = "subtitle-typing-container";
		animContainer.style.display = "inline-block";
		animContainer.style.position = "relative";
		animContainer.style.backgroundColor = originalBgColor;
		animContainer.style.color = originalColor;
		animContainer.style.borderRadius = originalBorderRadius;
		animContainer.style.padding = originalPadding;
		animContainer.style.width = "0";
		animContainer.style.whiteSpace = "nowrap";
		animContainer.style.overflow = "hidden";
		animContainer.style.transition = "width 0.1s ease-out";
		subtitle.appendChild(animContainer);

		// Create a text span to hold the typed text
		const textSpan = document.createElement("span");
		textSpan.className = "typed-text";
		animContainer.appendChild(textSpan);

		// Add a blinking cursor element
		const cursor = document.createElement("span");
		cursor.className = "typing-cursor";
		cursor.innerHTML = "|";
		cursor.style.display = "inline-block";
		cursor.style.color = originalColor;
		cursor.style.animation = "blink-cursor 0.8s step-end infinite";
		cursor.style.marginLeft = "2px";
		cursor.style.position = "absolute";
		cursor.style.right = "5px";
		animContainer.appendChild(cursor);

		// Add CSS for cursor animation
		const style = document.createElement("style");
		style.textContent = `
            @keyframes blink-cursor {
                from, to { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
		document.head.appendChild(style);

		// Store original text for later use in animation sequence
		subtitle.dataset.originalText = originalText;
	}

	// 3. Prepare social icons animation - make them ready but invisible
	const socialIconsList = document.querySelector(".social-icons .link-list");
	if (socialIconsList) {
		socialIconsList.style.position = "relative";
		socialIconsList.style.opacity = "1"; // We show the container immediately
		socialIconsList.style.transform = "translateY(0)"; // No initial transform
	}

	// 4. Prepare individual social icons for sequential animation
	const socialIcons = document.querySelectorAll(".link-title");
	if (socialIcons.length > 0) {
		socialIcons.forEach((icon, index) => {
			// Clear any existing animations and prepare for new animation
			icon.style.animation = "none";
			icon.style.opacity = "0";
			icon.style.transform = "translateX(-20px)"; // Start from left side
			icon.style.transition = "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"; // More pronounced spring effect

			// Prepare icon element for animation
			const iconElement = icon.querySelector("i");
			if (iconElement) {
				iconElement.style.opacity = "0";
				iconElement.style.transform = "scale(0.5)";
				iconElement.style.transition =
					"transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease, color 0.3s ease";
			}

			// Prepare text element for separate animation
			const textElement = icon.querySelector("a span, a");
			if (textElement) {
				textElement.style.opacity = "0";
				textElement.style.transform = "translateX(-15px)";
				textElement.style.transition =
					"transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.5s ease 0.2s";
			}
		});
	}

	// 5. Prepare CTA button animation
	const ctaButton = document.querySelector(".home .cta-button");
	if (ctaButton) {
		ctaButton.style.animation = "pulse 2s infinite";
		ctaButton.style.opacity = "0";
		ctaButton.style.transform = "translateY(20px)";
		ctaButton.style.transition = "opacity 0.5s ease, transform 0.5s ease";

		// Add ripple effect on click
		ctaButton.addEventListener("click", (e) => {
			const rect = ctaButton.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const ripple = document.createElement("span");
			ripple.className = "ripple";
			ripple.style.position = "absolute";
			ripple.style.top = `${y}px`;
			ripple.style.left = `${x}px`;
			ripple.style.transform = "translate(-50%, -50%)";
			ripple.style.width = "0";
			ripple.style.height = "0";
			ripple.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
			ripple.style.borderRadius = "50%";
			ripple.style.transition =
				"all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)";

			ctaButton.appendChild(ripple);

			// Animate the ripple
			setTrackedTimeout(
				() => {
					ripple.style.width = "300px";
					ripple.style.height = "300px";
					ripple.style.opacity = "0";
				},
				10,
				"ctaRippleExpand"
			);

			// Remove ripple after animation
			setTrackedTimeout(
				() => {
					ripple.remove();
				},
				600,
				"ctaRippleRemove"
			);
		});
	}
}

// Execute home animations in proper sequence
function executeHomeAnimationSequence() {
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;

	// ANIMATION SEQUENCE TIMELINE:
	// T+0ms: Name animation starts
	// T+300ms: Name animation completes
	// T+500ms: Subtitle typing starts
	// T+700ms: Individual social icons start appearing one by one
	// T+1300ms: CTA button appears

	// 1. Start name animation (immediately)
	const name = document.querySelector(".home__name");
	if (name) {
		requestAnimationFrame(() => {
			setTrackedTimeout(
				() => {
					name.style.opacity = "1";
					name.style.transform = isLowPowerDevice
						? "translateY(0)"
						: "perspective(1000px) translateZ(0) rotateX(0)";
					name.style.textShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";

					// Add enhanced hover effect after animation completes
					setTrackedTimeout(
						() => {
							addNameHoverEffect(name, isLowPowerDevice);
						},
						300,
						"nameHoverEffect"
					);
				},
				0,
				"nameAnimation"
			);
		});
	}

	// 2. Start subtitle typing animation (delay 500ms)
	const subtitle = document.querySelector(".home h2");
	if (subtitle) {
		setTrackedTimeout(
			() => {
				startTypingAnimation(subtitle);
			},
			500,
			"subtitleTyping"
		);
	}

	// 3. Animate individual social icons with elegant sequential reveal
	const socialIcons = document.querySelectorAll(".link-title");
	if (socialIcons.length > 0) {
		socialIcons.forEach((icon, index) => {
			// Enhanced staggered animation with choreographed timing
			setTrackedTimeout(
				() => {
					// First animate the container position
					icon.style.opacity = "1";
					icon.style.transform = "translateX(0)";

					// Then animate the icon with a slight delay
					const iconElement = icon.querySelector("i");
					if (iconElement) {
						setTrackedTimeout(
							() => {
								iconElement.style.opacity = "1";
								iconElement.style.transform = "scale(1.2)";

								// Return to normal scale with a bounce effect
								setTrackedTimeout(
									() => {
										iconElement.style.transform = "scale(1)";
									},
									150,
									`iconBounceEffect-${index}`
								);
							},
							100,
							`iconExpandEffect-${index}`
						);
					}

					// Finally reveal the text with another slight delay
					const textElement = icon.querySelector("a span, a");
					if (textElement) {
						setTrackedTimeout(
							() => {
								textElement.style.opacity = "1";
								textElement.style.transform = "translateX(0)";
							},
							200,
							`textRevealEffect-${index}`
						);
					}

					// Add hover effect after animation completes
					setTrackedTimeout(
						() => {
							addIconHoverEffect(icon);
						},
						350,
						`iconHoverEffect-${index}`
					);
				},
				1000 + index * 300,
				`iconAnimation-${index}` // Longer 200ms stagger for more noticeable sequence
			);
		});
	}

	// 4. Animate CTA button (delay 1300ms - after all social icons)
	const ctaButton = document.querySelector(".home .cta-button");
	if (ctaButton) {
		setTrackedTimeout(
			() => {
				ctaButton.style.opacity = "1";
				ctaButton.style.transform = "translateY(0)";
			},
			socialIcons.length * 200 + 1200,
			"ctaButtonAnimation" // Dynamic timing based on number of social icons
		);
	}
}

// Helper function to start typing animation with true letter-by-letter effect
function startTypingAnimation(subtitle) {
	if (!subtitle || !subtitle.dataset.originalText) return;

	const originalText = subtitle.dataset.originalText;
	const animContainer = subtitle.querySelector(".subtitle-typing-container");
	const textSpan = subtitle.querySelector(".typed-text");
	const cursor = subtitle.querySelector(".typing-cursor");

	if (!animContainer || !textSpan || !cursor) return;

	// Reset everything first to ensure clean animation
	textSpan.textContent = "";
	animContainer.style.width = "20px"; // Start with just enough width for cursor

	// Type characters one by one
	let charIndex = 0;
	const typingDelay = 100; // Slower typing for more dramatic effect

	// Disable transition temporarily for initial setup
	const originalTransition = animContainer.style.transition;
	animContainer.style.transition = "none";

	// Force a reflow to apply the style changes immediately
	void animContainer.offsetWidth;

	// Restore the transition for smooth animations during typing
	setTrackedTimeout(
		() => {
			animContainer.style.transition = "width 0.05s ease-out";

			// Start the letter-by-letter typing sequence
			function typeNextChar() {
				if (charIndex < originalText.length) {
					// Add exactly one character
					textSpan.textContent += originalText.charAt(charIndex);

					// Calculate new width for container with a bit of buffer for cursor
					const newWidth = textSpan.offsetWidth + 20;

					// Expand container to fit text
					animContainer.style.width = `${newWidth}px`;

					// Update cursor position
					if (cursor) {
						cursor.style.left = "";
						cursor.style.right = "5px";
					}

					// Move to next character
					charIndex++;

					// Schedule typing of next character with a visible delay
					setTrackedTimeout(
						typeNextChar,
						typingDelay,
						`typingChar-${charIndex}`
					);
				} else {
					// Animation complete - keep cursor blinking for a while then hide it
					setTrackedTimeout(
						() => {
							if (cursor) cursor.style.display = "none";
						},
						2000,
						"cursorHide"
					);
				}
			}

			// Start typing the first character
			typeNextChar();
		},
		50,
		"typingStart"
	);
}

// Add hover effect to name element
function addNameHoverEffect(name, isLowPowerDevice) {
	// Enhanced hover effect with subtle 3D movement
	const enhancedHoverHandler = debounce(function (e) {
		const rect = name.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Calculate the rotation based on mouse position
		const rotateY = isLowPowerDevice
			? 0
			: ((mouseX - rect.width / 2) / rect.width) * 5;
		const rotateX = isLowPowerDevice
			? 0
			: -((mouseY - rect.height / 2) / rect.height) * 5;

		if (e.type === "mouseenter") {
			name.style.transform = isLowPowerDevice
				? "translateY(-5px)"
				: `perspective(1000px) translateZ(15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
			name.style.textShadow = "0 15px 35px rgba(0, 0, 0, 0.25)";
			name.style.transition = "transform 0.3s ease, text-shadow 0.3s ease";
		} else if (e.type === "mousemove") {
			if (!isLowPowerDevice) {
				name.style.transform = `perspective(1000px) translateZ(15px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
				name.style.transition = "transform 0.1s ease-out";
			}
		} else {
			name.style.transform = isLowPowerDevice
				? "translateY(0)"
				: "perspective(1000px) translateZ(0) rotateX(0) rotateY(0)";
			name.style.textShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
			name.style.transition = "transform 0.5s ease, text-shadow 0.5s ease";
		}
	}, 10);

	name.addEventListener("mouseenter", enhancedHoverHandler);
	name.addEventListener("mousemove", enhancedHoverHandler);
	name.addEventListener("mouseleave", enhancedHoverHandler);
}

// Improved social icon animation and hover effects
function addIconHoverEffect(icon) {
	// Add an advanced hover effect with scale and 3D rotation
	icon.addEventListener("mouseenter", () => {
		// Get the social icon element
		const iconElement = icon.querySelector("i");
		if (iconElement) {
			iconElement.style.transform = "scale(1.3)";
			iconElement.style.color = "rgba(240, 248, 255, 1)"; // Full brightness
			iconElement.style.textShadow = "0 0 15px rgba(240, 248, 255, 0.5)";
		}

		// Apply 3D effect to the entire icon container
		icon.style.transform =
			"perspective(800px) translateY(-5px) translateZ(10px)";
	});

	icon.addEventListener("mouseleave", () => {
		const iconElement = icon.querySelector("i");
		if (iconElement) {
			iconElement.style.transform = "scale(1)";
			iconElement.style.color = "";
			iconElement.style.textShadow = "none";
		}

		// Smooth return to original position
		icon.style.transform = "perspective(800px) translateY(0) translateZ(0)";
	});

	// Add click feedback effect
	icon.addEventListener("click", (e) => {
		// Create ripple effect for tactile feedback
		const rect = icon.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const ripple = document.createElement("span");
		ripple.className = "icon-ripple";
		ripple.style.position = "absolute";
		ripple.style.top = `${y}px`;
		ripple.style.left = `${x}px`;
		ripple.style.transform = "translate(-50%, -50%)";
		ripple.style.width = "0";
		ripple.style.height = "0";
		ripple.style.backgroundColor = "rgba(240, 248, 255, 0.4)";
		ripple.style.borderRadius = "50%";
		ripple.style.transition = "all 0.4s cubic-bezier(0.26, 0.86, 0.44, 0.985)";

		icon.appendChild(ripple); // Append to original icon

		// Animate the ripple
		setTrackedTimeout(
			() => {
				ripple.style.width = "100px";
				ripple.style.height = "100px";
				ripple.style.opacity = "0";
			},
			10,
			"iconRippleExpand"
		);

		// Remove ripple after animation
		setTrackedTimeout(
			() => {
				ripple.remove();
			},
			400,
			"iconRippleRemove"
		);
	});
}

// Jobs page animations
function initJobsPageAnimations() {
	// Animate jobs title
	const jobsTitle = document.querySelector(
		".jobs-layout .heading .text-secondary"
	);
	if (jobsTitle) {
		jobsTitle.style.animation = "none";
		jobsTitle.style.opacity = "0";
		jobsTitle.style.transform = "translateY(-20px)";
		jobsTitle.style.transition =
			"all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)";

		setTrackedTimeout(
			() => {
				jobsTitle.style.opacity = "1";
				jobsTitle.style.transform = "translateY(0)";
			},
			300,
			"jobsTitleAnimation"
		);
	}

	// Animate job cards with enhanced 3D perspective
	const jobCards = document.querySelectorAll(".Jobs");
	if (jobCards.length > 0) {
		jobCards.forEach((card, index) => {
			card.style.animation = "none";
			card.style.opacity = "0";
			card.style.transform =
				"perspective(1000px) rotateX(5deg) translateY(50px)";
			card.style.transition = `all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${
				0.3 + index * 0.15
			}s`;

			setTrackedTimeout(
				() => {
					card.style.opacity = "1";
					card.style.transform = "perspective(1000px) rotateX(0) translateY(0)";
				},
				300 + index * 150,
				`jobCardAnimation-${index}`
			);

			// Animate list items with staggered delay
			const listItems = card.querySelectorAll(".content ul li");
			listItems.forEach((item, itemIndex) => {
				item.style.animation = "none";
				item.style.opacity = "0";
				item.style.transform = "translateX(-20px)";
				item.style.transition = `all 0.5s ease ${
					0.6 + index * 0.15 + itemIndex * 0.1
				}s`;

				setTrackedTimeout(
					() => {
						item.style.opacity = "1";
						item.style.transform = "translateX(0)";
					},
					600 + index * 150 + itemIndex * 100,
					`listItemAnimation-${index}-${itemIndex}`
				);
			});
		});
	}
}

// Projects page animations
function initProjectsPageAnimations() {
	const projectCards = document.querySelectorAll(".Projects");

	if (projectCards.length > 0) {
		projectCards.forEach((card, index) => {
			card.style.animation = "none";
			card.style.opacity = "0";
			card.style.transform =
				"perspective(1000px) rotateY(10deg) translateZ(-50px)";
			card.style.transition = `all 0.8s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${
				0.3 + index * 0.1
			}s`;

			setTrackedTimeout(
				() => {
					card.style.opacity = "1";
					card.style.transform = "perspective(1000px) rotateY(0) translateZ(0)";
				},
				300 + index * 100,
				`projectCardAnimation-${index}`
			);
		});
	}

	// Animate project header
	const projectHeader = document.querySelector(".project__project-image");
	if (projectHeader) {
		projectHeader.style.animation = "none";
		projectHeader.style.opacity = "0.6";
		projectHeader.style.transform = "scale(0.98)";
		projectHeader.style.transition =
			"all 1.2s cubic-bezier(0.26, 0.86, 0.44, 0.985)";

		setTrackedTimeout(
			() => {
				projectHeader.style.opacity = "1";
				projectHeader.style.transform = "scale(1)";
			},
			200,
			"projectHeaderAnimation"
		);
	}
}

// Certifications page animations
function initCertificationsPageAnimations() {
	// Animate certification cards with staggered 3D reveal
	const certCards = document.querySelectorAll(".certificate-content");

	if (certCards.length > 0) {
		certCards.forEach((card, index) => {
			card.style.animation = "none";
			card.style.opacity = "0";
			card.style.transform =
				"perspective(1000px) rotateX(10deg) translateY(50px)";
			card.style.transition = `all 0.7s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${
				0.3 + index * 0.15
			}s`;

			setTrackedTimeout(
				() => {
					card.style.opacity = "1";
					card.style.transform = "perspective(1000px) rotateX(0) translateY(0)";
				},
				400 + index * 150,
				`certCardAnimation-${index}`
			);
		});
	}

	// Animate certification heading
	const heading = document.querySelector(".certification #heading");
	if (heading) {
		heading.style.animation = "none";
		heading.style.opacity = "0";
		heading.style.transform = "translateY(-30px)";
		heading.style.transition = "all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)";

		setTrackedTimeout(
			() => {
				heading.style.opacity = "1";
				heading.style.transform = "translateY(0)";
			},
			300,
			"certHeadingAnimation"
		);
	}
}

// About page animations
function initAboutPageAnimations() {
	// Animate about headings and content
	const aboutElements = document.querySelectorAll(
		".about h2, .about p, .about .about-details, .about .contact-email"
	);

	if (aboutElements.length > 0) {
		aboutElements.forEach((element, index) => {
			element.style.animation = "none";
			element.style.opacity = "0";
			element.style.transform = "translateY(30px)";
			element.style.transition = `all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${
				0.3 + index * 0.1
			}s`;

			setTrackedTimeout(
				() => {
					element.style.opacity = "1";
					element.style.transform = "translateY(0)";
				},
				300 + index * 100,
				`aboutElementAnimation-${index}`
			);
		});
	}
}

// Universal animations and effects for all pages
function initUniversalAnimations() {
	// Smooth page transitions for internal links
	document.addEventListener("click", (e) => {
		const link = e.target.closest("a");

		if (
			link &&
			link.href &&
			link.href.startsWith(window.location.origin) &&
			!link.getAttribute("target") &&
			!e.ctrlKey &&
			!e.metaKey
		) {
			e.preventDefault();
			const main = document.querySelector("main");

			if (main) {
				main.style.opacity = "0";
				main.style.transform = "translateY(-20px)";

				setTrackedTimeout(
					() => {
						window.location.href = link.href;
					},
					400,
					"linkTransition"
				);
			} else {
				window.location.href = link.href;
			}
		}
	});

	// REMOVED: Initialize modern menu call

	// Update copyright year dynamically
	updateCopyrightYear();

	// Initialize keyboard navigation detection
	detectKeyboardNavigation();
} // <-- Corrected closing brace

// Parallax effect for background elements (Consolidated - handles .home via data attribute)
function initParallaxEffect() {
	const parallaxElements = document.querySelectorAll(
		".home, .about, .jobs-layout, .project__project-image"
	);

	let ticking = false;

	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const scrollY = window.scrollY;

				parallaxElements.forEach((element) => {
					const speed = element.getAttribute("data-parallax-speed") || 0.2;
					const yPos = -(scrollY * speed);
					element.style.backgroundPositionY = `calc(center + ${yPos}px)`;
				});

				ticking = false;
			});

			ticking = true;
		}
	});

	// Set parallax speed attributes
	parallaxElements.forEach((element) => {
		if (!element.getAttribute("data-parallax-speed")) {
			element.setAttribute("data-parallax-speed", "0.2");
		}
	});
}

// Function to animate skill cards within a container
function animateSkillCards(container) {
	if (!container) return;

	// Target only cards that are NOT set to display: none by the filtering logic
	const cards = container.querySelectorAll(".skills__card:not([style*='display: none'])");
	// const animationSettings = {
	// 	duration: "0.6s",
	// 	staggerDelay: 0.08,
	// };

	cards.forEach((card, index) => {
		// --- TEMPORARY SIMPLIFICATION FOR DEBUGGING --- 
		// Directly apply final styles instead of transitioning
		card.style.opacity = "1";
		card.style.transform = "translateY(0)";
        card.style.transition = 'none'; // Disable transition temporarily
        card.style.animation = 'none'; // Disable other animations temporarily
		card.style.cursor = "pointer";
		card.title = "Click to see details";

		// --- Original Animation Code (Commented Out) ---
		// card.style.animation = "none"; // Reset animation
		// card.style.opacity = "0";
		// card.style.transform = "translateY(30px)";
		// // Apply transition for fade-in/slide-up effect
		// card.style.transition = `all ${
		// 	animationSettings.duration
		// } cubic-bezier(0.26, 0.86, 0.44, 0.985) ${
		// 	animationSettings.staggerDelay * index
		// }s`;
		// card.style.cursor = "pointer"; 
		// card.title = "Click to see details"; 

		// // Use setTimeout for staggered animation start
		// setTrackedTimeout(
		// 	() => {
		// 		card.style.opacity = "1";
		// 		card.style.transform = "translateY(0)";

		// 		// Trigger progress bar animation if visible (handled by IntersectionObserver)
		// 		// This part might be better handled directly within the IntersectionObserver callback
		// 		// const progressBar = card.querySelector(".skills__progress-bar");
		// 		// if (progressBar && card.classList.contains("observed-visible")) {
		// 		// 	const level = progressBar.dataset.level || "0";
		// 		// 	progressBar.style.width = `${level}%`;
		// 		// }
		// 	},
		// 	100 + animationSettings.staggerDelay * index * 1000, // Delay slightly after container appears
		// 	`skillCardAnim-${container.id || 'group'}-${index}` // Use container id or default
		// );
		// --- End Original Animation Code ---
	});

	// Re-initialize VanillaTilt for the visible cards if library is loaded
	if (typeof VanillaTilt !== "undefined") {
		VanillaTilt.init(cards, {
			max: 15,
			speed: 400,
			glare: true,
			"max-glare": 0.2,
		});
	}

	// Re-observe cards for progress bar animation
	if (typeof initIntersectionObserver === "function") {
		initIntersectionObserver(cards); // Pass specific cards to observe
	}
}

// --- ADD CLICK HANDLER FUNCTION ---
function handleCardClick(event) {
	const clickedCard = event.currentTarget;

	// Check if the click is on the card itself, not interactive elements inside the back
	if (event.target.closest("a, button")) {
		return; // Don't toggle if clicking a link/button inside
	}

	// Toggle the expanded class on the clicked card
	clickedCard.classList.toggle("expanded");
	// Update tooltip based on state
	clickedCard.title = clickedCard.classList.contains("expanded")
		? "Click to close details"
		: "Click to see details";

	// Optional: Close other expanded cards in the same container
	const container = clickedCard.closest(".skills__group");
	if (container) {
		const allCardsInContainer = container.querySelectorAll(".skills__card");
		allCardsInContainer.forEach((card) => {
			if (card !== clickedCard && card.classList.contains("expanded")) {
				card.classList.remove("expanded");
				card.title = "Click to see details"; // Reset title on close
			}
		});
	}
}
// --- END ADD CLICK HANDLER FUNCTION ---

// Skills page animations with interactive elements - Modified to reduce toast notifications and improve performance
// NOTE: Much of the filtering/tab logic is now in skills.js. This function might be simplified or removed if skills.js handles initialization.
function initSkillsPageAnimations() {
	// Check if this is the first visit to skills page
	const isFirstVisit = checkFirstTimeVisit("skills-page");

	// Check for low-power devices or reduced motion preference
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;

	// Adjust animation settings based on device capabilities
	const animationSettings = {
		useSimpleAnimations: isLowPowerDevice || prefersReducedMotion,
		duration: isLowPowerDevice ? "0.4s" : "0.7s",
		staggerDelay: isLowPowerDevice ? 0.02 : 0.05,
	};

	// Animate skills heading with fade in and slide up
	const skillsHeading = document.querySelector(".skills__heading");
	if (skillsHeading) {
		// Use transform: translate3d for GPU acceleration
		skillsHeading.style.animation = "none";
		skillsHeading.style.opacity = "0";
		skillsHeading.style.transform = "translate3d(0, 20px, 0)";
		skillsHeading.style.transition = `all ${animationSettings.duration} cubic-bezier(0.26, 0.86, 0.44, 0.985)`;

		// Use requestAnimationFrame for smoother animations
		requestAnimationFrame(() => {
			setTrackedTimeout(
				() => {
					skillsHeading.style.opacity = "1";
					skillsHeading.style.transform = "translate3d(0, 0, 0)";
				},
				300,
				"skillsHeadingAnimation"
			);
		});
	}

	// Animate search/filter controls
	const searchFilterControls = document.querySelector(".skills__search-filter");
	if (searchFilterControls) {
		searchFilterControls.style.animation = "none";
		searchFilterControls.style.opacity = "0";
		searchFilterControls.style.transform = "translateY(20px)";
		searchFilterControls.style.transition = `all ${animationSettings.duration} cubic-bezier(0.26, 0.86, 0.44, 0.985) 0.2s`; // Delay slightly

		setTrackedTimeout(
			() => {
				searchFilterControls.style.opacity = "1";
				searchFilterControls.style.transform = "translateY(0)";
			},
			500,
			"searchFilterAnimation"
		);
	}

	// // Automatically click the "All" tab when the page loads - MOVED TO skills.js initialization
	// setTrackedTimeout(
	// 	() => {
	// 		const allTab = document.querySelector(
	// 			'.category-tab[data-category="all"]'
	// 		);
	// 		if (allTab) {
	// 			allTab.click(); // This will trigger handleCategoryChange, which calls animateSkillCards
	// 		}
	// 	},
	// 	300,
	// 	"allTabClick"
	// );

	// // Animate category tabs with staggered fade in - MOVED TO skills.js initialization (or keep if skills.js doesn't handle init)
	// const categoryTabs = document.querySelectorAll(".category-tab");
	// if (categoryTabs.length > 0) {
	// 	categoryTabs.forEach((tab, index) => {
	// 		tab.style.animation = "none";
	// 		tab.style.opacity = "0";
	// 		tab.style.transform = "translateY(20px)";
	// 		tab.style.transition = `all 0.5s cubic-bezier(0.26, 0.86, 0.44, 0.985) ${
	// 			0.4 + index * 0.1
	// 		}s`;

	// 		setTrackedTimeout(
	// 			() => {
	// 				tab.style.opacity = "1";
	// 				tab.style.transform = "translateY(0)";
	// 			},
	// 			500 + index * 100,
	// 			`categoryTabAnimation-${index}`
	// 		);

	// 		// Add click event to show relevant skill group - MOVED TO skills.js
	// 		// tab.addEventListener("click", () => { ... });

	// 		// Add keyboard support for tab navigation - MOVED TO skills.js
	// 		// tab.addEventListener("keydown", (e) => { ... });
	// 	});
	// }

	// Add interactions for tech stack badges (Keep here or move to skills.js if specific to skills page)
	const techStackBadges = document.querySelectorAll(".tech-stack__badges img");
	if (techStackBadges.length > 0) {
		techStackBadges.forEach((badge) => {
			badge.addEventListener("click", () => {
				const technology = badge.getAttribute("src").match(/badge\/([^-]+)/);
				// Only show badge toast once per session
				if (
					technology &&
					technology[1] &&
					!sessionStorage.getItem("techBadgeToastShown")
				) {
					// Decode URL encoded badge name if necessary
					const techName = decodeURIComponent(technology[1].replace(/_/g, " "));
					showToast(
						techName,
						"One of my favorite technologies!",
						"fa-solid fa-code"
					);
					sessionStorage.setItem("techBadgeToastShown", "true");
				}
			});
		});
	}

	// // Add 3D effect to skills globe elements - Assuming this is not present or needed
	// const skillOrbitElements = document.querySelectorAll(".skill-orbit");
	// ... (globe logic removed for brevity, assuming it's not the primary focus) ...

	// Show keyboard shortcut hint only for first-time visitors
	if (isFirstVisit) {
		setTrackedTimeout(
			() => {
				showToast(
					"Keyboard Shortcuts",
					"Use Alt + Left/Right arrows to navigate between pages.",
					"fa-solid fa-keyboard"
				);
			},
			3000,
			"keyboardHintInit"
		);
	}
}

// Toast notification function - Optimized for visibility and performance
function showToast(title, message, iconClass) {
	// Check if toast container exists, if not create it
	let toastContainer = document.querySelector(".toast-container");
	if (!toastContainer) {
		toastContainer = document.createElement("div");
		toastContainer.className = "toast-container";
		// --- Improved Container Styles ---
		toastContainer.style.position = "fixed";
		toastContainer.style.bottom = "20px"; // Position at bottom-right
		toastContainer.style.right = "20px";
		toastContainer.style.maxWidth = "320px"; // Slightly wider
		toastContainer.style.zIndex = "10000";
		toastContainer.style.pointerEvents = "none"; // Allow clicks through container
		toastContainer.style.display = "flex";
		toastContainer.style.flexDirection = "column-reverse"; // New toasts appear above old ones
		toastContainer.style.gap = "10px"; // Space between toasts
		document.body.appendChild(toastContainer);
	}

	// Generate unique ID for this toast
	const toastId = "toast-" + Date.now();

	// Create toast element
	const toast = document.createElement("div");
	toast.id = toastId;
	toast.setAttribute("role", "alert"); // Accessibility
	toast.setAttribute("aria-live", "assertive"); // Accessibility

	// --- Improved Toast Styles ---
	toast.style.background =
		"linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(25, 25, 25, 0.98))"; // Subtle gradient
	toast.style.backdropFilter = "blur(8px)"; // Slightly less blur
	toast.style.color = "#e0e0e0"; // Lighter text color
	toast.style.padding = "15px 20px"; // More padding
	toast.style.borderRadius = "8px"; // More rounded corners
	toast.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.4)"; // Softer, larger shadow
	toast.style.display = "flex";
	toast.style.alignItems = "center"; // Vertically align items
	toast.style.pointerEvents = "auto"; // Allow interaction with toast
	toast.style.overflow = "hidden";
	toast.style.position = "relative";
	// toast.style.borderLeft = "4px solid #58a6ff"; // Accent border (e.g., blue) - Adjust color as needed
	toast.style.opacity = "0";
	toast.style.transform = "translateY(20px) scale(0.95)"; // Start slightly down and scaled down
	toast.style.transition =
		"opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"; // Smoother transition

	// Create icon container
	const iconContainer = document.createElement("div");
	iconContainer.style.display = "flex";
	iconContainer.style.alignItems = "center";
	iconContainer.style.justifyContent = "center";
	iconContainer.style.marginRight = "15px"; // More space for icon
	iconContainer.style.fontSize = "1.4rem"; // Larger icon
	iconContainer.style.color = "#79c0ff"; // Match accent color (adjust if border color changes)
	iconContainer.style.flexShrink = "0";
	iconContainer.style.width = "28px";
	iconContainer.style.height = "28px";

	// Create icon
	const icon = document.createElement("i");
	icon.className = iconClass; // Use the provided icon class
	iconContainer.appendChild(icon);

	// Create content container
	const contentContainer = document.createElement("div");
	contentContainer.style.flex = "1"; // Take remaining space
	contentContainer.style.minWidth = "0"; // Prevent overflow issues

	// Create title
	const titleElement = document.createElement("h4");
	titleElement.textContent = title;
	titleElement.style.margin = "0 0 4px 0"; // Space below title
	titleElement.style.fontSize = "1rem"; // Standard title size
	titleElement.style.fontWeight = "600";
	titleElement.style.color = "#ffffff"; // White title
	contentContainer.appendChild(titleElement);

	// Create message
	const messageElement = document.createElement("p");
	messageElement.textContent = message;
	messageElement.style.margin = "0";
	messageElement.style.fontSize = "0.9rem";
	messageElement.style.lineHeight = "1.4"; // Better readability
	messageElement.style.opacity = "0.85"; // Slightly less prominent message text
	contentContainer.appendChild(messageElement);

	// Create close button
	const closeButton = document.createElement("button");
	closeButton.setAttribute("aria-label", "Close notification"); // Accessibility
	closeButton.style.background = "transparent";
	closeButton.style.border = "none";
	closeButton.style.color = "rgba(255, 255, 255, 0.6)"; // Dimmer close icon
	closeButton.style.cursor = "pointer";
	closeButton.style.padding = "5px"; // Clickable area
	closeButton.style.marginLeft = "10px"; // Space before close button
	closeButton.style.fontSize = "1rem";
	closeButton.style.lineHeight = "1"; // Ensure icon is centered
	closeButton.style.transition = "color 0.2s ease";
	closeButton.innerHTML = '<i class="fa-solid fa-times"></i>';

	// Close button hover effect
	closeButton.onmouseenter = () =>
		(closeButton.style.color = "rgba(255, 255, 255, 0.9)");
	closeButton.onmouseleave = () =>
		(closeButton.style.color = "rgba(255, 255, 255, 0.6)");

	// Close action
	const closeToast = () => {
		toast.style.opacity = "0";
		toast.style.transform = "translateY(10px) scale(0.9)"; // Animate out downwards

		setTrackedTimeout(
			() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
				// If container is empty after removal, remove container
				if (toastContainer.children.length === 0) {
					toastContainer.remove();
				}
			},
			300, // Match transition duration
			`toastRemove-${toastId}`
		);
	};
	closeButton.onclick = closeToast;

	// Add elements to toast
	toast.appendChild(iconContainer);
	toast.appendChild(contentContainer);
	toast.appendChild(closeButton);

	// Add toast to container (prepends so new toasts are at the bottom visually due to flex-direction: column-reverse)
	toastContainer.insertBefore(toast, toastContainer.firstChild);

	// Force a reflow before animating in
	void toast.offsetWidth;

	// Animate in
	toast.style.opacity = "1";
	toast.style.transform = "translateY(0) scale(1)";

	// Auto-remove toast after 6 seconds
	setTrackedTimeout(
		() => {
			// Check if toast still exists before trying to close
			if (document.getElementById(toastId)) {
				closeToast();
			}
		},
		6000, // Increased duration
		`toastAutoRemove-${toastId}`
	);
}

// Add keyboard shortcuts for navigation
document.addEventListener("keydown", (e) => {
	// Process shortcuts if Alt key is pressed (to avoid interfering with normal typing)
	if (e.altKey) {
		switch (e.key) {
			// Existing letter shortcuts
			case "h": // Alt+H for Home
				e.preventDefault();
				navigateTo("index.html");
				break;
			case "j": // Alt+J for Jobs
				e.preventDefault();
				navigateTo("jobs.html");
				break;
			case "p": // Alt+P for Projects
				e.preventDefault();
				navigateTo("projects.html");
				break;
			case "c": // Alt+C for Certifications
				e.preventDefault();
				navigateTo("certification.html");
				break;
			case "s": // Alt+S for Skills
				e.preventDefault();
				navigateTo("skills.html");
				break;
			case "a": // Alt+A for About
				e.preventDefault();
				navigateTo("about.html");
				break;
			case "m": // Alt+M to toggle menu
				e.preventDefault();
				toggleMenu();
				break;

			// Add Arrow key shortcuts
			case "ArrowRight": // Alt+Right Arrow for next page
				e.preventDefault();
				navigateNextPage();
				break;
			case "ArrowLeft": // Alt+Left Arrow for previous page
				e.preventDefault();
				navigatePreviousPage();
				break;
			case "ArrowUp": // Alt+Up Arrow for Home
				e.preventDefault();
				navigateTo("index.html");
				break;
			case "ArrowDown": // Alt+Down Arrow for About (last page)
				e.preventDefault();
				navigateTo("about.html");
				break;
		}
	}
	// Also handle Escape key for menu closing here, consolidating listener
	else if (e.key === "Escape" && showMenu) {
		toggleMenu();
	}
});

// Function to determine the next page in the navigation sequence
function navigateNextPage() {
	const pages = [
		"index.html",
		"jobs.html",
		"projects.html",
		"certification.html",
		"skills.html",
		"about.html",
	];
	const currentPath = window.location.pathname;

	// Find current page index
	let currentIndex = -1;
	for (let i = 0; i < pages.length; i++) {
		if (
			currentPath.includes(pages[i]) ||
			(pages[i] === "index.html" && currentPath.endsWith("/"))
		) {
			currentIndex = i;
			break;
		}
	}

	// Navigate to next page or loop back to first
	if (currentIndex !== -1) {
		const nextIndex = (currentIndex + 1) % pages.length;
		navigateTo(pages[nextIndex]);
	} else {
		// Default to home if page not found in sequence
		navigateTo("index.html");
	}
}

// Function to determine the previous page in the navigation sequence
function navigatePreviousPage() {
	const pages = [
		"index.html",
		"jobs.html",
		"projects.html",
		"certification.html",
		"skills.html",
		"about.html",
	];
	const currentPath = window.location.pathname;

	// Find current page index
	let currentIndex = -1;
	for (let i = 0; i < pages.length; i++) {
		if (
			currentPath.includes(pages[i]) ||
			(pages[i] === "index.html" && currentPath.endsWith("/"))
		) {
			currentIndex = i;
			break;
		}
	}

	// Navigate to previous page or loop back to last
	if (currentIndex !== -1) {
		const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
		navigateTo(pages[prevIndex]);
	} else {
		// Default to home if page not found in sequence
		navigateTo("index.html");
	}
}

// Helper function for keyboard navigation
function navigateTo(url) {
	const main = document.querySelector("main");
	const pageName = url.replace(".html", "").replace("index", "Home"); // Get a user-friendly name

	if (main) {
		// Show a toast notification about the navigation
		showToast(
			"Navigating...", // Simpler title
			`Loading ${pageName} page`, // Clearer message
			"fa-solid fa-spinner fa-spin" // Use a loading icon
		);

		// Animate transition
		main.style.opacity = "0";
		main.style.transform = "translateY(-20px)";

		setTrackedTimeout(
			() => {
				window.location.href = url;
			},
			400, // Keep delay for animation
			"keyboardNavigation"
		);
	} else {
		window.location.href = url; // Navigate directly if main element not found
	}
}

// Add persistent session storage to track first-time visits
function checkFirstTimeVisit(pageName) {
	// Get or initialize the visitedPages object in sessionStorage
	let visitedPages =
		JSON.parse(sessionStorage.getItem("portfolioVisitedPages")) || {};

	// Check if this is the first visit to this page
	const isFirstVisit = !visitedPages[pageName];

	// If it's the first visit, mark the page as visited for future checks
	if (isFirstVisit) {
		visitedPages[pageName] = true;
		sessionStorage.setItem(
			"portfolioVisitedPages",
			JSON.stringify(visitedPages)
		);
	}

	return isFirstVisit;
}

/**
 * Debounce helper function to improve performance of event handlers
 */
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func.apply(this, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// Update copyright year dynamically across all pages
function updateCopyrightYear() {
	const currentYear = new Date().getFullYear();
	document
		.querySelectorAll('.copyright-link, footer a[href="copyright.html"]')
		.forEach((el) => {
			if (el.textContent.includes("©")) {
				el.innerHTML = el.innerHTML.replace(/\d{4}/, currentYear);
			}
		});
}

/**
 * Detect keyboard navigation to show focus styles appropriately
 */
function detectKeyboardNavigation() {
	// Add class to body when user navigates with keyboard
	let isUsingKeyboard = false;

	// Add keyboard navigation class
	function handleKeyDown(e) {
		if (e.key === "Tab") {
			if (!isUsingKeyboard) {
				document.body.classList.add("keyboard-nav-active");
				isUsingKeyboard = true;
			}
		}
	}

	// Remove keyboard navigation class when using mouse
	function handleMouseDown() {
		if (isUsingKeyboard) {
			document.body.classList.remove("keyboard-nav-active");
			isUsingKeyboard = false;
		}
	}

	// Add event listeners
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("mousedown", handleMouseDown);

	// Check for users who might be using screen readers
	if (
		navigator.userAgent.includes("JAWS") ||
		navigator.userAgent.includes("NVDA") ||
		navigator.userAgent.includes("VoiceOver")
	) {
		document.body.classList.add("keyboard-nav-active");
	}
}
