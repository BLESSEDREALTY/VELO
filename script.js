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

