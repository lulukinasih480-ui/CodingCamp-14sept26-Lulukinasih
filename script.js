/* ========================================
   EXPENSE & BUDGET VISUALIZER
======================================== */


/* ========================================
   GET HTML ELEMENTS
======================================== */

const transactionForm = document.getElementById("transactionForm");

const itemNameInput = document.getElementById("itemName");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

const transactionList = document.getElementById("transactionList");
const emptyMessage = document.getElementById("emptyMessage");

const totalBalance = document.getElementById("totalBalance");

const spendingLimitInput = document.getElementById("spendingLimit");
const limitWarning = document.getElementById("limitWarning");

const sortTransactions = document.getElementById("sortTransactions");

const themeToggle = document.getElementById("themeToggle");

const chartCanvas = document.getElementById("expenseChart");


/* ========================================
   DATA
======================================== */

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

let spendingLimit = Number(
    localStorage.getItem("spendingLimit")
) || 0;

let expenseChart = null;


/* ========================================
   SAVE TRANSACTIONS
======================================== */

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


/* ========================================
   SAVE SPENDING LIMIT
======================================== */

function saveSpendingLimit() {

    localStorage.setItem(
        "spendingLimit",
        spendingLimit
    );

}


/* ========================================
   FORMAT CURRENCY
======================================== */

function formatCurrency(amount) {

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        maximumFractionDigits: 0

    }).format(amount);

}


/* ========================================
   CALCULATE TOTAL
======================================== */

function calculateTotal() {

    return transactions.reduce(
        (total, transaction) => {

            return total + transaction.amount;

        },
        0
    );

}


/* ========================================
   UPDATE TOTAL BALANCE
======================================== */

function updateTotalBalance() {

    const total = calculateTotal();

    totalBalance.textContent =
        formatCurrency(total);

    checkSpendingLimit();

}


/* ========================================
   CHECK SPENDING LIMIT
======================================== */

function checkSpendingLimit() {

    const total = calculateTotal();

    if (
        spendingLimit > 0 &&
        total > spendingLimit
    ) {

        limitWarning.textContent =
            `⚠️ Your spending has exceeded the limit of ${formatCurrency(spendingLimit)}.`;

        limitWarning.classList.add("show");

    }

    else if (spendingLimit > 0) {

        const remaining =
            spendingLimit - total;

        limitWarning.textContent =
            `You have ${formatCurrency(remaining)} remaining from your spending limit.`;

        limitWarning.classList.add("show");

    }

    else {

        limitWarning.textContent = "";

        limitWarning.classList.remove("show");

    }

}


/* ========================================
   DISPLAY TRANSACTIONS
======================================== */

function displayTransactions() {

    /* Remove old transaction items */

    const transactionItems =
        document.querySelectorAll(".transaction-item");

    transactionItems.forEach(item => {

        item.remove();

    });


    /* Empty state */

    if (transactions.length === 0) {

        emptyMessage.style.display = "block";

        return;

    }

    emptyMessage.style.display = "none";


    /* Create transaction items */

    transactions.forEach(transaction => {

        const transactionItem =
            document.createElement("div");

        transactionItem.className =
            "transaction-item";


        /* Transaction information */

        const transactionInfo =
            document.createElement("div");

        transactionInfo.className =
            "transaction-info";


        const transactionName =
            document.createElement("div");

        transactionName.className =
            "transaction-name";

        transactionName.textContent =
            transaction.name;


        const transactionCategory =
            document.createElement("div");

        transactionCategory.className =
            "transaction-category";

        transactionCategory.textContent =
            transaction.category;


        transactionInfo.appendChild(
            transactionName
        );

        transactionInfo.appendChild(
            transactionCategory
        );


        /* Right side */

        const transactionRight =
            document.createElement("div");

        transactionRight.className =
            "transaction-right";


        /* Amount */

        const transactionAmount =
            document.createElement("span");

        transactionAmount.className =
            "transaction-amount";

        transactionAmount.textContent =
            formatCurrency(transaction.amount);


        /* Delete button */

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-button";

        deleteButton.type = "button";

        deleteButton.textContent = "🗑️";

        deleteButton.title =
            "Delete transaction";


        deleteButton.addEventListener(
            "click",
            function () {

                deleteTransaction(
                    transaction.id
                );

            }
        );


        /* Combine */

        transactionRight.appendChild(
            transactionAmount
        );

        transactionRight.appendChild(
            deleteButton
        );


        transactionItem.appendChild(
            transactionInfo
        );

        transactionItem.appendChild(
            transactionRight
        );


        transactionList.appendChild(
            transactionItem
        );

    });

}


/* ========================================
   ADD TRANSACTION
======================================== */

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /* Get input values */

        const name =
            itemNameInput.value.trim();

        const amount =
            Number(amountInput.value);

        const category =
            categoryInput.value;


        /* Validation */

        if (
            name === "" ||
            amount <= 0 ||
            category === ""
        ) {

            alert(
                "Please fill in all fields correctly."
            );

            return;

        }


        /* Create transaction */

        const newTransaction = {

            id: Date.now(),

            name: name,

            amount: amount,

            category: category

        };


        /* Add transaction */

        transactions.push(
            newTransaction
        );


        /* Save */

        saveTransactions();


        /* Update page */

        displayTransactions();

        updateTotalBalance();

        updateChart();


        /* Reset form */

        transactionForm.reset();

    }
);


/* ========================================
   DELETE TRANSACTION
======================================== */

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    displayTransactions();

    updateTotalBalance();

    updateChart();

}


/* ========================================
   SPENDING LIMIT
======================================== */

spendingLimitInput.value =
    spendingLimit > 0
        ? spendingLimit
        : "";


spendingLimitInput.addEventListener(
    "input",
    function () {

        spendingLimit =
            Number(
                spendingLimitInput.value
            ) || 0;

        saveSpendingLimit();

        checkSpendingLimit();

    }
);


/* ========================================
   SORT TRANSACTIONS
======================================== */

sortTransactions.addEventListener(
    "change",
    function () {

        const sortType =
            sortTransactions.value;


        if (sortType === "highest") {

            transactions.sort(
                (a, b) =>
                    b.amount - a.amount
            );

        }

        else if (sortType === "lowest") {

            transactions.sort(
                (a, b) =>
                    a.amount - b.amount
            );

        }

        else {

            transactions.sort(
                (a, b) =>
                    b.id - a.id
            );

        }


        displayTransactions();

    }
);


/* ========================================
   UPDATE PIE CHART
======================================== */

function updateChart() {

    /* Check Chart.js */

    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js could not be loaded."
        );

        return;

    }


    /* Calculate category totals */

    const foodTotal =
        transactions
            .filter(
                transaction =>
                    transaction.category === "Food"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    const transportTotal =
        transactions
            .filter(
                transaction =>
                    transaction.category === "Transport"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    const funTotal =
        transactions
            .filter(
                transaction =>
                    transaction.category === "Fun"
            )
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );


    const chartData = [

        foodTotal,

        transportTotal,

        funTotal

    ];


    /* Destroy old chart */

    if (expenseChart !== null) {

        expenseChart.destroy();

    }


    /* Create new chart */

    expenseChart = new Chart(
        chartCanvas,
        {

            type: "pie",

            data: {

                labels: [
                    "Food",
                    "Transport",
                    "Fun"
                ],

                datasets: [

                    {
                        data: chartData
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        }
    );

}


/* ========================================
   DARK / LIGHT MODE
======================================== */

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.textContent = "☀️";

}


/* Theme button */

themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark-mode"
        );


        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        if (isDark) {

            themeToggle.textContent = "☀️";

            localStorage.setItem(
                "theme",
                "dark"
            );

        }

        else {

            themeToggle.textContent = "🌙";

            localStorage.setItem(
                "theme",
                "light"
            );

        }

    }
);


/* ========================================
   INITIAL DISPLAY
======================================== */

displayTransactions();

updateTotalBalance();

updateChart();