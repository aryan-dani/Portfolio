/** @format */

function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

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
menuBtn.title = "Click to open navigation menu (Alt+M)";
function toggleMenu() {
	if (!showMenu) {
		menuNav.style.opacity = "0";
		nav.style.visibility = "visible";
		hamburger.classList.add("open");
		nav.classList.add("open");
		menuNav.classList.add("open");
		setTrackedTimeout(
			() => {
				const menuHeight = menuNav.offsetHeight;
				document.documentElement.style.setProperty(
					"--menu-height",
					menuHeight + "px"
				);
			},
			10,
			"calculateMenuHeight"
		);
		document.body.classList.add("menu-open");
		document.documentElement.style.background = "transparent"; // Prevent black border
		setTrackedTimeout(
			() => {
				menuNav.style.opacity = "1";
				navItems.forEach((item) => item.classList.add("open"));
			},
			50,
			"menuOpenAnimation"
		);
		showMenu = true;
	} else {
		menuNav.style.opacity = "0";
		navItems.forEach((item) => item.classList.remove("open"));
		document.body.classList.remove("menu-open");
		document.documentElement.style.background = ""; // Restore background
		setTrackedTimeout(
			() => {
				hamburger.classList.remove("open");
				nav.classList.remove("open");
				menuNav.classList.remove("open");
				setTrackedTimeout(
					() => {
						if (!showMenu) {
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
navItems.forEach((item) => {
	item.addEventListener("click", () => {
		if (showMenu) {
			toggleMenu();
		}
	});
});
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
document.addEventListener("DOMContentLoaded", () => {
	// ... (header scroll, page name detection) ...
	const pagePath = window.location.pathname;
	const isHomePage = pagePath.includes("index.html") || pagePath.endsWith("/");
	let pageName = "home";
	if (pagePath.includes("experience.html")) pageName = "experience";
	else if (pagePath.includes("projects.html")) pageName = "projects";
	else if (pagePath.includes("certification.html")) pageName = "certification";
	else if (pagePath.includes("skills.html")) pageName = "skills";
	else if (pagePath.includes("about.html")) pageName = "about";
	setTrackedTimeout(
		() => {
			// Show navigation tip once per session
			const navTipKey = "portfolioNavTipShown";
			if (!sessionStorage.getItem(navTipKey)) {
				showToast(
					// Corrected arguments: message, type, duration, title, icon
					"Use Alt + Arrow keys or Alt + [Letter] (H, J, P, C, S, A) to navigate between pages.", // message
					"info", // type
					8000, // duration (longer duration)
					"Navigation Tip", // title
					"fa-solid fa-keyboard" // iconClass
				);
				sessionStorage.setItem(navTipKey, "true"); // Mark as shown for this session
			}

			// Show page-specific welcome message once per page per session
			const isFirst = checkFirstTimeVisit(pageName);

			if (isFirst) {
				if (typeof showToast === "function") {
					// Refactored welcome toast logic
					const welcomeToasts = {
						home: {
							message: "Explore my work and get to know me better",
							title: "Welcome to My Portfolio",
							icon: "fa-solid fa-house-user",
						},
						experience: {
							// Changed key from 'jobs' to 'experience'
							message: "Learn about my career journey and achievements",
							title: "Professional Experience",
							icon: "fa-solid fa-briefcase",
						},
						projects: {
							message: "Discover the projects I've worked on",
							title: "Portfolio Projects",
							icon: "fa-solid fa-code",
						},
						certification: {
							message: "Check out my professional qualifications",
							title: "My Certifications",
							icon: "fa-solid fa-certificate",
						},
						skills: {
							message: "Explore my expertise across different technologies",
							title: "Technical Skills",
							icon: "fa-solid fa-laptop-code",
						},
						about: {
							message: "Get to know me better",
							title: "About",
							icon: "fa-solid fa-user",
						},
					};

					const toastDetails = welcomeToasts[pageName];

					if (toastDetails) {
						showToast(
							toastDetails.message,
							"info", // Type
							6000, // Duration
							toastDetails.title,
							toastDetails.icon
						);
					} else {
						console.error(
							`[WelcomeToast] No toast details found for pageName: ${pageName}`
						);
					}
				} else {
					console.error("[WelcomeToast] showToast function is not defined.");
				}
			}
		},
		1200, // Keep the original delay for welcome toasts
		"welcomeToast"
	);
	initPageTransition();
	if (isHomePage) {
		initHomePageAnimations();
		const homeImageContainer = document.querySelector(".home__image-container");
		if (homeImageContainer && typeof VanillaTilt !== "undefined") {
			VanillaTilt.init(homeImageContainer, {
				max: 15, // Max tilt rotation (degrees)
				speed: 400, // Speed of the enter/exit transition
				glare: true, // Add a glare effect
				"max-glare": 0.3, // Glare intensity (0-1)
			});
		}
	} else if (pagePath.includes("jobs.html")) {
		initJobsPageAnimations();
	} else if (pagePath.includes("certification.html")) {
		initCertificationsPageAnimations();
	} else if (pagePath.includes("skills.html")) {
		initSkillsPageAnimations();
	} else if (pagePath.includes("about.html")) {
		initAboutPageAnimations();
	}
	initUniversalAnimations();
	initScrollAnimations(); // Initialize scroll animations
	if (
		isHomePage ||
		pagePath.includes("experience.html") || // Corrected from jobs.html
		pagePath.includes("about.html") ||
		pagePath.includes("projects.html") // Assuming parallax is used here too based on initParallaxEffect querySelector
	) {
		initParallaxEffect();
	}
}); // <-- Added closing parenthesis and semicolon

// Function to initialize Intersection Observer for scroll animations
function initScrollAnimations() {
	const animatedElements = document.querySelectorAll(".animate-on-scroll");
	if (!animatedElements.length) return;

	const observerOptions = {
		root: null, // Use the viewport as the root
		rootMargin: "0px",
		threshold: 0.1, // Trigger when 10% of the element is visible
	};

	const observerCallback = (entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				// Optional: Unobserve after animation triggers once
				// observer.unobserve(entry.target);
			} else {
				// Optional: Remove class if you want animation to reverse on scroll out
				// entry.target.classList.remove("is-visible");
			}
		});
	};

	const observer = new IntersectionObserver(observerCallback, observerOptions);
	animatedElements.forEach((el) => observer.observe(el));
}

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
const timeoutMap = new Map();
function setTrackedTimeout(callback, delay, id) {
	clearTrackedTimeout(id);
	const timeoutId = setTimeout(() => {
		timeoutMap.delete(id);
		callback();
	}, delay);
	timeoutMap.set(id, timeoutId);
	return timeoutId;
}
function clearTrackedTimeout(id) {
	if (timeoutMap.has(id)) {
		clearTimeout(timeoutMap.get(id));
		timeoutMap.delete(id);
	}
}
function initHomePageAnimations() {
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;
	prepareHomeAnimations();
	executeHomeAnimationSequence();
	addHomeContentParallax();
}
function prepareHomeAnimations() {
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;
	const name = document.querySelector(".home__name");
	if (name) {
		name.style.animation = "none";
		name.style.opacity = "0";
		name.style.transform = isLowPowerDevice
			? "translateY(-25px)"
			: "perspective(1000px) translateZ(-30px) rotateX(10deg)";
		name.style.transition = "all 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67)";
		const existingEffect = name.querySelector("div");
		if (existingEffect) {
			existingEffect.remove();
		}
	}
	const subtitle = document.querySelector(".home h2");
	if (subtitle) {
		const originalText = subtitle.textContent;
		const originalBgColor = getComputedStyle(subtitle).backgroundColor;
		const originalColor = getComputedStyle(subtitle).color;
		const originalBorderRadius = getComputedStyle(subtitle).borderRadius;
		const originalPadding = getComputedStyle(subtitle).padding;
		subtitle.textContent = "";
		subtitle.style.background = "transparent";
		subtitle.style.opacity = "1";
		subtitle.style.padding = "0";
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
		const textSpan = document.createElement("span");
		textSpan.className = "typed-text";
		animContainer.appendChild(textSpan);
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
		const style = document.createElement("style");
		style.textContent = `
            @keyframes blink-cursor {
                from, to { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
		document.head.appendChild(style);
		subtitle.dataset.originalText = originalText;
	}
	const socialIconsList = document.querySelector(".social-icons .link-list");
	if (socialIconsList) {
		socialIconsList.style.position = "relative";
		socialIconsList.style.opacity = "1"; // We show the container immediately
		socialIconsList.style.transform = "translateY(0)"; // No initial transform
	}
	const socialIcons = document.querySelectorAll(".link-title");
	if (socialIcons.length > 0) {
		socialIcons.forEach((icon, index) => {
			icon.style.animation = "none";
			icon.style.opacity = "0";
			icon.style.transform = "translateX(-20px)"; // Start from left side
			icon.style.transition = "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"; // More pronounced spring effect
			const iconElement = icon.querySelector("i");
			if (iconElement) {
				iconElement.style.opacity = "0";
				iconElement.style.transform = "scale(0.5)";
				iconElement.style.transition =
					"transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease, color 0.3s ease";
			}
			const textElement = icon.querySelector("a span, a");
			if (textElement) {
				textElement.style.opacity = "0";
				textElement.style.transform = "translateX(-15px)";
				textElement.style.transition =
					"transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s, opacity 0.5s ease 0.2s";
			}
		});
	}
	const ctaButton = document.querySelector(".home .cta-button");
	if (ctaButton) {
		ctaButton.style.animation = "pulse 2s infinite";
		ctaButton.style.opacity = "0";
		ctaButton.style.transform = "translateY(20px)";
		ctaButton.style.transition = "opacity 0.5s ease, transform 0.5s ease";
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
			setTrackedTimeout(
				() => {
					ripple.style.width = "300px";
					ripple.style.height = "300px";
					ripple.style.opacity = "0";
				},
				10,
				"ctaRippleExpand"
			);
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
function addHomeContentParallax() {
	const content = document.querySelector(".home__content");
	if (!content) return;
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;
	const maxOffset = 15; // Max pixels to move
	const dampening = 0.05; // How quickly it reacts (lower is slower/smoother)
	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;
	function updatePosition(event) {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		targetX = ((mouseX - centerX) / centerX) * -maxOffset;
		targetY = ((mouseY - centerY) / centerY) * -maxOffset;
	}
	function animate() {
		currentX += (targetX - currentX) * dampening;
		currentY += (targetY - currentY) * dampening;
		if (!prefersReducedMotion && !isLowPowerDevice) {
			content.style.transform = `translate(${currentX}px, ${currentY}px)`;
		}
		requestAnimationFrame(animate);
	}
	window.addEventListener("mousemove", updatePosition);
	animate(); // Start the animation loop
}
function executeHomeAnimationSequence() {
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;
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
				},
				0,
				"nameAnimation"
			);
		});
	}
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
	const socialIcons = document.querySelectorAll(".link-title");
	if (socialIcons.length > 0) {
		socialIcons.forEach((icon, index) => {
			setTrackedTimeout(
				() => {
					icon.style.opacity = "1";
					icon.style.transform = "translateX(0)";
					const iconElement = icon.querySelector("i");
					if (iconElement) {
						setTrackedTimeout(
							() => {
								iconElement.style.opacity = "1";
								iconElement.style.transform = "scale(1.2)";
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
					setTrackedTimeout(
						() => {
							// This timeout is no longer needed
						},
						350,
						`iconHoverEffect-${index}` // Longer 200ms stagger for more noticeable sequence
					);
				},
				1000 + index * 300,
				`iconAnimation-${index}` // Longer 200ms stagger for more noticeable sequence
			);
		});
	}
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
function startTypingAnimation(subtitle) {
	if (!subtitle || !subtitle.dataset.originalText) return;
	const originalText = subtitle.dataset.originalText;
	const animContainer = subtitle.querySelector(".subtitle-typing-container");
	const textSpan = subtitle.querySelector(".typed-text");
	const cursor = subtitle.querySelector(".typing-cursor");
	if (!animContainer || !textSpan || !cursor) return;
	textSpan.textContent = "";
	animContainer.style.width = "20px"; // Start with just enough width for cursor
	let charIndex = 0;
	const typingDelay = 100; // Slower typing for more dramatic effect
	const originalTransition = animContainer.style.transition;
	animContainer.style.transition = "none";
	void animContainer.offsetWidth;
	setTrackedTimeout(
		() => {
			animContainer.style.transition = "width 0.05s ease-out";
			function typeNextChar() {
				if (charIndex < originalText.length) {
					textSpan.textContent += originalText.charAt(charIndex);
					const newWidth = textSpan.offsetWidth + 20;
					animContainer.style.width = `${newWidth}px`;
					if (cursor) {
						cursor.style.left = "";
						cursor.style.right = "5px";
					}
					charIndex++;
					setTrackedTimeout(
						typeNextChar,
						typingDelay,
						`typingChar-${charIndex}`
					);
				} else {
					setTrackedTimeout(
						() => {
							if (cursor) cursor.style.display = "none";
						},
						2000,
						"cursorHide"
					);
				}
			}
			typeNextChar();
		},
		50,
		"typingStart"
	);
}

function initJobsPageAnimations() {
	const experienceTitle = document.querySelector(
		".experience-layout .heading .text-secondary"
	);
	if (experienceTitle) {
		experienceTitle.style.animation = "none";
		experienceTitle.style.opacity = "0";
		experienceTitle.style.transform = "translateY(-20px)";
		experienceTitle.style.transition =
			"all 0.6s cubic-bezier(0.26, 0.86, 0.44, 0.985)";
		setTrackedTimeout(
			() => {
				experienceTitle.style.opacity = "1";
				experienceTitle.style.transform = "translateY(0)";
			},
			300,
			"experienceTitleAnimation"
		);
	}
	const experienceCards = document.querySelectorAll(".Experience");
	if (experienceCards.length > 0) {
		experienceCards.forEach((card, index) => {
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

function initCertificationsPageAnimations() {
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
function initAboutPageAnimations() {
	// Add logic for the contact form toggle
	const contactFormToggle = document.getElementById("contactFormToggle");
	const contactFormSection = document.getElementById("contactFormSection");

	if (contactFormToggle && contactFormSection) {
		contactFormToggle.addEventListener("click", () => {
			const isHidden = contactFormSection.classList.contains("hidden");
			if (isHidden) {
				contactFormSection.classList.remove("hidden");
				contactFormSection.setAttribute("aria-hidden", "false");
				contactFormToggle.querySelector("span").textContent = "Close Form"; // Update button text
				// Optional: Focus the first input field when shown
				const firstInput = contactFormSection.querySelector("input, textarea");
				if (firstInput) {
					firstInput.focus();
				}
			} else {
				contactFormSection.classList.add("hidden");
				contactFormSection.setAttribute("aria-hidden", "true");
				contactFormToggle.querySelector("span").textContent = "Contact Me"; // Update button text
			}
		});
	} else {
		console.warn("Contact form toggle button or section not found.");
	}

	// You can add other about-page specific animations here if needed
}

function initUniversalAnimations() {
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
					"keyboardNavTransition"
				);
			} else {
				window.location.href = link.href;
			}
		}
	});
	updateCopyrightYear();
	detectKeyboardNavigation();
} // <-- Corrected closing brace
function initParallaxEffect() {
	const parallaxElements = document.querySelectorAll(
		".home, .about, .experience-layout, .project__project-image"
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
	parallaxElements.forEach((element) => {
		if (!element.getAttribute("data-parallax-speed")) {
			element.setAttribute("data-parallax-speed", "0.2");
		}
	});
}
function animateSkillCards(container) {
	if (!container) return;
	const cards = container.querySelectorAll(
		".skills__card:not([style*='display: none'])"
	);
	cards.forEach((card, index) => {
		card.style.opacity = "1";
		card.style.transform = "translateY(0)";
		card.style.transition = "none"; // Disable transition temporarily
		card.style.animation = "none"; // Disable other animations temporarily
		card.title = "Click to see details";
	});
	if (typeof VanillaTilt !== "undefined") {
		VanillaTilt.init(cards, {
			max: 15,
			speed: 400,
			glare: true,
			"max-glare": 0.2,
		});
	}
	if (typeof initIntersectionObserver === "function") {
		initIntersectionObserver(cards); // Pass specific cards to observe
	}
}
function handleCardClick(event) {
	const clickedCard = event.currentTarget;
	if (event.target.closest("a, button")) {
		return; // Don't toggle if clicking a link/button inside
	}
	clickedCard.classList.toggle("expanded");
	clickedCard.title = clickedCard.classList.contains("expanded")
		? "Click to close details"
		: "Click to see details";
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
function initSkillsPageAnimations() {
	const isFirstVisit = checkFirstTimeVisit("skills-page");
	const isLowPowerDevice =
		window.navigator.userAgent.match(
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
		) !== null;
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;
	const animationSettings = {
		useSimpleAnimations: isLowPowerDevice || prefersReducedMotion,
		duration: isLowPowerDevice ? "0.4s" : "0.7s",
		staggerDelay: isLowPowerDevice ? 0.02 : 0.05,
	};
	const skillsHeading = document.querySelector(".skills__heading");
	if (skillsHeading) {
		skillsHeading.style.animation = "none";
		skillsHeading.style.opacity = "0";
		skillsHeading.style.transform = "translate3d(0, 20px, 0)";
		skillsHeading.style.transition = `all ${animationSettings.duration} cubic-bezier(0.26, 0.86, 0.44, 0.985)`;
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
	const techStackBadges = document.querySelectorAll(".tech-stack__badges img");
	if (techStackBadges.length > 0) {
		techStackBadges.forEach((badge) => {
			badge.addEventListener("click", () => {
				const technology = badge.getAttribute("src").match(/badge\/([^-]+)/);
				if (
					technology &&
					technology[1] &&
					!sessionStorage.getItem("techBadgeToastShown")
				) {
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
	// Corrected showToast call for keyboard hint on skills page
	// if (isFirstVisit) { // Keep this commented out if you want the hint always
	setTrackedTimeout(
		() => {
			showToast(
				"Use Alt + Left/Right arrows or Alt + [Letter] (H, J, P, C, S, A) to navigate.", // message
				"info", // type
				8000, // duration
				"Keyboard Navigation", // title
				"fa-solid fa-keyboard" // iconClass
			);
		},
		3000,
		"keyboardHintInit"
	);
	// } // End of commented out isFirstVisit check
}
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
function detectKeyboardNavigation() {
	let isUsingKeyboard = false;
	function handleKeyDown(e) {
		// --- START: Added Alt Key Navigation ---
		if (e.altKey) {
			handleAltNavigation(e);
			// Prevent potential browser default actions for Alt+Key combinations
			// e.preventDefault(); // Be cautious with this, might interfere with other Alt shortcuts
		}
		// --- END: Added Alt Key Navigation ---

		if (e.key === "Tab") {
			if (!isUsingKeyboard) {
				document.body.classList.add("keyboard-nav-active");
				isUsingKeyboard = true;
			}
		}
	}
	function handleMouseDown() {
		if (isUsingKeyboard) {
			document.body.classList.remove("keyboard-nav-active");
			isUsingKeyboard = false;
		}
	}
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("mousedown", handleMouseDown);
	if (
		navigator.userAgent.includes("JAWS") ||
		navigator.userAgent.includes("NVDA") ||
		navigator.userAgent.includes("VoiceOver")
	) {
		document.body.classList.add("keyboard-nav-active");
	}
}

// --- START: Added Navigation Logic ---
const pageOrder = [
	"index.html",
	"experience.html",
	"projects.html",
	"certification.html",
	"skills.html",
	"about.html",
];

const pageShortcuts = {
	H: "index.html",
	E: "experience.html", // Changed from jobs.html to experience.html but keeping the same shortcut key
	P: "projects.html",
	C: "certification.html",
	S: "skills.html",
	A: "about.html",
	M: null, // Reserved for menu toggle
};

function getCurrentPageIndex() {
	const currentPage = window.location.pathname.split("/").pop() || "index.html";
	return pageOrder.indexOf(currentPage);
}

function navigateToPage(url) {
	if (!url || window.location.pathname.endsWith(url)) {
		return; // Don't navigate to the same page or invalid URL
	}

	const main = document.querySelector("main");
	if (main) {
		main.style.opacity = "0";
		main.style.transform = "translateY(-20px)"; // Use existing transition style
		setTrackedTimeout(
			() => {
				window.location.href = url;
			},
			400, // Match existing link transition duration
			"keyboardNavTransition"
		);
	} else {
		window.location.href = url;
	}
}

function handleAltNavigation(e) {
	const key = e.key.toUpperCase();
	let targetUrl = null;

	if (key === "ARROWLEFT") {
		const currentIndex = getCurrentPageIndex();
		if (currentIndex > 0) {
			targetUrl = pageOrder[currentIndex - 1];
		}
	} else if (key === "ARROWRIGHT") {
		const currentIndex = getCurrentPageIndex();
		if (currentIndex < pageOrder.length - 1) {
			targetUrl = pageOrder[currentIndex + 1];
		}
	} else if (pageShortcuts.hasOwnProperty(key)) {
		if (key === "M") {
			toggleMenu(); // Toggle menu if Alt+M is pressed
		} else {
			targetUrl = pageShortcuts[key];
		}
	}

	if (targetUrl) {
		e.preventDefault(); // Prevent default browser action only if we are navigating
		navigateToPage(targetUrl);
	}
}
// --- END: Added Navigation Logic ---

// --- START: Toast Notification Logic ---
const toastContainer = document.querySelector(".toast-container");

function showToast(
	message,
	type = "info",
	duration = 5000,
	title = "Notification",
	iconClass = "fa-solid fa-circle-info" // Default icon
) {
	if (!toastContainer) {
		console.error("Toast container not found!");
		return;
	}

	const toast = document.createElement("div");
	toast.className = `toast toast--${type}`;
	toast.setAttribute("role", "alert");
	toast.setAttribute("aria-live", "assertive");
	toast.setAttribute("aria-atomic", "true");

	const toastContent = `
        <div class="toast-header">
            <i class="${iconClass} toast-icon"></i>
            <strong class="toast-title">${title}</strong>
            <button type="button" class="toast-close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

	toast.innerHTML = toastContent;

	// Add toast to container
	toastContainer.appendChild(toast);

	// Animate in
	requestAnimationFrame(() => {
		toast.classList.add("show");
	});

	// Close button functionality
	const closeButton = toast.querySelector(".toast-close");
	closeButton.addEventListener("click", () => closeToast(toast));

	// Auto-dismiss after duration
	const timeoutId = setTrackedTimeout(
		() => closeToast(toast),
		duration,
		`toast-${Date.now()}`
	);

	// Store timeout ID on the element for potential cancellation
	toast.dataset.timeoutId = timeoutId;
}

function closeToast(toast) {
	if (!toast) return;

	// Clear the auto-dismiss timeout if it exists
	if (toast.dataset.timeoutId) {
		clearTrackedTimeout(toast.dataset.timeoutId);
	}

	// Animate out
	toast.classList.remove("show");

	// Remove from DOM after animation
	toast.addEventListener(
		"transitionend",
		() => {
			if (toast.parentNode === toastContainer) {
				toastContainer.removeChild(toast);
			}
		},
		{ once: true }
	);
}

// Function to check if it's the first time visiting a specific page during the session
function checkFirstTimeVisit(pageIdentifier) {
	const key = `visited_${pageIdentifier}`;
	if (!sessionStorage.getItem(key)) {
		sessionStorage.setItem(key, "true");
		return true;
	}
	return false;
}
