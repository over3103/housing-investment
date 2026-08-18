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

    localStorage.removeItem(
        "housingUser"
    );

    window.location.href =
        "index.html";
}


/* =========================================
   IDENTIFIANT UTILISATEUR
========================================= */

function getUserIdentifier() {

    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        user.phone ||
        user.telephone ||
        user.email ||
        user.name ||
        user.fullName ||
        null
    );
}


/* =========================================
   RECUPERATION DES OPERATIONS
========================================= */

function getTransactions() {

    try {

        const data =
            localStorage.getItem(
                "housingTransactions"
            );

        if (!data) {
            return [];
        }

        const transactions =
            JSON.parse(data);

        return Array.isArray(transactions)
            ? transactions
            : [];

    } catch (error) {

        console.error(
            "Erreur de lecture des transactions.",
            error
        );

        return [];
    }
}


/* =========================================
   SAUVEGARDE DES OPERATIONS
========================================= */

function saveTransactions(transactions) {

    try {

        localStorage.setItem(
            "housingTransactions",
            JSON.stringify(transactions)
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur de sauvegarde des transactions.",
            error
        );

        return false;
    }
}


/* =========================================
   CREATION D'UNE TRANSACTION
========================================= */

function createTransaction(type, amount) {

    const user = getCurrentUser();

    if (!user) {

        alert(
            "Vous devez être connecté pour effectuer cette opération."
        );

        return false;
    }

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {

        alert(
            "Veuillez saisir un montant valide."
        );

        return false;
    }

    const transactions =
        getTransactions();

    const transaction = {

        id:
            "TX-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 10000
            ),

        userId:
            getUserIdentifier(),

        userName:
            user.name ||
            user.fullName ||
            user.nom ||
            "Utilisateur",

        phone:
            user.phone ||
            user.telephone ||
            "",

        type:
            type,

        amount:
            numericAmount,

        status:
            "pending",

        date:
            new Date().toISOString()
    };

    transactions.push(transaction);

    if (!saveTransactions(transactions)) {

        alert(
            "Impossible d'enregistrer l'opération."
        );

        return false;
    }

    return true;
}


/* =========================================
   DEMANDE DE DEPOT
========================================= */

function requestDeposit(amount) {

    const success =
        createTransaction(
            "deposit",
            amount
        );

    if (success) {

        alert(
            "Votre demande de dépôt a été enregistrée. Elle est en attente de validation."
        );

        updateDashboardData();

        return true;
    }

    return false;
}


/* =========================================
   DEMANDE DE RETRAIT
========================================= */

function requestWithdrawal(amount) {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Vous devez être connecté."
        );

        return false;
    }

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
    ) {

        alert(
            "Veuillez saisir un montant valide."
        );

        return false;
    }

    const balance =
        getUserBalance();

    if (numericAmount > balance) {

        alert(
            "Votre solde disponible est insuffisant."
        );

        return false;
    }

    const success =
        createTransaction(
            "withdrawal",
            numericAmount
        );

    if (success) {

        alert(
            "Votre demande de retrait a été enregistrée. Elle est en attente de validation."
        );

        updateDashboardData();

        return true;
    }

    return false;
}


/* =========================================
   TRANSACTIONS DE L'UTILISATEUR
========================================= */

function getCurrentUserTransactions() {

    const userId =
        getUserIdentifier();

    if (!userId) {
        return [];
    }

    const transactions =
        getTransactions();

    return transactions.filter(
        function (transaction) {

            return (
                transaction.userId === userId
            );

        }
    );
}


/* =========================================
   CALCUL DU SOLDE
========================================= */

function getUserBalance() {

    const user =
        getCurrentUser();

    if (!user) {
        return 0;
    }

    let balance =
        Number(
            user.balance ||
            user.solde ||
            0
        );

    if (!Number.isFinite(balance)) {
        balance = 0;
    }

    const transactions =
        getCurrentUserTransactions();

    transactions.forEach(
        function (transaction) {

            if (
                transaction.status !==
                "approved"
            ) {
                return;
            }

            const amount =
                Number(transaction.amount) || 0;

            if (
                transaction.type ===
                "deposit"
            ) {

                balance += amount;
            }

            if (
                transaction.type ===
                "withdrawal"
            ) {

                balance -= amount;
            }
        }
    );

    return Math.max(
        0,
        balance
    );
}


/* =========================================
   TEXTE DU STATUT
========================================= */

function getTransactionStatusText(
    status
) {

    if (status === "approved") {
        return "Validé";
    }

    if (status === "rejected") {
        return "Refusé";
    }

    return "En attente";
}


/* =========================================
   TYPE DE TRANSACTION
========================================= */

function getTransactionTypeText(
    type
) {

    if (type === "deposit") {
        return "Dépôt";
    }

    if (type === "withdrawal") {
        return "Retrait";
    }

    return "Opération";
}


/* =========================================
   AFFICHAGE DU SOLDE
========================================= */

function updateBalanceDisplay() {

    const balance =
        getUserBalance();

    const elements =
        document.querySelectorAll(
            "[data-user-balance]"
        );

    elements.forEach(
        function (element) {

            element.textContent =
                formatFCFA(balance);

        }
    );
}


/* =========================================
   AFFICHAGE DE L'HISTORIQUE
========================================= */

function displayTransactionHistory() {

    const container =
        document.querySelector(
            "[data-transaction-history]"
        );

    if (!container) {
        return;
    }

    const transactions =
        getCurrentUserTransactions();

    if (transactions.length === 0) {

        container.innerHTML =
            "<p>Aucune opération pour le moment.</p>";

        return;
    }

    const sortedTransactions =
        [...transactions].sort(
            function (a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }
        );

    container.innerHTML = "";

    sortedTransactions.forEach(
        function (transaction) {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "transaction-item";

            const date =
                new Date(
                    transaction.date
                ).toLocaleString(
                    "fr-FR"
                );

            row.innerHTML = `

                <div>
                    <strong>
                        ${getTransactionTypeText(
                            transaction.type
                        )}
                    </strong>

                    <div>
                        ${formatFCFA(
                            transaction.amount
                        )}
                    </div>

                    <small>
                        ${date}
                    </small>
                </div>

                <div>
                    <span>
                        ${getTransactionStatusText(
                            transaction.status
                        )}
                    </span>
                </div>

            `;

            container.appendChild(
                row
            );
        }
    );
}


/* =========================================
   MISE A JOUR DU DASHBOARD
========================================= */

function updateDashboardData() {

    updateBalanceDisplay();

    displayTransactionHistory();
}


/* =========================================
   FORMULAIRE DEPOT
========================================= */

function initializeDepositForm() {

    const form =
        document.querySelector(
            "[data-deposit-form]"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const input =
                form.querySelector(
                    "[name='amount']"
                );

            if (!input) {
                return;
            }

            const success =
                requestDeposit(
                    input.value
                );

            if (success) {
                form.reset();
            }
        }
    );
}


/* =========================================
   FORMULAIRE RETRAIT
========================================= */

function initializeWithdrawalForm() {

    const form =
        document.querySelector(
            "[data-withdrawal-form]"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const input =
                form.querySelector(
                    "[name='amount']"
                );

            if (!input) {
                return;
            }

            const success =
                requestWithdrawal(
                    input.value
                );

            if (success) {
                form.reset();
            }
        }
    );
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

        initializeDepositForm();

        initializeWithdrawalForm();

        updateDashboardData();

    }
);
