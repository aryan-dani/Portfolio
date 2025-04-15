/** @format */		

document.addEventListener("DOMContentLoaded", function () {
	// Add a small delay to ensure all elements are fully rendered
	setTimeout(() => {
		initCertificationPage();
	}, 100);
});

function initCertificationPage() {
	// Reference elements
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

	console.log("Filter buttons found:", filterButtons.length);
	console.log("Certificate items found:", certificateItems.length);
	// Filter functionality
	filterButtons.forEach((button) => {
		button.addEventListener("click", () => {
			// Update active button
			filterButtons.forEach((btn) => btn.classList.remove("active"));
			button.classList.add("active");

			// Get filter category
			const filterValue = button.getAttribute("data-filter");

			// Hide all certificates first with fade out
			certificateItems.forEach((item) => {
				item.classList.add("filtering-out");
				item.querySelector(".certificate-content").classList.remove("visible");
			});
			// Wait for fade out animation to complete
			setTimeout(() => {
				// Add filtering class to container
				certificatesContainer.classList.add("filtering"); // Filter certificates
				let visibleCount = 0;

				certificateItems.forEach((item) => {
					if (
						filterValue === "all" ||
						item.getAttribute("data-category") === filterValue
					) {
						item.style.display = "";
						item.classList.remove("filtering-out");
						// Reset position styles that might interfere with new layout
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

				// Force layout recalculation
				certificatesContainer.offsetHeight; // Completely reset and reinitialize masonry
				const grid = document.querySelector(".row[data-masonry]");

				// Fix for masonry layout
				if (typeof Masonry !== "undefined" && grid) {
					// Destroy previous masonry instance if it exists
					if (grid.masonry) {
						grid.masonry.destroy();
						delete grid.masonry;
					}

					// Remove any masonry attributes that might be causing issues
					grid.removeAttribute("data-masonry-id");

					// Reset all items to ensure clean layout
					grid.querySelectorAll(".certificate-item").forEach((item) => {
						if (item.style.display !== "none") {
							// Reset all positioning that might have been set by previous masonry
							item.style.position = "";
							item.style.left = "";
							item.style.top = "";
						}
					}); // Wait a moment to ensure DOM is ready
					setTimeout(() => {
						// Create fresh masonry instance with proper configuration
						const masonryInstance = new Masonry(grid, {
							itemSelector: ".certificate-item:not([style*='display: none'])",
							percentPosition: true,
							columnWidth: ".col-md-4",
							transitionDuration: 0,
							initLayout: true,
							horizontalOrder: true,
							fitWidth: false,
						});

						// Force layout recalculation
						masonryInstance.layout();

						// Store masonry instance on the grid element for future reference
						grid.masonry = masonryInstance;

						// After layout is applied, animate items in
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

							// Remove filtering class after animations
							setTimeout(() => {
								certificatesContainer.classList.remove("filtering");
								// Do another layout refresh after animations
								masonryInstance.layout();
							}, 500);
						}, 100);
					}, 50);
				} else {
					// If Masonry not available, still do the animations
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
		});
	}); // Certificate preview functionality with enhanced image viewing
	// Make both the view buttons and images clickable
	const viewButtons = document.querySelectorAll(".view-certificate");
	const certificateImages = document.querySelectorAll(".certificate-image");

	// Create enhanced preview container if it doesn't exist
	let zoomLevel = 1;
	let isDragging = false;
	let startX,
		startY,
		translateX = 0,
		translateY = 0;

	// Add zoom controls to preview
	if (certificatePreview) {
		// Create zoom controls if they don't exist
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

			// Style the zoom controls
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

			// Add zoom functionality
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

	// Function to update image transform
	function updateImageTransform() {
		if (previewImage) {
			previewImage.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
		}
	}

	// Add drag functionality for panning when zoomed in
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

		// Add mouse wheel zoom
		previewImage.addEventListener("wheel", (e) => {
			e.preventDefault();
			if (e.deltaY < 0) {
				// Zoom in
				zoomLevel = Math.min(zoomLevel + 0.1, 3);
			} else {
				// Zoom out
				zoomLevel = Math.max(zoomLevel - 0.1, 1);
				if (zoomLevel === 1) {
					translateX = 0;
					translateY = 0;
				}
			}
			updateImageTransform();
		});
	}

	// Add click handler to certificate images with enhanced animation
	certificateImages.forEach((imageContainer) => {
		imageContainer.addEventListener("click", () => {
			const certCard = imageContainer.closest(".certificate-content");
			const certImage = imageContainer.querySelector("img");
			const viewButton = certCard.querySelector(".certificate-link");
			// Reset zoom and position
			zoomLevel = 1;
			translateX = 0;
			translateY = 0;

			// Get current scroll position to center preview in viewport
			const scrollY = window.scrollY;
			const viewportHeight = window.innerHeight;

			// Position the certificate preview container relative to scroll position
			if (certificatePreview) {
				// Center the preview in the current viewport
				certificatePreview.style.top = `${scrollY}px`;
				certificatePreview.style.height = `${viewportHeight}px`;
			}

			// Set preview image source with preloading
			const loader = document.createElement("div");
			loader.className = "image-loader";
			loader.innerHTML = '<div class="spinner"></div>';

			const tempImage = new Image();
			tempImage.onload = () => {
				// Image loaded successfully
				if (previewImage) {
					previewImage.src = tempImage.src;
					previewImage.alt = certImage.alt;

					// Remove loader if exists
					const existingLoader =
						certificatePreview.querySelector(".image-loader");
					if (existingLoader) {
						existingLoader.remove();
					}

					// Show preview with beautiful animation
					requestAnimationFrame(() => {
						certificatePreview.classList.add("active");
					});
				}
			};

			// Add loader to preview container
			if (
				certificatePreview &&
				!certificatePreview.querySelector(".image-loader")
			) {
				const previewContainer =
					certificatePreview.querySelector(".preview-container");
				if (previewContainer) {
					previewContainer.appendChild(loader);
				}

				// Add loader styles
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

			// Start loading the image
			tempImage.src = certImage.src;

			// Show preview immediately with loader
			certificatePreview.classList.add("active");

			// Disable body scroll
			document.body.style.overflow = "hidden";

			// If there's a valid link from the view button, store it for later
			if (viewButton && viewButton.getAttribute("href") !== "#") {
				previewImage.dataset.linkUrl = viewButton.getAttribute("href");
			}
		});
	});

	// Keep the existing functionality for view certificate buttons
	viewButtons.forEach((button) => {
		button.addEventListener("click", (e) => {
			// Don't prevent default link behavior - allow the link to open naturally
			// e.preventDefault();
		});
	});

	// Close preview
	closePreviewBtn.addEventListener("click", () => {
		certificatePreview.classList.remove("active");
		document.body.style.overflow = "";
	});

	// Click outside to close
	certificatePreview.addEventListener("click", (e) => {
		if (e.target === certificatePreview) {
			certificatePreview.classList.remove("active");
			document.body.style.overflow = "";
		}
	});

	// Click on preview image to go to certificate link
	previewImage.addEventListener("click", () => {
		const linkUrl = previewImage.dataset.linkUrl;
		if (linkUrl) {
			window.open(linkUrl, "_blank");
		}
	});

	// Escape key to close preview
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && certificatePreview.classList.contains("active")) {
			certificatePreview.classList.remove("active");
			document.body.style.overflow = "";
		}
	});

	// Animation on scroll for certificate cards
	const animateOnScroll = () => {
		const cards = document.querySelectorAll(".animate-on-scroll:not(.visible)");

		cards.forEach((card) => {
			const cardTop = card.getBoundingClientRect().top;
			const windowHeight = window.innerHeight;

			if (cardTop < windowHeight - 100) {
				card.classList.add("visible");
			}
		});
	};

	// Initial check for animations
	setTimeout(animateOnScroll, 100);

	// Add scroll listener for animations
	window.addEventListener("scroll", animateOnScroll);

	// Initialize masonry layout
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
