// ===================================
// LIGHT MODE AND DARK MODE
// ===================================

const themeToggle = document.getElementById("themeToggle");

// Load the saved theme
const savedTheme = localStorage.getItem("portfolioTheme");

if (savedTheme === "light") {
    document.body.classList.add("light-mode");
}

// Update theme button text
function updateThemeButton() {
    if (!themeToggle) return;

    if (document.body.classList.contains("light-mode")) {
        themeToggle.textContent = "🌙 Dark Mode";
    } else {
        themeToggle.textContent = "☀️ Light Mode";
    }
}

updateThemeButton();

// Switch themes
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");

        const theme = document.body.classList.contains("light-mode")
            ? "light"
            : "dark";

        localStorage.setItem("portfolioTheme", theme);

        updateThemeButton();
    });
}


// ===================================
// MOBILE SLIDING NAVIGATION
// ===================================

function setupMobileNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    const navOverlay = document.getElementById("navOverlay");

    if (!menuToggle || !navLinks || !navOverlay) return;

    // Open or close the menu
    function setMenuState(isOpen) {
        navLinks.classList.toggle("active", isOpen);
        navOverlay.classList.toggle("active", isOpen);
        document.body.classList.toggle("menu-open", isOpen);

        menuToggle.textContent = isOpen ? "✕" : "☰";

        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    }

    // Toggle menu button
    menuToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.contains("active");

        setMenuState(!isOpen);
    });

    // Close menu when a navigation link is clicked
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const href = link.getAttribute("href");

            if (href === "#") {
                event.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            } else {
                const target = document.querySelector(href);

                if (target) {
                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                    history.replaceState(null, "", href);
                }
            }

            setMenuState(false);
        });
    });

    // Close menu when overlay is clicked
    navOverlay.addEventListener("click", function () {
        setMenuState(false);
    });

    // Close menu using Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            setMenuState(false);
        }
    });

    // Close menu when returning to desktop
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            setMenuState(false);
        }
    });
}

setupMobileNavigation();


// ===================================
// PHOTO VIEWER
// ===================================

const gallery = document.getElementById("photoGallery");
const viewer = document.getElementById("photoViewer");
const viewerImage = document.getElementById("viewerImage");
const viewerCaption = document.getElementById("viewerCaption");
const photoCounter = document.getElementById("photoCounter");

const closeViewer = document.getElementById("closeViewer");
const previousButton = document.getElementById("previousPhoto");
const nextButton = document.getElementById("nextPhoto");

// Get all gallery photos safely
const photos = gallery
    ? Array.from(gallery.querySelectorAll("figure")).map(function (figure) {
        const img = figure.querySelector("img");
        const caption = figure.querySelector("figcaption");

        return {
            src: img ? img.src : "",
            alt: img ? img.alt : "",
            caption: caption
                ? caption.textContent.trim()
                : (img ? img.alt : "")
        };
    }).filter(function (photo) {
        return photo.src !== "";
    })
    : [];

let currentPhoto = 0;
let lastFocusedElement = null;

// Display a selected photo
function showPhoto(index) {
    if (photos.length === 0) return;

    // Wrap around at the beginning and end
    currentPhoto = (index + photos.length) % photos.length;

    const photo = photos[currentPhoto];

    viewerImage.src = photo.src;
    viewerImage.alt = photo.alt;

    viewerCaption.textContent = photo.caption;

    photoCounter.textContent =
        `Photo ${currentPhoto + 1} of ${photos.length}`;
}

// Open the photo viewer
function openViewer(index) {
    if (!viewer || photos.length === 0) return;

    lastFocusedElement = document.activeElement;

    showPhoto(index);

    viewer.hidden = false;
    document.body.style.overflow = "hidden";

    if (closeViewer) {
        closeViewer.focus();
    }
}

// Close the photo viewer
function closePhotoViewer() {
    if (!viewer) return;

    viewer.hidden = true;
    document.body.style.overflow = "";

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

// Click a photo to open it
if (gallery) {
    gallery.addEventListener("click", function (event) {
        const figure = event.target.closest("figure");

        if (!figure || !gallery.contains(figure)) return;

        const figures = Array.from(
            gallery.querySelectorAll("figure")
        );

        const index = figures.indexOf(figure);

        if (index !== -1 && photos[index]) {
            openViewer(index);
        }
    });
}

// Next photo
if (nextButton) {
    nextButton.addEventListener("click", function () {
        showPhoto(currentPhoto + 1);
    });
}

// Previous photo
if (previousButton) {
    previousButton.addEventListener("click", function () {
        showPhoto(currentPhoto - 1);
    });
}

// Close button
if (closeViewer) {
    closeViewer.addEventListener("click", closePhotoViewer);
}

// Close when the dark background is clicked
if (viewer) {
    viewer.addEventListener("click", function (event) {
        if (event.target === viewer) {
            closePhotoViewer();
        }
    });
}

// Keyboard controls
document.addEventListener("keydown", function (event) {
    if (!viewer || viewer.hidden) return;

    if (event.key === "Escape") {
        closePhotoViewer();
    } else if (event.key === "ArrowRight") {
        showPhoto(currentPhoto + 1);
    } else if (event.key === "ArrowLeft") {
        showPhoto(currentPhoto - 1);
    }
});


// ===================================
// CONTACT FORM VALIDATION AND PREVIEW
// ===================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get user input
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        // Get error elements
        const nameError = document.getElementById("nameError");
        const emailError = document.getElementById("emailError");
        const messageError = document.getElementById("messageError");

        const feedback = document.getElementById("formFeedback");
        const preview = document.getElementById("formPreview");

        // Clear previous errors
        nameError.textContent = "";
        emailError.textContent = "";
        messageError.textContent = "";

        feedback.textContent = "";
        preview.hidden = true;

        let valid = true;

        // Validate name
        if (name === "") {
            nameError.textContent = "Please enter your name.";
            valid = false;
        }

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            emailError.textContent =
                "Please enter a valid email address.";

            valid = false;
        }

        // Validate message
        if (message === "") {
            messageError.textContent = "Please enter your message.";
            valid = false;
        }

        // Stop if validation fails
        if (!valid) {
            feedback.textContent =
                "Please correct the errors above.";

            return;
        }

        // Display validated information safely
        document.getElementById("previewName").textContent = name;
        document.getElementById("previewEmail").textContent = email;
        document.getElementById("previewMessage").textContent = message;

        // Show preview
        preview.hidden = false;

        feedback.textContent =
            "Validation successful! Your data has been checked.";
    });
}