/* =========================================================
   VELO™ MAIN SCRIPT
   HOMEPAGE — FINAL INTERACTION SYSTEM

   Designed by Gamer-X + ChatGPT

   CORE SYSTEMS:
   - Menu
   - Notifications
   - Account access popup
   - Smart search
   - Filters
   - Product card carousel
   - Product viewer
   - Save for later
   - Shopping cart
   - Related products
   - Persistent browser storage

   IMPORTANT:
   SIGN IN / CREATE ACCOUNT
   ≠
   REGISTER AS A MEMBER
========================================================= */


/* =========================================================
   GLOBAL STORAGE KEYS
========================================================= */

const VELO_STORAGE = {

    cart: "velo_cart",

    saved: "velo_saved",

    account: "velo_account",

    loggedIn: "velo_logged_in",

    notifications: "velo_notifications"

};


/* =========================================================
   GENERAL HELPERS
========================================================= */

function qs(selector, parent = document) {

    return parent.querySelector(selector);

}


function qsa(selector, parent = document) {

    return Array.from(
        parent.querySelectorAll(selector)
    );

}


function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null ? "" : String(value);

    return div.innerHTML;

}


function readStorage(key, fallback) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) return fallback;

        return JSON.parse(value);

    } catch (error) {

        console.warn(
            "VELO storage read failed:",
            error
        );

        return fallback;

    }

}


function writeStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.warn(
            "VELO storage write failed:",
            error
        );

    }

}


function removeStorage(key) {

    try {

        localStorage.removeItem(key);

    } catch (error) {

        console.warn(
            "VELO storage removal failed:",
            error
        );

    }

}


/* =========================================================
   BODY LOCK
========================================================= */

function lockBody() {

    document.body.classList.add(
        "velo-scroll-lock"
    );

}


function unlockBody() {

    /*
       Only unlock when no major overlay is open.
    */

    const sidebar =
        qs("#sidebar");

    const viewer =
        qs(".product-viewer");

    const popup =
        qs("#veloEntryPopup");

    const sidebarOpen =
        sidebar &&
        sidebar.classList.contains("open");

    const viewerOpen =
        viewer &&
        (
            viewer.classList.contains("open") ||
            viewer.classList.contains("active")
        );

    const popupOpen =
        popup &&
        (
            popup.classList.contains("open") ||
            popup.classList.contains("active")
        );

    if (
        !sidebarOpen &&
        !viewerOpen &&
        !popupOpen
    ) {

        document.body.classList.remove(
            "velo-scroll-lock"
        );

    }

}


/* =========================================================
   MENU
========================================================= */

const sidebar =
    qs("#sidebar");

const menuButton =
    qs(
        ".menu-btn, #menu-btn, [data-menu-button]"
    );

const menuCloseButton =
    qs(
        ".close-btn, #close-menu, [data-close-menu]"
    );

const sidebarOverlay =
    qs(
        ".sidebar-overlay, #overlay, [data-sidebar-overlay]"
    );


function openMenu() {

    if (!sidebar) return;

    sidebar.classList.add("open");

    sidebar.classList.add("active");

    sidebar.setAttribute(
        "aria-hidden",
        "false"
    );

    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

        sidebarOverlay.style.display =
            "block";

    }

    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }

    lockBody();

}


function closeMenu() {

    if (sidebar) {

        sidebar.classList.remove("open");

        sidebar.classList.remove("active");

        sidebar.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

        setTimeout(() => {

            if (
                !sidebarOverlay.classList.contains(
                    "active"
                )
            ) {

                sidebarOverlay.style.display =
                    "none";

            }

        }, 350);

    }

    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

    unlockBody();

}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            if (
                sidebar &&
                sidebar.classList.contains("open")
            ) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );

}


if (menuCloseButton) {

    menuCloseButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeMenu();

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        function() {

            closeMenu();

        }
    );

}


/* =========================================================
   SIDEBAR LINKS
========================================================= */

qsa(
    "#sidebar a"
).forEach(link => {

    link.addEventListener(
        "click",
        function() {

            closeMenu();

        }
    );

});


/* =========================================================
   NOTIFICATIONS
========================================================= */

const notificationButton =
    qs(
        "#notification-btn, .notification-btn, [data-notification-button]"
    );

const notificationPanel =
    qs(
        "#notification-panel, .notification-panel, [data-notification-panel]"
    );

const notificationClose =
    qs(
        "#notification-close, .notification-close, [data-close-notifications]"
    );


function openNotifications() {

    if (!notificationPanel) {

        /*
           If the page has no notification panel,
           allow the normal link to work.
        */

        return;

    }

    closeMenu();

    closeFilter();

    notificationPanel.classList.add(
        "active"
    );

    notificationPanel.classList.add(
        "open"
    );

    notificationPanel.style.display =
        "block";

    document.body.classList.add(
        "notifications-open"
    );

}


function closeNotifications() {

    if (!notificationPanel) return;

    notificationPanel.classList.remove(
        "active"
    );

    notificationPanel.classList.remove(
        "open"
    );

    notificationPanel.style.display =
        "none";

    document.body.classList.remove(
        "notifications-open"
    );

}


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        function(event) {

            if (!notificationPanel) {

                return;

            }

            event.preventDefault();

            event.stopPropagation();

            if (
                notificationPanel.classList.contains(
                    "active"
                )
            ) {

                closeNotifications();

            } else {

                openNotifications();

            }

        }
    );

}


if (notificationClose) {

    notificationClose.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeNotifications();

        }
    );

}


/* =========================================================
   NOTIFICATION COUNT
========================================================= */

function updateNotificationCount() {

    const countElement =
        qs(
            "#notification-count, .notification-count"
        );

    if (!countElement) return;

    const notifications =
        readStorage(
            VELO_STORAGE.notifications,
            []
        );

    const unread =
        notifications.filter(
            notification =>
                !notification.read
        ).length;

    if (unread > 0) {

        countElement.textContent =
            unread > 99 ? "99+" : unread;

        countElement.style.display =
            "flex";

    } else {

        countElement.textContent =
            "";

        countElement.style.display =
            "none";

    }

}


updateNotificationCount();


/* =========================================================
   ACCOUNT ACCESS POPUP
=========================================================

   THIS IS NOT MEMBERSHIP REGISTRATION.

   This popup exists only for:

   1. A person who has no website account.
   2. A person who has an account but is currently
      logged out.

   It does NOT mean:
   "Register as a VELO Member."

   Membership registration remains a separate system.
========================================================= */

const loginPopup =
    qs(
        "#veloEntryPopup, #login-popup, .login-popup, #auth-popup, .auth-popup, [data-login-popup]"
    );


const loginOpenButtons =
    qsa(
        "#login-btn, .login-btn, [data-open-login], [data-open-account]"
    );


const loginCloseButton =
    qs(
        "#veloPopupClose, #login-popup-close, .login-popup-close, #auth-close, .auth-close, [data-close-login]"
    );


const popupContinue =
    qs(
        "#veloPopupContinue"
    );


function hasWebsiteAccount() {

    const account =
        readStorage(
            VELO_STORAGE.account,
            null
        );

    return !!account;

}


function isWebsiteLoggedIn() {

    return (
        localStorage.getItem(
            VELO_STORAGE.loggedIn
        ) === "true"
    );

}


function shouldShowAccountPopup() {

    /*
       No account = show popup.

       Account exists but logged out = show popup.

       Account exists and logged in = don't show.
    */

    if (!hasWebsiteAccount()) {

        return true;

    }

    if (!isWebsiteLoggedIn()) {

        return true;

    }

    return false;

}


function openLoginPopup() {

    if (!loginPopup) return;

    closeMenu();

    closeNotifications();

    closeFilter();

    loginPopup.classList.add(
        "active"
    );

    loginPopup.classList.add(
        "open"
    );

    loginPopup.style.display =
        "flex";

    loginPopup.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "popup-open"
    );

    lockBody();

}


function closeLoginPopup() {

    if (!loginPopup) return;

    loginPopup.classList.remove(
        "active"
    );

    loginPopup.classList.remove(
        "open"
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

    unlockBody();

}


loginOpenButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                openLoginPopup();

            }
        );

    }
);


/* =========================================================
   ACCOUNT LINKS
========================================================= */

qsa(
    'a[href="register.html"], a[href="./register.html"]'
).forEach(link => {

    /*
       Do NOT intercept links that are inside
       the popup itself.

       Those must navigate to the actual
       Sign In/Create Account page.
    */

    if (
        loginPopup &&
        loginPopup.contains(link)
    ) {

        return;

    }

    link.addEventListener(
        "click",
        function(event) {

            /*
               Only intercept if this is an account
               access link.

               Membership registration is intentionally
               NOT included here.
            */

            const text =
                normalize(
                    link.textContent
                );

            const isAccountLink =
                text.includes("sign in") ||
                text.includes("create account") ||
                text.includes("login") ||
                text.includes("account");

            const isMembershipLink =
                text.includes("member") ||
                text.includes("membership");

            if (
                isAccountLink &&
                !isMembershipLink
            ) {

                event.preventDefault();

                openLoginPopup();

            }

        }
    );

});


/* =========================================================
   POPUP CLOSE
========================================================= */

if (loginCloseButton) {

    loginCloseButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeLoginPopup();

        }
    );

}


if (popupContinue) {

    popupContinue.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeLoginPopup();

        }
    );

}


if (loginPopup) {

    loginPopup.addEventListener(
        "click",
        function(event) {

            if (
                event.target === loginPopup
            ) {

                closeLoginPopup();

            }

        }
    );

}


/* =========================================================
   IMPORTANT:
   MEMBER REGISTRATION MUST NEVER BE INTERCEPTED
========================================================= */

qsa(
    'a[href*="member"], a[href*="membership"]'
).forEach(link => {

    link.addEventListener(
        "click",
        function() {

            /*
               Intentionally empty.

               Membership registration is its own
               separate process.
            */

        }
    );

});


/* =========================================================
   FILTER SYSTEM
========================================================= */

const filterButton =
    qs(
        "#filter-btn, .filter-btn, .filter-trigger, [data-filter-button]"
    );

const filterPanel =
    qs(
        "#filter-panel, .filter-panel, [data-filter-panel]"
    );

const filterClose =
    qs(
        "#filter-close, .filter-close, [data-close-filter]"
    );


function openFilter() {

    if (!filterPanel) return;

    closeNotifications();

    filterPanel.classList.add(
        "open"
    );

    filterPanel.classList.add(
        "active"
    );

    filterPanel.style.display =
        "";

}


function closeFilter() {

    if (!filterPanel) return;

    filterPanel.classList.remove(
        "open"
    );

    filterPanel.classList.remove(
        "active"
    );

}


if (filterButton) {

    filterButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            if (
                filterPanel &&
                (
                    filterPanel.classList.contains(
                        "open"
                    ) ||
                    filterPanel.classList.contains(
                        "active"
                    )
                )
            ) {

                closeFilter();

            } else {

                openFilter();

            }

        }
    );

}


if (filterClose) {

    filterClose.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeFilter();

        }
    );

}


/* =========================================================
   PRODUCT CARD DISCOVERY
========================================================= */

function getProductCards() {

    return qsa(
        ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
    ).filter(card => {

        /*
           Do not count related-product cards as
           main storefront cards.
        */

        return !card.closest(
            ".related-products"
        ) &&
        !card.classList.contains(
            "related-product-card"
        );

    });

}


/* =========================================================
   PRODUCT DATA EXTRACTION
========================================================= */

function getCardImages(card) {

    const images = [];

    /*
       First look for explicit data-images.
    */

    const dataImages =
        card.getAttribute(
            "data-images"
        );

    if (dataImages) {

        dataImages
            .split("|")
            .map(
                image =>
                    image.trim()
            )
            .filter(Boolean)
            .forEach(
                image =>
                    images.push(image)
            );

    }


    /*
       Then collect actual images inside the card.
    */

    qsa(
        "img",
        card
    ).forEach(img => {

        const source =
            img.dataset.src ||
            img.getAttribute("src");

        if (
            source &&
            !images.includes(source)
        ) {

            images.push(source);

        }

    });


    /*
       If absolutely nothing exists,
       use placeholder.
    */

    if (!images.length) {

        images.push(
            "images/placeholder.jpg"
        );

    }

    return images;

}


function getProductData(card) {

    const titleElement =
        qs(
            ".product-card-title, .product-card-info h3, .product-card-info h2, h3, h2",
            card
        );

    const descriptionElement =
        qs(
            ".product-card-description, .product-card-info p, p",
            card
        );

    const categoryElement =
        qs(
            ".product-card-info span, .product-category, [data-category]",
            card
        );

    const title =
        card.dataset.name ||
        card.dataset.productName ||
        (
            titleElement
                ? titleElement.textContent.trim()
                : "VELO Product"
        );

    const description =
        card.dataset.description ||
        (
            descriptionElement
                ? descriptionElement.textContent.trim()
                : ""
        );

    const category =
        card.dataset.category ||
        (
            categoryElement
                ? categoryElement.textContent.trim()
                : ""
        );

    const price =
        parseFloat(
            card.dataset.price || "0"
        ) || 0;

    const edition =
        card.dataset.edition || "";

    const gender =
        card.dataset.gender || "";

    const weather =
        card.dataset.weather || "";

    const item =
        card.dataset.item ||
        card.dataset.type ||
        "";

    const color =
        card.dataset.color || "";

    const productId =
        card.dataset.productId ||
        card.dataset.id ||
        (
            title
                .toLowerCase()
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-|-$/g,
                    ""
                )
        );

    return {

        id: productId,

        name: title,

        description: description,

        category: category,

        price: price,

        edition: edition,

        gender: gender,

        weather: weather,

        item: item,

        color: color,

        images: getCardImages(card),

        element: card

    };

}


/* =========================================================
   PRODUCT IMAGE CAROUSELS
========================================================= */

const cardCarouselStates =
    new WeakMap();


function createCardImageCarousel(card) {

    const frame =
        qs(
            ".product-image-frame, .product-image",
            card
        );

    if (!frame) return;

    const images =
        getCardImages(card);

    if (images.length <= 1) return;

    let track =
        qs(
            ".product-image-track",
            frame
        );

    /*
       If HTML already provides a track,
       use it.
    */

    if (!track) {

        track =
            document.createElement(
                "div"
            );

        track.className =
            "product-image-track";

        const existingImages =
            qsa(
                "img",
                frame
            );

        existingImages.forEach(img => {

            const slide =
                document.createElement(
                    "div"
                );

            slide.className =
                "product-image-slide";

            slide.appendChild(img);

            track.appendChild(
                slide
            );

        });

        frame.innerHTML = "";

        frame.appendChild(
            track
        );

    }


    /*
       Ensure all slides exist.
    */

    if (
        qsa(
            ".product-image-slide",
            track
        ).length !== images.length
    ) {

        track.innerHTML = "";

        images.forEach(
            src => {

                const slide =
                    document.createElement(
                        "div"
                    );

                slide.className =
                    "product-image-slide";

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    src;

                img.alt =
                    getProductData(
                        card
                    ).name;

                slide.appendChild(
                    img
                );

                track.appendChild(
                    slide
                );

            }
        );

    }


    let dots =
        qs(
            ".card-image-dots, .product-image-dots",
            frame
        );

    if (!dots) {

        dots =
            document.createElement(
                "div"
            );

        dots.className =
            "card-image-dots";

        frame.appendChild(
            dots
        );

    }

    dots.innerHTML = "";

    images.forEach(
        (_, index) => {

            const dot =
                document.createElement(
                    "button"
                );

            dot.type =
                "button";

            dot.className =
                "card-image-dot";

            if (index === 0) {

                dot.classList.add(
                    "active"
                );

            }

            dot.setAttribute(
                "aria-label",
                `View image ${index + 1}`
            );

            dot.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();

                    setCardImage(
                        card,
                        index,
                        true
                    );

                }
            );

            dots.appendChild(
                dot
            );

        }
    );


    let previous =
        qs(
            ".card-image-prev",
            frame
        );

    let next =
        qs(
            ".card-image-next",
            frame
        );


    if (!previous) {

        previous =
            document.createElement(
                "button"
            );

        previous.type =
            "button";

        previous.className =
            "card-image-prev";

        previous.innerHTML =
            "‹";

        frame.appendChild(
            previous
        );

    }


    if (!next) {

        next =
            document.createElement(
                "button"
            );

        next.type =
            "button";

        next.className =
            "card-image-next";

        next.innerHTML =
            "›";

        frame.appendChild(
            next
        );

    }


    previous.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            const state =
                cardCarouselStates.get(
                    card
                ) || { index: 0 };

            setCardImage(
                card,
                (
                    state.index -
                    1 +
                    images.length
                ) %
                images.length,
                true
            );

        }
    );


    next.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            const state =
                cardCarouselStates.get(
                    card
                ) || { index: 0 };

            setCardImage(
                card,
                (
                    state.index + 1
                ) %
                images.length,
                true
            );

        }
    );


    cardCarouselStates.set(
        card,
        {
            index:0,
            timer:null
        }
    );


    startCardAutoCarousel(
        card
    );

}


function setCardImage(
    card,
    index,
    manual = false
) {

    const frame =
        qs(
            ".product-image-frame, .product-image",
            card
        );

    const track =
        qs(
            ".product-image-track",
            frame
        );

    if (!track) return;

    const slides =
        qsa(
            ".product-image-slide",
            track
        );

    if (!slides.length) return;

    const safeIndex =
        (
            index +
            slides.length
        ) %
        slides.length;

    track.style.transform =
        `translateX(-${safeIndex * 100}%)`;

    const dots =
        qsa(
            ".card-image-dot, .product-image-dot",
            frame
        );

    dots.forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex === safeIndex
            );

        }
    );

    const state =
        cardCarouselStates.get(
            card
        ) || {};

    state.index =
        safeIndex;

    cardCarouselStates.set(
        card,
        state
    );

    if (manual) {

        restartCardAutoCarousel(
            card
        );

    }

}


function startCardAutoCarousel(card) {

    const state =
        cardCarouselStates.get(
            card
        );

    if (!state) return;

    clearInterval(
        state.timer
    );

    const images =
        getCardImages(card);

    if (images.length <= 1) return;

    state.timer =
        setInterval(
            () => {

                const nextIndex =
                    (
                        state.index + 1
                    ) %
                    images.length;

                setCardImage(
                    card,
                    nextIndex,
                    false
                );

            },
            8000
        );

}


function restartCardAutoCarousel(card) {

    startCardAutoCarousel(
        card
    );

}


/* =========================================================
   INITIALIZE CARD CAROUSELS
========================================================= */

getProductCards()
    .forEach(
        card =>
            createCardImageCarousel(
                card
            )
    );


/* =========================================================
   PRODUCT VIEWER
========================================================= */

const productViewer =
    qs(
        ".product-viewer"
    );


let activeProduct =
    null;

let activeViewerImage =
    0;

let viewerTimer =
    null;


function getViewerFrame() {

    return qs(
        ".viewer-image-frame, .product-viewer-image-frame",
        productViewer || document
    );

}


function getViewerImageElement() {

    const frame =
        getViewerFrame();

    if (!frame) return null;

    return qs(
        "img",
        frame
    );

}


function getViewerNameElement() {

    return qs(
        "#viewerProductName, .viewer-product-name, .viewer-product-title",
        productViewer || document
    );

}


function getViewerDescriptionElement() {

    return qs(
        "#viewerProductDescription, .viewer-description, .viewer-product-description",
        productViewer || document
    );

}


function getViewerCategoryElement() {

    return qs(
        "#viewerProductCategory, .viewer-product-category",
        productViewer || document
    );

}


function renderViewerProduct(
    product
) {

    if (!productViewer || !product) return;

    activeProduct =
        product;

    activeViewerImage =
        0;

    const image =
        getViewerImageElement();

    const name =
        getViewerNameElement();

    const description =
        getViewerDescriptionElement();

    const category =
        getViewerCategoryElement();


    if (image) {

        image.src =
            product.images[0];

        image.alt =
            product.name;

        image.classList.remove(
            "is-changing"
        );

    }


    if (name) {

        name.textContent =
            product.name;

    }


    if (description) {

        description.textContent =
            product.description;

    }


    if (category) {

        category.textContent =
            product.category;

    }


    renderViewerImageControls();

    renderRelatedProducts(
        product
    );

    updateSaveButton();

    startViewerAutoCarousel();

}


function renderViewerImageControls() {

    if (!productViewer || !activeProduct)
        return;

    const frame =
        getViewerFrame();

    if (!frame) return;

    let previous =
        qs(
            ".viewer-image-prev",
            frame
        );

    let next =
        qs(
            ".viewer-image-next",
            frame
        );


    if (
        activeProduct.images.length > 1
    ) {

        if (!previous) {

            previous =
                document.createElement(
                    "button"
                );

            previous.type =
                "button";

            previous.className =
                "viewer-image-prev";

            previous.innerHTML =
                "‹";

            frame.appendChild(
                previous
            );

        }


        if (!next) {

            next =
                document.createElement(
                    "button"
                );

            next.type =
                "button";

            next.className =
                "viewer-image-next";

            next.innerHTML =
                "›";

            frame.appendChild(
                next
            );

        }


        previous.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                changeViewerImage(
                    activeViewerImage - 1,
                    true
                );

            };


        next.onclick =
            function(event) {

                event.preventDefault();

                event.stopPropagation();

                changeViewerImage(
                    activeViewerImage + 1,
                    true
                );

            };

    }

}


function changeViewerImage(
    index,
    manual = false
) {

    if (!activeProduct) return;

    const images =
        activeProduct.images;

    if (!images.length) return;

    activeViewerImage =
        (
            index +
            images.length
        ) %
        images.length;

    const image =
        getViewerImageElement();

    if (!image) return;

    image.classList.add(
        "is-changing"
    );

    setTimeout(
        () => {

            image.src =
                images[
                    activeViewerImage
                ];

            image.onload =
                () => {

                    image.classList.remove(
                        "is-changing"
                    );

                };

        },
        100
    );

    if (manual) {

        startViewerAutoCarousel();

    }

}


function startViewerAutoCarousel() {

    clearInterval(
        viewerTimer
    );

    if (
        !activeProduct ||
        activeProduct.images.length <= 1
    ) {

        return;

    }

    viewerTimer =
        setInterval(
            () => {

                changeViewerImage(
                    activeViewerImage + 1,
                    false
                );

            },
            8000
        );

}


function stopViewerAutoCarousel() {

    clearInterval(
        viewerTimer
    );

    viewerTimer =
        null;

}


/* =========================================================
   OPEN PRODUCT VIEWER
========================================================= */

function openProductViewer(
    card
) {

    if (!productViewer) return;

    const product =
        getProductData(card);

    renderViewerProduct(
        product
    );

    productViewer.classList.add(
        "open"
    );

    productViewer.classList.add(
        "active"
    );

    productViewer.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "product-viewer-open"
    );

    lockBody();

    productViewer.scrollTop =
        0;

}


function closeProductViewer() {

    if (!productViewer) return;

    stopViewerAutoCarousel();

    productViewer.classList.remove(
        "open"
    );

    productViewer.classList.remove(
        "active"
    );

    productViewer.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "product-viewer-open"
    );

    activeProduct =
        null;

    unlockBody();

}


/* =========================================================
   VIEWER BACK / CLOSE
========================================================= */

const viewerBack =
    qs(
        ".viewer-back, .product-viewer-close, [data-close-viewer]"
    );


if (viewerBack) {

    viewerBack.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeProductViewer();

        }
    );

}


/* =========================================================
   PRODUCT CARD CLICK
========================================================= */

getProductCards()
    .forEach(
        card => {

            card.addEventListener(
                "click",
                function(event) {

                    /*
                       Buttons, links, inputs and controls
                       inside the card should perform their
                       own jobs.
                    */

                    if (
                        event.target.closest(
                            "button, a, input, select, textarea"
                        )
                    ) {

                        return;

                    }

                    /*
                       If the card has a genuine external
                       product link, use it only when the
                       current design explicitly asks for it.

                       Otherwise the new VELO viewer opens.
                    */

                    const explicitLink =
                        card.dataset.openLink ===
                        "true";

                    const productLink =
                        card.dataset.link ||
                        card.dataset.productLink;

                    if (
                        explicitLink &&
                        productLink
                    ) {

                        window.location.href =
                            productLink;

                        return;

                    }

                    openProductViewer(
                        card
                    );

                }
            );

        }
    );


/* =========================================================
   SAVE FOR LATER
========================================================= */

const saveButton =
    qs(
        ".save-product-btn, #saveProductBtn, [data-save-product]"
    );


function getSavedProducts() {

    return readStorage(
        VELO_STORAGE.saved,
        []
    );

}


function isProductSaved(
    productId
) {

    return getSavedProducts()
        .some(
            product =>
                product.id === productId
        );

}


function updateSaveButton() {

    if (!saveButton || !activeProduct)
        return;

    const saved =
        isProductSaved(
            activeProduct.id
        );

    saveButton.classList.toggle(
        "active",
        saved
    );

    saveButton.textContent =
        saved
            ? "Saved"
            : "Save for Later";

}


if (saveButton) {

    saveButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            if (!activeProduct) return;

            let saved =
                getSavedProducts();

            const existingIndex =
                saved.findIndex(
                    product =>
                        product.id ===
                        activeProduct.id
                );

            if (
                existingIndex >= 0
            ) {

                saved.splice(
                    existingIndex,
                    1
                );

            } else {

                saved.push({

                    id:
                        activeProduct.id,

                    name:
                        activeProduct.name,

                    description:
                        activeProduct.description,

                    price:
                        activeProduct.price,

                    images:
                        activeProduct.images,

                    edition:
                        activeProduct.edition

                });

            }

            writeStorage(
                VELO_STORAGE.saved,
                saved
            );

            updateSaveButton();

        }
    );

}


/* =========================================================
   CART
========================================================= */

let cart =
    readStorage(
        VELO_STORAGE.cart,
        []
    );


function saveCart() {

    writeStorage(
        VELO_STORAGE.cart,
        cart
    );

}


function getCartQuantity() {

    return cart.reduce(
        (
            total,
            item
        ) =>
            total +
            (
                Number(
                    item.quantity
                ) || 0
            ),
        0
    );

}


function updateCartCount() {

    const countElements =
        qsa(
            "#cart-count, .cart-count"
        );

    const quantity =
        getCartQuantity();

    countElements.forEach(
        element => {

            element.textContent =
                quantity;

            element.style.display =
                quantity > 0
                    ? "flex"
                    : "";

        }
    );

}


function addToCart(
    product,
    quantity = 1
) {

    if (!product) return;

    const amount =
        Math.max(
            1,
            Number(quantity) || 1
        );

    const existing =
        cart.find(
            item =>
                item.id ===
                product.id
        );

    if (existing) {

        existing.quantity +=
            amount;

    } else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            description:
                product.description,

            price:
                product.price,

            images:
                product.images,

            edition:
                product.edition,

            quantity:
                amount

        });

    }

    saveCart();

    updateCartCount();

    renderCartIfPresent();

    showToast(
        `${product.name} added to cart.`
    );

}


function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.id !==
                productId
        );

    saveCart();

    updateCartCount();

    renderCartIfPresent();

}


function changeCartQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            product =>
                product.id ===
                productId
        );

    if (!item) return;

    item.quantity =
        Math.max(
            1,
            (
                Number(
                    item.quantity
                ) || 1
            ) + amount
        );

    saveCart();

    updateCartCount();

    renderCartIfPresent();

}


/* =========================================================
   ADD TO CART BUTTON
========================================================= */

const addToCartButton =
    qs(
        ".add-to-cart-btn, .add-to-cart, #addToCartBtn, [data-add-to-cart]"
    );


if (addToCartButton) {

    addToCartButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            if (!activeProduct) return;

            addToCart(
                activeProduct,
                1
            );

        }
    );

}


/* =========================================================
   CART PANEL / CART PAGE
========================================================= */

const cartPanel =
    qs(
        "#cart-panel, .cart-panel, [data-cart-panel]"
    );

const cartButton =
    qs(
        "#cart-btn, .cart-btn, [data-cart-button]"
    );


function renderCartIfPresent() {

    const container =
        qs(
            "#cartItems, .cart-items, [data-cart-items]"
        );

    if (!container) return;

    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty.</h3>
                <p>Start exploring VELO and add something you love.</p>
            </div>
        `;

        updateCartTotals();

        return;

    }


    container.innerHTML =
        cart.map(
            item => `

                <article
                    class="cart-item"
                    data-cart-product-id="${escapeHTML(item.id)}"
                >

                    <div class="cart-item-image">

                        <img
                            src="${escapeHTML(
                                item.images &&
                                item.images[0]
                                    ? item.images[0]
                                    : "images/placeholder.jpg"
                            )}"
                            alt="${escapeHTML(item.name)}"
                        >

                    </div>


                    <div class="cart-item-details">

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>

                        <p>
                            ${escapeHTML(item.description || "")}
                        </p>

                        <strong>
                            ${formatMoney(item.price)}
                        </strong>


                        <div class="cart-item-controls">

                            <button
                                type="button"
                                data-cart-minus="${escapeHTML(item.id)}"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                type="button"
                                data-cart-plus="${escapeHTML(item.id)}"
                            >
                                +
                            </button>

                            <button
                                type="button"
                                data-cart-remove="${escapeHTML(item.id)}"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                </article>

            `
        ).join("");


    updateCartTotals();

}


function updateCartTotals() {

    const subtotalElement =
        qs(
            "#cartSubtotal, .cart-subtotal, [data-cart-subtotal]"
        );

    const totalElement =
        qs(
            "#cartTotal, .cart-total, [data-cart-total]"
        );

    const subtotal =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    (
                        Number(
                            item.price
                        ) || 0
                    ) *
                    (
                        Number(
                            item.quantity
                        ) || 0
                    )
                ),
            0
        );

    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(
                subtotal
            );

    }

    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                subtotal
            );

    }

}


document.addEventListener(
    "click",
    function(event) {

        const plus =
            event.target.closest(
                "[data-cart-plus]"
            );

        const minus =
            event.target.closest(
                "[data-cart-minus]"
            );

        const remove =
            event.target.closest(
                "[data-cart-remove]"
            );


        if (plus) {

            event.preventDefault();

            changeCartQuantity(
                plus.dataset.cartPlus,
                1
            );

            return;

        }


        if (minus) {

            event.preventDefault();

            changeCartQuantity(
                minus.dataset.cartMinus,
                -1
            );

            return;

        }


        if (remove) {

            event.preventDefault();

            removeFromCart(
                remove.dataset.cartRemove
            );

            return;

        }

    }
);


/* =========================================================
   CART BUTTON
========================================================= */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        function(event) {

            /*
               If no cart panel exists,
               allow the normal cart.html link.
            */

            if (!cartPanel) {

                return;

            }

            event.preventDefault();

            event.stopPropagation();

            if (
                cartPanel.classList.contains(
                    "active"
                )
            ) {

                cartPanel.classList.remove(
                    "active"
                );

                cartPanel.classList.remove(
                    "open"
                );

                cartPanel.style.display =
                    "none";

            } else {

                closeMenu();

                closeNotifications();

                renderCartIfPresent();

                cartPanel.classList.add(
                    "active"
                );

                cartPanel.classList.add(
                    "open"
                );

                cartPanel.style.display =
                    "block";

            }

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

const searchInput =
    qs(
        "#productSearch, #product-search, #search-input, .search-input, [data-product-search]"
    );

const searchButton =
    qs(
        "#searchButton, #search-btn, .search-btn, .search-submit, [data-search-button]"
    );

const searchSuggestions =
    qs(
        ".search-suggestions, #searchSuggestions, [data-search-suggestions]"
    );


function productSearchText(
    product
) {

    return normalize(
        [
            product.name,
            product.description,
            product.category,
            product.edition,
            product.gender,
            product.weather,
            product.item,
            product.color
        ].join(" ")
    );

}


function getAllProductData() {

    return getProductCards()
        .map(
            card =>
                getProductData(card)
        );

}


function showSearchSuggestions(
    value
) {

    if (!searchSuggestions) return;

    const search =
        normalize(value);

    if (!search) {

        searchSuggestions.classList.remove(
            "active"
        );

        searchSuggestions.classList.remove(
            "open"
        );

        return;

    }

    const products =
        getAllProductData();

    const matches =
        products
            .filter(
                product =>
                    productSearchText(
                        product
                    ).includes(
                        search
                    )
            )
            .slice(
                0,
                8
            );


    if (!matches.length) {

        searchSuggestions.innerHTML = `
            <div class="search-suggestion">
                <strong>No exact match</strong>
                <small>Try another term</small>
            </div>
        `;

    } else {

        searchSuggestions.innerHTML =
            matches
                .map(
                    product => `

                        <button
                            type="button"
                            class="search-suggestion"
                            data-search-product-id="${escapeHTML(product.id)}"
                        >

                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    product.edition ||
                                    product.category ||
                                    ""
                                )}
                            </small>

                        </button>

                    `
                )
                .join("");

    }


    searchSuggestions.classList.add(
        "active"
    );

    searchSuggestions.classList.add(
        "open"
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            showSearchSuggestions(
                this.value
            );

            applyProductFilters();

        }
    );

    searchInput.addEventListener(
        "focus",
        function() {

            if (this.value.trim()) {

                showSearchSuggestions(
                    this.value
                );

            }

        }
    );

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            applyProductFilters();

            if (searchSuggestions) {

                searchSuggestions.classList.remove(
                    "active"
                );

                searchSuggestions.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =========================================================
   SEARCH SUGGESTION CLICK
========================================================= */

if (searchSuggestions) {

    searchSuggestions.addEventListener(
        "click",
        function(event) {

            const suggestion =
                event.target.closest(
                    "[data-search-product-id]"
                );

            if (!suggestion) return;

            const id =
                suggestion.dataset
                    .searchProductId;

            const card =
                getProductCards()
                    .find(
                        productCard =>
                            getProductData(
                                productCard
                            ).id === id
                    );

            if (card) {

                if (searchInput) {

                    searchInput.value =
                        getProductData(
                            card
                        ).name;

                }

                searchSuggestions.classList.remove(
                    "active"
                );

                searchSuggestions.classList.remove(
                    "open"
                );

                openProductViewer(
                    card
                );

            }

        }
    );

}


/* =========================================================
   FILTER STATE
========================================================= */

const filterState = {

    gender: "",

    edition: "",

    weather: "",

    item: "",

    color: "",

    minPrice: null,

    maxPrice: null

};


/* =========================================================
   FILTER OPTION BUTTONS
========================================================= */

qsa(
    ".quick-filter-chip, .filter-option, .choice-grid button, [data-filter-value]"
).forEach(
    button => {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                const type =
                    normalize(
                        this.dataset.filter ||
                        this.dataset.filterType ||
                        this.name ||
                        this.closest(
                            ".filter-section"
                        )?.dataset.filter ||
                        ""
                    );

                const value =
                    normalize(
                        this.dataset.value ||
                        this.dataset.filterValue ||
                        this.value ||
                        this.textContent
                    );

                /*
                   Quick gender chips.
                */

                if (
                    type.includes("gender") ||
                    ["men", "women", "kids"].includes(
                        value
                    )
                ) {

                    filterState.gender =
                        filterState.gender === value
                            ? ""
                            : value;

                }


                if (
                    type.includes("edition")
                ) {

                    filterState.edition =
                        filterState.edition === value
                            ? ""
                            : value;

                }


                if (
                    type.includes("weather")
                ) {

                    filterState.weather =
                        filterState.weather === value
                            ? ""
                            : value;

                }


                if (
                    type.includes("item")
                ) {

                    filterState.item =
                        filterState.item === value
                            ? ""
                            : value;

                }


                if (
                    type.includes("color") ||
                    type.includes("colour")
                ) {

                    filterState.color =
                        filterState.color === value
                            ? ""
                            : value;

                }


                /*
                   If no explicit type was supplied,
                   infer from text.
                */

                if (!type) {

                    if (
                        ["men", "women", "kids"]
                            .includes(value)
                    ) {

                        filterState.gender =
                            filterState.gender === value
                                ? ""
                                : value;

                    }

                }


                updateFilterButtonStates();

                applyProductFilters();

            }
        );

    }
);


/* =========================================================
   FILTER INPUTS
========================================================= */

function readPriceFilters() {

    const minInput =
        qs(
            "#minPrice, #priceMin, [data-min-price]"
        );

    const maxInput =
        qs(
            "#maxPrice, #priceMax, [data-max-price]"
        );

    const min =
        minInput
            ? parseFloat(
                minInput.value
            )
            : NaN;

    const max =
        maxInput
            ? parseFloat(
                maxInput.value
            )
            : NaN;

    filterState.minPrice =
        Number.isFinite(min)
            ? min
            : null;

    filterState.maxPrice =
        Number.isFinite(max)
            ? max
            : null;

}


qsa(
    "#minPrice, #priceMin, #maxPrice, #priceMax, [data-min-price], [data-max-price]"
).forEach(
    input => {

        input.addEventListener(
            "input",
            function() {

                readPriceFilters();

                applyProductFilters();

            }
        );

    }
);


/* =========================================================
   FILTER SELECT ELEMENTS
========================================================= */

qsa(
    "#filter-panel select, .filter-panel select, [data-filter-panel] select"
).forEach(
    select => {

        select.addEventListener(
            "change",
            function() {

                const value =
                    normalize(
                        this.value
                    );

                const name =
                    normalize(
                        this.name ||
                        this.id
                    );


                if (
                    name.includes(
                        "edition"
                    )
                ) {

                    filterState.edition =
                        value;

                }


                if (
                    name.includes(
                        "gender"
                    )
                ) {

                    filterState.gender =
                        value;

                }


                if (
                    name.includes(
                        "weather"
                    )
                ) {

                    filterState.weather =
                        value;

                }


                if (
                    name.includes(
                        "item"
                    )
                ) {

                    filterState.item =
                        value;

                }


                if (
                    name.includes(
                        "color"
                    ) ||
                    name.includes(
                        "colour"
                    )
                ) {

                    filterState.color =
                        value;

                }


                readPriceFilters();

                applyProductFilters();

            }
        );

    }
);


/* =========================================================
   APPLY PRODUCT FILTERS
========================================================= */

function matchesFilter(
    product,
    state
) {

    const text =
        productSearchText(
            product
        );


    /*
       SEARCH
    */

    const searchValue =
        searchInput
            ? normalize(
                searchInput.value
            )
            : "";

    if (
        searchValue &&
        !text.includes(
            searchValue
        )
    ) {

        return false;

    }


    /*
       GENDER
    */

    if (
        state.gender &&
        !normalize(
            product.gender
        ).includes(
            state.gender
        )
    ) {

        return false;

    }


    /*
       EDITION
    */

    if (
        state.edition &&
        !normalize(
            product.edition
        ).includes(
            state.edition
        )
    ) {

        return false;

    }


    /*
       WEATHER
    */

    if (
        state.weather &&
        !normalize(
            product.weather
        ).includes(
            state.weather
        )
    ) {

        return false;

    }


    /*
       ITEM
    */

    if (
        state.item &&
        !(
            normalize(
                product.item
            ).includes(
                state.item
            ) ||
            text.includes(
                state.item
            )
        )
    ) {

        return false;

    }


    /*
       COLOR
    */

    if (
        state.color &&
        !normalize(
            product.color
        ).includes(
            state.color
        )
    ) {

        return false;

    }


    /*
       PRICE
    */

    if (
        state.minPrice !== null &&
        product.price <
        state.minPrice
    ) {

        return false;

    }


    if (
        state.maxPrice !== null &&
        product.price >
        state.maxPrice
    ) {

        return false;

    }


    return true;

}


function applyProductFilters() {

    const cards =
        getProductCards();

    cards.forEach(
        card => {

            const product =
                getProductData(
                    card
                );

            const visible =
                matchesFilter(
                    product,
                    filterState
                );

            card.style.display =
                visible
                    ? ""
                    : "none";

        }
    );

    updateFilterButtonStates();

}


/* =========================================================
   FILTER BUTTON VISUAL STATE
========================================================= */

function updateFilterButtonStates() {

    qsa(
        ".quick-filter-chip, .filter-option, .choice-grid button, [data-filter-value]"
    ).forEach(
        button => {

            const value =
                normalize(
                    button.dataset.value ||
                    button.dataset.filterValue ||
                    button.value ||
                    button.textContent
                );

            const type =
                normalize(
                    button.dataset.filter ||
                    button.dataset.filterType ||
                    button.closest(
                        ".filter-section"
                    )?.dataset.filter ||
                    ""
                );

            let active =
                false;


            if (
                (
                    type.includes("gender") ||
                    ["men", "women", "kids"]
                        .includes(value)
                ) &&
                value ===
                filterState.gender
            ) {

                active = true;

            }


            if (
                type.includes("edition") &&
                value ===
                filterState.edition
            ) {

                active = true;

            }


            if (
                type.includes("weather") &&
                value ===
                filterState.weather
            ) {

                active = true;

            }


            if (
                type.includes("item") &&
                value ===
                filterState.item
            ) {

                active = true;

            }


            if (
                (
                    type.includes("color") ||
                    type.includes("colour")
                ) &&
                value ===
                filterState.color
            ) {

                active = true;

            }


            button.classList.toggle(
                "active",
                active
            );

        }
    );

}


/* =========================================================
   RESET FILTERS
========================================================= */

const filterReset =
    qs(
        "#filter-reset, .filter-reset, [data-reset-filter]"
    );


if (filterReset) {

    filterReset.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            filterState.gender = "";

            filterState.edition = "";

            filterState.weather = "";

            filterState.item = "";

            filterState.color = "";

            filterState.minPrice =
                null;

            filterState.maxPrice =
                null;


            qsa(
                "#filter-panel input, #filter-panel select, .filter-panel input, .filter-panel select"
            ).forEach(
                element => {

                    if (
                        element.tagName ===
                        "SELECT"
                    ) {

                        element.selectedIndex =
                            0;

                    } else {

                        element.value =
                            "";

                    }

                }
            );


            if (searchInput) {

                searchInput.value =
                    "";

            }


            applyProductFilters();

        }
    );

}


/* =========================================================
   CURRENCY DISPLAY
========================================================= */

let activeCurrency =
    "USD";


const currencySymbols = {

    USD: "$",

    NGN: "₦",

    GBP: "£",

    EUR: "€"

};


function formatMoney(
    amount
) {

    const number =
        Number(
            amount
        ) || 0;

    const symbol =
        currencySymbols[
            activeCurrency
        ] ||
        "$";

    return (
        symbol +
        number.toLocaleString(
            undefined,
            {
                minimumFractionDigits:0,
                maximumFractionDigits:2
            }
        )
    );

}


const currencyButton =
    qs(
        ".currency-change-btn, #currencyChangeBtn, [data-currency-button]"
    );


if (currencyButton) {

    currencyButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            /*
               The full account-country currency system
               will eventually come from the user's account
               / backend.

               For now we support the currencies the UI
               already exposes.
            */

            const selected =
                prompt(
                    "Enter currency: USD, NGN, GBP or EUR"
                );

            if (!selected) return;

            const currency =
                selected
                    .trim()
                    .toUpperCase();

            if (
                currencySymbols[
                    currency
                ]
            ) {

                activeCurrency =
                    currency;

                currencyButton.textContent =
                    `Currency: ${currency}`;

                renderCartIfPresent();

            }

        }
    );

}


/* =========================================================
   RELATED PRODUCTS
========================================================= */

function renderRelatedProducts(
    currentProduct
) {

    const track =
        qs(
            ".related-products-track, .related-track"
        );

    if (!track) return;

    const products =
        getAllProductData()
            .filter(
                product =>
                    product.id !==
                    currentProduct.id
            );


    /*
       Prefer products with the same edition,
       category, item or gender.
    */

    products.sort(
        (
            a,
            b
        ) => {

            function score(product) {

                let value = 0;

                if (
                    currentProduct.edition &&
                    normalize(
                        product.edition
                    ) ===
                    normalize(
                        currentProduct.edition
                    )
                ) {

                    value += 4;

                }

                if (
                    currentProduct.category &&
                    normalize(
                        product.category
                    ) ===
                    normalize(
                        currentProduct.category
                    )
                ) {

                    value += 3;

                }

                if (
                    currentProduct.item &&
                    normalize(
                        product.item
                    ) ===
                    normalize(
                        currentProduct.item
                    )
                ) {

                    value += 2;

                }

                if (
                    currentProduct.gender &&
                    normalize(
                        product.gender
                    ) ===
                    normalize(
                        currentProduct.gender
                    )
                ) {

                    value += 1;

                }

                return value;

            }

            return (
                score(b) -
                score(a)
            );

        }
    );


    track.innerHTML =
        products
            .slice(
                0,
                10
            )
            .map(
                product => `

                    <article
                        class="related-product-card"
                        data-related-product-id="${escapeHTML(product.id)}"
                    >

                        <img
                            src="${escapeHTML(
                                product.images[0]
                            )}"
                            alt="${escapeHTML(
                                product.name
                            )}"
                        >

                        <span>
                            ${escapeHTML(
                                product.name
                            )}
                        </span>

                    </article>

                `
            )
            .join("");


    qsa(
        ".related-product-card",
        track
    ).forEach(
        relatedCard => {

            relatedCard.addEventListener(
                "click",
                function() {

                    const id =
                        this.dataset
                            .relatedProductId;

                    const card =
                        getProductCards()
                            .find(
                                productCard =>
                                    getProductData(
                                        productCard
                                    ).id === id
                            );

                    if (card) {

                        renderViewerProduct(
                            getProductData(
                                card
                            )
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   VIEWER TOUCH SWIPE
========================================================= */

let viewerTouchStartX =
    null;

let viewerTouchEndX =
    null;


if (productViewer) {

    const frame =
        getViewerFrame();


    if (frame) {

        frame.addEventListener(
            "touchstart",
            function(event) {

                viewerTouchStartX =
                    event.changedTouches[0].screenX;

            },
            {
                passive:true
            }
        );


        frame.addEventListener(
            "touchend",
            function(event) {

                viewerTouchEndX =
                    event.changedTouches[0].screenX;

                const difference =
                    viewerTouchEndX -
                    viewerTouchStartX;


                if (
                    Math.abs(
                        difference
                    ) < 45
                ) {

                    return;

                }


                if (
                    difference < 0
                ) {

                    changeViewerImage(
                        activeViewerImage + 1,
                        true
                    );

                } else {

                    changeViewerImage(
                        activeViewerImage - 1,
                        true
                    );

                }

            },
            {
                passive:true
            }
        );

    }

}


/* =========================================================
   CARD TOUCH SWIPE
========================================================= */

getProductCards()
    .forEach(
        card => {

            const frame =
                qs(
                    ".product-image-frame, .product-image",
                    card
                );

            if (!frame) return;


            let startX =
                null;


            frame.addEventListener(
                "touchstart",
                function(event) {

                    startX =
                        event.changedTouches[0]
                            .screenX;

                },
                {
                    passive:true
                }
            );


            frame.addEventListener(
                "touchend",
                function(event) {

                    if (
                        startX === null
                    ) {

                        return;

                    }

                    const endX =
                        event.changedTouches[0]
                            .screenX;

                    const difference =
                        endX -
                        startX;


                    if (
                        Math.abs(
                            difference
                        ) < 45
                    ) {

                        startX =
                            null;

                        return;

                    }


                    const state =
                        cardCarouselStates.get(
                            card
                        ) || {
                            index:0
                        };

                    const images =
                        getCardImages(
                            card
                        );


                    if (
                        difference < 0
                    ) {

                        setCardImage(
                            card,
                            (
                                state.index +
                                1
                            ) %
                            images.length,
                            true
                        );

                    } else {

                        setCardImage(
                            card,
                            (
                                state.index -
                                1 +
                                images.length
                            ) %
                            images.length,
                            true
                        );

                    }

                    startX =
                        null;

                },
                {
                    passive:true
                }
            );

        }
    );


/* =========================================================
   TOAST MESSAGE
========================================================= */

function showToast(
    message
) {

    let toast =
        qs(
            "#veloToast, .velo-toast"
        );

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "veloToast";

        toast.className =
            "velo-toast";

        toast.style.position =
            "fixed";

        toast.style.left =
            "50%";

        toast.style.bottom =
            "25px";

        toast.style.transform =
            "translateX(-50%) translateY(20px)";

        toast.style.padding =
            "12px 18px";

        toast.style.borderRadius =
            "999px";

        toast.style.background =
            "#111";

        toast.style.border =
            "1px solid rgba(255,255,255,.14)";

        toast.style.color =
            "#fff";

        toast.style.fontSize =
            "13px";

        toast.style.fontWeight =
            "700";

        toast.style.opacity =
            "0";

        toast.style.pointerEvents =
            "none";

        toast.style.zIndex =
            "30000";

        toast.style.transition =
            "opacity .3s ease, transform .3s ease";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;

    toast.style.opacity =
        "1";

    toast.style.transform =
        "translateX(-50%) translateY(0)";


    clearTimeout(
        toast._veloTimer
    );


    toast._veloTimer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateX(-50%) translateY(20px)";

            },
            2500
        );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }

        closeMenu();

        closeNotifications();

        closeFilter();

        closeLoginPopup();

        closeProductViewer();

    }
);


/* =========================================================
   CLICK OUTSIDE SEARCH SUGGESTIONS
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            searchSuggestions &&
            !event.target.closest(
                ".search-container, .search-section"
            )
        ) {

            searchSuggestions.classList.remove(
                "active"
            );

            searchSuggestions.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

const header =
    qs(
        "header"
    );


window.addEventListener(
    "scroll",
    function() {

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            window.scrollY > 30
        );

    },
    {
        passive:true
    }
);


/* =========================================================
   HERO FADE
========================================================= */

const hero =
    qs(
        ".hero"
    );


window.addEventListener(
    "scroll",
    function() {

        if (!hero) return;

        const scroll =
            window.scrollY;

        const opacity =
            Math.max(
                0,
                Math.min(
                    1,
                    1 -
                    scroll /
                    900
                )
            );

        hero.style.opacity =
            opacity;

    },
    {
        passive:true
    }
);


/* =========================================================
   LOGO
========================================================= */

const logo =
    qs(
        ".velo-logo"
    );


if (logo) {

    setInterval(
        function() {

            logo.classList.toggle(
                "float"
            );

        },
        2000
    );

}


/* =========================================================
   IMAGE FALLBACK
========================================================= */

qsa(
    "img"
).forEach(
    img => {

        img.addEventListener(
            "error",
            function() {

                if (
                    this.dataset
                        .fallbackApplied
                ) {

                    return;

                }

                this.dataset
                    .fallbackApplied =
                    "true";

                this.src =
                    "images/placeholder.jpg";

            }
        );

    }
);


/* =========================================================
   ACTIVE PAGE
========================================================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


qsa(
    "a"
).forEach(
    link => {

        const href =
            link.getAttribute(
                "href"
            );

        if (!href) return;

        const clean =
            href
                .split("?")[0]
                .split("#")[0]
                .split("/")
                .pop()
                .toLowerCase();

        if (
            clean &&
            clean ===
            currentPage
        ) {

            link.classList.add(
                "active-page"
            );

        }

    }
);


/* =========================================================
   PRELOADER / PAGE READY
========================================================= */

window.addEventListener(
    "load",
    function() {

        document.body.classList.add(
            "loaded"
        );

        updateCartCount();

        renderCartIfPresent();

        updateFilterButtonStates();


        /*
           IMPORTANT ACCOUNT POPUP RULE:

           We intentionally DO NOT automatically
           open it here if an account is logged in.

           If the user has no account or is logged out,
           show it.

           Membership registration is completely separate.
        */

        setTimeout(
            () => {

                if (
                    shouldShowAccountPopup()
                ) {

                    openLoginPopup();

                }

            },
            700
        );

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Sidebar starts hidden.
        */

        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

            sidebar.classList.remove(
                "active"
            );

            sidebar.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (sidebarOverlay) {

            sidebarOverlay.classList.remove(
                "active"
            );

            sidebarOverlay.style.display =
                "none";

        }


        /*
           Filter starts closed.
        */

        closeFilter();


        /*
           Notifications start closed.
        */

        closeNotifications();


        /*
           Product viewer starts closed.
        */

        closeProductViewer();


        /*
           Login popup starts hidden.
        */

        if (loginPopup) {

            loginPopup.classList.remove(
                "active"
            );

            loginPopup.classList.remove(
                "open"
            );

            loginPopup.style.display =
                "none";

            loginPopup.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        /*
           Cart.
        */

        cart =
            readStorage(
                VELO_STORAGE.cart,
                []
            );

        updateCartCount();

        renderCartIfPresent();

    }
);


/* =========================================================
   GLOBAL PRODUCT CARD ACTION SUPPORT
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const addButton =
            event.target.closest(
                "[data-product-add-to-cart]"
            );

        if (addButton) {

            event.preventDefault();

            const card =
                addButton.closest(
                    ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
                );

            if (card) {

                addToCart(
                    getProductData(
                        card
                    ),
                    Number(
                        addButton.dataset.quantity
                    ) || 1
                );

            }

            return;

        }


        const saveButtonFromCard =
            event.target.closest(
                "[data-product-save]"
            );

        if (saveButtonFromCard) {

            event.preventDefault();

            const card =
                saveButtonFromCard.closest(
                    ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
                );

            if (!card) return;

            const product =
                getProductData(
                    card
                );

            let saved =
                getSavedProducts();

            const index =
                saved.findIndex(
                    item =>
                        item.id ===
                        product.id
                );

            if (index >= 0) {

                saved.splice(
                    index,
                    1
                );

            } else {

                saved.push(
                    product
                );

            }

            writeStorage(
                VELO_STORAGE.saved,
                saved
            );

            return;

        }

    }
);


/* =========================================================
   DEBUG API
   Useful while building/testing the site.
========================================================= */

window.VELO = {

    openMenu,

    closeMenu,

    openNotifications,

    closeNotifications,

    openFilter,

    closeFilter,

    openLoginPopup,

    closeLoginPopup,

    openProductViewer,

    closeProductViewer,

    addToCart,

    removeFromCart,

    changeCartQuantity,

    applyProductFilters,

    getProductCards,

    getProductData,

    getAllProductData,

    getCartQuantity

};


/* =========================================================
   END VELO MAIN SCRIPT
========================================================= */
