/* =========================================================
   HOUSING INVESTMENT
   SCRIPT CENTRAL
   ========================================================= */


/* =========================================================
   OUTILS
   ========================================================= */

function getJSON(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Erreur :", key, error);
        return fallback;
    }
}


function saveJSON(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


function formatFCFA(amount) {
    return Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
}


function today() {
    return new Date().toLocaleDateString("fr-FR");
}


/* =========================================================
   UTILISATEUR CONNECTÉ
   ========================================================= */

function getCurrentUser() {

    return (
        getJSON("currentUser", null) ||
        getJSON("loggedInUser", null) ||
        getJSON("user", null)
    );
}


function saveCurrentUser(user) {

    if (!user) return;

    saveJSON("currentUser", user);
    saveJSON("loggedInUser", user);
    saveJSON("user", user);
}


/* =========================================================
   UTILISATEURS
   ========================================================= */

function getUsers() {
    return getJSON("users", []);
}


function saveUsers(users) {
    saveJSON("users", users);
}


function getUserPhone(user) {

    if (!user) return "";

    return String(
        user.phone ||
        user.telephone ||
        user.phoneNumber ||
        ""
    );
}


function getUserName(user) {

    if (!user) return "Utilisateur";

    return (
        user.name ||
        user.fullName ||
        user.nom ||
        user.username ||
        "Utilisateur"
    );
}


/* =========================================================
   RECHERCHE UTILISATEUR
   ========================================================= */

function findUserByPhone(phone) {

    const users = getUsers();

    return users.find(user => {

        return getUserPhone(user) === String(phone).trim();

    });

}


/* =========================================================
   MISE A JOUR UTILISATEUR
   ========================================================= */

function updateUser(user) {

    if (!user) return;

    const users = getUsers();

    const phone = getUserPhone(user);

    const index = users.findIndex(item => {

        return getUserPhone(item) === phone;

    });


    if (index !== -1) {

        users[index] = {
            ...users[index],
            ...user
        };

    } else {

        users.push(user);

    }


    saveUsers(users);
    saveCurrentUser(user);

}


/* =========================================================
   INSCRIPTION
   ========================================================= */

function registerUser(data) {

    const users = getUsers();

    const phone =
        String(
            data.phone ||
            data.telephone ||
            data.phoneNumber ||
            ""
        ).trim();


    if (!phone) {

        return {
            success: false,
            message: "Le numéro de téléphone est obligatoire."
        };

    }


    const existing = users.find(user => {

        return getUserPhone(user) === phone;

    });


    if (existing) {

        return {
            success: false,
            message: "Ce numéro est déjà enregistré."
        };

    }


    const user = {

        id:
            "USR-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 10000),

        name:
            data.name ||
            data.fullName ||
            data.nom ||
            "",

        phone: phone,

        password:
            data.password ||
            "",

        invitationCode:
            data.invitationCode ||
            "",

        balance: 0,

        totalInvested: 0,

        totalGains: 0,

        createdAt: today(),

        status: "active"

    };


    users.push(user);

    saveUsers(users);
    saveCurrentUser(user);


    return {
        success: true,
        user: user
    };

}


/* =========================================================
   CONNEXION
   ========================================================= */

function loginUser(phone, password) {

    const users = getUsers();

    const user = users.find(item => {

        return (
            getUserPhone(item) === String(phone).trim() &&
            String(item.password || "") === String(password)
        );

    });


    if (!user) {

        return {
            success: false,
            message: "Numéro ou mot de passe incorrect."
        };

    }


    saveCurrentUser(user);


    return {
        success: true,
        user: user
    };

}


/* =========================================================
   DECONNEXION
   ========================================================= */

function logoutUser() {

    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}


/* =========================================================
   PACKS
   ========================================================= */

const PACKS = {

    3000: {
        name: "Starter",
        amount: 3000,
        dailyGain: 800,
        duration: 180,
        total: 144000
    },

    10000: {
        name: "Familial",
        amount: 10000,
        dailyGain: 3000,
        duration: 180,
        total: 540000
    },

    20000: {
        name: "Confort",
        amount: 20000,
        dailyGain: 6000,
        duration: 180,
        total: 1080000
    },

    45000: {
        name: "Villa",
        amount: 45000,
        dailyGain: 14000,
        duration: 180,
        total: 2520000
    },

    100000: {
        name: "Premium",
        amount: 100000,
        dailyGain: 30000,
        duration: 180,
        total: 5400000
    },

    200000: {
        name: "Prestige",
        amount: 200000,
        dailyGain: 65000,
        duration: 180,
        total: 11700000
    },

    400000: {
        name: "Excellence",
        amount: 400000,
        dailyGain: 140000,
        duration: 180,
        total: 25200000
    },

    800000: {
        name: "Luxe",
        amount: 800000,
        dailyGain: 290000,
        duration: 180,
        total: 52200000
    }

};


/* =========================================================
   INVESTISSEMENTS
   ========================================================= */

function getInvestments() {
    return getJSON("investments", []);
}


function saveInvestments(investments) {
    saveJSON("investments", investments);
}


/* =========================================================
   CALCUL DU SUIVI
   ========================================================= */

function calculateInvestmentProgress(investment) {

    const start =
        new Date(
            investment.createdAt ||
            new Date().toISOString()
        );

    const now =
        new Date();


    const difference =
        now.getTime() -
        start.getTime();


    const millisecondsPerDay =
        24 * 60 * 60 * 1000;


    let daysElapsed =
        Math.floor(
            difference /
            millisecondsPerDay
        );


    if (daysElapsed < 0) {
        daysElapsed = 0;
    }


    const duration =
        Number(
            investment.duration || 180
        );


    if (daysElapsed > duration) {
        daysElapsed = duration;
    }


    const dailyGain =
        Number(
            investment.dailyGain || 0
        );


    const earned =
        daysElapsed *
        dailyGain;


    const progress =
        duration > 0
        ? (daysElapsed / duration) * 100
        : 0;


    return {

        daysElapsed: daysElapsed,

        daysRemaining:
            Math.max(
                duration - daysElapsed,
                0
            ),

        earned: earned,

        progress:
            Math.min(
                progress,
                100
            ),

        completed:
            daysElapsed >= duration

    };

}


/* =========================================================
   ACTUALISATION DES INVESTISSEMENTS
   ========================================================= */

function updateInvestmentProgress() {

    const investments =
        getInvestments();


    let changed = false;


    investments.forEach(investment => {

        const progress =
            calculateInvestmentProgress(
                investment
            );


        const oldDays =
            Number(
                investment.elapsedDays || 0
            );


        const oldGain =
            Number(
                investment.gain || 0
            );


        if (
            oldDays !==
            progress.daysElapsed
        ) {

            investment.elapsedDays =
                progress.daysElapsed;

            changed = true;

        }


        if (
            oldGain !==
            progress.earned
        ) {

            investment.gain =
                progress.earned;

            changed = true;

        }


        investment.daysRemaining =
            progress.daysRemaining;

        investment.progress =
            progress.progress;


        if (progress.completed) {

            investment.status =
                "completed";

        } else {

            investment.status =
                "active";

        }

    });


    if (changed) {

        saveInvestments(
            investments
        );

    }


    return investments;

}


/* =========================================================
   CREATION INVESTISSEMENT
   ========================================================= */

function createInvestment(amount) {

    const user =
        getCurrentUser();


    if (!user) {

        return {
            success: false,
            message: "Vous devez être connecté."
        };

    }


    const pack =
        PACKS[Number(amount)];


    if (!pack) {

        return {
            success: false,
            message: "Pack d'investissement invalide."
        };

    }


    const balance =
        Number(
            user.balance || 0
        );


    if (balance < pack.amount) {

        return {
            success: false,
            message:
                "Solde insuffisant. Effectuez d'abord un dépôt."
        };

    }


    user.balance =
        balance -
        pack.amount;


    user.totalInvested =
        Number(
            user.totalInvested || 0
        ) +
        pack.amount;


    updateUser(user);


    const investments =
        getInvestments();


    const investment = {

        id:
            "INV-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 10000),

        userId:
            user.id || "",

        userName:
            getUserName(user),

        userPhone:
            getUserPhone(user),

        pack:
            pack.name,

        amount:
            pack.amount,

        dailyGain:
            pack.dailyGain,

        duration:
            pack.duration,

        total:
            pack.total,

        elapsedDays:
            0,

        daysRemaining:
            pack.duration,

        gain:
            0,

        progress:
            0,

        status:
            "active",

        date:
            today(),

        createdAt:
            new Date().toISOString()

    };


    investments.push(
        investment
    );

    saveInvestments(
        investments
    );


    addNotification(
        user.id,
        "Votre investissement " +
        pack.name +
        " a été enregistré.",
        "success"
    );


    return {
        success: true,
        investment: investment,
        user: user
    };

}


/* =========================================================
   MES INVESTISSEMENTS
   ========================================================= */

function getMyInvestments() {

    updateInvestmentProgress();


    const user =
        getCurrentUser();


    if (!user) return [];


    const phone =
        getUserPhone(user);


    const investments =
        getInvestments();


    return investments.filter(item => {

        return (
            item.userId === user.id ||
            item.userPhone === phone
        );

    });

}


/* =========================================================
   GAINS CUMULES
   ========================================================= */

function calculateTotalGains() {

    const investments =
        getMyInvestments();


    let total = 0;


    investments.forEach(item => {

        total +=
            Number(
                item.gain || 0
            );

    });


    return total;

}


/* =========================================================
   DEPOTS
   ========================================================= */

function getDeposits() {
    return getJSON("deposits", []);
}


function saveDeposits(deposits) {
    saveJSON("deposits", deposits);
}


/* =========================================================
   CREER DEPOT
   ========================================================= */

function createDeposit(
    amount,
    method = "Non précisé"
) {

    const user =
        getCurrentUser();


    if (!user) {

        return {
            success: false,
            message: "Vous devez être connecté."
        };

    }


    amount =
        Number(amount);


    if (!amount || amount <= 0) {

        return {
            success: false,
            message: "Montant de dépôt invalide."
        };

    }


    const deposits =
        getDeposits();


    const deposit = {

        id:
            "DEP-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 10000),

        userId:
            user.id || "",

        userName:
            getUserName(user),

        userPhone:
            getUserPhone(user),

        amount:
            amount,

        method:
            method,

        date:
            today(),

        status:
            "pending",

        createdAt:
            new Date().toISOString()

    };


    deposits.push(
        deposit
    );

    saveDeposits(
        deposits
    );


    addNotification(
        user.id,
        "Votre demande de dépôt est en attente de validation.",
        "info"
    );


    return {
        success: true,
        deposit: deposit
    };

}


/* =========================================================
   APPROUVER DEPOT
   ========================================================= */

function approveDeposit(
    depositId
) {

    const deposits =
        getDeposits();


    const index =
        deposits.findIndex(
            item =>
            item.id === depositId
        );


    if (index === -1) {

        return {
            success: false,
            message: "Dépôt introuvable."
        };

    }


    const deposit =
        deposits[index];


    if (
        deposit.status !==
        "pending"
    ) {

        return {
            success: false,
            message:
                "Cette opération a déjà été traitée."
        };

    }


    const users =
        getUsers();


    const userIndex =
        users.findIndex(user => {

            return (
                user.id === deposit.userId ||
                getUserPhone(user) ===
                deposit.userPhone
            );

        });


    if (userIndex === -1) {

        return {
            success: false,
            message:
                "Utilisateur introuvable."
        };

    }


    users[userIndex].balance =
        Number(
            users[userIndex].balance || 0
        ) +
        Number(
            deposit.amount || 0
        );


    deposit.status =
        "approved";


    deposit.approvedAt =
        new Date().toISOString();


    saveUsers(users);
    saveDeposits(deposits);


    addNotification(
        users[userIndex].id,
        "Votre dépôt de " +
        formatFCFA(deposit.amount) +
        " a été validé.",
        "success"
    );


    return {
        success: true,
        message:
            "Dépôt validé."
    };

}


/* =========================================================
   REFUSER DEPOT
   ========================================================= */

function rejectDeposit(
    depositId
) {

    const deposits =
        getDeposits();


    const index =
        deposits.findIndex(
            item =>
            item.id === depositId
        );


    if (index === -1) {

        return {
            success: false,
            message:
                "Dépôt introuvable."
        };

    }


    deposits[index].status =
        "rejected";


    deposits[index].rejectedAt =
        new Date().toISOString();


    saveDeposits(
        deposits
    );


    addNotification(
        deposits[index].userId,
        "Votre demande de dépôt a été refusée.",
        "error"
    );


    return {
        success: true,
        message:
            "Dépôt refusé."
    };

}


/* =========================================================
   RETRAITS
   ========================================================= */

function getWithdrawals() {
    return getJSON("withdrawals", []);
}


function saveWithdrawals(
    withdrawals
) {
    saveJSON(
        "withdrawals",
        withdrawals
    );
}


/* =========================================================
   CREER RETRAIT
   ========================================================= */

function createWithdrawal(
    amount,
    method = "Non précisé"
) {

    const user =
        getCurrentUser();


    if (!user) {

        return {
            success: false,
            message:
                "Vous devez être connecté."
        };

    }


    amount =
        Number(amount);


    if (!amount || amount <= 0) {

        return {
            success: false,
            message:
                "Montant invalide."
        };

    }


    const balance =
        Number(
            user.balance || 0
        );


    if (amount > balance) {

        return {
            success: false,
            message:
                "Solde insuffisant."
        };

    }


    const withdrawals =
        getWithdrawals();


    const withdrawal = {

        id:
            "RET-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 10000),

        userId:
            user.id || "",

        userName:
            getUserName(user),

        userPhone:
            getUserPhone(user),

        amount:
            amount,

        method:
            method,

        date:
            today(),

        status:
            "pending",

        createdAt:
            new Date().toISOString()

    };


    withdrawals.push(
        withdrawal
    );

    saveWithdrawals(
        withdrawals
    );


    addNotification(
        user.id,
        "Votre demande de retrait est en attente de validation.",
        "info"
    );


    return {
        success: true,
        withdrawal: withdrawal
    };

}


/* =========================================================
   APPROUVER RETRAIT
   ========================================================= */

function approveWithdrawal(
    withdrawalId
) {

    const withdrawals =
        getWithdrawals();


    const index =
        withdrawals.findIndex(
            item =>
            item.id === withdrawalId
        );


    if (index === -1) {

        return {
            success: false,
            message:
                "Retrait introuvable."
        };

    }


    const withdrawal =
        withdrawals[index];


    if (
        withdrawal.status !==
        "pending"
    ) {

        return {
            success: false,
            message:
                "Cette opération a déjà été traitée."
        };

    }


    const users =
        getUsers();


    const userIndex =
        users.findIndex(user => {

            return (
                user.id ===
                withdrawal.userId ||
                getUserPhone(user) ===
                withdrawal.userPhone
            );

        });


    if (userIndex === -1) {

        return {
            success: false,
            message:
                "Utilisateur introuvable."
        };

    }


    const user =
        users[userIndex];


    const balance =
        Number(
            user.balance || 0
        );


    if (
        balance <
        Number(
            withdrawal.amount || 0
        )
    ) {

        return {
            success: false,
            message:
                "Le solde de l'utilisateur est insuffisant."
        };

    }


    user.balance =
        balance -
        Number(
            withdrawal.amount || 0
        );


    withdrawal.status =
        "approved";


    withdrawal.approvedAt =
        new Date().toISOString();


    saveUsers(users);
    saveWithdrawals(
        withdrawals
    );


    addNotification(
        user.id,
        "Votre retrait de " +
        formatFCFA(withdrawal.amount) +
        " a été validé.",
        "success"
    );


    return {
        success: true,
        message:
            "Retrait validé."
    };

}


/* =========================================================
   REFUSER RETRAIT
   ========================================================= */

function rejectWithdrawal(
    withdrawalId
) {

    const withdrawals =
        getWithdrawals();


    const index =
        withdrawals.findIndex(
            item =>
            item.id === withdrawalId
        );


    if (index === -1) {

        return {
            success: false,
            message:
                "Retrait introuvable."
        };

    }


    withdrawals[index].status =
        "rejected";


    withdrawals[index].rejectedAt =
        new Date().toISOString();


    saveWithdrawals(
        withdrawals
    );


    addNotification(
        withdrawals[index].userId,
        "Votre demande de retrait a été refusée.",
        "error"
    );


    return {
        success: true,
        message:
            "Retrait refusé."
    };

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function getNotifications() {
    return getJSON(
        "notifications",
        []
    );
}


function saveNotifications(
    notifications
) {
    saveJSON(
        "notifications",
        notifications
    );
}


function addNotification(
    userId,
    message,
    type = "info"
) {

    if (!userId) return;


    const notifications =
        getNotifications();


    notifications.push({

        id:
            "NOTIF-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 10000
            ),

        userId:
            userId,

        message:
            message,

        type:
            type,

        read:
            false,

        date:
            new Date().toISOString()

    });


    saveNotifications(
        notifications
    );

}


/* =========================================================
   NOTIFICATIONS UTILISATEUR
   ========================================================= */

function getMyNotifications() {

    const user =
        getCurrentUser();


    if (!user) return [];


    return getNotifications()
        .filter(
            item =>
            item.userId === user.id
        )
        .reverse();

}


/* =========================================================
   EXPORT GLOBAL
   ========================================================= */

window.HousingInvestment = {

    getUsers,
    saveUsers,

    getCurrentUser,
    saveCurrentUser,

    registerUser,
    loginUser,
    logoutUser,

    updateUser,
    findUserByPhone,

    PACKS,

    getInvestments,
    saveInvestments,
    createInvestment,
    getMyInvestments,

    calculateInvestmentProgress,
    updateInvestmentProgress,
    calculateTotalGains,

    getDeposits,
    saveDeposits,
    createDeposit,
    approveDeposit,
    rejectDeposit,

    getWithdrawals,
    saveWithdrawals,
    createWithdrawal,
    approveWithdrawal,
    rejectWithdrawal,

    getNotifications,
    saveNotifications,
    addNotification,
    getMyNotifications,

    formatFCFA

};


/* =========================================================
   INITIALISATION
   ========================================================= */

updateInvestmentProgress();


console.log(
    "Housing Investment : script.js chargé."
);

console.log(
    "Utilisateurs :",
    getUsers().length
);

console.log(
    "Investissements :",
    getInvestments().length
);

console.log(
    "Dépôts :",
    getDeposits().length
);

console.log(
    "Retraits :",
    getWithdrawals().length
);
