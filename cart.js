/* =========================================================
   VELO™ CART SYSTEM
   Independent cart-page controller
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       DOM
    ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    const els = {
        items: $("#cart-items"),
        empty: $("#cart-empty"),
        subtotal: $("#cart-subtotal"),
        delivery: $("#cart-delivery"),
        total: $("#cart-total"),
        itemCount: $("#cart-item-count"),
        clear: $("#cart-clear-btn"),
        checkout: $("#cart-checkout-btn"),
        toast: $("#cart-toast")
    };


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEYS = [
        "velo_cart",
        "veloCart"
    ];


    function readCart(){

        for(const key of STORAGE_KEYS){

            try{

                const raw =
                    localStorage.getItem(key);

                if(!raw){
                    continue;
                }

                const parsed =
                    JSON.parse(raw);

                if(Array.isArray(parsed)){

                    return parsed;

                }

            }catch(error){

                console.warn(
                    "VELO cart read error:",
                    error
                );

            }

        }

        return [];

    }


    function saveCart(cart){

        const clean =
            Array.isArray(cart)
                ? cart
                : [];


        try{

            /*
             Primary storage key used by the
             current VELO system.
            */

            localStorage.setItem(
                "velo_cart",
                JSON.stringify(clean)
            );


            /*
             Keep legacy compatibility so older
             pages/scripts don't lose the cart.
            */

            localStorage.setItem(
                "veloCart",
                JSON.stringify(clean)
            );

        }catch(error){

            console.warn(
                "VELO cart save error:",
                error
            );

        }

    }


    /* =====================================================
       PRODUCT NORMALIZATION
    ===================================================== */

    function normalizeItem(item){

        if(!item || typeof item !== "object"){
            return null;
        }


        const price =
            Number(
                item.price ??
                item.priceUSD ??
                item.amount ??
                0
            );


        const quantity =
            Math.max(
                1,
                Number(
                    item.quantity ??
                    item.qty ??
                    1
                )
            );


        return {

            id:
                String(
                    item.id ??
                    item.productId ??
                    item.name ??
                    Math.random()
                ),

            name:
                String(
                    item.name ??
                    item.productName ??
                    "VELO™ Product"
                ),

            price:
                Number.isFinite(price)
                    ? price
                    : 0,

            quantity,

            image:
                item.image ??
                item.imageUrl ??
                item.src ??
                "",

            edition:
                String(
                    item.edition ??
                    item.category ??
                    item.collection ??
                    "VELO™ COLLECTION"
                ),

            color:
                item.color ??
                "",

            size:
                item.size ??
                ""

        };

    }


    function getCart(){

        return readCart()
            .map(normalizeItem)
            .filter(Boolean);

    }


    /* =====================================================
       STATE
    ===================================================== */

    let cart = getCart();


    /* =====================================================
       FORMAT
    ===================================================== */

    function formatPrice(value){

        const amount =
            Number(value) || 0;

        return "₦" +
            amount.toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits:0,
                    maximumFractionDigits:2
                }
            );

    }


    function getItemCount(){

        return cart.reduce(
            (total,item) =>
                total +
                Math.max(
                    1,
                    Number(item.quantity) || 1
                ),
            0
        );

    }


    function getSubtotal(){

        return cart.reduce(
            (total,item) =>
                total +
                (
                    Number(item.price) || 0
                ) *
                (
                    Number(item.quantity) || 1
                ),
            0
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer;


    function showToast(message){

        if(!els.toast){
            return;
        }


        clearTimeout(toastTimer);


        els.toast.textContent =
            message;


        els.toast.hidden =
            false;


        requestAnimationFrame(() => {

            els.toast.classList.add(
                "show"
            );

        });


        toastTimer =
            setTimeout(() => {

                els.toast.classList.remove(
                    "show"
                );


                setTimeout(() => {

                    els.toast.hidden =
                        true;

                },250);

            },2200);

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render(){

        if(!els.items){
            return;
        }


        /*
         Remove previously rendered products.
        */

        $$(".cart-product",els.items)
            .forEach(item => item.remove());


        const count =
            getItemCount();


        const subtotal =
            getSubtotal();


        /*
         Header count
        */

        if(els.itemCount){

            els.itemCount.textContent =
                `${count} ${count === 1 ? "ITEM" : "ITEMS"}`;

        }


        /*
         Empty state
        */

        const empty =
            cart.length === 0;


        if(els.empty){

            els.empty.hidden =
                !empty;

        }


        /*
         Buttons / summary
        */

        if(els.clear){

            els.clear.disabled =
                empty;

        }


        if(els.checkout){

            els.checkout.disabled =
                empty;

        }


        if(els.subtotal){

            els.subtotal.textContent =
                formatPrice(subtotal);

        }


        if(els.total){

            els.total.textContent =
                formatPrice(subtotal);

        }


        if(els.delivery){

            els.delivery.textContent =
                empty
                    ? "Calculated at checkout"
                    : "Calculated at checkout";

        }


        if(empty){

            return;

        }


        /*
         Render each item.
        */

        cart.forEach(
            (item,index) => {

                const product =
                    document.createElement(
                        "article"
                    );


                product.className =
                    "cart-product";


                product.dataset.index =
                    String(index);


                const image =
                    item.image
                        ? `
                            <img
                                src="${escapeAttribute(item.image)}"
                                alt="${escapeAttribute(item.name)}"
                                loading="lazy"
                            >
                          `
                        : `
                            <div class="cart-product-placeholder">
                                VELO™
                            </div>
                          `;


                const optionText = [
                    item.color,
                    item.size
                ]
                    .filter(Boolean)
                    .join(" · ");


                product.innerHTML = `

                    <div class="cart-product-image">
                        ${image}
                    </div>


                    <div class="cart-product-details">

                        <span class="cart-product-category">
                            ${escapeHTML(item.edition)}
                        </span>


                        <h2>
                            ${escapeHTML(item.name)}
                        </h2>


                        <p class="cart-product-price">
                            ${formatPrice(item.price)}
                            ${
                                optionText
                                    ? `<br><small>${escapeHTML(optionText)}</small>`
                                    : ""
                            }
                        </p>


                        <div class="cart-product-controls">

                            <button
                                type="button"
                                class="cart-quantity-btn"
                                data-cart-action="decrease"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>


                            <span
                                class="cart-quantity-value"
                            >
                                ${item.quantity}
                            </span>


                            <button
                                type="button"
                                class="cart-quantity-btn"
                                data-cart-action="increase"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>


                        <button
                            type="button"
                            class="cart-remove-btn"
                            data-cart-action="remove"
                        >
                            Remove
                        </button>

                    </div>


                    <div class="cart-product-line-total">
                        ${formatPrice(
                            item.price *
                            item.quantity
                        )}
                    </div>

                `;


                /*
                 Insert before empty state.
                */

                els.items.insertBefore(
                    product,
                    els.empty
                );

            }
        );


        attachImageFallbacks();

    }


    /* =====================================================
       HTML SAFETY
    ===================================================== */

    function escapeHTML(value){

        return String(value)
            .replace(
                /[&<>"']/g,
                char => ({
                    "&":"&amp;",
                    "<":"&lt;",
                    ">":"&gt;",
                    '"':"&quot;",
                    "'":"&#039;"
                }[char])
            );

    }


    function escapeAttribute(value){

        return escapeHTML(value);

    }


    /* =====================================================
       IMAGE FALLBACK
    ===================================================== */

    function attachImageFallbacks(){

        $$(
            ".cart-product-image img",
            els.items
        )
        .forEach(img => {

            img.addEventListener(
                "error",
                () => {

                    const parent =
                        img.parentElement;


                    if(!parent){
                        return;
                    }


                    parent.innerHTML = `
                        <div class="cart-product-placeholder">
                            VELO™
                        </div>
                    `;

                },
                {
                    once:true
                }
            );

        });

    }


    /* =====================================================
       CART ACTIONS
    ===================================================== */

    function updateItem(index,action){

        cart =
            getCart();


        const item =
            cart[index];


        if(!item){
            return;
        }


        const currentQuantity =
            Math.max(
                1,
                Number(item.quantity) || 1
            );


        if(action === "increase"){

            item.quantity =
                currentQuantity + 1;


            showToast(
                "Quantity updated."
            );

        }


        if(action === "decrease"){

            if(currentQuantity <= 1){

                cart.splice(
                    index,
                    1
                );


                showToast(
                    "Item removed from cart."
                );

            }else{

                item.quantity =
                    currentQuantity - 1;


                showToast(
                    "Quantity updated."
                );

            }

        }


        if(action === "remove"){

            cart.splice(
                index,
                1
            );


            showToast(
                "Item removed from cart."
            );

        }


        saveCart(cart);

        render();

    }


    /* =====================================================
       CLEAR CART
    ===================================================== */

    function clearCart(){

        if(!cart.length){
            return;
        }


        cart = [];


        saveCart(cart);

        render();


        showToast(
            "Your cart has been cleared."
        );

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function attachEvents(){

        /*
         Event delegation means we don't need
         to attach a new listener every time
         the cart renders.
        */

        els.items?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-cart-action]"
                    );


                if(!button){
                    return;
                }


                const product =
                    button.closest(
                        ".cart-product"
                    );


                if(!product){
                    return;
                }


                const index =
                    Number(
                        product.dataset.index
                    );


                const action =
                    button.dataset.cartAction;


                updateItem(
                    index,
                    action
                );

            }
        );


        els.clear?.addEventListener(
            "click",
            clearCart
        );


        els.checkout?.addEventListener(
            "click",
            () => {

                if(!cart.length){

                    showToast(
                        "Your cart is empty."
                    );

                    return;

                }


                /*
                 Actual checkout/payment integration
                 will be connected at the checkout stage.
                */

                showToast(
                    "Checkout will be connected next."
                );

            }
        );


        /*
         Keyboard shortcut:
         Escape returns to store.
        */

        document.addEventListener(
            "keydown",
            event => {

                if(
                    event.key === "Escape" &&
                    !event.target.matches(
                        "input,textarea,select"
                    )
                ){

                    window.location.href =
                        "index.html";

                }

            }
        );

    }


    /* =====================================================
       STORAGE SYNC
    ===================================================== */

    window.addEventListener(
        "storage",
        event => {

            if(
                STORAGE_KEYS.includes(
                    event.key
                )
            ){

                cart =
                    getCart();

                render();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init(){

        /*
         Standardize any existing legacy cart.
        */

        saveCart(cart);


        attachEvents();

        render();

    }


    init();


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.VELO_CART = {

        getCart: () =>
            getCart(),

        render: () =>
            render(),

        clear: () =>
            clearCart(),

        subtotal: () =>
            getSubtotal(),

        itemCount: () =>
            getItemCount()

    };

})();
