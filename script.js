/* =========================================================
   VELO — MAIN SCRIPT
   FINAL HOMEPAGE BEHAVIOUR
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const menuButton = document.querySelector(".menu-btn");

    const popup = document.getElementById("veloEntryPopup");
    const popupClose = document.getElementById("veloPopupClose");
    const popupContinue = document.getElementById("veloPopupContinue");

    const cartCount = document.getElementById("cart-count");


    /* =====================================================
       MENU
       ===================================================== */

    window.openMenu = function () {

        if (!sidebar || !overlay) return;

        sidebar.classList.add("active");
        overlay.classList.add("active");

        document.body.classList.add("menu-open");

    };


    window.closeMenu = function () {

        if (!sidebar || !overlay) return;

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

        document.body.classList.remove("menu-open");

    };


    /* =====================================================
       MENU BUTTON
       ===================================================== */

    if (menuButton) {

        menuButton.addEventListener("click", (event) => {

            event.preventDefault();

            if (sidebar && sidebar.classList.contains("active")) {
                window.closeMenu();
            } else {
                window.openMenu();
            }

        });


        menuButton.addEventListener("keydown", (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                if (
                    sidebar &&
                    sidebar.classList.contains("active")
                ) {

                    window.closeMenu();

                } else {

                    window.openMenu();

                }

            }

        });

    }


    /* =====================================================
       OVERLAY CLOSE
       ===================================================== */

    if (overlay) {

        overlay.addEventListener("click", () => {

            window.closeMenu();

        });

    }


    /* =====================================================
       SIDEBAR CLOSE BUTTON
       ===================================================== */

    const closeButton = document.querySelector(".close-btn");

    if (closeButton) {

        closeButton.addEventListener("click", () => {

            window.closeMenu();

        });

    }


    /* =====================================================
       CLOSE MENU WHEN A SIDEBAR LINK IS SELECTED
       ===================================================== */

    if (sidebar) {

        sidebar.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {

                window.closeMenu();

            });

        });

    }


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            if (
                sidebar &&
                sidebar.classList.contains("active")
            ) {

                window.closeMenu();

            }

            if (
                popup &&
                popup.classList.contains("active")
            ) {

                closeVeloPopup();

            }

        }

    });


    /* =====================================================
       VELO ENTRY POPUP
       ===================================================== */

    function openVeloPopup() {

        if (!popup) return;

        popup.classList.add("active");

        document.body.classList.add("popup-open");

    }


    function closeVeloPopup() {

        if (!popup) return;

        popup.classList.remove("active");

        document.body.classList.remove("popup-open");

    }


    /* =====================================================
       POPUP CLOSE BUTTON
       ===================================================== */

    if (popupClose) {

        popupClose.addEventListener(
            "click",
            closeVeloPopup
        );

    }


    /* =====================================================
       POPUP CONTINUE BROWSING
       ===================================================== */

    if (popupContinue) {

        popupContinue.addEventListener(
            "click",
            closeVeloPopup
        );

    }


    /* =====================================================
       CLICK OUTSIDE POPUP CARD
       ===================================================== */

    if (popup) {

        popup.addEventListener("click", (event) => {

            if (event.target === popup) {

                closeVeloPopup();

            }

        });

    }


    /* =====================================================
       POPUP OPEN ON HOMEPAGE ENTRY
       ===================================================== */

    if (popup) {

        setTimeout(() => {

            openVeloPopup();

        }, 650);

    }


    /* =====================================================
       CART COUNT
       ===================================================== */

    function updateCartCount() {

        if (!cartCount) return;

        let count = 0;

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem("veloCart")
                );

            if (Array.isArray(cart)) {

                count = cart.reduce(
                    (total, item) => {

                        return total +
                            Number(
                                item.quantity || 1
                            );

                    },
                    0
                );

            }

        } catch (error) {

            count = 0;

        }

        cartCount.textContent = count;

    }


    updateCartCount();


    /* =====================================================
       KEEP CART COUNT UPDATED
       ===================================================== */

    window.addEventListener(
        "storage",
        updateCartCount
    );


    /* =====================================================
       IMAGE FALLBACK
       ===================================================== */

    document.querySelectorAll("img").forEach(img => {

        img.addEventListener("error", function () {

            if (
                this.dataset.fallbackApplied === "true"
            ) {

                return;

            }

            this.dataset.fallbackApplied = "true";

            this.src = "images/placeholder.jpg";

        });

    });


    /* =====================================================
       PAGE LOAD
       ===================================================== */

    window.addEventListener("load", () => {

        document.body.classList.add("loaded");

    });


    /* =====================================================
       HERO FADE
       ===================================================== */

    const hero =
        document.querySelector(".homepage .hero");

    if (hero) {

        let ticking = false;

        window.addEventListener("scroll", () => {

            if (ticking) return;

            window.requestAnimationFrame(() => {

                const scrollY = window.scrollY;

                /*
                   Keep the hero visible longer.
                   It should fade gradually rather than
                   disappearing immediately.
                */

                const opacity =
                    Math.max(
                        0,
                        1 - scrollY / 1100
                    );

                hero.style.opacity = opacity;

                ticking = false;

            });

            ticking = true;

        });

    }


    /* =====================================================
       PREVENT BODY SCROLL WHEN MENU / POPUP IS OPEN
       ===================================================== */

    document.body.addEventListener(
        "wheel",
        (event) => {

            if (
                document.body.classList.contains("menu-open") ||
                document.body.classList.contains("popup-open")
            ) {

                /*
                   Allow scrolling inside the sidebar itself.
                */

                if (
                    sidebar &&
                    sidebar.contains(event.target)
                ) {

                    return;

                }

                event.preventDefault();

            }

        },
        { passive: false }
    );


    /* =====================================================
       ACTIVE SIDEBAR PAGE
       ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    if (sidebar) {

        sidebar.querySelectorAll("a").forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) return;

            const cleanHref =
                href.split("#")[0];

            if (
                cleanHref === currentPage ||
                (
                    currentPage === "" &&
                    cleanHref === "index.html"
                )
            ) {

                link.classList.add("active");

            }

        });

    }


    /* =====================================================
       SMOOTH PAGE TRANSITION
       ===================================================== */

    document.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", (event) => {

            const href =
                link.getAttribute("href");

            if (!href) return;

            /*
               Do not interfere with:
               - anchors
               - external links
               - new tabs
               - javascript links
               - cart interactions
            */

            if (
                href.startsWith("#") ||
                href.startsWith("http") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                link.target === "_blank"
            ) {

                return;

            }

            /*
               Close the sidebar immediately.
            */

            window.closeMenu();

        });

    });


    /* =====================================================
       EXPOSE POPUP FUNCTIONS IF NEEDED
       ===================================================== */

    window.openVeloPopup = openVeloPopup;
    window.closeVeloPopup = closeVeloPopup;

});


/* =========================================================
   IMPORTANT:
   NO AUTO SLIDER
   NO CARD DRAG SLIDER
   NO 4-SECOND HORIZONTAL MOVEMENT

   The new VELO homepage uses a fixed product-card
   showcase/grid. Products remain exactly where the
   homepage layout places them.
   ========================================================= */
