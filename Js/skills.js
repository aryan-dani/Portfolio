/**
 * Skills Page Functionality
 * Handles category filtering, search filtering, and modal display for skill cards.
 *
 * @format
 */

document.addEventListener("DOMContentLoaded", () => {
	// --- START OF DOMContentLoaded LISTENER CODE ---

	const skillsContainer = document.querySelector(".skills"); // Get the main container
	const searchInput = document.getElementById("skillSearchInput");
	const categoryTabs = document.querySelectorAll(".category-tab");
	const allSkillCards = document.querySelectorAll(".skills__card"); // Get all cards once
	const skillGroups = document.querySelectorAll(".skills__group");
	const noResultsMsg = document.querySelector(".no-skills");

	// Modal Elements
	const modal = document.getElementById("skillModal");

	// *** Add check for modal existence ***
	if (!modal) {
		console.error("Skill modal element with ID 'skillModal' not found!");
		// Optionally disable card clicks if modal is missing
		allSkillCards.forEach((card) => (card.style.cursor = "default"));
		return; // Stop script execution if modal is essential
	}

	const modalCloseBtns = modal.querySelectorAll("[data-close-modal]");
	const modalIcon = modal.querySelector(".skill-modal__icon");
	const modalTitle = modal.querySelector(".skill-modal__title");
	const modalProgressBar = modal.querySelector(".skills__progress-bar");
	const modalProgressPercent = modal.querySelector(".skills__progress-percent");
	const modalDescription = modal.querySelector(".skill-modal__description");
	const modalProjectsList = modal.querySelector(".skill-modal__projects ul");
	let lastFocusedElement = null; // To restore focus when modal closes

	let currentCategory = "all";
	let currentSearchTerm = "";

	// --- Helper Functions ---

	/**
	 * Animates the progress bar width and updates the percentage text.
	 * @param {HTMLElement} progressBar - The progress bar element.
	 * @param {HTMLElement} progressPercent - The percentage text element.
	 * @param {number} level - The proficiency level (0-100).
	 */
	function animateProgressBar(progressBar, progressPercent, level) {
		if (progressBar && progressPercent) {
			// Reset before animating
			progressBar.style.width = "0%";
			progressPercent.textContent = "0%";

			// Delay slightly to ensure reset is rendered before animation starts
			setTimeout(() => {
				progressBar.style.width = `${level}%`;
				progressPercent.textContent = `${level}%`;
			}, 100); // Small delay
		}
	}

	/**
	 * Opens the skill details modal and populates it with data from the card.
	 * @param {HTMLElement} card - The skill card element that was clicked.
	 */
	function openSkillModal(card) {
		const iconElement = card.querySelector(".skills__card-front i");
		const titleElement = card.querySelector(".skills__card-front h3");
		const descriptionElement = card.querySelector(".skills__card-back p");
		const progressElement = card.querySelector(".skills__progress-bar");
		const projectsContainer = card.querySelector(".skill-projects ul");

		if (
			!modal ||
			!iconElement ||
			!titleElement ||
			!descriptionElement ||
			!progressElement
		) {
			console.error("Modal or card elements not found!");
			return;
		}

		// Populate Modal
		modalIcon.className = iconElement.className + " skill-modal__icon"; // Copy classes
		modalTitle.textContent = titleElement.textContent;
		modalDescription.textContent = descriptionElement.textContent;

		// Handle Progress Bar
		const level = progressElement.getAttribute("data-level") || 0;
		animateProgressBar(modalProgressBar, modalProgressPercent, level);

		// Handle Projects
		modalProjectsList.innerHTML = ""; // Clear previous projects
		if (projectsContainer) {
			const projectLinks = projectsContainer.querySelectorAll("li");
			if (projectLinks.length > 0) {
				projectLinks.forEach((linkItem) => {
					modalProjectsList.appendChild(linkItem.cloneNode(true));
				});
				modalProjectsList.parentElement.style.display = "block"; // Show projects section
			} else {
				modalProjectsList.parentElement.style.display = "none"; // Hide if no projects
			}
		} else {
			modalProjectsList.parentElement.style.display = "none"; // Hide if no projects container
		}

		// Show Modal & Accessibility
		lastFocusedElement = document.activeElement; // Store focus
		modal.classList.add("active");
		modal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden"; // Prevent background scrolling

		// Focus the close button or modal content for accessibility
		const firstFocusableElement = modal.querySelector(
			"button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
		);
		if (firstFocusableElement) {
			firstFocusableElement.focus();
		}
	}

	/**
	 * Closes the skill details modal.
	 */
	function closeSkillModal() {
		if (!modal) return;
		modal.classList.remove("active");
		modal.setAttribute("aria-hidden", "true");
		document.body.style.overflow = ""; // Restore background scrolling

		// Restore focus
		if (lastFocusedElement) {
			lastFocusedElement.focus();
			lastFocusedElement = null;
		}
	}

	/**
	 * Filters and displays skill cards based on the current category and search term.
	 */
	function filterAndDisplaySkills() {
		let totalVisibleCards = 0;
		const searchTermLower = currentSearchTerm.toLowerCase();

		// Hide all cards initially (and groups)
		allSkillCards.forEach((card) => {
			card.style.display = "none";
			card.classList.remove("expanded");
		});
		skillGroups.forEach((group) => {
			group.style.display = "none";
			group.classList.remove("active");
			delete group.dataset.hasVisibleCard; // Clear flag initially
		});

		// Determine which cards should be visible
		allSkillCards.forEach((card) => {
			const parentGroup = card.closest(".skills__group");
			if (!parentGroup) return; // Skip if card is not in a group

			const cardCategory = parentGroup.getAttribute("data-category");
			const skillName = (
				card.getAttribute("data-skill-name") || ""
			).toLowerCase();
			const skillDescription = (
				card.querySelector(".skills__card-back p")?.textContent || ""
			).toLowerCase();

			const matchesCategory =
				currentCategory === "all" || cardCategory === currentCategory;
			const matchesSearch =
				searchTermLower === "" ||
				skillName.includes(searchTermLower) ||
				skillDescription.includes(searchTermLower);

			if (matchesCategory && matchesSearch) {
				card.style.display = ""; // Show the card
				totalVisibleCards++;
				// Mark the parent group as needing to be visible
				parentGroup.dataset.hasVisibleCard = "true";
			} else {
				card.style.display = "none"; // Explicitly hide non-matching cards
			}
		});

		// Now, make the necessary groups visible (using requestAnimationFrame)
		requestAnimationFrame(() => {
			skillGroups.forEach((group) => {
				if (group.dataset.hasVisibleCard === "true") {
					group.style.display = "grid";
					group.classList.add("active");
				} else {
					group.style.display = "none"; // Ensure non-active groups are hidden
					group.classList.remove("active");
				}
				delete group.dataset.hasVisibleCard; // Clean up the temporary attribute
			});

			// Show/hide the 'no results' message
			if (noResultsMsg) {
				noResultsMsg.style.display = totalVisibleCards === 0 ? "block" : "none";
			}
		});
	}

	// --- Event Listeners ---

	// Category Tab Clicks
	categoryTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			categoryTabs.forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
			currentCategory = tab.getAttribute("data-category");
			filterAndDisplaySkills();
		});
	});

	// Search Input
	if (searchInput) {
		searchInput.addEventListener("input", () => {
			currentSearchTerm = searchInput.value;
			filterAndDisplaySkills();
		});
	}

	// Skill Card Clicks - Open Modal
	allSkillCards.forEach((card) => {
		card.addEventListener("click", (event) => {
			// Prevent opening modal if a link inside the card was clicked (e.g., project link)
			if (event.target.closest("a")) {
				return;
			}
			openSkillModal(card);
		});
	});

	// Modal Close Button/Overlay Clicks
	modalCloseBtns.forEach((btn) => {
		btn.addEventListener("click", closeSkillModal);
	});

	// Keyboard accessibility (Escape key to close modal)
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && modal.classList.contains("active")) {
			closeSkillModal();
		}
	});

	// --- Initial Setup ---
	const initialActiveTab = document.querySelector(".category-tab.active");
	if (initialActiveTab) {
		currentCategory = initialActiveTab.getAttribute("data-category");
	} else {
		// Default to 'all' if none are active initially
		currentCategory = "all";
		const allTab = document.querySelector('.category-tab[data-category="all"]');
		if (allTab) allTab.classList.add("active");
	}

	filterAndDisplaySkills(); // Initial filter

	// --- END OF DOMContentLoaded LISTENER CODE ---
}); // Ensure this is the final closing brace and parenthesis for the listener
