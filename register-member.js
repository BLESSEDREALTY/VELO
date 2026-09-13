/* =========================================================
   VELO™ — REGISTER AS A MEMBER
   FIREBASE BACKEND VERSION
   ========================================================= */

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


(function () {
    "use strict";

    const STORAGE_KEY = "velo_membership";
    const ACCOUNT_KEY = "velo_account";

    const $ = (selector) =>
        document.querySelector(selector);

    const form =
        $("#memberForm");

    const success =
        $("#memberSuccess");

    const toast =
        $("#memberToast");

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

        const element =
            document.getElementById(id);

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
                localStorage.getItem(
                    STORAGE_KEY
                );

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
            field =>
                markInvalid(field, false)
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
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
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


        if (
            password !== confirmPassword
        ) {

            markInvalid(
                fields.confirmPassword,
                true
            );

            valid = false;
        }


        if (
            terms &&
            !terms.checked
        ) {

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
       FIREBASE MEMBERSHIP REGISTRATION
       ======================================================= */

    async function registerMember() {

        if (!validate()) return;


        const name =
            value("memberName");

        const username =
            value("memberUsername");

        const email =
            value("memberEmail")
                .toLowerCase();

        const phone =
            value("memberPhone");

        const password =
            value("memberPassword");


        try {

            showToast(
                "Creating your VELOVERSE account..."
            );


            /*
             * 1. CREATE FIREBASE AUTH ACCOUNT
             */

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            /*
             * 2. ADD DISPLAY NAME
             */

            await updateProfile(
                user,
                {
                    displayName: name
                }
            );


            /*
             * 3. CREATE CUSTOMER RECORD
             */

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {

                    uid:
                        user.uid,

                    name:
                        name,

                    username:
                        username,

                    email:
                        email,

                    phone:
                        phone,

                    membershipStatus:
                        "pending_payment",

                    membershipPriceNGN:
                        5000,

                    membershipCurrency:
                        "NGN",

                    membershipRegisteredAt:
                        serverTimestamp(),

                    createdAt:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );


            /*
             * 4. CREATE MEMBERSHIP RECORD
             */

            await setDoc(
                doc(
                    db,
                    "memberships",
                    user.uid
                ),
                {

                    userId:
                        user.uid,

                    name:
                        name,

                    username:
                        username,

                    email:
                        email,

                    phone:
                        phone,

                    status:
                        "pending_payment",

                    priceNGN:
                        5000,

                    currency:
                        "NGN",

                    registeredAt:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );


            /*
             * 5. KEEP A LIGHTWEIGHT LOCAL
             *    MEMBERSHIP RECORD FOR
             *    CURRENT FRONTEND COMPATIBILITY.
             */

            const member = {

                id:
                    user.uid,

                name:
                    name,

                username:
                    username,

                email:
                    email,

                phone:
                    phone,

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


            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(member)
            );


            /*
             * 6. UPDATE EXISTING LOCAL
             *    ACCOUNT DATA IF PRESENT.
             */

            const existingAccount =
                localStorage.getItem(
                    ACCOUNT_KEY
                );


            if (existingAccount) {

                try {

                    const account =
                        JSON.parse(
                            existingAccount
                        );


                    account.uid =
                        user.uid;

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


            /*
             * 7. SHOW SUCCESS STATE
             */

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
                "Welcome to the VELOVERSE."
            );


        } catch (error) {

            console.error(
                "VELO membership registration failed:",
                error
            );


            /*
             * Firebase-friendly messages
             */

            let message =
                "Unable to complete registration.";

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message =
                    "An account already exists with this email.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            } else if (
                error.code ===
                "auth/weak-password"
            ) {

                message =
                    "Please choose a stronger password.";

            } else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                message =
                    "Network error. Please check your connection and try again.";
            }


            showToast(message);
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
                    "invalid"
                );
            }
        );
    });


    /* =======================================================
       PUBLIC VELO MEMBERSHIP API
       ======================================================= */

    window.VELO_MEMBERSHIP = {

        get:
            getStoredMembership,

        register:
            registerMember,

        validate:
            validate
    };


})();
