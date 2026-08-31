/* =========================================================
   VELO™ MAIN SCRIPT — HOMEPAGE FINAL INTERACTION SYSTEM
   Built specifically for the current index.html structure.
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const norm = v => String(v ?? "").trim().toLowerCase();

  const esc = v => {
    const d = document.createElement("div");
    d.textContent = String(v ?? "");
    return d.innerHTML;
  };

  const STORAGE = {
    cart: "velo_cart",
    saved: "velo_saved",
    account: "velo_account",
    loggedIn: "velo_logged_in",
    notifications: "velo_notifications",
    currency: "velo_currency"
  };

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const boolStored = key =>
    localStorage.getItem(key) === "true";

  const state = {
    currency:
      localStorage.getItem(STORAGE.currency) || "USD",

    filters: {
      editions: new Set(),
      genders: new Set(),
      weather: new Set(),
      items: new Set(),
      colors: new Set(),
      minUSD: 0,
      maxUSD: 250000
    },

    activeProduct: null,
    activeImage: 0,
    viewerTimer: null,
    relatedIndex: 0,
    cardTimers: new WeakMap(),
    cardIndexes: new WeakMap(),
    lastFocused: null
  };

  const currencySymbols = {
    USD: "$",
    NGN: "₦"
  };

  /*
     Product prices are stored internally in USD.
     Display currency can be switched between USD and NGN.
  */
  const rates = {
    USD: 1,
    NGN: 1500
  };

  function money(usd) {
    const value =
      (Number(usd) || 0) *
      (rates[state.currency] || 1);

    return (
      `${currencySymbols[state.currency] || "$"}` +
      value.toLocaleString(undefined, {
        minimumFractionDigits:
          value % 1 ? 2 : 0,
        maximumFractionDigits: 2
      })
    );
  }

  function usdFromDisplayed(value) {
    const n = Number(value);

    if (!Number.isFinite(n)) {
      return null;
    }

    return (
      n /
      (rates[state.currency] || 1)
    );
  }

  function setHidden(el, hidden) {
    if (!el) return;

    el.hidden = hidden;

    el.setAttribute(
      "aria-hidden",
      String(hidden)
    );
  }

  function lockBody() {
    document.body.classList.add(
      "velo-scroll-lock"
    );
  }

  function unlockBody() {
    const overlays = [
      $("#sidebar"),
      $("#filterPanel"),
      $("#productViewer"),
      $("#veloEntryPopup")
    ];

    const open =
      overlays.some(
        el =>
          el &&
          !el.hidden &&
          (
            el.classList.contains("open") ||
            el.classList.contains("active")
          )
      );

    if (!open) {
      document.body.classList.remove(
        "velo-scroll-lock"
      );
    }
  }


  /* =========================================================
     MENU
  ========================================================= */

  const sidebar =
    $("#sidebar");

  const overlay =
    $("#overlay");

  const menuButton =
    $("#menuButton");

  const menuClose =
    $("#sidebar .close-btn");


  function openMenu() {

    if (!sidebar) return;

    sidebar.classList.add(
      "open",
      "active"
    );

    sidebar.hidden = false;

    sidebar.setAttribute(
      "aria-hidden",
      "false"
    );

    if (overlay) {

      overlay.classList.add(
        "open",
        "active"
      );

      overlay.hidden = false;

      overlay.setAttribute(
        "aria-hidden",
        "false"
      );
    }

    menuButton?.setAttribute(
      "aria-expanded",
      "true"
    );

    document.body.classList.add(
      "menu-open"
    );

    lockBody();
  }


  function closeMenu() {

    sidebar?.classList.remove(
      "open",
      "active"
    );

    if (sidebar) {

      sidebar.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    overlay?.classList.remove(
      "open",
      "active"
    );

    if (overlay) {

      overlay.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    menuButton?.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove(
      "menu-open"
    );

    unlockBody();
  }


  menuButton?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      openMenu();

    }
  );


  menuClose?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      closeMenu();

    }
  );


  overlay?.addEventListener(
    "click",
    closeMenu
  );


  $$("#sidebar a").forEach(
    link => {

      link.addEventListener(
        "click",
        closeMenu
      );

    }
  );


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const notificationButton =
    $("#notificationButton");

  const notificationCount =
    $("#notificationCount");


  function updateNotificationCount() {

    if (!notificationCount) return;

    const list =
      read(
        STORAGE.notifications,
        []
      );

    const unread =
      Array.isArray(list)
        ? list.filter(
            notification =>
              !notification.read
          ).length
        : 0;

    notificationCount.textContent =
      unread > 99
        ? "99+"
        : unread
          ? String(unread)
          : "";

    notificationCount.style.display =
      unread
        ? "flex"
        : "none";
  }


  notificationButton?.addEventListener(
    "click",
    event => {

      /*
         Notifications is an actual page
         in the current homepage HTML.
         Therefore its href should navigate normally.
      */

      if (
        notificationButton.getAttribute(
          "href"
        )
      ) {
        return;
      }

      event.preventDefault();

    }
  );


  updateNotificationCount();


  /* =========================================================
     ACCOUNT ACCESS POPUP
  ========================================================= */

  const popup =
    $("#veloEntryPopup");

  const popupClose =
    $("#veloPopupClose");

  const popupContinue =
    $("#veloPopupContinue");


  function hasAccount() {

    const account =
      read(
        STORAGE.account,
        null
      );

    return (
      !!account &&
      typeof account === "object"
    );
  }


  function shouldShowPopup() {

    return (
      !hasAccount() ||
      !boolStored(
        STORAGE.loggedIn
      )
    );

  }


  function openLoginPopup() {

    if (!popup) return;

    state.lastFocused =
      document.activeElement;

    closeMenu();

    closeFilter();

    popup.hidden = false;

    popup.classList.add(
      "open",
      "active"
    );

    popup.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "popup-open"
    );

    lockBody();

    setTimeout(
      () => {

        popupClose?.focus();

      },
      30
    );

  }


  function closeLoginPopup() {

    if (!popup) return;

    popup.classList.remove(
      "open",
      "active"
    );

    popup.hidden = true;

    popup.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "popup-open"
    );

    unlockBody();

    state.lastFocused?.focus?.();

    state.lastFocused =
      null;

  }


  popupClose?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      closeLoginPopup();

    }
  );


  popupContinue?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      closeLoginPopup();

    }
  );


  popup?.addEventListener(
    "click",
    event => {

      if (
        event.target === popup
      ) {

        closeLoginPopup();

      }

    }
  );


  /*
     Account links navigate normally.
     Membership remains completely separate.
  */

  $$(
    "a[href='register.html'], a[href='./register.html']"
  ).forEach(
    link => {

      if (
        popup?.contains(link)
      ) {
        return;
      }

      link.addEventListener(
        "click",
        () => {

          closeMenu();

        }
      );

    }
  );


  /* =========================================================
     PRODUCTS
  ========================================================= */

  function productCards() {

    return $$(".product-card");

  }


  function parseImages(card) {

    const box =
      $(
        ".product-image-carousel, .product-image",
        card
      );

    if (!box) {

      return [
        "images/placeholder.jpg"
      ];

    }

    const declared =
      (
        box.dataset.images ||
        ""
      )
        .split("|")
        .map(
          source =>
            source.trim()
        )
        .filter(Boolean);


    const actual =
      $$(
        "img",
        box
      )
        .map(
          img =>
            img.dataset.src ||
            img.getAttribute("src")
        )
        .filter(Boolean);


    const all =
      [
        ...new Set(
          [
            ...declared,
            ...actual
          ]
        )
      ];


    return all.length
      ? all
      : [
          "images/placeholder.jpg"
        ];

  }


  function getProduct(card) {

    if (!card) return null;

    const title =
      $("h3", card)
        ?.textContent
        .trim() ||
      card.dataset.product ||
      "VELO Product";


    const edition =
      $(
        ".product-edition",
        card
      )
        ?.textContent
        .trim() ||
      card.dataset.edition ||
      "";


    const description =
      $(
        ".product-card-info p",
        card
      )
        ?.textContent
        .trim() ||
      "";


    const priceUSD =
      Number(
        card.dataset.priceUsd ??
        card.dataset.price ??
        0
      ) || 0;


    const id =
      card.dataset.product ||
      norm(title)
        .replace(
          /[^a-z0-9]+/g,
          "-"
        );


    return {

      id,

      name:
        title,

      edition:
        edition,

      description:
        description,

      priceUSD:
        priceUSD,

      gender:
        norm(
          card.dataset.gender
        ),

      weather:
        norm(
          card.dataset.weather
        ),

      item:
        norm(
          card.dataset.item ||
          card.dataset.type
        ),

      color:
        norm(
          card.dataset.color
        ),

      keywords:
        norm(
          card.dataset.keywords
        ),

      images:
        parseImages(card),

      card

    };

  }


  function allProducts() {

    return productCards()
      .map(
        getProduct
      )
      .filter(Boolean);

  }


  /* =========================================================
     CARD CAROUSELS
  ========================================================= */

  function renderCard(
    card,
    index
  ) {

    const box =
      $(
        ".product-image-carousel, .product-image",
        card
      );

    const track =
      $(
        "[data-image-track], .product-image-track",
        box
      );

    if (
      !box ||
      !track
    ) {
      return;
    }

    const images =
      parseImages(card);

    if (!images.length) {
      return;
    }

    const safe =
      (
        index %
        images.length +
        images.length
      ) %
      images.length;


    state.cardIndexes.set(
      card,
      safe
    );


    track.style.transform =
      `translate3d(-${safe * 100}%,0,0)`;


    const dots =
      $(
        "[data-image-dots], .card-image-dots",
        box
      );


    if (dots) {

      dots.innerHTML =
        images
          .map(
            (_, i) =>
              `<button
                type="button"
                class="card-image-dot${i === safe ? " active" : ""}"
                data-dot-index="${i}"
                aria-label="View image ${i + 1}">
              </button>`
          )
          .join("");

    }

  }


  function stopCardTimer(card) {

    const timer =
      state.cardTimers.get(
        card
      );

    if (timer) {

      clearInterval(
        timer
      );

    }

    state.cardTimers.delete(
      card
    );

  }


  function startCardTimer(card) {

    stopCardTimer(card);

    const images =
      parseImages(card);

    if (
      images.length <= 1
    ) {
      return;
    }


    const timer =
      setInterval(
        () => {

          renderCard(
            card,
            (
              state.cardIndexes.get(
                card
              ) || 0
            ) + 1
          );

        },
        8000
      );


    state.cardTimers.set(
      card,
      timer
    );

  }


  function initCardCarousel(card) {

    const box =
      $(
        ".product-image-carousel, .product-image",
        card
      );

    const track =
      $(
        "[data-image-track], .product-image-track",
        box
      );

    if (
      !box ||
      !track
    ) {
      return;
    }

    const images =
      parseImages(card);

    const product =
      getProduct(card);

    track.innerHTML =
      images
        .map(
          src =>
            `<div class="product-image-slide">
              <img
                src="${esc(src)}"
                alt="${esc(product?.name || "VELO Product")}"
                loading="lazy">
            </div>`
        )
        .join("");


    $$(
      "img",
      track
    ).forEach(
      img => {

        img.addEventListener(
          "error",
          () => {

            if (
              img.dataset
                .fallbackApplied
            ) {
              return;
            }

            img.dataset
              .fallbackApplied =
              "1";

            img.src =
              "images/placeholder.jpg";

          }
        );

      }
    );


    renderCard(
      card,
      0
    );

    startCardTimer(
      card
    );

  }


  productCards()
    .forEach(
      initCardCarousel
    );

/* =========================================================
   VELO™ MAIN SCRIPT — PART 2
   PRODUCT SYSTEMS + VIEWER + CART
========================================================= */


/* =========================================================
   PRODUCT CARD DISCOVERY
========================================================= */

function getProductCards() {

    return qsa(
        ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
    ).filter(card => {

        return !card.closest(".related-products") &&
               !card.classList.contains("related-product-card");

    });

}


/* =========================================================
   PRODUCT IMAGE EXTRACTION
========================================================= */

function getCardImages(card) {

    const images = [];

    const dataImages =
        card.getAttribute("data-images");

    if (dataImages) {

        dataImages
            .split("|")
            .map(image => image.trim())
            .filter(Boolean)
            .forEach(image => {

                if (!images.includes(image)) {
                    images.push(image);
                }

            });

    }

    qsa("img", card).forEach(img => {

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

    if (!images.length) {

        images.push(
            "images/placeholder.jpg"
        );

    }

    return images;

}


/* =========================================================
   PRODUCT DATA
========================================================= */

function getProductData(card) {

    if (!card) return null;

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
            ".product-category, [data-category], .product-card-info span",
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
                : "Premium VELO product."
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
        title
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                "");

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
   PRODUCT CARD IMAGE CAROUSEL
========================================================= */

const cardCarouselStates =
    new WeakMap();


function createCardImageCarousel(card) {

    if (!card) return;

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

    if (!track) {

        track =
            document.createElement("div");

        track.className =
            "product-image-track";

        const existingImages =
            qsa("img", frame);

        existingImages.forEach(img => {

            const slide =
                document.createElement("div");

            slide.className =
                "product-image-slide";

            slide.appendChild(img);

            track.appendChild(slide);

        });

        frame.innerHTML = "";

        frame.appendChild(track);

    }

    if (
        qsa(
            ".product-image-slide",
            track
        ).length !== images.length
    ) {

        track.innerHTML = "";

        images.forEach(src => {

            const slide =
                document.createElement("div");

            slide.className =
                "product-image-slide";

            const img =
                document.createElement("img");

            img.src = src;

            img.alt =
                getProductData(card).name;

            slide.appendChild(img);

            track.appendChild(slide);

        });

    }

    let dots =
        qs(
            ".card-image-dots, .product-image-dots",
            frame
        );

    if (!dots) {

        dots =
            document.createElement("div");

        dots.className =
            "card-image-dots";

        frame.appendChild(dots);

    }

    dots.innerHTML = "";

    images.forEach((image, index) => {

        const dot =
            document.createElement("button");

        dot.type = "button";

        dot.className =
            "card-image-dot";

        if (index === 0) {

            dot.classList.add("active");

        }

        dot.setAttribute(
            "aria-label",
            `View image ${index + 1}`
        );

        dot.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                setCardImage(
                    card,
                    index,
                    true
                );

            }
        );

        dots.appendChild(dot);

    });

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
            document.createElement("button");

        previous.type = "button";

        previous.className =
            "card-image-prev";

        previous.innerHTML = "‹";

        frame.appendChild(previous);

    }

    if (!next) {

        next =
            document.createElement("button");

        next.type = "button";

        next.className =
            "card-image-next";

        next.innerHTML = "›";

        frame.appendChild(next);

    }

    previous.onclick =
        event => {

            event.preventDefault();

            event.stopPropagation();

            const state =
                cardCarouselStates.get(card) ||
                { index: 0 };

            setCardImage(
                card,
                state.index - 1,
                true
            );

        };

    next.onclick =
        event => {

            event.preventDefault();

            event.stopPropagation();

            const state =
                cardCarouselStates.get(card) ||
                { index: 0 };

            setCardImage(
                card,
                state.index + 1,
                true
            );

        };

    cardCarouselStates.set(
        card,
        {
            index: 0,
            timer: null
        }
    );

    startCardAutoCarousel(card);

}


/* =========================================================
   SET CARD IMAGE
========================================================= */

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

    if (!frame) return;

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

    qsa(
        ".card-image-dot, .product-image-dot",
        frame
    ).forEach(
        (dot, dotIndex) => {

            dot.classList.toggle(
                "active",
                dotIndex === safeIndex
            );

        }
    );

    const state =
        cardCarouselStates.get(card) ||
        {
            index: 0,
            timer: null
        };

    state.index =
        safeIndex;

    cardCarouselStates.set(
        card,
        state
    );

    if (manual) {

        restartCardAutoCarousel(card);

    }

}


/* =========================================================
   CARD AUTO CAROUSEL
========================================================= */

function startCardAutoCarousel(card) {

    const state =
        cardCarouselStates.get(card);

    if (!state) return;

    clearInterval(state.timer);

    const images =
        getCardImages(card);

    if (images.length <= 1) return;

    state.timer =
        setInterval(
            () => {

                setCardImage(
                    card,
                    state.index + 1,
                    false
                );

            },
            8000
        );

}


function restartCardAutoCarousel(card) {

    startCardAutoCarousel(card);

}


/* =========================================================
   INITIALIZE PRODUCT CARDS
========================================================= */

function initializeProductCards() {

    getProductCards().forEach(card => {

        createCardImageCarousel(card);

    });

}


initializeProductCards();


/* =========================================================
   PRODUCT VIEWER
========================================================= */

const productViewer =
    qs(".product-viewer");


let activeProduct = null;

let activeViewerImage = 0;

let viewerTimer = null;


/* =========================================================
   VIEWER ELEMENT HELPERS
========================================================= */

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

    return qs("img", frame);

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


function getViewerPriceElement() {

    return qs(
        "#viewerProductPrice, .viewer-price, .viewer-product-price",
        productViewer || document
    );

}


/* =========================================================
   RENDER PRODUCT VIEWER
========================================================= */

function renderViewerProduct(product) {

    if (!productViewer || !product) return;

    activeProduct =
        product;

    activeViewerImage = 0;

    const image =
        getViewerImageElement();

    const name =
        getViewerNameElement();

    const description =
        getViewerDescriptionElement();

    const category =
        getViewerCategoryElement();

    const price =
        getViewerPriceElement();

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

    if (price) {

        price.textContent =
            formatMoney(
                product.price
            );

    }

    renderViewerImageControls();

    renderRelatedProducts(product);

    updateSaveButton();

    startViewerAutoCarousel();

}


/* =========================================================
   VIEWER IMAGE CONTROLS
========================================================= */

function renderViewerImageControls() {

    if (
        !productViewer ||
        !activeProduct
    ) return;

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
                document.createElement("button");

            previous.type = "button";

            previous.className =
                "viewer-image-prev";

            previous.innerHTML = "‹";

            frame.appendChild(previous);

        }

        if (!next) {

            next =
                document.createElement("button");

            next.type = "button";

            next.className =
                "viewer-image-next";

            next.innerHTML = "›";

            frame.appendChild(next);

        }

        previous.onclick =
            event => {

                event.preventDefault();

                event.stopPropagation();

                changeViewerImage(
                    activeViewerImage - 1,
                    true
                );

            };

        next.onclick =
            event => {

                event.preventDefault();

                event.stopPropagation();

                changeViewerImage(
                    activeViewerImage + 1,
                    true
                );

            };

    } else {

        if (previous) {

            previous.remove();

        }

        if (next) {

            next.remove();

        }

    }

}


/* =========================================================
   CHANGE VIEWER IMAGE
========================================================= */

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

            if (!activeProduct) return;

            image.src =
                images[
                    activeViewerImage
                ];

            image.alt =
                activeProduct.name;

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


/* =========================================================
   VIEWER AUTO CAROUSEL
========================================================= */

function startViewerAutoCarousel() {

    clearInterval(viewerTimer);

    viewerTimer = null;

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

    clearInterval(viewerTimer);

    viewerTimer = null;

}


/* =========================================================
   OPEN PRODUCT VIEWER
========================================================= */

function openProductViewer(card) {

    if (!productViewer || !card) return;

    const product =
        getProductData(card);

    if (!product) return;

    renderViewerProduct(product);

    closeMenu();

    closeNotifications();

    closeFilter();

    productViewer.classList.add("open");

    productViewer.classList.add("active");

    productViewer.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "product-viewer-open"
    );

    lockBody();

    productViewer.scrollTop = 0;

}


/* =========================================================
   CLOSE PRODUCT VIEWER
========================================================= */

function closeProductViewer() {

    if (!productViewer) return;

    stopViewerAutoCarousel();

    productViewer.classList.remove("open");

    productViewer.classList.remove("active");

    productViewer.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "product-viewer-open"
    );

    activeProduct = null;

    unlockBody();

}


/* =========================================================
   PRODUCT VIEWER CLOSE BUTTON
========================================================= */

const viewerBack =
    qs(
        ".viewer-back, .product-viewer-close, [data-close-viewer]"
    );


if (viewerBack) {

    viewerBack.addEventListener(
        "click",
        event => {

            event.preventDefault();

            closeProductViewer();

        }
    );

}


/* =========================================================
   PRODUCT CARD TAP → FULL VIEWER
========================================================= */

document.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
            );

        if (!card) return;

        if (
            card.closest(".related-products") ||
            card.classList.contains(
                "related-product-card"
            )
        ) {

            return;

        }

        /*
           Buttons, links, form controls and
           carousel controls must keep their
           own behaviour.
        */

        if (
            event.target.closest(
                "button, a, input, select, textarea, label"
            )
        ) {

            return;

        }

        /*
           Only open the viewer when the user
           actually taps the product card.
        */

        openProductViewer(card);

    }
);


/* =========================================================
   SAVE FOR LATER
========================================================= */

const viewerSaveButton =
    qs(
        ".save-product-btn, #saveProductBtn, [data-save-product]"
    );


function getSavedProducts() {

    return readStorage(
        VELO_STORAGE.saved,
        []
    );

}


function isProductSaved(productId) {

    return getSavedProducts().some(
        product =>
            product.id === productId
    );

}


function updateSaveButton() {

    if (
        !viewerSaveButton ||
        !activeProduct
    ) return;

    const saved =
        isProductSaved(
            activeProduct.id
        );

    viewerSaveButton.classList.toggle(
        "active",
        saved
    );

    viewerSaveButton.textContent =
        saved
            ? "Saved"
            : "Save for Later";

}


if (viewerSaveButton) {

    viewerSaveButton.addEventListener(
        "click",
        event => {

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

            if (existingIndex >= 0) {

                saved.splice(
                    existingIndex,
                    1
                );

            } else {

                saved.push({
                    id: activeProduct.id,
                    name: activeProduct.name,
                    description: activeProduct.description,
                    price: activeProduct.price,
                    images: activeProduct.images,
                    edition: activeProduct.edition
                });

            }

            writeStorage(
                VELO_STORAGE.saved,
                saved
            );

            updateSaveButton();

            showToast(
                existingIndex >= 0
                    ? "Removed from saved items."
                    : "Saved for later."
            );

        }
    );

}


/* =========================================================
   SHOPPING CART
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
        ) => {

            return total +
                (
                    Number(
                        item.quantity
                    ) || 0
                );

        },
        0
    );

}


function updateCartCount() {

    const quantity =
        getCartQuantity();

    qsa(
        "#cart-count, .cart-count"
    ).forEach(
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
                item.id === product.id
        );

    if (existing) {

        existing.quantity =
            (
                Number(
                    existing.quantity
                ) || 0
            ) + amount;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            description: product.description,

            price: product.price,

            images: product.images,

            edition: product.edition,

            quantity: amount

        });

    }

    saveCart();

    updateCartCount();

    renderCartIfPresent();

    showToast(
        `${product.name} added to cart.`
    );

}


/* =========================================================
   CART ITEM REMOVAL
========================================================= */

function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                item.id !== productId
        );

    saveCart();

    updateCartCount();

    renderCartIfPresent();

}


/* =========================================================
   CART QUANTITY
========================================================= */

function changeCartQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            product =>
                product.id === productId
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
   ADD TO CART FROM VIEWER
========================================================= */

const addToCartButton =
    qs(
        ".add-to-cart-btn, .add-to-cart, #addToCartBtn, [data-add-to-cart]"
    );


if (addToCartButton) {

    addToCartButton.addEventListener(
        "click",
        event => {

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
   END PART 2
========================================================= */

 /* =========================================================
   VELO™ MAIN SCRIPT — PART 3
   CART PANEL + CART ACTIONS + SEARCH
========================================================= */


/* =========================================================
   CART PANEL
========================================================= */

const cartPanel =
    qs(
        "#cart-panel, .cart-panel, [data-cart-panel]"
    );

const cartButton =
    qs(
        "#cart-btn, .cart-btn, [data-cart-button]"
    );


/* =========================================================
   CART RENDER
========================================================= */

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
                <p>
                    Start exploring VELO and add something you love.
                </p>
            </div>
        `;

        updateCartTotals();

        return;

    }


    container.innerHTML =
        cart.map(item => {

            const image =
                item.images &&
                item.images.length
                    ? item.images[0]
                    : "images/placeholder.jpg";


            return `

                <article
                    class="cart-item"
                    data-cart-product-id="${escapeHTML(
                        item.id
                    )}"
                >

                    <div class="cart-item-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(item.name)}"
                        >

                    </div>


                    <div class="cart-item-details">

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>

                        ${
                            item.edition
                                ? `
                                    <small>
                                        ${escapeHTML(
                                            item.edition
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                        ${
                            item.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            item.description
                                        )}
                                    </p>
                                  `
                                : ""
                        }


                        <strong>
                            ${formatMoney(item.price)}
                        </strong>


                        <div class="cart-item-controls">

                            <button
                                type="button"
                                aria-label="Decrease quantity"
                                data-cart-minus="${escapeHTML(
                                    item.id
                                )}"
                            >
                                −
                            </button>


                            <span
                                class="cart-item-quantity"
                            >
                                ${Number(item.quantity) || 1}
                            </span>


                            <button
                                type="button"
                                aria-label="Increase quantity"
                                data-cart-plus="${escapeHTML(
                                    item.id
                                )}"
                            >
                                +
                            </button>


                            <button
                                type="button"
                                class="cart-remove"
                                data-cart-remove="${escapeHTML(
                                    item.id
                                )}"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("");


    updateCartTotals();

}


/* =========================================================
   CART TOTALS
========================================================= */

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
            ) => {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 0;

                return total +
                    (
                        price *
                        quantity
                    );

            },
            0
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(subtotal);

    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(subtotal);

    }

}


/* =========================================================
   CART ITEM CONTROLS
========================================================= */

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

            showToast(
                "Item removed from cart."
            );

            return;

        }

    }
);


/* =========================================================
   CART PANEL OPEN / CLOSE
========================================================= */

function openCartPanel() {

    if (!cartPanel) return;

    closeMenu();

    closeNotifications();

    closeFilter();

    closeLoginPopup();

    renderCartIfPresent();

    cartPanel.classList.add("open");

    cartPanel.classList.add("active");

    cartPanel.style.display =
        "block";

    cartPanel.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeCartPanel() {

    if (!cartPanel) return;

    cartPanel.classList.remove("open");

    cartPanel.classList.remove("active");

    cartPanel.style.display =
        "none";

    cartPanel.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   CART BUTTON
========================================================= */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        function(event) {

            /*
               If there is no cart panel,
               let the normal cart.html link work.
            */

            if (!cartPanel) {

                return;

            }

            event.preventDefault();

            event.stopPropagation();

            if (
                cartPanel.classList.contains("open") ||
                cartPanel.classList.contains("active")
            ) {

                closeCartPanel();

            } else {

                openCartPanel();

            }

        }
    );

}


/* =========================================================
   CART CLOSE BUTTON
========================================================= */

const cartClose =
    qs(
        "#cart-close, .cart-close, [data-close-cart]"
    );


if (cartClose) {

    cartClose.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            closeCartPanel();

        }
    );

}


/* =========================================================
   CART OVERLAY
========================================================= */

const cartOverlay =
    qs(
        "#cart-overlay, .cart-overlay, [data-cart-overlay]"
    );


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        function() {

            closeCartPanel();

        }
    );

}


/* =========================================================
   PRODUCT CARD QUICK ACTIONS
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

            event.stopPropagation();


            const card =
                addButton.closest(
                    ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
                );


            if (!card) return;


            const product =
                getProductData(card);


            if (!product) return;


            const quantity =
                Number(
                    addButton.dataset.quantity
                ) || 1;


            addToCart(
                product,
                quantity
            );


            return;

        }


        const saveCardButton =
            event.target.closest(
                "[data-product-save]"
            );


        if (saveCardButton) {

            event.preventDefault();

            event.stopPropagation();


            const card =
                saveCardButton.closest(
                    ".product-card, .item-card, .shop-card, .drop-card, [data-product]"
                );


            if (!card) return;


            const product =
                getProductData(card);


            if (!product) return;


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

                showToast(
                    "Removed from saved items."
                );

            } else {

                saved.push({

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
                        product.edition

                });


                showToast(
                    "Saved for later."
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
   SEARCH SYSTEM
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


/* =========================================================
   PRODUCT SEARCH TEXT
========================================================= */

function productSearchText(product) {

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


/* =========================================================
   ALL PRODUCT DATA
========================================================= */

function getAllProductData() {

    return getProductCards()
        .map(
            card =>
                getProductData(card)
        )
        .filter(Boolean);

}


/* =========================================================
   SEARCH SUGGESTIONS
========================================================= */

function showSearchSuggestions(value) {

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

        searchSuggestions.innerHTML =
            "";

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
                    ).includes(search)
            )
            .slice(
                0,
                8
            );


    if (!matches.length) {

        searchSuggestions.innerHTML = `

            <div class="search-suggestion no-result">

                <strong>
                    No exact match
                </strong>

                <small>
                    Try another term
                </small>

            </div>

        `;

    } else {

        searchSuggestions.innerHTML =
            matches.map(product => `

                <button
                    type="button"
                    class="search-suggestion"
                    data-search-product-id="${escapeHTML(
                        product.id
                    )}"
                >

                    <strong>
                        ${escapeHTML(
                            product.name
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            product.edition ||
                            product.category ||
                            ""
                        )}
                    </small>

                </button>

            `).join("");

    }


    searchSuggestions.classList.add(
        "active"
    );

    searchSuggestions.classList.add(
        "open"
    );

}


/* =========================================================
   SEARCH INPUT
========================================================= */

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

            if (
                this.value.trim()
            ) {

                showSearchSuggestions(
                    this.value
                );

            }

        }
    );


    searchInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

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

        }
    );

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

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


            if (!card) return;


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
    );

}


/* =========================================================
   SEARCH OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !searchSuggestions
        ) return;


        const searchArea =
            event.target.closest(
                ".search-container, .search-section, .search-wrapper"
            );


        if (!searchArea) {

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
   END PART 3
========================================================= */

   /* ---------------- FILTERS ---------------- */
  const filterPanel = $("#filterPanel");
  const filterButton = $("#filterButton");
  const filterClose = $("#filterCloseButton");
  const clearFilters = $("#clearFiltersButton");
  const applyFiltersButton = $("#applyFiltersButton");
  const emptyState = $("#productEmpty");
  const resultCount = $("#productResultCount");
  const currencyLabel = $("#currencyLabel");
  const currencySelect = $("#currencyFilter");
  const currencyChange = $("#changeCurrencyButton");

  function openFilter() {
    if (!filterPanel) return;

    filterPanel.hidden = false;
    filterPanel.classList.add("open", "active");
    filterPanel.setAttribute("aria-hidden", "false");
    filterButton?.setAttribute("aria-expanded", "true");
  }

  function closeFilter() {
    if (!filterPanel) return;

    filterPanel.classList.remove("open", "active");
    filterPanel.hidden = true;
    filterPanel.setAttribute("aria-hidden", "true");
    filterButton?.setAttribute("aria-expanded", "false");

    unlockBody();
  }

  filterButton?.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();

    if (filterPanel?.hidden) {
      openFilter();
    } else {
      closeFilter();
    }
  });

  filterClose?.addEventListener("click", e => {
    e.preventDefault();
    closeFilter();
  });

  function readCheckboxes() {
    const names = [
      "edition",
      "gender",
      "weather",
      "item",
      "color"
    ];

    names.forEach(name => {
      state.filters[name + "s"] =
        new Set(
          $$(`#filterPanel input[name="${name}"]:checked`)
            .map(input => norm(input.value))
        );
    });

    const min =
      usdFromDisplayed(
        $("#priceMin")?.value
      );

    const max =
      usdFromDisplayed(
        $("#priceMax")?.value
      );

    state.filters.minUSD =
      min === null
        ? 0
        : Math.max(0, min);

    state.filters.maxUSD =
      max === null
        ? 250000
        : Math.min(250000, max);
  }

  function checkboxMatches(value, selected) {
    if (!selected.size) return true;

    const normalized =
      norm(value);

    const parts =
      normalized
        .split(/\s+/)
        .filter(Boolean);

    return [...selected].some(
      choice =>
        parts.includes(choice) ||
        normalized.includes(choice)
    );
  }

  function applyFilters() {
    readCheckboxes();

    const query =
      norm(
        searchInput?.value
      );

    let visible = 0;

    productCards().forEach(card => {

      const product =
        getProduct(card);

      if (!product) return;

      let matches = true;

      if (
        query &&
        !searchText(product).includes(query)
      ) {
        matches = false;
      }

      if (
        matches &&
        !checkboxMatches(
          product.edition,
          state.filters.editions
        )
      ) {
        matches = false;
      }

      if (
        matches &&
        !checkboxMatches(
          product.gender,
          state.filters.genders
        )
      ) {
        matches = false;
      }

      if (
        matches &&
        !checkboxMatches(
          product.weather,
          state.filters.weather
        )
      ) {
        matches = false;
      }

      if (
        matches &&
        !checkboxMatches(
          product.item,
          state.filters.items
        )
      ) {
        matches = false;
      }

      if (
        matches &&
        !checkboxMatches(
          product.color,
          state.filters.colors
        )
      ) {
        matches = false;
      }

      if (
        matches &&
        product.priceUSD <
        state.filters.minUSD
      ) {
        matches = false;
      }

      if (
        matches &&
        product.priceUSD >
        state.filters.maxUSD
      ) {
        matches = false;
      }

      card.hidden =
        !matches;

      card.style.display =
        matches
          ? ""
          : "none";

      if (matches) {
        visible++;
      }

    });

    if (emptyState) {
      emptyState.hidden =
        visible !== 0;
    }

    if (resultCount) {
      resultCount.textContent =
        `${visible} product${visible === 1 ? "" : "s"}`;
    }

    updateFilterUI();
  }

  function updateFilterUI() {

    const active =
      Object.values(
        state.filters
      ).some(
        value =>
          value instanceof Set
            ? value.size > 0
            : false
      );

    filterButton?.classList.toggle(
      "active",
      !!active
    );

    $$("[data-quick-filter]")
      .forEach(chip => {

        const [
          type,
          valueRaw
        ] =
          (
            chip.dataset.quickFilter ||
            ""
          ).split(":");

        chip.classList.toggle(
          "active",
          type === "gender" &&
          state.filters.genders.has(
            norm(valueRaw)
          )
        );

      });

    if (currencyLabel) {
      currencyLabel.textContent =
        state.currency;
    }

    if (currencySelect) {
      currencySelect.value =
        state.currency;
    }
  }

  $$("#filterPanel input[type='checkbox']")
    .forEach(
      input =>
        input.addEventListener(
          "change",
          applyFilters
        )
    );

  $$("#priceMin, #priceMax")
    .forEach(
      input =>
        input.addEventListener(
          "input",
          applyFilters
        )
    );

  applyFiltersButton?.addEventListener(
    "click",
    e => {
      e.preventDefault();

      applyFilters();
      closeFilter();
    }
  );

  clearFilters?.addEventListener(
    "click",
    e => {

      e.preventDefault();

      $$("#filterPanel input[type='checkbox']")
        .forEach(
          input =>
            input.checked = false
        );

      const min =
        $("#priceMin");

      const max =
        $("#priceMax");

      if (min) {
        min.value = 0;
      }

      if (max) {
        max.value = 250000;
      }

      if (searchInput) {
        searchInput.value = "";
      }

      state.filters.editions.clear();
      state.filters.genders.clear();
      state.filters.weather.clear();
      state.filters.items.clear();
      state.filters.colors.clear();

      applyFilters();

    }
  );

  $("#emptyStateClearFilters")
    ?.addEventListener(
      "click",
      () =>
        clearFilters?.click()
    );

  currencyChange?.addEventListener(
    "click",
    e => {

      e.preventDefault();

      currencySelect?.focus();

    }
  );

  currencySelect?.addEventListener(
    "change",
    () => {

      const previousCurrency =
        state.currency;

      const nextCurrency =
        currencySelect.value === "NGN"
          ? "NGN"
          : "USD";

      const previousRate =
        rates[previousCurrency] || 1;

      const nextRate =
        rates[nextCurrency] || 1;

      const min =
        $("#priceMin");

      const max =
        $("#priceMax");

      const minUSD =
        (Number(min?.value) || 0) /
        previousRate;

      const maxUSD =
        (Number(max?.value) || 250000 * previousRate) /
        previousRate;

      state.currency =
        nextCurrency;

      localStorage.setItem(
        STORAGE.currency,
        state.currency
      );

      if (min) {
        min.value =
          Math.round(
            minUSD * nextRate
          );
      }

      if (max) {
        max.value =
          Math.round(
            maxUSD * nextRate
          );
      }

      applyFilters();
      renderCartIfPresent();

      if (
        state.activeProduct &&
        viewerPrice
      ) {
        viewerPrice.textContent =
          money(
            state.activeProduct.priceUSD
          );
      }

    }
  );

   /* ---------------- CURRENCY HELPERS ---------------- */

  function usdFromDisplayed(value) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    const numeric =
      Number(
        String(value)
          .replace(/,/g, "")
          .replace(/[₦$£€]/g, "")
          .trim()
      );

    if (!Number.isFinite(numeric)) {
      return null;
    }

    const rate =
      rates[state.currency] || 1;

    return numeric / rate;
  }


  function displayedFromUSD(
    usd
  ) {

    const rate =
      rates[state.currency] || 1;

    return (
      Number(usd) || 0
    ) * rate;

  }


  function money(
    usd
  ) {

    const amount =
      displayedFromUSD(
        usd
      );

    const symbol =
      state.currency === "NGN"
        ? "₦"
        : "$";

    return (
      symbol +
      amount.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      )
    );

  }


  /* ---------------- QUICK FILTERS ---------------- */

  $$("[data-quick-filter]")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            const raw =
              button.dataset.quickFilter ||
              "";

            const separator =
              raw.indexOf(":");

            if (separator === -1) {
              return;
            }

            const type =
              norm(
                raw.slice(
                  0,
                  separator
                )
              );

            const value =
              norm(
                raw.slice(
                  separator + 1
                )
              );

            if (!value) {
              return;
            }

            if (
              type === "gender"
            ) {

              if (
                state.filters.genders.has(
                  value
                )
              ) {

                state.filters.genders.delete(
                  value
                );

              } else {

                state.filters.genders.clear();

                state.filters.genders.add(
                  value
                );

              }

            }

            applyFilters();

          }
        );

      }
    );


  /* ---------------- SEARCH ---------------- */

  function searchText(
    product
  ) {

    if (!product) {
      return "";
    }

    return norm(
      [
        product.name,
        product.description,
        product.category,
        product.edition,
        product.gender,
        product.weather,
        product.item,
        product.color,
        product.type
      ].join(" ")
    );

  }


  function showSearchSuggestions(
    value
  ) {

    if (!searchSuggestions) {
      return;
    }

    const query =
      norm(value);

    if (!query) {

      searchSuggestions.innerHTML =
        "";

      searchSuggestions.classList.remove(
        "open",
        "active"
      );

      searchSuggestions.hidden =
        true;

      return;

    }

    const matches =
      productCards()
        .map(
          card =>
            getProduct(card)
        )
        .filter(Boolean)
        .filter(
          product =>
            searchText(product)
              .includes(query)
        )
        .slice(
          0,
          8
        );

    if (!matches.length) {

      searchSuggestions.innerHTML = `
        <div class="search-empty">
          <strong>No exact match</strong>
          <span>Try another product, edition or category.</span>
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
                <span class="search-suggestion-name">
                  ${escapeHTML(product.name)}
                </span>

                <small>
                  ${escapeHTML(
                    product.edition ||
                    product.category ||
                    "VELO"
                  )}
                </small>
              </button>
            `
          )
          .join("");

    }

    searchSuggestions.hidden =
      false;

    searchSuggestions.classList.add(
      "open",
      "active"
    );

  }


  searchInput?.addEventListener(
    "input",
    function() {

      showSearchSuggestions(
        this.value
      );

      applyFilters();

    }
  );


  searchInput?.addEventListener(
    "focus",
    function() {

      if (
        this.value.trim()
      ) {

        showSearchSuggestions(
          this.value
        );

      }

    }
  );


  searchInput?.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        applyFilters();

        searchSuggestions?.classList.remove(
          "open",
          "active"
        );

        if (searchSuggestions) {
          searchSuggestions.hidden =
            true;
        }

      }

      if (
        event.key === "Escape"
      ) {

        this.value =
          "";

        applyFilters();

        searchSuggestions?.classList.remove(
          "open",
          "active"
        );

        if (searchSuggestions) {
          searchSuggestions.hidden =
            true;
        }

      }

    }
  );


  searchButton?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      applyFilters();

      searchSuggestions?.classList.remove(
        "open",
        "active"
      );

      if (searchSuggestions) {
        searchSuggestions.hidden =
          true;
      }

    }
  );


  searchSuggestions?.addEventListener(
    "click",
    event => {

      const suggestion =
        event.target.closest(
          "[data-search-product-id]"
        );

      if (!suggestion) {
        return;
      }

      event.preventDefault();

      const id =
        suggestion.dataset
          .searchProductId;

      const card =
        productCards()
          .find(
            productCard =>
              getProduct(
                productCard
              )?.id === id
          );

      if (!card) {
        return;
      }

      const product =
        getProduct(card);

      if (searchInput) {
        searchInput.value =
          product.name;
      }

      searchSuggestions.classList.remove(
        "open",
        "active"
      );

      searchSuggestions.hidden =
        true;

      openProductViewer(
        product
      );

    }
  );


  /* ---------------- CLOSE SEARCH ---------------- */

  document.addEventListener(
    "click",
    event => {

      if (!searchSuggestions) {
        return;
      }

      const insideSearch =
        event.target.closest(
          ".search-container, .search-section, .search-wrapper"
        );

      if (!insideSearch) {

        searchSuggestions.classList.remove(
          "open",
          "active"
        );

        searchSuggestions.hidden =
          true;

      }

    }
  );


  /* ---------------- CART STATE ---------------- */

  function cartQuantity() {

    return state.cart.reduce(
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


  function saveCart() {

    writeStorage(
      STORAGE.cart,
      state.cart
    );

  }


  function updateCartCount() {

    const quantity =
      cartQuantity();

    $$("#cartCount, #cart-count, .cart-count")
      .forEach(
        element => {

          element.textContent =
            quantity;

          element.hidden =
            quantity === 0;

        }
      );

  }


  function findCartItem(
    productId
  ) {

    return state.cart.find(
      item =>
        item.id === productId
    );

  }


  function addToCart(
    product,
    quantity = 1
  ) {

    if (!product) {
      return;
    }

    const amount =
      Math.max(
        1,
        Number(quantity) || 1
      );

    const existing =
      findCartItem(
        product.id
      );

    if (existing) {

      existing.quantity =
        (
          Number(
            existing.quantity
          ) || 0
        ) +
        amount;

    } else {

      state.cart.push({

        id:
          product.id,

        name:
          product.name,

        description:
          product.description,

        category:
          product.category,

        edition:
          product.edition,

        priceUSD:
          product.priceUSD,

        images:
          product.images.slice(),

        quantity:
          amount

      });

    }

    saveCart();

    updateCartCount();

    renderCart();

    showToast(
      `${product.name} added to cart.`
    );

  }


  function removeFromCart(
    productId
  ) {

    state.cart =
      state.cart.filter(
        item =>
          item.id !==
          productId
      );

    saveCart();

    updateCartCount();

    renderCart();

  }


  function changeCartQuantity(
    productId,
    delta
  ) {

    const item =
      findCartItem(
        productId
      );

    if (!item) {
      return;
    }

    item.quantity =
      Math.max(
        1,
        (
          Number(
            item.quantity
          ) || 1
        ) +
        Number(delta || 0)
      );

    saveCart();

    updateCartCount();

    renderCart();

  }


  function cartSubtotalUSD() {

    return state.cart.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          (
            Number(
              item.priceUSD
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

  }


  /* ---------------- CART RENDER ---------------- */

  function renderCart() {

    if (!cartItemsContainer) {
      return;
    }

    if (!state.cart.length) {

      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <h3>Your cart is empty.</h3>
          <p>Explore VELO and find something worth moving for.</p>
        </div>
      `;

      updateCartTotals();

      return;

    }

    cartItemsContainer.innerHTML =
      state.cart
        .map(
          item => `

            <article
              class="cart-item"
              data-cart-product-id="${escapeHTML(item.id)}"
            >

              <div class="cart-item-image">
                <img
                  src="${escapeHTML(
                    item.images?.[0] ||
                    "images/placeholder.jpg"
                  )}"
                  alt="${escapeHTML(item.name)}"
                >
              </div>

              <div class="cart-item-details">

                <h3>
                  ${escapeHTML(item.name)}
                </h3>

                <p>
                  ${escapeHTML(
                    item.description || ""
                  )}
                </p>

                <strong>
                  ${money(item.priceUSD)}
                </strong>

                <div class="cart-item-controls">

                  <button
                    type="button"
                    data-cart-minus="${escapeHTML(item.id)}"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>
                    ${item.quantity}
                  </span>

                  <button
                    type="button"
                    data-cart-plus="${escapeHTML(item.id)}"
                    aria-label="Increase quantity"
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
        )
        .join("");

    updateCartTotals();

  }


  function updateCartTotals() {

    const subtotal =
      cartSubtotalUSD();

    const formatted =
      money(subtotal);

    $$("#cartSubtotal, #cart-subtotal, .cart-subtotal")
      .forEach(
        element =>
          element.textContent =
            formatted
      );

    $$("#cartTotal, #cart-total, .cart-total")
      .forEach(
        element =>
          element.textContent =
            formatted
      );

  }


  /* ---------------- CART BUTTONS ---------------- */

  document.addEventListener(
    "click",
    event => {

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


  /* ---------------- CART PANEL ---------------- */

  function openCart() {

    if (!cartPanel) {
      return;
    }

    closeMenu();
    closeFilter();
    closeNotifications();

    renderCart();

    cartPanel.hidden =
      false;

    cartPanel.classList.add(
      "open",
      "active"
    );

    cartPanel.setAttribute(
      "aria-hidden",
      "false"
    );

    cartButton?.setAttribute(
      "aria-expanded",
      "true"
    );

    lockBody();

  }


  function closeCart() {

    if (!cartPanel) {
      return;
    }

    cartPanel.classList.remove(
      "open",
      "active"
    );

    cartPanel.hidden =
      true;

    cartPanel.setAttribute(
      "aria-hidden",
      "true"
    );

    cartButton?.setAttribute(
      "aria-expanded",
      "false"
    );

    unlockBody();

  }


  cartButton?.addEventListener(
    "click",
    event => {

      if (!cartPanel) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (
        cartPanel.hidden
      ) {

        openCart();

      } else {

        closeCart();

      }

    }
  );


  $("#cartClose, #closeCart, [data-close-cart]")
    ?.addEventListener(
      "click",
      event => {

        event.preventDefault();

        closeCart();

      }
    );
