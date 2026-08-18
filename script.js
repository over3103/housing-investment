/* =========================================
   HOUSING INVESTMENT
   SCRIPT PRINCIPAL
========================================= */

"use strict";


/* =========================================
   FRAIS
========================================= */

const DEPOSIT_FEE_RATE = 0.01;   // 1 %
const WITHDRAWAL_FEE_RATE = 0.25; // 25 %


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
   SESSION
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

    const user =
        getCurrentUser();

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
   TRANSACTIONS
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


function saveTransactions(
    transactions
) {

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
   CREATION TRANSACTION
========================================= */

function createTransaction(
    type,
    amount
) {

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


    let fee = 0;
    let netAmount = numericAmount;


    /* DEPOT */

    if (type === "deposit") {

        fee =
            numericAmount *
            DEPOSIT_FEE_RATE;

        netAmount =
            numericAmount -
            fee;
    }


    /* RETRAIT */

    if (type === "withdrawal") {

        fee =
            numericAmount *
            WITHDRAWAL_FEE_RATE;

        netAmount =
            numericAmount -
            fee;
    }


    fee =
        Math.round(fee);

    netAmount =
        Math.round(netAmount);


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

        fee:
            fee,

        netAmount:
            netAmount,

        status:
            "pending",

        date:
            new Date().toISOString()
    };


    transactions.push(
        transaction
    );


    if (
        !saveTransactions(
            transactions
        )
    ) {

        alert(
            "Impossible d'enregistrer l'opération."
        );

        return false;
    }


    return true;
}


/* =========================================
   DEPOT
========================================= */

function requestDeposit(amount) {

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


    const fee =
        Math.round(
            numericAmount *
            DEPOSIT_FEE_RATE
        );


    const creditedAmount =
        numericAmount -
        fee;


    const success =
        createTransaction(
            "deposit",
            numericAmount
        );


    if (success) {

        alert(
            "Dépôt enregistré.\n\n" +
            "Montant : " +
            formatFCFA(numericAmount) +
            "\nFrais (1 %) : " +
            formatFCFA(fee) +
            "\nMontant crédité après validation : " +
            formatFCFA(creditedAmount)
        );


        updateDashboardData();

        return true;
    }


    return false;
}


/* =========================================
   RETRAIT
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


    if (
        numericAmount >
        balance
    ) {

        alert(
            "Votre solde disponible est insuffisant."
        );

        return false;
    }


    const fee =
        Math.round(
            numericAmount *
            WITHDRAWAL_FEE_RATE
        );


    const receivedAmount =
        numericAmount -
        fee;


    const success =
        createTransaction(
            "withdrawal",
            numericAmount
        );


    if (success) {

        alert(
            "Retrait enregistré.\n\n" +
            "Montant demandé : " +
            formatFCFA(numericAmount) +
            "\nFrais (25 %) : " +
            formatFCFA(fee) +
            "\nMontant reçu après validation : " +
            formatFCFA(receivedAmount)
        );


        updateDashboardData();

        return true;
    }


    return false;
}


/* =========================================
   TRANSACTIONS UTILISATEUR
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
        function(transaction) {

            return (
                transaction.userId ===
                userId
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


    if (
        !Number.isFinite(balance)
    ) {

        balance = 0;
    }


    const transactions =
        getCurrentUserTransactions();


    transactions.forEach(
        function(transaction) {

            if (
                transaction.status !==
                "approved"
            ) {

                return;
            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            /*
               DEPOT

               Seul le montant après
               frais est crédité.
            */

            if (
                transaction.type ===
                "deposit"
            ) {

                const netAmount =
                    transaction.netAmount !== undefined
                        ? Number(
                            transaction.netAmount
                        )
                        : amount;

                balance +=
                    netAmount;
            }


            /*
               RETRAIT

               Le montant demandé est
               débité du solde.
            */

            if (
                transaction.type ===
                "withdrawal"
            ) {

                balance -=
                    amount;
            }

        }
    );


    return Math.max(
        0,
        Math.round(balance)
    );
}


/* =========================================
   STATUT
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
   TYPE
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
   AFFICHAGE SOLDE
========================================= */

function updateBalanceDisplay() {

    const balance =
        getUserBalance();


    const elements =
        document.querySelectorAll(
            "[data-user-balance]"
        );


    elements.forEach(
        function(element) {

            element.textContent =
                formatFCFA(balance);

        }
    );
}


/* =========================================
   HISTORIQUE
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


    if (
        transactions.length ===
        0
    ) {

        container.innerHTML =
            "<p>Aucune opération pour le moment.</p>";

        return;
    }


    const sortedTransactions =
        [...transactions].sort(
            function(a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }
        );


    container.innerHTML = "";


    sortedTransactions.forEach(
        function(transaction) {

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


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            const fee =
                Number(
                    transaction.fee
                ) || 0;


            const netAmount =
                transaction.netAmount !== undefined
                    ? Number(
                        transaction.netAmount
                    )
                    : amount;


            row.innerHTML = `

                <div>

                    <strong>
                        ${getTransactionTypeText(
                            transaction.type
                        )}
                    </strong>

                    <div>
                        Montant :
                        ${formatFCFA(amount)}
                    </div>

                    <div>
                        Frais :
                        ${formatFCFA(fee)}
                    </div>

                    <div>
                        Net :
                        ${formatFCFA(netAmount)}
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
   MISE A JOUR DASHBOARD
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
        function(event) {

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
        function(event) {

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
    function() {

        console.log(
            "Housing Investment chargé correctement."
        );


        initializeDepositForm();

        initializeWithdrawalForm();

        updateDashboardData();

    }
);
