/* =========================================
   HOUSING INVESTMENT
   SCRIPT PRINCIPAL
========================================= */

"use strict";


/* =========================================
   OUTILS UTILISATEUR
========================================= */

function getCurrentUser() {

    const savedUser =
        localStorage.getItem("housingUser");

    if (!savedUser) {
        return null;
    }

    try {

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Impossible de lire les données utilisateur.",
            error
        );

        return null;
    }
}


/* =========================================
   FORMATAGE FCFA
========================================= */

function formatFCFA(amount) {

    const value =
        Number(amount) || 0;

    return value.toLocaleString("fr-FR") + " FCFA";
}


/* =========================================
   SAUVEGARDE UTILISATEUR
========================================= */

function saveCurrentUser(user) {

    if (!user) {
        return false;
    }

    try {

        localStorage.setItem(
            "housingUser",
            JSON.stringify(user)
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur lors de la sauvegarde.",
            error
        );

        return false;
    }
}


/* =========================================
   SESSION UTILISATEUR
========================================= */

function isUserLoggedIn() {

    return (
        localStorage.getItem("housingLoggedIn")
        === "true"
    );
}


/* =========================================
   DECONNEXION
========================================= */

function logoutUser() {

    localStorage.removeItem(
        "housingLoggedIn"
    );

    window.location.href =
        "index.html";
}


/* =========================================
   INITIALISATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Housing Investment chargé correctement."
        );

    }
);
