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
	if (!document.querySelector(".page-loader")) {
		const loader = document.createElement("div");
		loader.className = "page-loader";
		loader.innerHTML = '<div class="page-loader__spinner"></div>';
		document.body.appendChild(loader);
		setTrackedTimeout(
			() => {
				loader.classList.add("loaded");
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
	const pagePath = window.location.pathname;
	const isHomePage = pagePath.includes("index.html") || pagePath.endsWith("/");
	let pageName = "home";
	if (pagePath.includes("jobs.html")) pageName = "jobs";
	else if (pagePath.includes("projects.html")) pageName = "projects";
	else if (pagePath.includes("certification.html")) pageName = "certification";
	else if (pagePath.includes("skills.html")) pageName = "skills";
	else if (pagePath.includes("about.html")) pageName = "about";
	setTrackedTimeout(
		() => {
			const globalFirstVisitKey = "portfolioGlobalFirstVisit";
			if (!sessionStorage.getItem(globalFirstVisitKey)) {
				showToast(
					"Navigation Tip",
					"Use Alt + Arrow keys or Alt + [Letter] (H, J, P, C, S, A) to navigate between pages.",
					"fa-solid fa-keyboard"
				);
				sessionStorage.setItem(globalFirstVisitKey, "true"); // Mark as visited globally
			}
			if (checkFirstTimeVisit(pageName)) {
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
							"About",
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
	} else if (pagePath.includes("projects.html")) {
		initProjectsPageAnimations();
	} else if (pagePath.includes("certification.html")) {
		initCertificationsPageAnimations();
	} else if (pagePath.includes("skills.html")) {
		initSkillsPageAnimations();
	} else if (pagePath.includes("about.html")) {
		initAboutPageAnimations();
	}
	initUniversalAnimations();
	if (
		isHomePage ||
		pagePath.includes("jobs.html") ||
		pagePath.includes("about.html") ||
		pagePath.includes("projects.html") // Assuming parallax is used here too based on initParallaxEffect querySelector
	) {
		initParallaxEffect();
	}
}); // <-- Added closing parenthesis and semicolon
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
function addNameHoverEffect(name, isLowPowerDevice) {
	const enhancedHoverHandler = debounce(function (e) {
		const rect = name.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
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
function addIconHoverEffect(icon) {
	icon.addEventListener("mouseenter", () => {
		const iconElement = icon.querySelector("i");
		if (iconElement) {
			iconElement.style.transform = "scale(1.3)";
			iconElement.style.color = "rgba(240, 248, 255, 1)"; // Full brightness
			iconElement.style.textShadow = "0 0 15px rgba(240, 248, 255, 0.5)";
		}
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
		icon.style.transform = "perspective(800px) translateY(0) translateZ(0)";
	});
	icon.addEventListener("click", (e) => {
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
		setTrackedTimeout(
			() => {
				ripple.style.width = "100px";
				ripple.style.height = "100px";
				ripple.style.opacity = "0";
			},
			10,
			"iconRippleExpand"
		);
		setTrackedTimeout(
			() => {
				ripple.remove();
			},
			400,
			"iconRippleRemove"
		);
	});
}
function initJobsPageAnimations() {
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
					"linkTransition"
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
		card.style.cursor = "pointer";
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
function showToast(title, message, iconClass) {
	let toastContainer = document.querySelector(".toast-container");
	if (!toastContainer) {
		toastContainer = document.createElement("div");
		toastContainer.className = "toast-container";
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
	const toastId = "toast-" + Date.now();
	const toast = document.createElement("div");
	toast.id = toastId;
	toast.setAttribute("role", "alert"); // Accessibility
	toast.setAttribute("aria-live", "assertive"); // Accessibility
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
	toast.style.opacity = "0";
	toast.style.transform = "translateY(20px) scale(0.95)"; // Start slightly down and scaled down
	toast.style.transition =
		"opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"; // Smoother transition
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
	const icon = document.createElement("i");
	icon.className = iconClass; // Use the provided icon class
	iconContainer.appendChild(icon);
	const contentContainer = document.createElement("div");
	contentContainer.style.flex = "1"; // Take remaining space
	contentContainer.style.minWidth = "0"; // Prevent overflow issues
	const titleElement = document.createElement("h4");
	titleElement.textContent = title;
	titleElement.style.margin = "0 0 4px 0"; // Space below title
	titleElement.style.fontSize = "1rem"; // Standard title size
	titleElement.style.fontWeight = "600";
	titleElement.style.color = "#ffffff"; // White title
	contentContainer.appendChild(titleElement);
	const messageElement = document.createElement("p");
	messageElement.textContent = message;
	messageElement.style.margin = "0";
	messageElement.style.fontSize = "0.9rem";
	messageElement.style.lineHeight = "1.4"; // Better readability
	messageElement.style.opacity = "0.85"; // Slightly less prominent message text
	contentContainer.appendChild(messageElement);
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
	closeButton.onmouseenter = () =>
		(closeButton.style.color = "rgba(255, 255, 255, 0.9)");
	closeButton.onmouseleave = () =>
		(closeButton.style.color = "rgba(255, 255, 255, 0.6)");
	const closeToast = () => {
		toast.style.opacity = "0";
		toast.style.transform = "translateY(10px) scale(0.9)"; // Animate out downwards
		setTrackedTimeout(
			() => {
				if (toast.parentNode) {
					toast.parentNode.removeChild(toast);
				}
				if (toastContainer.children.length === 0) {
					toastContainer.remove();
				}
			},
			300, // Match transition duration
			`toastRemove-${toastId}`
		);
	};
	closeButton.onclick = closeToast;
	toast.appendChild(iconContainer);
	toast.appendChild(contentContainer);
	toast.appendChild(closeButton);
	toastContainer.insertBefore(toast, toastContainer.firstChild);
	void toast.offsetWidth;
	toast.style.opacity = "1";
	toast.style.transform = "translateY(0) scale(1)";
	setTrackedTimeout(
		() => {
			if (document.getElementById(toastId)) {
				closeToast();
			}
		},
		6000, // Increased duration
		`toastAutoRemove-${toastId}`
	);
}
document.addEventListener("keydown", (e) => {
	if (e.altKey) {
		switch (e.key) {
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
	else if (e.key === "Escape" && showMenu) {
		toggleMenu();
	}
});
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
	if (currentIndex !== -1) {
		const nextIndex = (currentIndex + 1) % pages.length;
		navigateTo(pages[nextIndex]);
	} else {
		navigateTo("index.html");
	}
}
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
	if (currentIndex !== -1) {
		const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
		navigateTo(pages[prevIndex]);
	} else {
		navigateTo("index.html");
	}
}
function navigateTo(url) {
	const main = document.querySelector("main");
	const pageName = url.replace(".html", "").replace("index", "Home"); // Get a user-friendly name
	if (main) {
		showToast(
			"Navigating...", // Simpler title
			`Loading ${pageName} page`, // Clearer message
			"fa-solid fa-spinner fa-spin" // Use a loading icon
		);
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
function checkFirstTimeVisit(pageName) {
	let visitedPages =
		JSON.parse(sessionStorage.getItem("portfolioVisitedPages")) || {};
	const isFirstVisit = !visitedPages[pageName];
	if (isFirstVisit) {
		visitedPages[pageName] = true;
		sessionStorage.setItem(
			"portfolioVisitedPages",
			JSON.stringify(visitedPages)
		);
	}
	return isFirstVisit;
}
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
