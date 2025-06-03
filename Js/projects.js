document.addEventListener("DOMContentLoaded", function () {
  initProjectsPage();
});

function initProjectsPage() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");
  const noResultsMsg = document.querySelector(".no-projects");
  const projectsContainer = document.querySelector(".project-grid");
  const searchInput = document.getElementById("projectSearchInput");
  const clearSearchBtn = searchInput
    ? searchInput.parentElement.querySelector(".search-clear-btn")
    : null;

  let currentFilter = "all";
  let currentSearchTerm = "";

  if (noResultsMsg) {
    noResultsMsg.style.display = "none";
  }

  function filterAndSearchProjects() {
    // Add filtering animation
    projectItems.forEach((item) => {
      item.classList.add("filtering-out");
    });

    setTimeout(() => {
      projectsContainer.classList.add("filtering");
      let visibleCount = 0;
      const searchTermLower = currentSearchTerm.toLowerCase();

      projectItems.forEach((item) => {
        const category = item.getAttribute("data-category");
        const title =
          item.querySelector(".title")?.textContent.toLowerCase() || "";
        const description =
          item.querySelector("p")?.textContent.toLowerCase() || "";
        const tags = Array.from(item.querySelectorAll(".tags-container h6"))
          .map((tag) => tag.textContent.toLowerCase())
          .join(" ");

        const matchesCategory =
          currentFilter === "all" || category === currentFilter;
        const matchesSearch =
          searchTermLower === "" ||
          title.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          tags.includes(searchTermLower);

        if (matchesCategory && matchesSearch) {
          item.style.display = "";
          item.classList.remove("filtering-out");
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      });

      // Show/hide no results message
      if (visibleCount === 0) {
        noResultsMsg.style.display = "block";
      } else {
        noResultsMsg.style.display = "none";
      }

      // Remove filtering animation
      setTimeout(() => {
        projectsContainer.classList.remove("filtering");
        projectItems.forEach((item) => {
          if (item.style.display !== "none") {
            item.classList.remove("filtering-out");
          }
        });
      }, 300);
    }, 100);
  }

  // Filter button event listeners
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filterValue = button.getAttribute("data-filter");
      currentFilter = filterValue;
      filterAndSearchProjects();
    });
  });

  // Search input event listeners
  if (searchInput && clearSearchBtn) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      clearSearchBtn.style.display = currentSearchTerm ? "block" : "none";
      filterAndSearchProjects();
    });

    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchTerm = "";
      clearSearchBtn.style.display = "none";
      searchInput.focus();
      filterAndSearchProjects();
    });

    clearSearchBtn.style.display = searchInput.value ? "block" : "none";
  } else if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      filterAndSearchProjects();
    });
  }
}
