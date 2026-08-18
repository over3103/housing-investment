/* =========================================
   HOUSING INVESTMENT
   SCRIPT PRINCIPAL
   VERSION PROTOTYPE
========================================= */

"use strict";


/* =========================================
   CONFIGURATION
========================================= */

const DEPOSIT_FEE_RATE = 0.01;       // 1 %
const WITHDRAWAL_FEE_RATE = 0.25;    // 25 %
const INVESTMENT_DURATION_DAYS = 180;


/* =========================================
   PACKS
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
   UTILISATEUR
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
            "Erreur lecture utilisateur :",
            error
        );
        return null;
    }
}


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
            "Erreur sauvegarde utilisateur :",
            error
        );
        return false;
    }
}


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
   FORMATAGE
========================================= */

function formatFCFA(amount) {

    return (
        Math.round(
            Number(amount) || 0
        )
    ).toLocaleString("fr-FR") +
    " FCFA";
}


/* =========================================
   SESSION
========================================= */

function isUserLoggedIn() {

    return (
        localStorage.getItem(
            "housingLoggedIn"
        ) === "true"
    );
}


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

        const result =
            JSON.parse(data);

        return Array.isArray(result)
            ? result
            : [];

    } catch (error) {

        console.error(error);

        return [];
    }
}


function saveTransactions(
    transactions
) {

    try {

        localStorage.setItem(
            "housingTransactions",
            JSON.stringify(
                transactions
            )
        );

        return true;

    } catch (error) {

        console.error(error);

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

        const result =
            JSON.parse(data);

        return Array.isArray(result)
            ? result
            : [];

    } catch (error) {

        console.error(error);

        return [];
    }
}


function saveInvestments(
    investments
) {

    try {

        localStorage.setItem(
            "housingInvestments",
            JSON.stringify(
                investments
            )
        );

        return true;

    } catch (error) {

        console.error(error);

        return false;
    }
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
   INVESTISSEMENTS UTILISATEUR
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
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        alert(
            "Montant invalide."
        );

        return false;
    }

    let fee = 0;
    let netAmount =
        numericAmount;

    if (
        type === "deposit"
    ) {

        fee =
            Math.round(
                numericAmount *
                DEPOSIT_FEE_RATE
            );

        netAmount =
            numericAmount -
            fee;
    }

    if (
        type === "withdrawal"
    ) {

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

    transactions.push({

        id:
            "TX-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() *
                10000
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

    });

    return saveTransactions(
        transactions
    );
}


/* =========================================
   DEPOT
========================================= */

function requestDeposit(
    amount
) {

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(
            numericAmount
        ) ||
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

    const credited =
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
            formatFCFA(
                numericAmount
            ) +
            "\nFrais (1 %) : " +
            formatFCFA(
                fee
            ) +
            "\nMontant net : " +
            formatFCFA(
                credited
            )
        );

        updateDashboardData();

        return true;
    }

    return false;
}


/* =========================================
   RETRAIT
========================================= */

function requestWithdrawal(
    amount
) {

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(
            numericAmount
        ) ||
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
            "Solde insuffisant."
        );

        return false;
    }

    const fee =
        Math.round(
            numericAmount *
            WITHDRAWAL_FEE_RATE
        );

    const received =
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
            formatFCFA(
                numericAmount
            ) +
            "\nFrais (25 %) : " +
            formatFCFA(
                fee
            ) +
            "\nMontant net : " +
            formatFCFA(
                received
            )
        );

        updateDashboardData();

        return true;
    }

    return false;
}


/* =========================================
   VERSEMENTS INVESTISSEMENT
========================================= */

function getInvestmentPayments() {

    try {

        const data =
            localStorage.getItem(
                "housingInvestmentPayments"
            );

        if (!data) {
            return [];
        }

        const result =
            JSON.parse(data);

        return Array.isArray(result)
            ? result
            : [];

    } catch (error) {

        console.error(error);

        return [];
    }
}


function saveInvestmentPayments(
    payments
) {

    localStorage.setItem(
        "housingInvestmentPayments",
        JSON.stringify(
            payments
        )
    );
}


/* =========================================
   CLE JOURNALIERE
========================================= */

function getDayKey(date) {

    const d =
        new Date(date);

    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );
}


/* =========================================
   ACHAT PACK
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
            "Pack introuvable."
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
            "Solde insuffisant pour ce pack."
        );

        return false;
    }

    const now =
        new Date();

    const end =
        new Date(
            now.getTime() +
            (
                INVESTMENT_DURATION_DAYS *
                24 *
                60 *
                60 *
                1000
            )
        );

    const investments =
        getInvestments();

    const investment = {

        id:
            "INV-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() *
                10000
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
            now.toISOString(),

        endDate:
            end.toISOString(),

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
       Le capital investi est enregistré
       une seule fois.
    */

    const transactions =
        getTransactions();

    transactions.push({

        id:
            "TX-INV-" +
            Date.now(),

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
            now.toISOString()

    });

    if (
        !saveTransactions(
            transactions
        )
    ) {

        investments.pop();

        saveInvestments(
            investments
        );

        alert(
            "Erreur lors de l'enregistrement."
        );

        return false;
    }

    alert(
        "Investissement activé.\n\n" +
        pack.name +
        "\nMontant : " +
        formatFCFA(
            pack.amount
        ) +
        "\nGain quotidien prévu : " +
        formatFCFA(
            pack.dailyGain
        ) +
        "\nDurée : 180 jours"
    );

    updateDashboardData();

    return true;
}


/* =========================================
   ENREGISTRER LES GAINS DU JOUR
========================================= */

function processDailyInvestmentPayments() {

    const userId =
        getUserIdentifier();

    if (!userId) {
        return;
    }

    const investments =
        getInvestments();

    const payments =
        getInvestmentPayments();

    const today =
        getDayKey(
            new Date()
        );

    let changed =
        false;

    investments.forEach(
        function(investment) {

            if (
                investment.userId !==
                userId
            ) {
                return;
            }

            if (
                investment.status !==
                "active"
            ) {
                return;
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
                now < start
            ) {
                return;
            }

            /*
               Si les 180 jours sont terminés,
               on ferme l'investissement.
            */

            if (
                now >= end
            ) {

                investment.status =
                    "completed";

                changed =
                    true;

                return;
            }

            /*
               Une seule ligne de gain
               par investissement et par jour.
            */

            const alreadyPaid =
                payments.some(
                    function(payment) {

                        return (
                            payment.investmentId ===
                            investment.id &&
                            payment.dayKey ===
                            today
                        );
                    }
                );

            if (
                alreadyPaid
            ) {
                return;
            }

            /*
               Ne pas verser le jour zéro.
            */

            const elapsed =
                Math.floor(
                    (
                        now.getTime() -
                        start.getTime()
                    ) /
                    (
                        24 *
                        60 *
                        60 *
                        1000
                    )
                );

            if (
                elapsed < 1
            ) {
                return;
            }

            payments.push({

                id:
                    "PAY-" +
                    Date.now() +
                    "-" +
                    Math.floor(
                        Math.random() *
                        10000
                    ),

                investmentId:
                    investment.id,

                userId:
                    investment.userId,

                amount:
                    Number(
                        investment.dailyGain
                    ),

                dayKey:
                    today,

                date:
                    new Date().toISOString(),

                status:
                    "approved"

            });

            changed =
                true;

        }
    );

    if (changed) {

        saveInvestments(
            investments
        );

        saveInvestmentPayments(
            payments
        );
    }
}


/* =========================================
   TOTAL DES GAINS ENREGISTRES
========================================= */

function getCurrentUserPaidGains() {

    const userId =
        getUserIdentifier();

    if (!userId) {
        return 0;
    }

    return getInvestmentPayments()
        .filter(
            function(payment) {

                return (
                    payment.userId ===
                    userId &&
                    payment.status ===
                    "approved"
                );

            }
        )
        .reduce(
            function(total, payment) {

                return (
                    total +
                    Number(
                        payment.amount
                    )
                );

            },
            0
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
        !Number.isFinite(
            balance
        )
    ) {
        balance = 0;
    }

    /*
       Dépôts validés
    */

    getCurrentUserTransactions()
        .forEach(
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

                    balance +=
                        Number(
                            transaction.netAmount
                        ) ||
                        amount;
                }

                if (
                    transaction.type ===
                    "withdrawal"
                ) {

                    balance -=
                        amount;
                }

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
       Gains réellement enregistrés.
       Ils ne sont jamais recalculés
       simplement parce que la page est
       rechargée.
    */

    balance +=
        getCurrentUserPaidGains();

    return Math.max(
        0,
        Math.round(
            balance
        )
    );
}


/* =========================================
   AFFICHAGE SOLDE
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
                    formatFCFA(
                        balance
                    );
            }
        );
}


/* =========================================
   AFFICHAGE HISTORIQUE
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

    const payments =
        getInvestmentPayments()
            .filter(
                function(payment) {

                    return (
                        payment.userId ===
                        getUserIdentifier()
                    );
                }
            );

    if (
        transactions.length === 0 &&
        payments.length === 0
    ) {

        container.innerHTML =
            "<p>Aucune opération pour le moment.</p>";

        return;
    }

    let html = "";

    transactions.forEach(
        function(transaction) {

            html += `
                <div class="transaction-item">

                    <strong>
                        ${transaction.type === "deposit"
                            ? "Dépôt"
                            : transaction.type === "withdrawal"
                            ? "Retrait"
                            : "Investissement"}
                    </strong>

                    <div>
                        Montant :
                        ${formatFCFA(
                            transaction.amount
                        )}
                    </div>

                    ${
                        transaction.type ===
                        "deposit" ||
                        transaction.type ===
                        "withdrawal"
                            ? `
                                <div>
                                    Frais :
                                    ${formatFCFA(
                                        transaction.fee
                                    )}
                                </div>
                              `
                            : ""
                    }

                    <div>
                        Statut :
                        ${
                            transaction.status ===
                            "approved"
                                ? "Validé"
                                : transaction.status ===
                                  "rejected"
                                ? "Refusé"
                                : "En attente"
                        }
                    </div>

                </div>
            `;
        }
    );

    payments.forEach(
        function(payment) {

            html += `
                <div class="transaction-item">

                    <strong>
                        Gain d'investissement
                    </strong>

                    <div>
                        Montant :
                        ${formatFCFA(
                            payment.amount
                        )}
                    </div>

                    <div>
                        Date :
                        ${new Date(
                            payment.date
                        ).toLocaleDateString(
                            "fr-FR"
                        )}
                    </div>

                    <div>
                        Statut :
                        Validé
                    </div>

                </div>
            `;
        }
    );

    container.innerHTML =
        html;
}


/* =========================================
   AFFICHAGE INVESTISSEMENTS
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
        investments.length === 0
    ) {

        container.innerHTML =
            "<p>Aucun investissement.</p>";

        return;
    }

    container.innerHTML =
        "";

    investments.forEach(
        function(investment) {

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

            let days = 0;

            if (
                now > start
            ) {

                days =
                    Math.floor(
                        (
                            now.getTime() -
                            start.getTime()
                        ) /
                        (
                            24 *
                            60 *
                            60 *
                            1000
                        )
                    );
            }

            days =
                Math.min(
                    180,
                    Math.max(
                        0,
                        days
                    )
                );

            const status =
                now >= end
                    ? "Terminé"
                    : "Actif";

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
                    Progression :
                    ${days} / 180 jours
                </p>

                <p>
                    Début :
                    ${start.toLocaleDateString(
                        "fr-FR"
                    )}
                </p>

                <p>
                    Fin :
                    ${end.toLocaleDateString(
                        "fr-FR"
                    )}
                </p>

                <p>
                    Statut :
                    <strong>
                        ${status}
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
   MISE A JOUR
========================================= */

function updateDashboardData() {

    /*
       Enregistre uniquement les gains
       qui doivent réellement être créés
       aujourd'hui.
    */

    processDailyInvestmentPayments();

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

            if (
                requestDeposit(
                    input.value
                )
            ) {

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

            if (
                requestWithdrawal(
                    input.value
                )
            ) {

                form.reset();
            }
        }
    );
}


/* =========================================
   BOUTONS PACKS
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
