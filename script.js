/* =========================================
   HOUSING INVESTMENT
   SCRIPT PRINCIPAL
========================================= */

"use strict";


/* =========================================
   FRAIS
========================================= */

const DEPOSIT_FEE_RATE = 0.01;
const WITHDRAWAL_FEE_RATE = 0.25;


/* =========================================
   PARAMETRES INVESTISSEMENT
========================================= */

const INVESTMENT_DURATION_DAYS = 180;


/* =========================================
   8 PACKS
========================================= */

const INVESTMENT_PACKS = [

    {
        id: "pack3000",
        name: "Pack 3 000 FCFA",
        amount: 3000,
        dailyGain: 800
    },

    {
        id: "pack10000",
        name: "Pack 10 000 FCFA",
        amount: 10000,
        dailyGain: 3000
    },

    {
        id: "pack20000",
        name: "Pack 20 000 FCFA",
        amount: 20000,
        dailyGain: 6000
    },

    {
        id: "pack45000",
        name: "Pack 45 000 FCFA",
        amount: 45000,
        dailyGain: 14000
    },

    {
        id: "pack100000",
        name: "Pack 100 000 FCFA",
        amount: 100000,
        dailyGain: 30000
    },

    {
        id: "pack200000",
        name: "Pack 200 000 FCFA",
        amount: 200000,
        dailyGain: 65000
    },

    {
        id: "pack400000",
        name: "Pack 400 000 FCFA",
        amount: 400000,
        dailyGain: 140000
    },

    {
        id: "pack800000",
        name: "Pack 800 000 FCFA",
        amount: 800000,
        dailyGain: 290000
    }

];


/* =========================================
   UTILISATEUR ACTUEL
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
   INVESTISSEMENTS
========================================= */

function getInvestments() {

    try {

        const data =
            localStorage.getItem(
                "housingInvestments"
            );

        if (!data) {
            return [];
        }

        const investments =
            JSON.parse(data);

        return Array.isArray(investments)
            ? investments
            : [];

    } catch (error) {

        console.error(
            "Erreur de lecture des investissements.",
            error
        );

        return [];
    }
}


function saveInvestments(
    investments
) {

    try {

        localStorage.setItem(
            "housingInvestments",
            JSON.stringify(investments)
        );

        return true;

    } catch (error) {

        console.error(
            "Erreur de sauvegarde des investissements.",
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
    let netAmount =
        numericAmount;


    if (type === "deposit") {

        fee =
            Math.round(
                numericAmount *
                DEPOSIT_FEE_RATE
            );

        netAmount =
            numericAmount -
            fee;
    }


    if (type === "withdrawal") {

        fee =
            Math.round(
                numericAmount *
                WITHDRAWAL_FEE_RATE
            );

        netAmount =
            numericAmount -
            fee;
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


    return saveTransactions(
        transactions
    );
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
   INVESTISSEMENTS DE L'UTILISATEUR
========================================= */

function getCurrentUserInvestments() {

    const userId =
        getUserIdentifier();


    if (!userId) {
        return [];
    }


    return getInvestments().filter(
        function(investment) {

            return (
                investment.userId ===
                userId
            );

        }
    );
}


/* =========================================
   SOLDE
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


            if (
                transaction.type ===
                "withdrawal"
            ) {

                balance -=
                    amount;
            }


            /*
               INVESTISSEMENT

               Le montant du pack est
               retiré du solde.
            */

            if (
                transaction.type ===
                "investment"
            ) {

                balance -=
                    amount;
            }

        }
    );


    /*
       Gains journaliers déjà calculés
       par les investissements actifs.
    */

    const investments =
        getCurrentUserInvestments();


    investments.forEach(
        function(investment) {

            if (
                investment.status !==
                "active"
            ) {

                return;
            }


            const earned =
                getInvestmentEarnedAmount(
                    investment
                );


            balance +=
                earned;
        }
    );


    return Math.max(
        0,
        Math.round(balance)
    );
}


/* =========================================
   ACHAT D'UN PACK
========================================= */

function investInPack(
    packId
) {

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            "Vous devez être connecté."
        );

        return false;
    }


    const pack =
        INVESTMENT_PACKS.find(
            function(item) {

                return (
                    item.id ===
                    packId
                );

            }
        );


    if (!pack) {

        alert(
            "Pack d'investissement introuvable."
        );

        return false;
    }


    const balance =
        getUserBalance();


    if (
        balance <
        pack.amount
    ) {

        alert(
            "Votre solde est insuffisant pour ce pack."
        );

        return false;
    }


    const investments =
        getInvestments();


    const startDate =
        new Date();


    const endDate =
        new Date(
            startDate.getTime() +
            INVESTMENT_DURATION_DAYS *
            24 *
            60 *
            60 *
            1000
        );


    const investment = {

        id:
            "INV-" +
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

        packId:
            pack.id,

        packName:
            pack.name,

        amount:
            pack.amount,

        dailyGain:
            pack.dailyGain,

        duration:
            INVESTMENT_DURATION_DAYS,

        startDate:
            startDate.toISOString(),

        endDate:
            endDate.toISOString(),

        status:
            "active"

    };


    investments.push(
        investment
    );


    if (
        !saveInvestments(
            investments
        )
    ) {

        alert(
            "Impossible d'enregistrer l'investissement."
        );

        return false;
    }


    /*
       Transaction interne permettant
       de déduire le capital investi.
    */

    const transactions =
        getTransactions();


    transactions.push({

        id:
            "TX-INV-" +
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
            "investment",

        amount:
            pack.amount,

        fee:
            0,

        netAmount:
            pack.amount,

        packId:
            pack.id,

        packName:
            pack.name,

        status:
            "approved",

        date:
            new Date().toISOString()

    });


    if (
        !saveTransactions(
            transactions
        )
    ) {

        /*
           Annulation si la transaction
           ne peut pas être sauvegardée.
        */

        investments.pop();

        saveInvestments(
            investments
        );

        alert(
            "Impossible d'enregistrer le paiement de l'investissement."
        );

        return false;
    }


    alert(
        "Investissement activé.\n\n" +
        pack.name +
        "\nMontant : " +
        formatFCFA(pack.amount) +
        "\nGain quotidien : " +
        formatFCFA(pack.dailyGain) +
        "\nDurée : 180 jours"
    );


    updateDashboardData();


    if (
        typeof displayInvestments ===
        "function"
    ) {

        displayInvestments();
    }


    return true;
}


/* =========================================
   GAINS D'UN INVESTISSEMENT
========================================= */

function getInvestmentEarnedAmount(
    investment
) {

    if (!investment) {
        return 0;
    }


    const start =
        new Date(
            investment.startDate
        );


    const end =
        new Date(
            investment.endDate
        );


    const now =
        new Date();


    if (
        Number.isNaN(
            start.getTime()
        )
    ) {

        return 0;
    }


    const effectiveDate =
        now < end
            ? now
            : end;


    const elapsedMilliseconds =
        effectiveDate.getTime() -
        start.getTime();


    if (
        elapsedMilliseconds <=
        0
    ) {

        return 0;
    }


    const elapsedDays =
        Math.floor(
            elapsedMilliseconds /
            (
                24 *
                60 *
                60 *
                1000
            )
        );


    const days =
        Math.min(
            INVESTMENT_DURATION_DAYS,
            elapsedDays
        );


    return (
        days *
        Number(
            investment.dailyGain
        )
    );
}


/* =========================================
   JOUR SUIVANT
========================================= */

function getInvestmentDaysElapsed(
    investment
) {

    if (!investment) {
        return 0;
    }


    const start =
        new Date(
            investment.startDate
        );


    const now =
        new Date();


    const milliseconds =
        now.getTime() -
        start.getTime();


    if (
        milliseconds <=
        0
    ) {

        return 0;
    }


    return Math.min(
        INVESTMENT_DURATION_DAYS,
        Math.floor(
            milliseconds /
            (
                24 *
                60 *
                60 *
                1000
            )
        )
    );
}


/* =========================================
   STATUT INVESTISSEMENT
========================================= */

function getInvestmentStatus(
    investment
) {

    if (!investment) {
        return "unknown";
    }


    const now =
        new Date();


    const end =
        new Date(
            investment.endDate
        );


    if (
        now >= end
    ) {

        return "completed";
    }


    return "active";
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


    return getTransactions().filter(
        function(transaction) {

            return (
                transaction.userId ===
                userId
            );

        }
    );
}


/* =========================================
   STATUT TRANSACTION
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
   TYPE TRANSACTION
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


    if (type === "investment") {
        return "Investissement";
    }


    return "Opération";
}


/* =========================================
   AFFICHAGE DU SOLDE
========================================= */

function updateBalanceDisplay() {

    const balance =
        getUserBalance();


    document
        .querySelectorAll(
            "[data-user-balance]"
        )
        .forEach(
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


    const sorted =
        [...transactions].sort(
            function(a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }
        );


    container.innerHTML = "";


    sorted.forEach(
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


            const net =
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

                    ${
                        transaction.type ===
                        "deposit" ||
                        transaction.type ===
                        "withdrawal"
                            ? `
                                <div>
                                    Frais :
                                    ${formatFCFA(fee)}
                                </div>

                                <div>
                                    Net :
                                    ${formatFCFA(net)}
                                </div>
                              `
                            : ""
                    }

                    <small>
                        ${date}
                    </small>

                </div>

                <div>
                    ${getTransactionStatusText(
                        transaction.status
                    )}
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );
}


/* =========================================
   AFFICHAGE DES INVESTISSEMENTS
========================================= */

function displayInvestments() {

    const container =
        document.querySelector(
            "[data-investments]"
        );


    if (!container) {
        return;
    }


    const investments =
        getCurrentUserInvestments();


    if (
        investments.length ===
        0
    ) {

        container.innerHTML =
            "<p>Aucun investissement actif.</p>";

        return;
    }


    container.innerHTML = "";


    investments.forEach(
        function(investment) {

            const days =
                getInvestmentDaysElapsed(
                    investment
                );


            const earned =
                getInvestmentEarnedAmount(
                    investment
                );


            const status =
                getInvestmentStatus(
                    investment
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "investment-item";


            card.innerHTML = `

                <h3>
                    ${investment.packName}
                </h3>

                <p>
                    Capital :
                    <strong>
                        ${formatFCFA(
                            investment.amount
                        )}
                    </strong>
                </p>

                <p>
                    Gain quotidien :
                    <strong>
                        ${formatFCFA(
                            investment.dailyGain
                        )}
                    </strong>
                </p>

                <p>
                    Durée :
                    180 jours
                </p>

                <p>
                    Jours écoulés :
                    ${days} / 180
                </p>

                <p>
                    Gains calculés :
                    <strong>
                        ${formatFCFA(
                            earned
                        )}
                    </strong>
                </p>

                <p>
                    Statut :
                    <strong>
                        ${
                            status === "active"
                                ? "Actif"
                                : "Terminé"
                        }
                    </strong>
                </p>

            `;


            container.appendChild(
                card
            );

        }
    );
}


/* =========================================
   MISE A JOUR GENERALE
========================================= */

function updateDashboardData() {

    updateBalanceDisplay();

    displayTransactionHistory();

    displayInvestments();
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
   BOUTONS D'INVESTISSEMENT
========================================= */

function initializeInvestmentButtons() {

    document
        .querySelectorAll(
            "[data-investment-pack]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const packId =
                            button.getAttribute(
                                "data-investment-pack"
                            );


                        investInPack(
                            packId
                        );

                    }
                );

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

        initializeInvestmentButtons();

        updateDashboardData();

    }
);
