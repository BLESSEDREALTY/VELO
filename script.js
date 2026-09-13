/* VELO™ — FINAL HOMEPAGE SCRIPT */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = {
    cart: 'velo_cart', saved: 'velo_saved', account: 'velo_account',
    loggedIn: 'velo_logged_in', notifications: 'velo_notifications', currency: 'velo_currency'
  };
  const RATE = { USD: 1, NGN: 1500 };
  const SYMBOL = { USD: '$', NGN: '₦' };
  const state = {
    currency: localStorage.getItem(S.currency) || 'USD',
    query: '', active: null, image: 0, viewerTimer: null, relatedTimer: null,
    relatedIndex: 0, cardTimers: new WeakMap(), cardIndexes: new WeakMap(), focus: null
  };

  const read = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  const norm = v => String(v ?? '').trim().toLowerCase();

  const esc = v => {
    const d = document.createElement('div');
    d.textContent = String(v ?? '');
    return d.innerHTML;
  };

  const money = usd => {
    const v = (Number(usd) || 0) * (RATE[state.currency] || 1);
    return `${SYMBOL[state.currency] || '$'}${v.toLocaleString(undefined, {
      minimumFractionDigits: v % 1 ? 2 : 0,
      maximumFractionDigits: 2
    })}`;
  };

  const usdFromDisplay = v =>
    Number(v) / (RATE[state.currency] || 1);

  function lock() {
    document.body.classList.add('velo-scroll-lock');
  }

  function unlock() {
    const ids = ['sidebar', 'filterPanel', 'productViewer', 'veloEntryPopup'];

    if (!ids.some(id => {
      const e = $('#' + id);
      return e && !e.hidden &&
        (e.classList.contains('open') || e.classList.contains('active'));
    })) {
      document.body.classList.remove('velo-scroll-lock');
    }
  }

  function show(e) {
    if (e) {
      e.hidden = false;
      e.setAttribute('aria-hidden', 'false');
    }
  }

  function hide(e) {
    if (e) {
      e.hidden = true;
      e.setAttribute('aria-hidden', 'true');
    }
  }

  /* =========================
     MENU
  ========================= */

  const sidebar = $('#sidebar');
  const overlay = $('#overlay');
  const menuButton = $('#menuButton');

  function openMenu() {
    if (!sidebar) return;

    show(sidebar);
    sidebar.classList.add('open', 'active');

    if (overlay) {
      show(overlay);
      overlay.classList.add('open', 'active');
    }

    menuButton?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    lock();
  }

  function closeMenu() {
    sidebar?.classList.remove('open', 'active');
    hide(sidebar);

    overlay?.classList.remove('open', 'active');
    hide(overlay);

    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    unlock();
  }

  window.openMenu = openMenu;
  window.closeMenu = closeMenu;

  menuButton?.addEventListener('click', e => {
    e.preventDefault();
    openMenu();
  });

  $('#sidebar .close-btn')?.addEventListener('click', e => {
    e.preventDefault();
    closeMenu();
  });

  overlay?.addEventListener('click', closeMenu);

  $$('#sidebar a').forEach(a =>
    a.addEventListener('click', closeMenu)
  );

  /* =========================
     ACCOUNT POPUP
  ========================= */

  const popup = $('#veloEntryPopup');
  const popupClose = $('#veloPopupClose');
  const popupContinue = $('#veloPopupContinue');

  const hasAccount = () => {
    const a = read(S.account, null);
    return !!a && typeof a === 'object';
  };

  const loggedIn = () =>
    localStorage.getItem(S.loggedIn) === 'true';

  function openLoginPopup() {
    if (!popup) return;

    state.focus = document.activeElement;

    closeMenu();
    closeFilter();

    show(popup);
    popup.classList.add('open', 'active');

    document.body.classList.add('popup-open');
    lock();

    setTimeout(() => popupClose?.focus(), 30);
  }

  function closeLoginPopup() {
    if (!popup) return;

    popup.classList.remove('open', 'active');
    hide(popup);

    document.body.classList.remove('popup-open');
    unlock();

    state.focus?.focus?.();
    state.focus = null;
  }

  function maybeShowAccountPopup() {
    if (!hasAccount() || !loggedIn()) {
      setTimeout(() => {
        if (!hasAccount() || !loggedIn()) {
          openLoginPopup();
        }
      }, 700);
    }
  }

  popupClose?.addEventListener('click', e => {
    e.preventDefault();
    closeLoginPopup();
  });

  popupContinue?.addEventListener('click', e => {
    e.preventDefault();
    closeLoginPopup();
  });

  popup?.addEventListener('click', e => {
    if (e.target === popup) closeLoginPopup();
  });

  function setWebsiteAccount(account) {
    if (!account) {
      localStorage.removeItem(S.account);
      localStorage.setItem(S.loggedIn, 'false');
      return;
    }

    write(S.account, account);
    localStorage.setItem(S.loggedIn, 'true');
    closeLoginPopup();
  }

  function logoutWebsiteAccount() {
    localStorage.setItem(S.loggedIn, 'false');
    openLoginPopup();
  }

  function clearWebsiteAccount() {
    localStorage.removeItem(S.account);
    localStorage.setItem(S.loggedIn, 'false');
    openLoginPopup();
  }

  window.openLoginPopup = openLoginPopup;

  /* =========================
     NOTIFICATIONS
  ========================= */

  function updateNotificationCount() {
    const badges = $$('.notification-count');
    const list = read(S.notifications, []);

    const n = Array.isArray(list)
      ? list.filter(x => !x.read).length
      : 0;

    badges.forEach(b => {
      b.textContent = n > 99 ? '99+' : n ? String(n) : '';
      b.style.display = n ? 'flex' : 'none';
    });
  }

  function addNotification(n = {}) {
    const list = read(S.notifications, []);

    list.unshift({
      id: n.id || String(Date.now()),
      title: n.title || 'VELO',
      message: n.message || '',
      read: false,
      createdAt: n.createdAt || new Date().toISOString()
    });

    write(S.notifications, list);
    updateNotificationCount();
  }

  function markNotificationsRead() {
    const list = read(S.notifications, []);

    if (!Array.isArray(list)) return;

    list.forEach(n => n.read = true);
    write(S.notifications, list);
    updateNotificationCount();
  }

  updateNotificationCount();

  /* =========================
     PRODUCTS
  ========================= */

  const cards = () => $$('.product-card');

  function images(card) {
    const box = $('.product-image-carousel,.product-image', card);

    const fromData = (box?.dataset.images || '')
      .split('|')
      .map(s => s.trim())
      .filter(Boolean);

    const fromImg = $$('img', box || card)
      .map(i => i.dataset.src || i.getAttribute('src'))
      .filter(Boolean);

    return [...new Set([
      ...fromData,
      ...fromImg
    ])].filter(Boolean);
  }

  function product(card) {
    if (!card) return null;

    const name =
      $('h3,h2', card)?.textContent.trim() ||
      card.dataset.product ||
      'VELO Product';

    const edition =
      $('.product-edition', card)?.textContent.trim() ||
      card.dataset.edition ||
      '';

    const description =
      $('.product-card-info p', card)?.textContent.trim() ||
      '';

    const price =
      Number(
        card.dataset.priceUsd ??
        card.dataset.price ??
        0
      ) || 0;

    const id =
      card.dataset.product ||
      norm(name)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    return {
      id,
      name,
      edition,
      description:card.dataset.fullDescription || card.dataset.description || ''
      price,
      priceUSD: price,
      gender: norm(card.dataset.gender),
      weather: norm(card.dataset.weather),
      item: norm(card.dataset.item || card.dataset.type),
      color: norm(card.dataset.color),
      keywords: norm(card.dataset.keywords),
      images: images(card),
      card
    };
  }

  const allProducts = () =>
    cards().map(product).filter(Boolean);

  function compatible(value, selected) {
    if (!selected.size) return true;

    const hay = norm(value);

    return [...selected].some(x =>
      hay.split(/\s+/).includes(x) ||
      hay.includes(x)
    );
  }

  /* =========================
     CARD IMAGE CAROUSELS
  ========================= */

  function renderCard(card, index) {
    const frame =
      $('.product-image-carousel,.product-image', card);

    const track =
      $('.product-image-track', frame);

    if (!frame || !track) return;

    const imgs = images(card);

    if (!imgs.length) return;

    const i =
      ((index % imgs.length) + imgs.length) %
      imgs.length;

    state.cardIndexes.set(card, i);

    track.style.transform =
      `translate3d(-${i * 100}%,0,0)`;

    $$('.card-image-dot,.product-image-dot', frame)
      .forEach((d, n) =>
        d.classList.toggle('active', n === i)
      );
  }

  function stopCard(card) {
    const t = state.cardTimers.get(card);

    if (t) clearInterval(t);

    state.cardTimers.delete(card);
  }

  function startCard(card) {
    stopCard(card);

    const imgs = images(card);

    if (imgs.length < 2) return;

    state.cardTimers.set(
      card,
      setInterval(() => {
        renderCard(
          card,
          (state.cardIndexes.get(card) || 0) + 1
        );
      }, 8000)
    );
  }

  function initCard(card) {
    const frame =
      $('.product-image-carousel,.product-image', card);

    const track =
      $('.product-image-track', frame);

    if (!frame || !track) return;

    const imgs = images(card);

    if (!imgs.length) return;

    track.innerHTML = imgs.map(src =>
      `<div class="product-image-slide">
        <img
          src="${esc(src)}"
          alt="${esc(product(card)?.name || 'VELO Product')}"
          loading="lazy">
      </div>`
    ).join('');

    $$('img', track).forEach(img => {
      img.addEventListener('error', () => {
        if (!img.dataset.fallback) {
          img.dataset.fallback = '1';
          img.src = 'images/placeholder.jpg';
        }
      });
    });

    const dots =
      $('[data-image-dots],.card-image-dots', frame);

    if (dots) {
      dots.innerHTML = imgs.map((_, i) =>
        `<button
          type="button"
          class="card-image-dot${i === 0 ? ' active' : ''}"
          data-dot-index="${i}"
          aria-label="View image ${i + 1}">
        </button>`
      ).join('');
    }

    $$('.card-image-prev,.card-image-next', frame)
      .forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();

          const i =
            state.cardIndexes.get(card) || 0;

          renderCard(
            card,
            i +
              (
                btn.classList.contains('card-image-next')
                  ? 1
                  : -1
              )
          );

          startCard(card);
        });
      });

    $$('.card-image-dot', frame)
      .forEach(dot => {
        dot.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();

          renderCard(
            card,
            Number(dot.dataset.dotIndex)
          );

          startCard(card);
        });
      });

    renderCard(card, 0);
    startCard(card);
  }

  cards().forEach(initCard);

  /* =========================
     PRODUCT VIEWER
  ========================= */

  const viewer = $('#productViewer');
  const viewerImage = $('#viewerMainImage');
  const viewerName = $('#viewerProductName');
  const viewerDesc = $('#viewerDescription');
  const viewerEdition = $('#viewerEdition');
  const viewerPrice = $('#viewerPrice');
  const viewerDots = $('#viewerDots');
  const relatedTrack = $('#relatedProductsTrack');

  function stopViewer() {
    clearInterval(state.viewerTimer);
    clearInterval(state.relatedTimer);

    state.viewerTimer = null;
    state.relatedTimer = null;
  }

  function changeViewerImage(index, manual = false) {
    if (!state.active) return;

    const imgs = state.active.images;

    if (!imgs.length || !viewerImage) return;

    state.image =
      ((index % imgs.length) + imgs.length) %
      imgs.length;

    viewerImage.src = imgs[state.image];
    viewerImage.alt = state.active.name;

    if (viewerDots) {
      $$('.viewer-dot', viewerDots)
        .forEach((dot, i) =>
          dot.classList.toggle(
            'active',
            i === state.image
          )
        );
    }

    if (manual) startViewer();
  }

  function renderViewerDots() {
    if (!viewerDots || !state.active) return;

    viewerDots.innerHTML =
      state.active.images.map((_, i) =>
        `<button
          type="button"
          class="viewer-dot${i === 0 ? ' active' : ''}"
          data-viewer-index="${i}"
          aria-label="View image ${i + 1}">
        </button>`
      ).join('');
  }

  function renderRelatedProducts() {
    if (!relatedTrack || !state.active) return;

    const related = allProducts()
      .filter(p => p.id !== state.active.id)
      .slice(0, 6);

    relatedTrack.innerHTML = related.map(p =>
      `<button
        type="button"
        class="related-product-card"
        data-related-id="${esc(p.id)}">
        <img
          src="${esc(p.images[0] || 'images/placeholder.jpg')}"
          alt="${esc(p.name)}"
          loading="lazy">
        <span>${esc(p.name)}</span>
        <small>${esc(p.edition)}</small>
      </button>`
    ).join('');

    state.relatedIndex = 0;
  }

  function startRelated() {
    clearInterval(state.relatedTimer);

    if (!relatedTrack) return;

    const items =
      $$('.related-product-card', relatedTrack);

    if (items.length <= 1) return;

    state.relatedTimer =
      setInterval(() => {
        state.relatedIndex =
          (state.relatedIndex + 1) %
          items.length;

        items[state.relatedIndex]
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
      }, 5000);
  }

  function startViewer() {
    clearInterval(state.viewerTimer);

    if (
      !state.active ||
      state.active.images.length <= 1
    ) {
      return;
    }

    state.viewerTimer =
      setInterval(() => {
        changeViewerImage(
          state.image + 1
        );
      }, 8000);
  }

  function renderViewer(p) {
    if (!viewer || !p) return;

    state.active = p;
    state.image = 0;

    if (viewerImage) {
      viewerImage.src =
        p.images[0] ||
        'images/placeholder.jpg';

      viewerImage.alt = p.name;
    }

    if (viewerName)
      viewerName.textContent = p.name;

    if (viewerDesc)
      viewerDesc.textContent =
        p.description;

    if (viewerEdition)
      viewerEdition.textContent =
        p.edition;

    if (viewerPrice)
      viewerPrice.textContent =
        money(p.priceUSD);

    renderViewerDots();
    renderRelatedProducts();
    startViewer();
    startRelated();
  }

  function openProductViewer(card) {
    if (!viewer) return;

    const p =
      card?.card
        ? card
        : product(card);

    if (!p) return;

    renderViewer(p);
    closeMenu();
    closeFilter();

    show(viewer);
    viewer.classList.add('open', 'active');

    viewer.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'product-viewer-open'
    );

    lock();

    viewer.scrollTop = 0;
  }

  function closeProductViewer() {
    if (!viewer) return;

    stopViewer();

    viewer.classList.remove(
      'open',
      'active'
    );

    hide(viewer);

    document.body.classList.remove(
      'product-viewer-open'
    );

    unlock();

    state.active = null;
  }

  $('#viewerClose')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      closeProductViewer();
    }
  );

  $('#viewerImagePrev')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      e.stopPropagation();
      changeViewerImage(
        state.image - 1,
        true
      );
    }
  );

  $('#viewerImageNext')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      e.stopPropagation();
      changeViewerImage(
        state.image + 1,
        true
      );
    }
  );

  viewerDots?.addEventListener(
    'click',
    e => {
      const dot =
        e.target.closest('[data-viewer-index]');

      if (!dot) return;

      changeViewerImage(
        Number(dot.dataset.viewerIndex),
        true
      );
    }
  );

  relatedTrack?.addEventListener(
    'click',
    e => {
      const item =
        e.target.closest('[data-related-id]');

      if (!item) return;

      const p =
        allProducts().find(
          x => x.id === item.dataset.relatedId
        );

      if (p) renderViewer(p);
    }
  );

  document.addEventListener(
    'error',
    e => {
      const img = e.target;

      if (
        img instanceof HTMLImageElement &&
        !img.dataset.fallback
      ) {
        img.dataset.fallback = '1';
        img.src =
          'images/placeholder.jpg';
      }
    },
    true
  );

  /* =========================
     SAVE FOR LATER
  ========================= */

  function savedList() {
    const list = read(S.saved, []);
    return Array.isArray(list) ? list : [];
  }

  function isProductSaved(id) {
    return savedList().some(
      x => x.id === id
    );
  }

  function saveForLater() {
    if (!state.active) return;

    const list = savedList();

    if (isProductSaved(state.active.id)) {
      const updated =
        list.filter(
          x => x.id !== state.active.id
        );

      write(S.saved, updated);
      toast('Removed from saved items.');
    } else {
      list.push({
        id: state.active.id,
        name: state.active.name,
        edition: state.active.edition,
        priceUSD: state.active.priceUSD,
        image: state.active.images[0] || ''
      });

      write(S.saved, list);
      toast('Saved for later.');
    }

    updateSaveButton();
  }

  function updateSaveButton() {
    const b =
      $('#saveForLaterButton');

    if (!b || !state.active) return;

    const saved =
      isProductSaved(state.active.id);

    b.classList.toggle(
      'saved',
      saved
    );

    b.setAttribute(
      'aria-pressed',
      String(saved)
    );

    const text =
      b.querySelector('[data-save-label]');

    if (text) {
      text.textContent =
        saved
          ? 'Saved'
          : 'Save for Later';
    }
  }

  $('#saveForLaterButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      saveForLater();
    }
  );

  /* =========================
     CART
  ========================= */

  function cartList() {
    const list = read(S.cart, []);
    return Array.isArray(list) ? list : [];
  }

  function updateCartCount() {
    const count =
      cartList().reduce(
        (n, x) =>
          n + (Number(x.quantity) || 0),
        0
      );

    $$('.cart-count').forEach(b => {
      b.textContent =
        count > 99
          ? '99+'
          : count
            ? String(count)
            : '';

      b.style.display =
        count ? 'flex' : 'none';
    });
  }

  function addToCart() {
    if (!state.active) return;

    const list = cartList();

    const existing =
      list.find(
        x => x.id === state.active.id
      );

    if (existing) {
      existing.quantity =
        (Number(existing.quantity) || 0) + 1;
    } else {
      list.push({
        id: state.active.id,
        name: state.active.name,
        edition: state.active.edition,
        priceUSD: state.active.priceUSD,
        image: state.active.images[0] || '',
        quantity: 1
      });
    }

    write(S.cart, list);
    updateCartCount();
    renderCartIfPresent();

    toast('Added to cart.');
  }

  function removeFromCart(id) {
    const list =
      cartList().filter(
        x => x.id !== id
      );

    write(S.cart, list);
    updateCartCount();
    renderCartIfPresent();
  }

  function changeCartQuantity(id, quantity) {
    const list = cartList();

    const item =
      list.find(
        x => x.id === id
      );

    if (!item) return;

    const n =
      Math.max(
        1,
        Number(quantity) || 1
      );

    item.quantity = n;

    write(S.cart, list);
    updateCartCount();
    renderCartIfPresent();
  }

  function getCartQuantity(id) {
    return cartList()
      .find(x => x.id === id)
      ?.quantity || 0;
  }

  $('#addToCartButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      addToCart();
    }
  );

  updateCartCount();

  /* =========================
     SEARCH
  ========================= */

  const search = $('#productSearch');
  const suggestions = $('#searchSuggestions');
  const resultCount = $('#productResultCount');

  function searchable(p) {
    return norm([
      p.name,
      p.description,
      p.edition,
      p.gender,
      p.weather,
      p.item,
      p.color,
      p.keywords,
      p.id
    ].join(' '));
  }

  function searchProducts(q) {
    const terms =
      norm(q)
        .split(/\s+/)
        .filter(Boolean);

    if (!terms.length)
      return allProducts();

    return allProducts()
      .filter(p => {
        const hay =
          searchable(p);

        return terms.every(
          t => hay.includes(t)
        );
      });
  }

  function showSuggestions() {
    if (!suggestions || !search)
      return;

    const q =
      norm(search.value);

    if (!q) {
      hide(suggestions);
      return;
    }

    const list =
      searchProducts(q)
        .slice(0, 6);

    suggestions.innerHTML =
      list.length
        ? list.map(p =>
          `<button
            type="button"
            data-suggestion-id="${esc(p.id)}">
            <span>${esc(p.name)}</span>
            <small>${esc(p.edition)}</small>
          </button>`
        ).join('')
        : '<span class="search-no-results">No matching VELO products</span>';

    show(suggestions);

    suggestions.classList.add(
      'open',
      'active'
    );
  }

  function applySearch() {
    state.query =
      search?.value || '';

    applyFilters();
    hide(suggestions);
  }

  search?.addEventListener(
    'input',
    showSuggestions
  );

  search?.addEventListener(
    'keydown',
    e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applySearch();
      }

      if (e.key === 'Escape') {
        hide(suggestions);
      }
    }
  );

  $('#searchButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      applySearch();
    }
  );

  suggestions?.addEventListener(
    'click',
    e => {
      const b =
        e.target.closest(
          '[data-suggestion-id]'
        );

      if (!b) return;

      const p =
        allProducts().find(
          x =>
            x.id ===
            b.dataset.suggestionId
        );

      if (p) {
        search.value =
          p.name;

        applySearch();
        openProductViewer(
          p.card
        );
      }
    }
  );

  document.addEventListener(
    'click',
    e => {
      if (
        suggestions &&
        !e.target.closest('#storeSearch')
      ) {
        hide(suggestions);
      }
    }
  );

  /* =========================
     FILTERS
  ========================= */

  const filterPanel =
    $('#filterPanel');

  function selected(name) {
    return new Set(
      $$(`input[name="${name}"]:checked`)
        .map(x => norm(x.value))
    );
  }

  function openFilter() {
    if (!filterPanel) return;

    closeMenu();

    show(filterPanel);
    filterPanel.classList.add(
      'open',
      'active'
    );

    lock();
  }

  function closeFilter() {
    filterPanel?.classList.remove(
      'open',
      'active'
    );

    hide(filterPanel);
    unlock();
  }

  $('#filterButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();

      filterPanel?.hidden
        ? openFilter()
        : closeFilter();
    }
  );

  $('#filterCloseButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      closeFilter();
    }
  );

  function applyFilters() {
    const q =
      norm(state.query);

    const terms =
      q.split(/\s+/)
        .filter(Boolean);

    const ed =
      selected('edition');

    const ge =
      selected('gender');

    const we =
      selected('weather');

    const it =
      selected('item');

    const co =
      selected('color');

    const min =
      usdFromDisplay(
        $('#priceMin')?.value || 0
      );

    const max =
      usdFromDisplay(
        $('#priceMax')?.value || 250000
      );

    let shown = 0;

    cards().forEach(card => {
      const p =
        product(card);

      if (!p) return;

      const hay =
        searchable(p);

      const qok =
        !terms.length ||
        terms.every(
          t => hay.includes(t)
        );

      const eok =
        compatible(
          p.edition,
          ed
        );

      const gok =
        !ge.size ||
        p.gender === 'unisex' ||
        compatible(
          p.gender,
          ge
        );

      const wok =
        compatible(
          p.weather,
          we
        );

      const iok =
        compatible(
          p.item,
          it
        );

      const cok =
        compatible(
          p.color,
          co
        );

      const low =
        Math.min(
          min,
          max
        );

      const high =
        Math.max(
          min,
          max
        );

      const pok =
        p.priceUSD >= low &&
        p.priceUSD <= high;

      const ok =
        qok &&
        eok &&
        gok &&
        wok &&
        iok &&
        cok &&
        pok;

      card.hidden = !ok;

      if (ok) shown++;
    });

    if (resultCount) {
      resultCount.textContent =
        `${shown} product${shown === 1 ? '' : 's'} shown`;
    }

    const empty =
      $('#productEmpty');

    if (empty) {
      empty.hidden =
        shown !== 0;
    }
  }

  $('#applyFiltersButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      applyFilters();
      closeFilter();
    }
  );

  $('#clearFiltersButton')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      clearFilters();
    }
  );

  $('#emptyStateClearFilters')?.addEventListener(
    'click',
    e => {
      e.preventDefault();
      clearFilters();
    }
  );

  function clearFilters() {
    $$(
      'input[type="checkbox"]',
      filterPanel || document
    ).forEach(
      x => x.checked = false
    );

    if ($('#priceMin'))
      $('#priceMin').value = '0';

    if ($('#priceMax')) {
      $('#priceMax').value =
        String(
          Math.round(
            250000 *
            (RATE[state.currency] || 1)
          )
        );
    }

    if (search)
      search.value = '';

    state.query = '';

    $$('.quick-filter-chip')
      .forEach(x =>
        x.classList.remove('active')
      );

    applyFilters();
  }

  $$('#genderChoices input')
    .forEach(x =>
      x.addEventListener(
        'change',
        applyFilters
      )
    );

  $$('[data-quick-filter]')
    .forEach(b =>
      b.addEventListener(
        'click',
        () => {
          const parts =
            String(
              b.dataset.quickFilter || ''
            ).split(':');

          const type = parts[0];
          const val = parts[1];

          if (type !== 'gender')
            return;

          $$('input[name="gender"]')
            .forEach(x =>
              x.checked =
                norm(x.value) ===
                norm(val)
            );

          applyFilters();

          $$('.quick-filter-chip')
            .forEach(x =>
              x.classList.toggle(
                'active',
                x === b
              )
            );
        }
      )
    );

  /* =========================
     CURRENCY
  ========================= */

  const currencySelect =
    $('#currencyFilter');

  const currencyLabel =
    $('#currencyLabel');

  function updateCurrencyUI(
    oldCurrency,
    newCurrency
  ) {
    const min =
      Number(
        $('#priceMin')?.value || 0
      );

    const max =
      Number(
        $('#priceMax')?.value || 250000
      );

    const oldRate =
      RATE[oldCurrency] || 1;

    const newRate =
      RATE[newCurrency] || 1;

    if ($('#priceMin')) {
      $('#priceMin').value =
        String(
          Math.round(
            min /
            oldRate *
            newRate
          )
        );
    }

    if ($('#priceMax')) {
      $('#priceMax').value =
        String(
          Math.round(
            max /
            oldRate *
            newRate
          )
        );
    }

    if (currencyLabel)
      currencyLabel.textContent =
        newCurrency;

    if (currencySelect)
      currencySelect.value =
        newCurrency;

    $$('[data-price-usd]')
      .forEach(e =>
        e.textContent =
          money(
            Number(
              e.dataset.priceUsd
            )
          )
      );

    if (
      viewerPrice &&
      state.active
    ) {
      viewerPrice.textContent =
        money(
          state.active.priceUSD
        );
    }

    state.currency =
      newCurrency;

    localStorage.setItem(
      S.currency,
      newCurrency
    );

    applyFilters();
  }

  currencySelect?.addEventListener(
    'change',
    () => {
      const old =
        state.currency;

      state.currency =
        currencySelect.value === 'NGN'
          ? 'NGN'
          : 'USD';

      updateCurrencyUI(
        old,
        state.currency
      );
    }
  );

  $('#changeCurrencyButton')
    ?.addEventListener(
      'click',
      () => {
        const old =
          state.currency;

        state.currency =
          old === 'USD'
            ? 'NGN'
            : 'USD';

        updateCurrencyUI(
          old,
          state.currency
        );
      }
    );

  if (currencySelect)
    currencySelect.value =
      state.currency;

  if (currencyLabel)
    currencyLabel.textContent =
      state.currency;

  /* =========================
     TOAST
  ========================= */

  let toastTimer;

  function toast(message) {
    let t =
      $('#veloToast');

    if (!t) {
      t =
        document.createElement('div');

      t.id =
        'veloToast';

      t.className =
        'velo-toast';

      document.body.appendChild(t);
    }

    t.textContent =
      message;

    t.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer =
      setTimeout(
        () =>
          t.classList.remove('show'),
        2400
      );
  }

  /* =========================
     CART PAGE COMPATIBILITY
  ========================= */

  function renderCartIfPresent() {
    const box =
      $('#cartItems');

    if (!box) return;

    const list =
      cartList();

    box.innerHTML =
      list.length
        ? list.map(x =>
          `<div
            class="cart-item"
            data-cart-id="${esc(x.id)}">

            <img
              src="${esc(x.image)}"
              alt="${esc(x.name)}">

            <div>
              <strong>
                ${esc(x.name)}
              </strong>

              <span>
                ${esc(x.edition)}
              </span>

              <b>
                ${money(x.priceUSD)}
              </b>

              <input
                type="number"
                min="1"
                value="${Number(x.quantity) || 1}"
                data-cart-qty>

              <button
                type="button"
                data-remove-cart>
                Remove
              </button>
            </div>
          </div>`
        ).join('')
        : '<p>Your cart is empty.</p>';

    const subtotal =
      list.reduce(
        (n, x) =>
          n +
          (Number(x.priceUSD) || 0) *
          (Number(x.quantity) || 1),
        0
      );

    ['#cartSubtotal', '#cartTotal']
      .forEach(id => {
        const e = $(id);

        if (e)
          e.textContent =
            money(subtotal);
      });
  }

  $('#cartItems')
    ?.addEventListener(
      'change',
      e => {
        const row =
          e.target.closest(
            '[data-cart-id]'
          );

        if (
          row &&
          e.target.matches(
            '[data-cart-qty]'
          )
        ) {
          changeCartQuantity(
            row.dataset.cartId,
            e.target.value
          );
        }
      }
    );

  $('#cartItems')
    ?.addEventListener(
      'click',
      e => {
        const row =
          e.target.closest(
            '[data-cart-id]'
          );

        if (
          row &&
          e.target.closest(
            '[data-remove-cart]'
          )
        ) {
          removeFromCart(
            row.dataset.cartId
          );
        }
      }
    );

  renderCartIfPresent();

  /* =========================
     GLOBAL PRODUCT OPENING
  ========================= */

  document.addEventListener(
    'click',
    e => {
      const open =
        e.target.closest(
          '[data-product-open]'
        );

      if (open) {
        if (
          e.target.closest(
            'button'
          )
        ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        openProductViewer(
          open.closest(
            '.product-card'
          )
        );

        return;
      }

      const card =
        e.target.closest(
          '.product-card'
        );

      if (
        card &&
        !e.target.closest(
          'button,a,input,select,textarea,label,[data-product-open]'
        )
      ) {
        e.preventDefault();
        openProductViewer(card);
      }
    }
  );

  /* =========================
     KEYBOARD / ESCAPE
  ========================= */

  document.addEventListener(
    'keydown',
    e => {
      if (e.key === 'Escape') {
        if (
          viewer &&
          !viewer.hidden
        ) {
          closeProductViewer();
        } else if (
          filterPanel &&
          !filterPanel.hidden
        ) {
          closeFilter();
        } else if (
          popup &&
          !popup.hidden
        ) {
          closeLoginPopup();
        } else if (
          sidebar &&
          !sidebar.hidden
        ) {
          closeMenu();
        }
      }

      const card =
        e.target.closest?.(
          '.product-card,[data-product-open]'
        );

      if (
        card &&
        (
          e.key === 'Enter' ||
          e.key === ' '
        )
      ) {
        e.preventDefault();

        openProductViewer(
          card.closest(
            '.product-card'
          ) || card
        );
      }
    }
  );

  /* =========================
     HEADER
  ========================= */

  const topbar =
    $('#veloTopbar');

  window.addEventListener(
    'scroll',
    () => {
      topbar?.classList.toggle(
        'scrolled',
        window.scrollY > 20
      );
    },
    { passive: true }
  );

  window.addEventListener(
    'resize',
    () =>
      cards().forEach(card =>
        renderCard(
          card,
          state.cardIndexes.get(card) || 0
        )
      )
  );

  /* =========================
     PUBLIC VELO API
  ========================= */

  window.VELO = {
    openMenu,
    closeMenu,

    openLoginPopup,
    closeLoginPopup,

    setWebsiteAccount,
    logoutWebsiteAccount,
    clearWebsiteAccount,

    hasWebsiteAccount:
      hasAccount,

    isWebsiteLoggedIn:
      loggedIn,

    openFilter,
    closeFilter,

    applyProductFilters:
      applyFilters,

    getProductCards:
      cards,

    getProductData:
      product,

    getAllProductData:
      allProducts,

    openProductViewer,
    closeProductViewer,

    renderViewerProduct:
      renderViewer,

    changeViewerImage,

    addToCart,
    removeFromCart,
    changeCartQuantity,
    getCartQuantity,

    renderCartIfPresent,

    getSavedProducts:
      savedList,

    isProductSaved,

    showToast:
      toast,

    formatMoney:
      money,

    addNotification,
    markNotificationsRead
  };

  /* =========================
     INITIALIZE
  ========================= */

  applyFilters();
  maybeShowAccountPopup();

  console.info(
    'VELO™ final homepage interaction system loaded.'
  );

})();
