/**
 * Certification Page JavaScript
 * Handles filtering, animations, and interactive features for the certifications page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are fully rendered
    setTimeout(() => {
        initCertificationPage();
    }, 100);
});

function initCertificationPage() {
    // Reference elements
    const filterButtons = document.querySelectorAll('.filter-btn');
    const certificateItems = document.querySelectorAll('.certificate-item');
    const noResultsMsg = document.querySelector('.no-certificates');
    const certificatesContainer = document.querySelector('.certificates-container');
    const certificatePreview = document.querySelector('.certificate-preview');
    const previewImage = certificatePreview ? certificatePreview.querySelector('img') : null;
    const closePreviewBtn = document.querySelector('.close-preview');
    
    console.log('Filter buttons found:', filterButtons.length);
    console.log('Certificate items found:', certificateItems.length);
      // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Get filter category
            const filterValue = button.getAttribute('data-filter');
            
            // Hide all certificates first with fade out
            certificateItems.forEach(item => {
                item.classList.add('filtering-out');
                item.querySelector('.certificate-content').classList.remove('visible');
            });
            
            // Wait for fade out animation to complete
            setTimeout(() => {
                // Add filtering class to container
                certificatesContainer.classList.add('filtering');
                
                // Filter certificates
                let visibleCount = 0;
                
                certificateItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = '';
                        item.classList.remove('filtering-out');
                        visibleCount++;
                        
                        // Add staggered animation
                        setTimeout(() => {
                            item.querySelector('.certificate-content').classList.add('visible');
                        }, 50 * visibleCount);
                    } else {
                        item.style.display = 'none';
                    }
            });
            
            // Show/hide no results message
            if (visibleCount === 0) {
                noResultsMsg.style.display = 'block';
            } else {
                noResultsMsg.style.display = 'none';
            }
                  // Show/hide no results message
                if (visibleCount === 0) {
                    noResultsMsg.style.display = 'block';
                } else {
                    noResultsMsg.style.display = 'none';
                }
                
                // Remove filtering class after transition
                setTimeout(() => {
                    certificatesContainer.classList.remove('filtering');
                    
                    // If masonry is available, reinitialize it
                    if (typeof Masonry !== 'undefined' && certificatesContainer.parentElement.dataset.masonry) {
                        new Masonry(certificatesContainer.parentElement, {
                            itemSelector: '.certificate-item',
                            percentPosition: true
                        });
                    }
                }, 500);
            }, 300); // Wait for fade out animation
        });
    });
      // Certificate preview functionality
    // Make both the view buttons and images clickable
    const viewButtons = document.querySelectorAll('.view-certificate');
    const certificateImages = document.querySelectorAll('.certificate-image');
    
    // Add click handler to certificate images
    certificateImages.forEach(imageContainer => {
        imageContainer.addEventListener('click', () => {
            const certCard = imageContainer.closest('.certificate-content');
            const certImage = imageContainer.querySelector('img');
            const viewButton = certCard.querySelector('.certificate-link');
            
            // Set preview image source
            previewImage.src = certImage.src;
            previewImage.alt = certImage.alt;
            
            // Show preview
            certificatePreview.classList.add('active');
            
            // Disable body scroll
            document.body.style.overflow = 'hidden';
            
            // If there's a valid link from the view button, store it for later
            if (viewButton && viewButton.getAttribute('href') !== '#') {
                previewImage.dataset.linkUrl = viewButton.getAttribute('href');
            }
        });
    });
    
    // Keep the existing functionality for view certificate buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Don't prevent default link behavior - allow the link to open naturally
            // e.preventDefault();
        });
    });
    
    // Close preview
    closePreviewBtn.addEventListener('click', () => {
        certificatePreview.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Click outside to close
    certificatePreview.addEventListener('click', (e) => {
        if (e.target === certificatePreview) {
            certificatePreview.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Click on preview image to go to certificate link
    previewImage.addEventListener('click', () => {
        const linkUrl = previewImage.dataset.linkUrl;
        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    });
    
    // Escape key to close preview
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certificatePreview.classList.contains('active')) {
            certificatePreview.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Animation on scroll for certificate cards
    const animateOnScroll = () => {
        const cards = document.querySelectorAll('.animate-on-scroll:not(.visible)');
        
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                card.classList.add('visible');
            }
        });
    };
    
    // Initial check for animations
    setTimeout(animateOnScroll, 100);
    
    // Add scroll listener for animations
    window.addEventListener('scroll', animateOnScroll);
    
    // Initialize masonry layout
    if (typeof Masonry !== 'undefined') {
        const grid = document.querySelector('.row[data-masonry]');
        if (grid) {
            new Masonry(grid, {
                itemSelector: '.certificate-item',
                percentPosition: true
            });
        }
    }
}
