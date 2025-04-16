/**
 * Skills Page Functionality
 * Handles category filtering and search filtering for skill cards.
 *
 * @format
 */

document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("skillSearchInput");
	const categoryTabs = document.querySelectorAll(".category-tab");
	const allSkillCards = document.querySelectorAll(".skills__card"); // Get all cards once
	const skillGroups = document.querySelectorAll(".skills__group");
	const noResultsMsg = document.querySelector(".no-skills");
	const skillsContainer = document.querySelector(".skills__container"); // Main container for all groups

	let currentCategory = "all";
	let currentSearchTerm = "";

	// --- Helper Functions ---

	/**
	 * Filters and displays skill cards based on the current category and search term.
	 */
	function filterAndDisplaySkills() {
		let totalVisibleCards = 0;
		const searchTermLower = currentSearchTerm.toLowerCase();

		// Reset group states
		skillGroups.forEach((group) => {
			group.classList.remove("active");
			group.style.display = "none"; // Start by hiding all groups
		});
		// Reset container class used for specific 'all' view styling if any
		if (skillsContainer) {
			skillsContainer.classList.remove("all-view-active");
		}

		if (currentCategory === "all") {
			// --- Handle "All" Category ---
			// Make all groups potentially visible and apply search filter to cards within them
			skillGroups.forEach((group) => {
				group.style.display = "grid"; // Set all groups to grid
				group.classList.add("active"); // Mark them as active for potential styling/animation
				const cardsInGroup = group.querySelectorAll(".skills__card");
				let groupHasVisibleSearchResult = false;

				cardsInGroup.forEach((card) => {
					const skillName = (
						card.getAttribute("data-skill-name") || ""
					).toLowerCase();
					const skillDescription = (
						card.querySelector(".skills__card-back p")?.textContent || ""
					).toLowerCase();
					const matchesSearch =
						searchTermLower === "" ||
						skillName.includes(searchTermLower) ||
						skillDescription.includes(searchTermLower);

					if (matchesSearch) {
						card.style.display = ""; // Show card if it matches search
						totalVisibleCards++;
						groupHasVisibleSearchResult = true;
					} else {
						card.style.display = "none"; // Hide card if it doesn't match search
					}
				});

				// Optional: If a group has NO visible cards after search, hide the group itself
				if (!groupHasVisibleSearchResult) {
					group.style.display = "none";
					group.classList.remove("active");
				}
			});
		} else {
			// --- Handle Specific Category ---
			// Hide all cards first, then show only the relevant group and filter within it
			allSkillCards.forEach((card) => (card.style.display = "none"));

			skillGroups.forEach((group) => {
				const groupCategory = group.getAttribute("data-category");

				if (groupCategory === currentCategory) {
					let groupHasVisibleCards = false;
					const cardsInGroup = group.querySelectorAll(".skills__card");

					cardsInGroup.forEach((card) => {
						const skillName = (
							card.getAttribute("data-skill-name") || ""
						).toLowerCase();
						const skillDescription = (
							card.querySelector(".skills__card-back p")?.textContent || ""
						).toLowerCase();
						const matchesSearch =
							searchTermLower === "" ||
							skillName.includes(searchTermLower) ||
							skillDescription.includes(searchTermLower);

						if (matchesSearch) {
							card.style.display = ""; // Show card
							groupHasVisibleCards = true;
							totalVisibleCards++;
						} else {
							card.style.display = "none"; // Hide card
						}
					});

					// Show the group only if it's the selected category AND has visible cards
					if (groupHasVisibleCards) {
						group.style.display = "grid";
						group.classList.add("active");
					} else {
						group.style.display = "none"; // Keep group hidden if no cards match search
						group.classList.remove("active");
					}
				} else {
					// Ensure other groups remain hidden
					group.style.display = "none";
					group.classList.remove("active");
				}
			});
		}

		// Show/hide the 'no results' message
		if (noResultsMsg) {
			noResultsMsg.style.display = totalVisibleCards === 0 ? "block" : "none";
		}

		// Animate cards within the currently active groups
		const activeGroups = document.querySelectorAll(".skills__group.active");
		activeGroups.forEach((group) => {
			if (typeof animateSkillCards === "function") {
				animateSkillCards(group); // animateSkillCards should internally select visible cards
			}
		});

		// Re-observe for progress bars etc.
		if (typeof initIntersectionObserver === "function") {
			const visibleCards = document.querySelectorAll(
				'.skills__card:not([style*="display: none"])'
			);
			initIntersectionObserver(visibleCards);
		}
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

	// Add click handler for expanding cards
	allSkillCards.forEach((card) => {
		if (typeof handleCardClick === "function") {
			card.removeEventListener("click", handleCardClick);
			card.addEventListener("click", handleCardClick);
		}
	});
});
