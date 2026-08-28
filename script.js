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

    const button =
        document.querySelector(
            ".menu-btn, #menu-btn, [data-menu-button]"
        );

    if (button) {
        button.setAttribute("aria-expanded", "true");
    }

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

    const button =
        document.querySelector(
            ".menu-btn, #menu-btn, [data-menu-button]"
        );

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }

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

        /*
           IMPORTANT:
           If the notification button is a normal link
           to notifications.html and there is no panel
           on this page, allow the link to work normally.
        */

        if (!notificationPanel) {
            return;
        }

        e.preventDefault();

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

        /*
           If there is NO cart panel on the current page,
           this is a normal link to cart.html.

           DO NOT prevent the default action.
        */

        if (!cartPanel) {
            return;
        }

        e.preventDefault();

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
        "#productSearch, #product-search, #search-input, .search-input, [data-product-search]"
    );


const searchButton =
    document.querySelector(
        "#searchButton, #search-btn, .search-btn, [data-search-button]"
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
        "#filter-panel select, .filter-panel select, [data-filter-panel] select, .store-filters select"
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
               The homepage uses IDs such as:
               editionFilter
               priceFilter
               genderFilter
               shopPriceFilter
               sizeFilter
               colorFilter

               Convert those IDs to the matching
               data attribute names.
            */

            let dataKey = key;

            if (key === "editionfilter") {
                dataKey = "edition";
            }

            if (key === "pricefilter") {
                dataKey = "price";
            }

            if (key === "genderfilter") {
                dataKey = "gender";
            }

            if (key === "shoppricefilter") {
                dataKey = "price";
            }

            if (key === "sizefilter") {
                dataKey = "size";
            }

            if (key === "colorfilter") {
                dataKey = "color";
            }


            const dataValue =
                card.getAttribute(
                    "data-" + dataKey
                );


            if (dataValue) {

                const normalizedData =
                    dataValue.toLowerCase();

                /*
                   PRICE SORTING is handled separately.
                   Do not treat high-low / low-high
                   as an actual product price value.
                */

                if (
                    key === "pricefilter" &&
                    (
                        filterValue === "high-low" ||
                        filterValue === "low-high" ||
                        filterValue === "default"
                    )
                ) {

                    return;

                }


                /*
                   Shop-by-price ranges.
                */

                if (key === "shoppricefilter") {

                    const numericPrice =
                        parseFloat(dataValue);

                    if (!isNaN(numericPrice)) {

                        if (filterValue === "0-50") {

                            if (
                                numericPrice < 0 ||
                                numericPrice > 50
                            ) {
                                visible = false;
                            }

                        }

                        if (filterValue === "50-100") {

                            if (
                                numericPrice < 50 ||
                                numericPrice > 100
                            ) {
                                visible = false;
                            }

                        }

                        if (filterValue === "100-200") {

                            if (
                                numericPrice < 100 ||
                                numericPrice > 200
                            ) {
                                visible = false;
                            }

                        }

                        if (filterValue === "200-500") {

                            if (
                                numericPrice < 200 ||
                                numericPrice > 500
                            ) {
                                visible = false;
                            }

                        }

                        if (filterValue === "500-plus") {

                            if (numericPrice < 500) {
                                visible = false;
                            }

                        }

                    }

                } else if (
                    !normalizedData.includes(filterValue)
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


    /*
       PRICE SORT
    */

    const priceFilter =
        document.getElementById("priceFilter");


    if (priceFilter) {

        const sortValue =
            priceFilter.value;


        if (
            sortValue === "high-low" ||
            sortValue === "low-high"
        ) {

            const productGrid =
                document.getElementById("productGrid");


            if (productGrid) {

                const cardsArray =
                    Array.from(
                        productGrid.querySelectorAll(
                            ".product-card"
                        )
                    );


                cardsArray.sort((a, b) => {

                    const priceA =
                        parseFloat(
                            a.getAttribute("data-price") || "0"
                        );

                    const priceB =
                        parseFloat(
                            b.getAttribute("data-price") || "0"
                        );


                    if (sortValue === "high-low") {
                        return priceB - priceA;
                    }

                    return priceA - priceB;

                });


                cardsArray.forEach(card => {

                    productGrid.appendChild(card);

                });

            }

        }

    }

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

    if (sliderIsBeingDragged) return;


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

/*
   YOUR INDEX.HTML uses:

   #veloEntryPopup

   The previous script was looking for:
   #login-popup
   #auth-popup
   etc.

   That is why the popup could not be found.
*/

const loginPopup =
    document.querySelector(
        "#veloEntryPopup, #login-popup, .login-popup, #auth-popup, .auth-popup, [data-login-popup]"
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

    loginPopup.setAttribute(
        "aria-hidden",
        "false"
    );

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

    loginPopup.setAttribute(
        "aria-hidden",
        "true"
    );

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


/* ==================================================
   REGISTER / SIGN-IN LINKS
   OPEN POPUP FROM NORMAL ACCOUNT LINKS
================================================== */

document
    .querySelectorAll(
        'a[href="register.html"]'
    )
    .forEach(link => {

        /*
           Do not intercept the register link
           INSIDE the popup itself.
        */

        if (
            loginPopup &&
            loginPopup.contains(link)
        ) {

            return;

        }


        link.addEventListener(
            "click",
            function(e) {

                e.preventDefault();

                openLoginPopup();

            }
        );

    });


/* ==================================================
   POPUP CLOSE BUTTON
================================================== */

const loginCloseButton =
    document.querySelector(
        "#veloPopupClose, #login-popup-close, .login-popup-close, #auth-close, .auth-close, [data-close-login]"
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
   POPUP CONTINUE BROWSING
================================================== */

const popupContinue =
    document.getElementById(
        "veloPopupContinue"
    );


if (popupContinue) {

    popupContinue.addEventListener(
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
   KEEP POPUP REGISTER BUTTON WORKING
================================================== */

if (loginPopup) {

    const popupRegisterLink =
        loginPopup.querySelector(
            'a[href="register.html"]'
        );


    if (popupRegisterLink) {

        popupRegisterLink.addEventListener(
            "click",
            function(e) {

                /*
                   This link should actually take the
                   visitor to register.html.

                   Do NOT prevent its default action.
                */

                closeLoginPopup();

            }
        );

    }

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
           These are intentionally independent.
           Do not add behaviour here that would
           interfere with their normal links.
        */

        const notification =
            e.target.closest(
                "#notification-btn, .notification-btn, [data-notification-button]"
            );


        const cart =
            e.target.closest(
                "#cart-btn, .cart-btn, [data-cart-button]"
            );


        const menu =
            e.target.closest(
                ".menu-btn, #menu-btn, [data-menu-button]"
            );


        /*
           Nothing else needs to happen here.
           The individual handlers above manage
           each control.
        */

        if (
            notification ||
            cart ||
            menu
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
           Notifications should begin closed
           ONLY if a notification panel exists.
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
           ONLY when it exists.
        */

        if (cartPanel) {

            cartPanel.classList.remove(
                "active"
            );

            cartPanel.style.display =
                "none";

        }


        /*
           Your popup should begin hidden.
        */

        if (loginPopup) {

            loginPopup.classList.remove(
                "active"
            );

            loginPopup.style.display =
                "none";

            loginPopup.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }
);
