/* =========================================================
   VELO™ NOTIFICATIONS
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "velo_notifications";

    const $ = (selector) => document.querySelector(selector);

    const list = $("#notificationsList");
    const empty = $("#notificationEmpty");
    const count = $("#notificationCount");
    const markAllButton = $("#markAllReadButton");
    const clearButton = $("#clearNotificationsButton");
    const toast = $("#notificationToast");


    /* =======================================================
       STORAGE
       ======================================================= */

    function getNotifications() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return getDefaultNotifications();
            }

            const parsed = JSON.parse(stored);

            if (!Array.isArray(parsed)) {
                return getDefaultNotifications();
            }

            return parsed;
        } catch (error) {
            console.warn("VELO notifications could not be loaded.", error);
            return getDefaultNotifications();
        }
    }


    function saveNotifications(notifications) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(notifications)
            );

            /*
             * Notify other VELO pages immediately.
             * The storage event handles other tabs/windows.
             */
            window.dispatchEvent(
                new CustomEvent("veloNotificationsUpdated")
            );

        } catch (error) {
            console.warn("VELO notifications could not be saved.", error);
        }
    }


    /* =======================================================
       DEFAULT NOTIFICATIONS
       ======================================================= */

    function getDefaultNotifications() {
        return [
            {
                id: "welcome",
                label: "ANNOUNCEMENT",
                title: "Welcome to VELO™.",
                message:
                    "You're now connected to the movement. Keep checking this space for important VELO™ announcements and updates.",
                time: "Just now",
                read: false,
                createdAt: Date.now()
            },

            {
                id: "collections-coming",
                label: "COLLECTION",
                title: "New releases are coming.",
                message:
                    "Stay ready for upcoming VELO™ collections, limited releases, and exclusive drops.",
                time: "VELO™ Updates",
                read: true,
                createdAt: Date.now() - 1000
            },

            {
                id: "membership-updates",
                label: "MEMBERSHIP",
                title: "Membership updates.",
                message:
                    "Important membership announcements, benefits, and selected member opportunities will appear here.",
                time: "VELO™ Membership",
                read: true,
                createdAt: Date.now() - 2000
            }
        ];
    }


    /* =======================================================
       RENDER
       ======================================================= */

    function render() {

        if (!list) return;

        const notifications = getNotifications();

        list.innerHTML = "";

        const unreadCount = notifications.filter(
            notification => !notification.read
        ).length;

        if (count) {
            count.textContent = notifications.length;
        }


        /* EMPTY STATE */

        if (!notifications.length) {

            list.hidden = true;

            if (empty) {
                empty.hidden = false;
            }

            return;
        }


        list.hidden = false;

        if (empty) {
            empty.hidden = true;
        }


        /* CARDS */

        notifications.forEach(notification => {

            const card = document.createElement("article");

            card.className =
                "notification-card" +
                (notification.read ? "" : " unread");

            card.dataset.notificationId = notification.id;


            const dot = document.createElement("div");

            dot.className = "notification-dot";


            const content = document.createElement("div");

            content.className = "notification-content";


            const label = document.createElement("span");

            label.className = "notification-label";
            label.textContent = notification.label || "VELO™";


            const title = document.createElement("h2");

            title.textContent =
                notification.title || "VELO™ Update";


            const message = document.createElement("p");

            message.textContent =
                notification.message || "";


            const time = document.createElement("span");

            time.className = "notification-time";

            time.textContent =
                notification.time || "VELO™ Updates";


            content.appendChild(label);
            content.appendChild(title);
            content.appendChild(message);
            content.appendChild(time);

            card.appendChild(dot);
            card.appendChild(content);

            list.appendChild(card);


            /*
             * Clicking an unread notification marks it read.
             */
            card.addEventListener("click", function () {

                if (notification.read) return;

                markAsRead(notification.id);
            });

        });


        if (markAllButton) {
            markAllButton.disabled = unreadCount === 0;

            markAllButton.style.opacity =
                unreadCount === 0 ? "0.45" : "";
        }
    }


    /* =======================================================
       READ STATE
       ======================================================= */

    function markAsRead(id) {

        const notifications = getNotifications();

        const target = notifications.find(
            notification => notification.id === id
        );

        if (!target || target.read) return;

        target.read = true;

        saveNotifications(notifications);

        render();

        showToast("Notification marked as read.");
    }


    function markAllAsRead() {

        const notifications = getNotifications();

        let changed = false;

        notifications.forEach(notification => {

            if (!notification.read) {
                notification.read = true;
                changed = true;
            }

        });

        if (!changed) return;

        saveNotifications(notifications);

        render();

        showToast("All notifications marked as read.");
    }


    /* =======================================================
       CLEAR
       ======================================================= */

    function clearNotifications() {

        const notifications = getNotifications();

        if (!notifications.length) return;

        const confirmed = window.confirm(
            "Clear all VELO™ notifications?"
        );

        if (!confirmed) return;

        saveNotifications([]);

        render();

        showToast("Notifications cleared.");
    }


    /* =======================================================
       ADD NOTIFICATION
       ======================================================= */

    function addNotification(data) {

        if (!data || !data.title) return;

        const notifications = getNotifications();

        const newNotification = {
            id:
                data.id ||
                "notification-" + Date.now(),

            label:
                data.label ||
                "ANNOUNCEMENT",

            title:
                data.title,

            message:
                data.message ||
                "",

            time:
                data.time ||
                "Just now",

            read:
                false,

            createdAt:
                Date.now()
        };


        notifications.unshift(newNotification);

        saveNotifications(notifications);

        render();

        return newNotification;
    }


    /* =======================================================
       TOAST
       ======================================================= */

    let toastTimer = null;

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            toast.classList.remove("show");

        }, 2200);
    }


    /* =======================================================
       CROSS-PAGE / CROSS-TAB SYNC
       ======================================================= */

    window.addEventListener("storage", function (event) {

        if (event.key === STORAGE_KEY) {
            render();
        }

    });


    window.addEventListener(
        "veloNotificationsUpdated",
        render
    );


    /* =======================================================
       EVENTS
       ======================================================= */

    if (markAllButton) {
        markAllButton.addEventListener(
            "click",
            markAllAsRead
        );
    }

    if (clearButton) {
        clearButton.addEventListener(
            "click",
            clearNotifications
        );
    }


    /* =======================================================
       PUBLIC API
       ======================================================= */

    window.VELO_NOTIFICATIONS = {

        get: getNotifications,

        add: addNotification,

        markAsRead: markAsRead,

        markAllAsRead: markAllAsRead,

        clear: clearNotifications,

        render: render

    };


    /* =======================================================
       INITIALIZE
       ======================================================= */

    render();

})();
