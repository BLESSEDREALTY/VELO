/* =========================================================
   VELO™ — REGISTER AS A MEMBER
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "velo_membership";
    const ACCOUNT_KEY = "velo_account";

    const $ = (selector) => document.querySelector(selector);

    const form = $("#memberForm");
    const success = $("#memberSuccess");
    const toast = $("#memberToast");

    let toastTimer = null;


    /* =======================================================
       TOAST
       ======================================================= */

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2400);
    }


    /* =======================================================
       HELPERS
       ======================================================= */

    function value(id) {

        const element = document.getElementById(id);

        return element
            ? element.value.trim()
            : "";
    }


    function markInvalid(element, invalid) {

        if (!element) return;

        element.classList.toggle(
            "invalid",
            invalid
        );
    }


    function getStoredMembership() {

        try {

            const raw =
                localStorage.getItem(STORAGE_KEY);

            return raw
                ? JSON.parse(raw)
                : null;

        } catch (error) {

            console.warn(
                "VELO membership data could not be read.",
                error
            );

            return null;
        }
    }


    /* =======================================================
       VALIDATION
       ======================================================= */

    function validate() {

        const fields = {

            name:
                $("#memberName"),

            username:
                $("#memberUsername"),

            email:
                $("#memberEmail"),

            phone:
                $("#memberPhone"),

            password:
                $("#memberPassword"),

            confirmPassword:
                $("#memberConfirmPassword")
        };


        const name =
            value("memberName");

        const username =
            value("memberUsername");

        const email =
            value("memberEmail");

        const phone =
            value("memberPhone");

        const password =
            value("memberPassword");

        const confirmPassword =
            value("memberConfirmPassword");

        const terms =
            $("#memberTerms");


        Object.values(fields).forEach(
            field => markInvalid(field, false)
        );


        let valid = true;


        if (name.length < 2) {

            markInvalid(
                fields.name,
                true
            );

            valid = false;
        }


        if (username.length < 3) {

            markInvalid(
                fields.username,
                true
            );

            valid = false;
        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            markInvalid(
                fields.email,
                true
            );

            valid = false;
        }


        if (phone.length < 7) {

            markInvalid(
                fields.phone,
                true
            );

            valid = false;
        }


        if (password.length < 6) {

            markInvalid(
                fields.password,
                true
            );

            valid = false;
        }


        if (password !== confirmPassword) {

            markInvalid(
                fields.confirmPassword,
                true
            );

            valid = false;
        }


        if (terms && !terms.checked) {

            valid = false;
        }


        if (!valid) {

            showToast(
                "Please complete the membership form correctly."
            );
        }


        return valid;
    }


    /* =======================================================
       MEMBERSHIP REGISTRATION
       ======================================================= */

    function registerMember() {

        if (!validate()) return;


        const member = {

            id:
                "member-" +
                Date.now(),

            name:
                value("memberName"),

            username:
                value("memberUsername"),

            email:
                value("memberEmail")
                    .toLowerCase(),

            phone:
                value("memberPhone"),

            membership: {

                status:
                    "pending_payment",

                priceNGN:
                    5000,

                currency:
                    "NGN"
            },

            registeredAt:
                new Date().toISOString()
        };


        /*
         * IMPORTANT:
         *
         * Passwords are deliberately NOT
         * stored in localStorage.
         *
         * Final authentication will be handled
         * by Firebase/backend.
         */


        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(member)
            );


            /*
             * If the visitor already has
             * a VELO account, update its
             * membership status.
             *
             * Membership remains separate
             * from normal account creation.
             */

            const existingAccount =
                localStorage.getItem(
                    ACCOUNT_KEY
                );


            if (existingAccount) {

                try {

                    const account =
                        JSON.parse(existingAccount);


                    account.membershipStatus =
                        "pending_payment";


                    account.membershipRegisteredAt =
                        member.registeredAt;


                    localStorage.setItem(
                        ACCOUNT_KEY,
                        JSON.stringify(account)
                    );

                } catch (error) {

                    console.warn(
                        "Existing VELO account could not be updated.",
                        error
                    );
                }
            }


            if (form) {

                form.hidden = true;
            }


            if (success) {

                success.hidden = false;

                success.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"
                });
            }


            showToast(
                "Membership registration saved."
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to save your membership registration."
            );
        }
    }


    /* =======================================================
       FORM SUBMISSION
       ======================================================= */

    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                registerMember();
            }
        );
    }


    /* =======================================================
       LIVE VALIDATION
       ======================================================= */

    [
        "memberName",
        "memberUsername",
        "memberEmail",
        "memberPhone",
        "memberPassword",
        "memberConfirmPassword"

    ].forEach(id => {

        const field =
            document.getElementById(id);


        if (!field) return;


        field.addEventListener(
            "input",
            function () {

                this.classList.remove(
                    "invalid
