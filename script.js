/* =========================================================
   HOUSING INVESTMENT
   SCRIPT PRINCIPAL — SUPABASE
   ========================================================= */

/* =========================================================
   CONFIGURATION SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://scnuphudlhqiadyavknt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_SQ6iUFoLHRsPMYE41Z8XtQ_pgaF3O5L";


/* =========================================================
   INITIALISATION
========================================================= */

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;


/* =========================================================
   CHARGEMENT SUPABASE
========================================================= */

function loadSupabase(){

    if(typeof window.supabase === "undefined"){

        console.error(
            "Supabase JS n'est pas chargé."
        );

        return false;
    }

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    return true;
}


/* =========================================================
   OUTILS
========================================================= */

function formatFCFA(amount){

    return Number(amount || 0)
        .toLocaleString("fr-FR")
        + " FCFA";
}


function escapeHtml(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =========================================================
   UTILISATEUR CONNECTÉ
========================================================= */

async function getCurrentUser(){

    if(!supabaseClient){

        return null;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if(error || !data.user){

        return null;
    }


    currentUser = data.user;

    return data.user;
}


/* =========================================================
   PROFIL
========================================================= */

async function loadProfile(){

    const user =
        await getCurrentUser();


    if(!user){

        window.location.href =
            "login.html";

        return null;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id",user.id)
        .single();


    if(error){

        console.error(
            "Erreur profil :",
            error
        );

        return null;
    }


    currentProfile = data;

    return data;
}


/* =========================================================
   AFFICHAGE PROFIL
========================================================= */

function displayUserProfile(){

    if(!currentProfile){

        return;
    }


    const name =
        currentProfile.full_name ||
        "Utilisateur";


    const phone =
        currentProfile.phone ||
        "—";


    const userName =
        document.getElementById(
            "userName"
        );


    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );


    const profilePhone =
        document.getElementById(
            "profilePhone"
        );


    const avatar =
        document.getElementById(
            "avatar"
        );


    if(userName){

        userName.textContent =
            name;
    }


    if(welcomeName){

        welcomeName.textContent =
            name;
    }


    if(profileName){

        profileName.textContent =
            name;
    }


    if(profilePhone){

        profilePhone.textContent =
            phone;
    }


    if(avatar){

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();
    }
}


/* =========================================================
   SOLDE
========================================================= */

function displayBalance(){

    if(!currentProfile){

        return;
    }


    const balance =
        Number(
            currentProfile.balance || 0
        );


    const element =
        document.getElementById(
            "balance"
        );


    if(element){

        element.textContent =
            formatFCFA(balance);
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageId,button){

    document
        .querySelectorAll(".page")
        .forEach(function(page){

            page.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(".menu")
        .forEach(function(btn){

            btn.classList.remove(
                "active"
            );

        });


    const page =
        document.getElementById(
            pageId
        );


    if(page){

        page.classList.add(
            "active"
        );
    }


    if(button){

        button.classList.add(
            "active"
        );
    }


    if(pageId === "investments"){

        loadInvestments();
    }


    if(pageId === "transactions"){

        loadTransactions();
    }


    if(pageId === "home"){

        updateDashboard();
    }
}


/* =========================================================
   INVESTISSEMENTS
========================================================= */

async function loadInvestments(){

    if(!currentUser){

        return;
    }


    const container =
        document.getElementById(
            "investmentTable"
        );


    if(!container){

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("investments")
        .select("*")
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(error){

        console.error(error);

        container.innerHTML = `

            <div class="empty">

                Impossible de charger
                les investissements.

            </div>

        `;

        return;
    }


    if(!data || data.length === 0){

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    📊
                </div>

                Aucun investissement actif.

            </div>

        `;

        return;
    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>Pack</th>

                    <th>Montant</th>

                    <th>Gain/jour</th>

                    <th>Durée</th>

                    <th>Total</th>

                    <th>Statut</th>

                </tr>

            </thead>

            <tbody>

    `;


    data.forEach(function(item){

        html += `

            <tr>

                <td>
                    ${escapeHtml(
                        item.pack_name
                    )}
                </td>

                <td>
                    ${formatFCFA(
                        item.amount
                    )}
                </td>

                <td>
                    ${formatFCFA(
                        item.daily_gain
                    )}
                </td>

                <td>
                    ${item.duration_days}
                    jours
                </td>

                <td>
                    ${formatFCFA(
                        item.total_expected
                    )}
                </td>

                <td>

                    <span class="badge green">

                        ${escapeHtml(
                            item.status
                        )}

                    </span>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML =
        html;
}


/* =========================================================
   INVESTIR
========================================================= */

async function invest(
    pack,
    amount,
    daily
){

    if(!currentUser){

        alert(
            "Votre session a expiré."
        );

        window.location.href =
            "login.html";

        return;
    }


    if(!currentProfile){

        await loadProfile();
    }


    const balance =
        Number(
            currentProfile?.balance || 0
        );


    amount =
        Number(amount);

    daily =
        Number(daily);


    if(balance < amount){

        alert(
            "Votre solde est insuffisant. Veuillez effectuer un dépôt."
        );

        openDeposit();

        return;
    }


    const confirmation =
        confirm(
            "Confirmer votre investissement de "
            + formatFCFA(amount)
            + " dans "
            + pack
            + " ?"
        );


    if(!confirmation){

        return;
    }


    const duration =
        180;


    const total =
        daily * duration;


    const newBalance =
        balance - amount;


    /* -----------------------------------------
       Création investissement
    ----------------------------------------- */

    const {
        data:investment,
        error:investmentError
    } = await supabaseClient
        .from("investments")
        .insert({

            user_id:
                currentUser.id,

            pack_name:
                pack,

            amount:
                amount,

            daily_gain:
                daily,

            duration_days:
                duration,

            total_expected:
                total,

            status:
                "active"

        })
        .select()
        .single();


    if(investmentError){

        console.error(
            investmentError
        );

        alert(
            "Impossible d'enregistrer l'investissement."
        );

        return;
    }


    /* -----------------------------------------
       Mise à jour du solde
    ----------------------------------------- */

    const {
        error:balanceError
    } = await supabaseClient
        .from("profiles")
        .update({

            balance:
                newBalance,

            total_invested:
                Number(
                    currentProfile.total_invested || 0
                ) + amount,

            updated_at:
                new Date().toISOString()

        })
        .eq(
            "id",
            currentUser.id
        );


    if(balanceError){

        console.error(
            balanceError
        );

        alert(
            "L'investissement a été créé mais la mise à jour du solde a échoué. Contactez l'administration."
        );

        return;
    }


    /* -----------------------------------------
       Historique
    ----------------------------------------- */

    await supabaseClient
        .from("transactions")
        .insert({

            user_id:
                currentUser.id,

            type:
                "investment",

            amount:
                amount,

            description:
                "Investissement " + pack,

            reference_id:
                investment.id

        });


    /* -----------------------------------------
       Notification
    ----------------------------------------- */

    await createNotification(

        "Investissement confirmé",

        "Votre investissement "
        + pack
        + " de "
        + formatFCFA(amount)
        + " a été enregistré.",

        "investment"

    );


    currentProfile.balance =
        newBalance;


    currentProfile.total_invested =
        Number(
            currentProfile.total_invested || 0
        ) + amount;


    displayBalance();

    updateDashboard();


    alert(
        "Investissement enregistré avec succès."
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

async function updateDashboard(){

    if(!currentUser){

        return;
    }


    if(!currentProfile){

        await loadProfile();
    }


    displayBalance();


    const {
        data,
        error
    } = await supabaseClient
        .from("investments")
        .select(
            "amount,daily_gain,status"
        )
        .eq(
            "user_id",
            currentUser.id
        );


    if(error){

        console.error(error);

        return;
    }


    let totalInvested = 0;

    let dailyGain = 0;

    let activeCount = 0;


    (data || []).forEach(
        function(item){

            if(
                item.status === "active"
            ){

                totalInvested +=
                    Number(
                        item.amount || 0
                    );

                dailyGain +=
                    Number(
                        item.daily_gain || 0
                    );

                activeCount++;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "totalInvested"
        );


    const dailyElement =
        document.getElementById(
            "dailyGain"
        );


    const activeElement =
        document.getElementById(
            "activeInvestments"
        );


    if(totalElement){

        totalElement.textContent =
            formatFCFA(
                totalInvested
            );
    }


    if(dailyElement){

        dailyElement.textContent =
            formatFCFA(
                dailyGain
            );
    }


    if(activeElement){

        activeElement.textContent =
            activeCount;
    }
}


/* =========================================================
   DEPOT
========================================================= */

function openDeposit(){

    const modal =
        document.getElementById(
            "depositModal"
        );


    if(modal){

        modal.classList.add(
            "show"
        );
    }
}


function closeDeposit(){

    const modal =
        document.getElementById(
            "depositModal"
        );


    if(modal){

        modal.classList.remove(
            "show"
        );
    }
}


async function confirmDeposit(){

    if(!currentUser){

        return;
    }


    const amount =
        Number(
            document.getElementById(
                "depositAmount"
            )?.value
        );


    const method =
        document.getElementById(
            "depositMethod"
        )?.value;


    if(!amount || amount <= 0){

        alert(
            "Veuillez entrer un montant valide."
        );

        return;
    }


    if(!method){

        alert(
            "Veuillez choisir un moyen de paiement."
        );

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("deposits")
        .insert({

            user_id:
                currentUser.id,

            amount:
                amount,

            method:
                method,

            status:
                "pending"

        });


    if(error){

        console.error(error);

        alert(
            "Impossible d'enregistrer le dépôt."
        );

        return;
    }


    await createNotification(

        "Dépôt enregistré",

        "Votre demande de dépôt de "
        + formatFCFA(amount)
        + " est en attente de validation.",

        "deposit"

    );


    document.getElementById(
        "depositAmount"
    ).value = "";


    document.getElementById(
        "depositMethod"
    ).value = "";


    closeDeposit();


    alert(
        "Votre demande de dépôt a été enregistrée."
    );


    loadTransactions();
}


/* =========================================================
   RETRAIT
========================================================= */

function openWithdraw(){

    const modal =
        document.getElementById(
            "withdrawModal"
        );


    if(modal){

        modal.classList.add(
            "show"
        );
    }
}


function closeWithdraw(){

    const modal =
        document.getElementById(
            "withdrawModal"
        );


    if(modal){

        modal.classList.remove(
            "show"
        );
    }
}


async function confirmWithdraw(){

    if(!currentUser){

        return;
    }


    if(!currentProfile){

        await loadProfile();
    }


    const amount =
        Number(
            document.getElementById(
                "withdrawAmount"
            )?.value
        );


    const destination =
        document.getElementById(
            "withdrawPhone"
        )?.value.trim();


    const balance =
        Number(
            currentProfile?.balance || 0
        );


    if(!amount || amount <= 0){

        alert(
            "Veuillez entrer un montant valide."
        );

        return;
    }


    if(amount > balance){

        alert(
            "Votre solde disponible est insuffisant."
        );

        return;
    }


    if(!destination){

        alert(
            "Veuillez entrer le numéro de réception."
        );

        return;
    }


    /* Frais de retrait : 25 % */

    const fee =
        amount * 0.25;


    const netAmount =
        amount - fee;


    const {
        error
    } = await supabaseClient
        .from("withdrawals")
        .insert({

            user_id:
                currentUser.id,

            amount:
                amount,

            fee:
                fee,

            net_amount:
                netAmount,

            destination:
                destination,

            status:
                "pending"

        });


    if(error){

        console.error(error);

        alert(
            "Impossible d'enregistrer la demande de retrait."
        );

        return;
    }


    await createNotification(

        "Retrait demandé",

        "Votre demande de retrait de "
        + formatFCFA(amount)
        + " a été enregistrée.",

        "withdrawal"

    );


    document.getElementById(
        "withdrawAmount"
    ).value = "";


    document.getElementById(
        "withdrawPhone"
    ).value = "";


    closeWithdraw();


    alert(
        "Votre demande de retrait a été enregistrée."
    );


    loadTransactions();
}


/* =========================================================
   HISTORIQUE
========================================================= */

async function loadTransactions(){

    if(!currentUser){

        return;
    }


    const container =
        document.getElementById(
            "transactionTable"
        );


    if(!container){

        return;
    }


    const {
        data:deposits
    } = await supabaseClient
        .from("deposits")
        .select("*")
        .eq(
            "user_id",
            currentUser.id
        );


    const {
        data:withdrawals
    } = await supabaseClient
        .from("withdrawals")
        .select("*")
        .eq(
            "user_id",
            currentUser.id
        );


    const transactions = [];


    (deposits || []).forEach(
        function(item){

            transactions.push({

                type:
                    "📥 Dépôt",

                amount:
                    item.amount,

                details:
                    item.method,

                date:
                    item.created_at,

                status:
                    item.status

            });

        }
    );


    (withdrawals || []).forEach(
        function(item){

            transactions.push({

                type:
                    "📤 Retrait",

                amount:
                    item.amount,

                details:
                    item.destination,

                date:
                    item.created_at,

                status:
                    item.status

            });

        }
    );


    transactions.sort(
        function(a,b){

            return new Date(b.date)
                - new Date(a.date);

        }
    );


    if(transactions.length === 0){

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    📋
                </div>

                Aucun historique disponible.

            </div>

        `;

        return;
    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>Type</th>

                    <th>Montant</th>

                    <th>Détails</th>

                    <th>Date</th>

                    <th>Statut</th>

                </tr>

            </thead>

            <tbody>

    `;


    transactions.forEach(
        function(item){

            html += `

                <tr>

                    <td>
                        ${escapeHtml(
                            item.type
                        )}
                    </td>

                    <td>
                        ${formatFCFA(
                            item.amount
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.details || "—"
                        )}
                    </td>

                    <td>
                        ${new Date(
                            item.date
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </td>

                    <td>

                        <span class="badge orange">

                            ${escapeHtml(
                                item.status
                            )}

                        </span>

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML =
        html;
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

async function createNotification(
    title,
    message,
    type = "info"
){

    if(!currentUser){

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("notifications")
        .insert({

            user_id:
                currentUser.id,

            title:
                title,

            message:
                message,

            type:
                type,

            is_read:
                false

        });


    if(error){

        console.error(
            "Notification error:",
            error
        );
    }
}


async function loadNotifications(){

    if(!currentUser){

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq(
            "user_id",
            currentUser.id
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(error){

        console.error(error);

        return;
    }


    const list =
        document.getElementById(
            "notificationList"
        );


    const count =
        document.getElementById(
            "notificationCount"
        );


    if(!list){

        return;
    }


    if(!data || data.length === 0){

        list.innerHTML = `

            <div class="no-notification">

                🔔<br><br>

                Aucune notification.

            </div>

        `;


        if(count){

            count.style.display =
                "none";
        }

        return;
    }


    const unread =
        data.filter(
            item => !item.is_read
        ).length;


    if(count){

        if(unread > 0){

            count.textContent =
                unread > 99
                    ? "99+"
                    : unread;

            count.style.display =
                "flex";

        }else{

            count.style.display =
                "none";

        }
    }


    let html = "";


    data.forEach(
        function(item){

            html += `

                <div
                    class="notification-item
                    ${item.is_read ? "" : "unread"}"
                    onclick="readNotification('${item.id}')">

                    <strong>
                        ${escapeHtml(
                            item.title
                        )}
                    </strong>

                    <div>
                        ${escapeHtml(
                            item.message
                        )}
                    </div>

                    <small>
                        ${new Date(
                            item.created_at
                        ).toLocaleString(
                            "fr-FR"
                        )}
                    </small>

                </div>

            `;

        }
    );


    list.innerHTML =
        html;
}


async function readNotification(id){

    if(!currentUser){

        return;
    }


    await supabaseClient
        .from("notifications")
        .update({
            is_read:true
        })
        .eq(
            "id",
            id
        )
        .eq(
            "user_id",
            currentUser.id
        );


    loadNotifications();
}


async function clearNotifications(){

    if(!currentUser){

        return;
    }


    await supabaseClient
        .from("notifications")
        .update({
            is_read:true
        })
        .eq(
            "user_id",
            currentUser.id
        );


    loadNotifications();
}


function toggleNotifications(){

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if(panel){

        panel.classList.toggle(
            "open"
        );
    }
}


/* =========================================================
   DECONNEXION
========================================================= */

async function logout(){

    if(supabaseClient){

        await supabaseClient.auth.signOut();
    }


    currentUser = null;

    currentProfile = null;


    window.location.href =
        "login.html";
}


/* =========================================================
   INITIALISATION DASHBOARD
========================================================= */

async function initializeDashboard(){

    const ready =
        loadSupabase();


    if(!ready){

        return;
    }


    const user =
        await getCurrentUser();


    if(!user){

        window.location.href =
            "login.html";

        return;
    }


    await loadProfile();


    displayUserProfile();

    displayBalance();

    await updateDashboard();

    await loadInvestments();

    await loadTransactions();

    await loadNotifications();
}


/* =========================================================
   DEMARRAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeDashboard();

    }
);


/* =========================================================
   ACTUALISATION
========================================================= */

setInterval(
    async function(){

        if(!currentUser){

            return;
        }


        await loadProfile();

        displayUserProfile();

        displayBalance();

        await updateDashboard();

        await loadNotifications();

    },
    10000
);
