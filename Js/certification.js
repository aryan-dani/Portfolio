document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    initCertificationPage();
  }, 100);
});
function initCertificationPage() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const certificateItems = document.querySelectorAll(".certificate-item");
  const noResultsMsg = document.querySelector(".no-certificates");
  const certificatesContainer = document.querySelector(
    ".certificates-container"
  );
  const certificatePreview = document.querySelector(".certificate-preview");
  const previewImage = certificatePreview
    ? certificatePreview.querySelector("img")
    : null;
  const closePreviewBtn = document.querySelector(".close-preview");
  const searchInput = document.getElementById("certificateSearchInput"); // Get search input
  const clearSearchBtn = searchInput
    ? searchInput.parentElement.querySelector(".search-clear-btn")
    : null; // Get the clear button relative to parent
  let currentFilter = "all"; // Keep track of the current category filter
  let currentSearchTerm = ""; // Keep track of the current search term
  if (noResultsMsg) {
    noResultsMsg.style.display = "none";
  }
  function filterAndSearchCertificates() {
    certificateItems.forEach((item) => {
      item.classList.add("filtering-out");
      item.querySelector(".certificate-content").classList.remove("visible");
    });
    setTimeout(() => {
      certificatesContainer.classList.add("filtering");
      let visibleCount = 0;
      const searchTermLower = currentSearchTerm.toLowerCase();
      certificateItems.forEach((item) => {
        const category = item.getAttribute("data-category");
        const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
        const description =
          item.querySelector("p")?.textContent.toLowerCase() || "";
        const issuer =
          item
            .querySelector(".certificate-issuer span")
            ?.textContent.toLowerCase() || "";
        const matchesCategory =
          currentFilter === "all" || category === currentFilter;
        const matchesSearch =
          searchTermLower === "" ||
          title.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          issuer.includes(searchTermLower);
        if (matchesCategory && matchesSearch) {
          item.style.display = "";
          item.classList.remove("filtering-out");
          item.style.position = "";
          item.style.left = "";
          item.style.top = "";
          visibleCount++;
        } else {
          item.style.display = "none";
        }
      }); // Show/hide no results message
      if (visibleCount === 0) {
        noResultsMsg.style.display = "block";
      } else {
        noResultsMsg.style.display = "none";
      }
      certificatesContainer.offsetHeight; // Completely reset and reinitialize masonry
      const grid = document.querySelector(".row[data-masonry]");
      if (typeof Masonry !== "undefined" && grid) {
        if (grid.masonry) {
          grid.masonry.destroy();
          delete grid.masonry;
        }
        grid.removeAttribute("data-masonry-id");
        grid.querySelectorAll(".certificate-item").forEach((item) => {
          if (item.style.display !== "none") {
            item.style.position = "";
            item.style.left = "";
            item.style.top = "";
          }
        }); // Wait a moment to ensure DOM is ready
        setTimeout(() => {
          const masonryInstance = new Masonry(grid, {
            itemSelector: ".certificate-item:not([style*='display: none'])",
            percentPosition: true,
            columnWidth: ".col-md-4",
            transitionDuration: 0,
            initLayout: true,
            horizontalOrder: true,
            fitWidth: false,
          });
          masonryInstance.layout();
          grid.masonry = masonryInstance;
          setTimeout(() => {
            let counter = 0;
            certificateItems.forEach((item) => {
              if (item.style.display !== "none") {
                counter++;
                setTimeout(() => {
                  item
                    .querySelector(".certificate-content")
                    .classList.add("visible");
                }, 50 * counter);
              }
            });
            setTimeout(() => {
              certificatesContainer.classList.remove("filtering");
              masonryInstance.layout();
            }, 500);
          }, 100);
        }, 50);
      } else {
        let counter = 0;
        certificateItems.forEach((item) => {
          if (item.style.display !== "none") {
            counter++;
            setTimeout(() => {
              item
                .querySelector(".certificate-content")
                .classList.add("visible");
            }, 50 * counter);
          }
        });
        setTimeout(() => {
          certificatesContainer.classList.remove("filtering");
        }, 500);
      }
    }, 300); // Wait for fade out animation
  }
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filterValue = button.getAttribute("data-filter");
      currentFilter = filterValue; // Update current filter
      filterAndSearchCertificates(); // Call combined function
    });
  });
  if (searchInput && clearSearchBtn) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      clearSearchBtn.style.display = currentSearchTerm ? "block" : "none";
      filterAndSearchCertificates(); // Call combined function
    });
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = ""; // Clear the input
      currentSearchTerm = ""; // Update the state variable
      clearSearchBtn.style.display = "none"; // Hide the button
      searchInput.focus(); // Keep focus on the input
      filterAndSearchCertificates(); // Re-filter
    });
    clearSearchBtn.style.display = searchInput.value ? "block" : "none";
  } else if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchTerm = searchInput.value;
      filterAndSearchCertificates();
    });
  }
  const viewButtons = document.querySelectorAll(".view-certificate");
  const certificateImages = document.querySelectorAll(".certificate-image");
  let zoomLevel = 1;
  let isDragging = false;
  let startX,
    startY,
    translateX = 0,
    translateY = 0;
  if (certificatePreview) {
    if (!certificatePreview.querySelector(".zoom-controls")) {
      const zoomControls = document.createElement("div");
      zoomControls.className = "zoom-controls";
      zoomControls.innerHTML = `
                <button class="zoom-in"><i class="fas fa-search-plus"></i></button>
                <button class="zoom-reset"><i class="fas fa-redo-alt"></i></button>
                <button class="zoom-out"><i class="fas fa-search-minus"></i></button>
            `;
      certificatePreview
        .querySelector(".preview-container")
        .appendChild(zoomControls);
      const style = document.createElement("style");
      style.textContent = `
                .zoom-controls {
                    position: absolute;
                    bottom: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 15px;
                }
                .zoom-controls button {
                    background: rgba(240, 248, 255, 0.2);
                    border: 1px solid rgba(240, 248, 255, 0.4);
                    color: aliceblue;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .zoom-controls button:hover {
                    background: rgba(240, 248, 255, 0.3);
                    transform: translateY(-3px);
                }
            `;
      document.head.appendChild(style);
      const zoomIn = zoomControls.querySelector(".zoom-in");
      const zoomOut = zoomControls.querySelector(".zoom-out");
      const zoomReset = zoomControls.querySelector(".zoom-reset");
      zoomIn.addEventListener("click", (e) => {
        e.stopPropagation();
        zoomLevel = Math.min(zoomLevel + 0.25, 3);
        updateImageTransform();
      });
      zoomOut.addEventListener("click", (e) => {
        e.stopPropagation();
        zoomLevel = Math.max(zoomLevel - 0.25, 1);
        updateImageTransform();
        if (zoomLevel === 1) {
          translateX = 0;
          translateY = 0;
          updateImageTransform();
        }
      });
      zoomReset.addEventListener("click", (e) => {
        e.stopPropagation();
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
      });
    }
  }
  function updateImageTransform() {
    if (previewImage) {
      previewImage.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    }
  }
  if (previewImage) {
    previewImage.addEventListener("mousedown", (e) => {
      if (zoomLevel > 1) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        previewImage.style.cursor = "grabbing";
        e.preventDefault();
      }
    });
    window.addEventListener("mousemove", (e) => {
      if (isDragging) {
        translateX = (e.clientX - startX) / zoomLevel;
        translateY = (e.clientY - startY) / zoomLevel;
        updateImageTransform();
      }
    });
    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        previewImage.style.cursor = "grab";
      }
    });
    previewImage.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomLevel = Math.min(zoomLevel + 0.1, 3);
      } else {
        zoomLevel = Math.max(zoomLevel - 0.1, 1);
        if (zoomLevel === 1) {
          translateX = 0;
          translateY = 0;
        }
      }
      updateImageTransform();
    });
  }
  certificateImages.forEach((imageContainer) => {
    imageContainer.addEventListener("click", () => {
      const certCard = imageContainer.closest(".certificate-content");
      const certImage = imageContainer.querySelector("img");
      const viewButton = certCard.querySelector(".certificate-link");
      zoomLevel = 1;
      translateX = 0;
      translateY = 0;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      if (certificatePreview) {
        certificatePreview.style.top = `${scrollY}px`;
        certificatePreview.style.height = `${viewportHeight}px`;
      }
      const loader = document.createElement("div");
      loader.className = "image-loader";
      loader.innerHTML = '<div class="spinner"></div>';
      const tempImage = new Image();
      tempImage.onload = () => {
        if (previewImage) {
          previewImage.src = tempImage.src;
          previewImage.alt = certImage.alt;
          const existingLoader =
            certificatePreview.querySelector(".image-loader");
          if (existingLoader) {
            existingLoader.remove();
          }
          requestAnimationFrame(() => {
            certificatePreview.classList.add("active");
          });
        }
      };
      if (
        certificatePreview &&
        !certificatePreview.querySelector(".image-loader")
      ) {
        const previewContainer =
          certificatePreview.querySelector(".preview-container");
        if (previewContainer) {
          previewContainer.appendChild(loader);
        }
        const style = document.createElement("style");
        style.textContent = `
                    .image-loader {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid rgba(240, 248, 255, 0.3);
                        border-top: 4px solid aliceblue;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
        document.head.appendChild(style);
      }
      tempImage.src = certImage.src;
      certificatePreview.classList.add("active");
      document.body.style.overflow = "hidden";
      if (viewButton && viewButton.getAttribute("href") !== "#") {
        previewImage.dataset.linkUrl = viewButton.getAttribute("href");
      }
    });
  });
  closePreviewBtn.addEventListener("click", () => {
    certificatePreview.classList.remove("active");
    document.body.style.overflow = "";
  });
  certificatePreview.addEventListener("click", (e) => {
    if (e.target === certificatePreview) {
      certificatePreview.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
  previewImage.addEventListener("click", () => {
    const linkUrl = previewImage.dataset.linkUrl;
    if (linkUrl) {
      window.open(linkUrl, "_blank");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && certificatePreview.classList.contains("active")) {
      certificatePreview.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
  if (typeof Masonry !== "undefined") {
    const grid = document.querySelector(".row[data-masonry]");
    if (grid) {
      new Masonry(grid, {
        itemSelector: ".certificate-item",
        percentPosition: true,
      });
    }
  }
}
