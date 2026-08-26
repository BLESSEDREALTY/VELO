/* =========================
VELO MAIN SCRIPT
Designed by Gamer-X + ChatGPT
Preserved + Enhanced
========================= */


/* ==================================================
   MENU
================================================== */

function openMenu() {

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (!sidebar) return;

    sidebar.style.left = "0";

    if (overlay) {
        overlay.style.display = "block";

        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
        });
    }

    document.body.classList.add("menu-open");
}


function closeMenu() {

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) {
        sidebar.style.left = "-340px";
    }

    if (overlay) {

        overlay.style.opacity = "0";

        setTimeout(() => {

            if (!document.body.classList.contains("menu-open")) {
                overlay.style.display = "none";
            }

        }, 350);
    }

    document.body.classList.remove("menu-open");
}


/* ==================================================
   MENU BUTTON / CLOSE BUTTON / OVERLAY
================================================== */

const menuButton =
    document.querySelector(
        ".menu-btn, #menu-btn, [data-menu-button]"
    );

const closeButton =
    document.querySelector(
        ".close-btn, #close-menu, [data-close-menu]"
    );

const pageOverlay =
    document.getElementById("overlay");


if (menuButton) {

    menuButton.addEventListener("click", function(e) {

        e.preventDefault();

        openMenu();

    });

}


if (closeButton) {

    closeButton.addEventListener("click", function(e) {

        e.preventDefault();

        closeMenu();

    });

}


if (pageOverlay) {

    pageOverlay.addEventListener("click", function() {

        closeMenu();

    });

}


/* ==================================================
   CLOSE MENU WHEN A SIDEBAR LINK IS SELECTED
================================================== */

const sidebarLinks =
    document.querySelectorAll("#sidebar a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", function() {

        closeMenu();

    });

});


/* ==================================================
   ESCAPE KEY
================================================== */

document.addEventListener("keydown", function(e) {

    if (e.key !== "Escape") return;

    closeMenu();

    closeNotifications();

    closeFilter();

    closeLoginPopup();

});


/* ==================================================
   NOTIFICATION BELL
================================================== */

const notificationButton =
    document.querySelector(
        "#notification-btn, .notification-btn, [data-notification-button]"
    );

const notificationPanel =
    document.querySelector(
        "#notification-panel, .notification-panel, [data-notification-panel]"
    );


function openNotifications() {

    if (!notificationPanel) return;

    notificationPanel.classList.add("active");

    notificationPanel.style.display = "block";

    document.body.classList.add("notifications-open");

}


function closeNotifications() {

    if (!notificationPanel) return;

    notificationPanel.classList.remove("active");

    notificationPanel.style.display = "none";

    document.body.classList.remove("notifications-open");

}


if (notificationButton) {

    notificationButton.addEventListener("click", function(e) {

        e.preventDefault();

        if (!notificationPanel) return;

        const isOpen =
            notificationPanel.classList.contains("active");

        if (isOpen) {

            closeNotifications();

        } else {

            closeMenu();

            openNotifications();

        }

    });

}


/* ==================================================
   NOTIFICATION CLOSE BUTTON
================================================== */

const notificationClose =
    document.querySelector(
        "#notification-close, .notification-close, [data-close-notifications]"
    );


if (notificationClose) {

    notificationClose.addEventListener("click", function(e) {

        e.preventDefault();

        closeNotifications();

    });

}


/* ==================================================
   CART BUTTON
================================================== */

const cartButton =
    document.querySelector(
        "#cart-btn, .cart-btn, [data-cart-button]"
    );

const cartPanel =
    document.querySelector(
        "#cart-panel, .cart-panel, [data-cart-panel]"
    );


if (cartButton) {

    cartButton.addEventListener("click", function(e) {

        e.preventDefault();

        /*
           If a cart panel exists, open it.
           If the cart is a separate page,
           the HTML link continues to work normally.
        */

        if (cartPanel) {

            const isOpen =
                cartPanel.classList.contains("active");

            if (isOpen) {

                cartPanel.classList.remove("active");

                cartPanel.style.display = "none";

            } else {

                closeMenu();

                closeNotifications();

                cartPanel.classList.add("active");

                cartPanel.style.display = "block";

            }

        }

    });

}


/* ==================================================
   FILTER SYSTEM
================================================== */

const filterButton =
    document.querySelector(
        "#filter-btn, .filter-btn, [data-filter-button]"
    );

const filterPanel =
    document.querySelector(
        "#filter-panel, .filter-panel, [data-filter-panel]"
    );


function openFilter() {

    if (!filterPanel) return;

    filterPanel.classList.add("active");

    filterPanel.style.display = "block";

}


function closeFilter() {

    if (!filterPanel) return;

    filterPanel.classList.remove("active");

    filterPanel.style.display = "none";

}


if (filterButton) {

    filterButton.addEventListener("click", function(e) {

        e.preventDefault();

        const isOpen =
            filterPanel &&
            filterPanel.classList.contains("active");

        if (isOpen) {

            closeFilter();

        } else {

            openFilter();

        }

    });

}


/* ==================================================
   FILTER CLOSE BUTTON
================================================== */

const filterClose =
    document.querySelector(
        "#filter-close, .filter-close, [data-close-filter]"
    );


if (filterClose) {

    filterClose.addEventListener("click", function(e) {

        e.preventDefault();

        closeFilter();

    });

}


/* ==================================================
   SEARCH
================================================== */

const searchInput =
    document.querySelector(
        "#product-search, #search-input, .search-input, [data-product-search]"
    );


const searchButton =
    document.querySelector(
        "#search-btn, .search-btn, [data-search-button]"
    );


function getProductCards() {

    return document.querySelectorAll(
        ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
    );

}


function filterProducts() {

    if (!searchInput) return;

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    const cards =
        getProductCards();

    cards.forEach(card => {

        const searchableText =
            card.textContent.toLowerCase();

        if (
            searchValue === "" ||
            searchableText.includes(searchValue)
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


if (searchButton) {

    searchButton.addEventListener("click", function(e) {

        e.preventDefault();

        filterProducts();

    });

}


/* ==================================================
   PRODUCT FILTER SELECTS
================================================== */

const filterSelects =
    document.querySelectorAll(
        "#filter-panel select, .filter-panel select, [data-filter-panel] select"
    );


function applyProductFilters() {

    const cards =
        getProductCards();

    if (!cards.length) return;

    const selectedFilters = {};

    filterSelects.forEach(select => {

        const value =
            select.value.trim().toLowerCase();

        const name =
            (
                select.name ||
                select.id ||
                ""
            ).toLowerCase();

        if (
            value &&
            value !== "all" &&
            !value.includes("all ")
        ) {

            selectedFilters[name] = value;

        }

    });


    const searchValue =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    cards.forEach(card => {

        const text =
            card.textContent.toLowerCase();

        let visible = true;


        /* SEARCH */

        if (
            searchValue &&
            !text.includes(searchValue)
        ) {

            visible = false;

        }


        /* FILTERS */

        Object.keys(selectedFilters).forEach(key => {

            if (!visible) return;

            const filterValue =
                selectedFilters[key];

            /*
               Look first at matching data attributes.
               If none exist, fall back to card text.
            */

            const dataValue =
                card.getAttribute(
                    "data-" + key
                );

            if (dataValue) {

                if (
                    !dataValue
                        .toLowerCase()
                        .includes(filterValue)
                ) {

                    visible = false;

                }

            } else if (
                !text.includes(filterValue)
            ) {

                visible = false;

            }

        });


        card.style.display =
            visible ? "" : "none";

    });

}


filterSelects.forEach(select => {

    select.addEventListener(
        "change",
        applyProductFilters
    );

});


/* ==================================================
   AUTO SLIDER
================================================== */

const slider =
    document.querySelector(".card-slider");

let scrollAmount = 0;

let autoSlideTimer = null;

let sliderIsBeingDragged = false;


function autoSlide() {

    if (!slider) return;

    /*
       Do not fight the user while they are
       manually dragging/swiping the cards.
    */

    if (sliderIsBeingDragged) return;

    /*
       On the new homepage grid, there may be no
       horizontal overflow. In that case, simply stop.
    */

    if (
        slider.scrollWidth <=
        slider.clientWidth
    ) {

        return;

    }


    const step =
        Math.min(
            320,
            slider.clientWidth
        );


    scrollAmount += step;


    if (
        scrollAmount >=
        slider.scrollWidth -
        slider.clientWidth
    ) {

        scrollAmount = 0;

    }


    slider.scrollTo({

        left: scrollAmount,

        behavior: "smooth"

    });

}


if (slider) {

    autoSlideTimer =
        setInterval(
            autoSlide,
            4000
        );

}


/* ==================================================
   PAUSE AUTO SLIDER DURING USER INTERACTION
================================================== */

if (slider) {

    slider.addEventListener(
        "mouseenter",
        () => {

            sliderIsBeingDragged = true;

        }
    );


    slider.addEventListener(
        "mouseleave",
        () => {

            sliderIsBeingDragged = false;

        }
    );


    slider.addEventListener(
        "touchstart",
        () => {

            sliderIsBeingDragged = true;

        },
        { passive: true }
    );


    slider.addEventListener(
        "touchend",
        () => {

            setTimeout(() => {

                sliderIsBeingDragged = false;

            }, 500);

        }
    );

}


/* ==================================================
   SMOOTH BUTTONS
================================================== */

document
    .querySelectorAll("a")
    .forEach(link => {

        link.addEventListener(
            "click",
            function() {

                /*
                   Keep the original subtle transition.
                   Do not interfere with buttons that
                   perform JavaScript actions.
                */

                document.body.style.opacity =
                    "0.96";

                setTimeout(() => {

                    document.body.style.opacity =
                        "1";

                }, 300);

            }
        );

    });


/* ==================================================
   SIMPLE PRELOADER EFFECT
================================================== */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "loaded"
        );

    }
);


/* ==================================================
   HERO FADE
================================================== */

const hero =
    document.querySelector(".hero");


window.addEventListener(
    "scroll",
    () => {

        const value =
            window.scrollY;

        if (hero) {

            /*
               Only apply the effect near the
               beginning of the page.
            */

            const opacity =
                Math.max(
                    0,
                    Math.min(
                        1,
                        1 - value / 900
                    )
                );

            hero.style.opacity =
                opacity;

        }

    },
    { passive: true }
);


/* ==================================================
   LOGO FLOAT
================================================== */

const logo =
    document.querySelector(".velo-logo");


if (logo) {

    setInterval(
        () => {

            logo.classList.toggle(
                "float"
            );

        },
        2000
    );

}


/* ==================================================
   IMAGE FALLBACK
================================================== */

document
    .querySelectorAll("img")
    .forEach(img => {

        img.addEventListener(
            "error",
            function() {

                /*
                   Prevent an infinite loop if the
                   placeholder itself is missing.
                */

                if (
                    this.dataset.fallbackApplied
                ) {

                    return;

                }

                this.dataset.fallbackApplied =
                    "true";

                this.src =
                    "images/placeholder.jpg";

            }
        );

    });


/* ==================================================
   CARD DRAG SLIDER
================================================== */

const sliderContainer =
    document.querySelector(
        ".card-slider"
    );


if (sliderContainer) {

    let isDown = false;

    let startX;

    let scrollLeft;


    sliderContainer.addEventListener(
        "mousedown",
        (e) => {

            isDown = true;

            sliderIsBeingDragged =
                true;

            startX =
                e.pageX -
                sliderContainer.offsetLeft;

            scrollLeft =
                sliderContainer.scrollLeft;

            sliderContainer.classList.add(
                "dragging"
            );

        }
    );


    sliderContainer.addEventListener(
        "mouseleave",
        () => {

            isDown = false;

            sliderIsBeingDragged =
                false;

            sliderContainer.classList.remove(
                "dragging"
            );

        }
    );


    sliderContainer.addEventListener(
        "mouseup",
        () => {

            isDown = false;

            sliderIsBeingDragged =
                false;

            sliderContainer.classList.remove(
                "dragging"
            );

        }
    );


    sliderContainer.addEventListener(
        "mousemove",
        (e) => {

            if (!isDown) return;

            e.preventDefault();

            const x =
                e.pageX -
                sliderContainer.offsetLeft;

            const walk =
                (x - startX) * 2;

            sliderContainer.scrollLeft =
                scrollLeft - walk;

        }
    );

}


/* ==================================================
   PRODUCT CARD CLICK
================================================== */

document
    .querySelectorAll(
        ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
    )
    .forEach(card => {

        card.addEventListener(
            "click",
            function(e) {

                /*
                   Do not hijack clicks on buttons,
                   links, save buttons or cart buttons.
                */

                if (
                    e.target.closest(
                        "a, button, input, select"
                    )
                ) {

                    return;

                }


                const productLink =
                    this.dataset.link ||
                    this.getAttribute(
                        "data-product-link"
                    );


                if (productLink) {

                    window.location.href =
                        productLink;

                    return;

                }


                const existingLink =
                    this.querySelector(
                        "a"
                    );


                if (existingLink) {

                    existingLink.click();

                }

            }
        );

    });


/* ==================================================
   LOGIN / REGISTER POPUP
================================================== */

const loginPopup =
    document.querySelector(
        "#login-popup, .login-popup, #auth-popup, .auth-popup, [data-login-popup]"
    );


const loginOpenButtons =
    document.querySelectorAll(
        "#login-btn, #register-btn, .login-btn, .register-btn, [data-open-login], [data-open-register]"
    );


function openLoginPopup() {

    if (!loginPopup) return;

    closeMenu();

    loginPopup.classList.add("active");

    loginPopup.style.display =
        "flex";

    document.body.classList.add(
        "popup-open"
    );

}


function closeLoginPopup() {

    if (!loginPopup) return;

    loginPopup.classList.remove(
        "active"
    );

    loginPopup.style.display =
        "none";

    document.body.classList.remove(
        "popup-open"
    );

}


loginOpenButtons.forEach(button => {

    button.addEventListener(
        "click",
        function(e) {

            e.preventDefault();

            openLoginPopup();

        }
    );

});


const loginCloseButton =
    document.querySelector(
        "#login-popup-close, .login-popup-close, #auth-close, .auth-close, [data-close-login]"
    );


if (loginCloseButton) {

    loginCloseButton.addEventListener(
        "click",
        function(e) {

            e.preventDefault();

            closeLoginPopup();

        }
    );

}


/* ==================================================
   POPUP BACKDROP CLICK
================================================== */

if (loginPopup) {

    loginPopup.addEventListener(
        "click",
        function(e) {

            if (e.target === loginPopup) {

                closeLoginPopup();

            }

        }
    );

}


/* ==================================================
   ACTIVE PAGE HIGHLIGHT
================================================== */

const currentPage =
    window.location.pathname
        .split("/")
        .pop();


document
    .querySelectorAll("a")
    .forEach(link => {

        const linkPage =
            link.getAttribute(
                "href"
            );

        if (!linkPage) return;

        const cleanLinkPage =
            linkPage
                .split("?")[0]
                .split("#")[0]
                .split("/")
                .pop();


        if (
            cleanLinkPage ===
            currentPage
        ) {

            link.style.color =
                "#d4af37";

        }

    });


/* ==================================================
   KEEP NOTIFICATION / CART / MENU INDEPENDENT
================================================== */

document.addEventListener(
    "click",
    function(e) {

        /*
           Clicking the notification should not
           accidentally trigger cart/menu behaviour.
        */

        if (
            e.target.closest(
                "#notification-btn, .notification-btn, [data-notification-button]"
            )
        ) {

            return;

        }


        if (
            e.target.closest(
                "#cart-btn, .cart-btn, [data-cart-button]"
            )
        ) {

            return;

        }

    }
);


/* ==================================================
   INITIAL UI STATE
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Filters should begin closed.
        */

        if (filterPanel) {

            filterPanel.classList.remove(
                "active"
            );

            filterPanel.style.display =
                "none";

        }


        /*
           Notifications should begin closed.
        */

        if (notificationPanel) {

            notificationPanel.classList.remove(
                "active"
            );

            notificationPanel.style.display =
                "none";

        }


        /*
           Cart panel should begin closed
           when it exists.
        */

        if (cartPanel) {

            cartPanel.classList.remove(
                "active"
            );

            cartPanel.style.display =
                "none";

        }

    }
);
