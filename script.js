const transaction = JSON.parse(localStorage.getItem("transaction")) || [];

const formatter = new Intl.NumberFormat("es-PE", {
    style: 'currency',
    currency: 'PEN',
    signDisplay: 'always',
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionPlus");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

function updateTotal() {
    const incomeTotal = transaction
        .filter(trx => trx.type === "income")
        .reduce((total, trx) => total + trx.amount, 0);
    const expenseTotal = transaction
        .filter(trx => trx.type === "expense")
        .reduce((total, trx) => total + trx.amount, 0);
    const balanceTotal = incomeTotal - expenseTotal;
    balance.textContent = formatter.format(balanceTotal);
    incomeElement.textContent = formatter.format(incomeTotal);
    expenseElement.textContent = formatter.format(-expenseTotal);
}

function renderList() {
    list.innerHTML = "";
    if (transaction.length === 0) {
        status.textContent = "Sin transacciones.";
        return;
    }

    transaction.forEach(({ id, name, amount, date, type }) => {
        const li = document.createElement('li');

        li.innerHTML = `
        <div class="name">
            <h4>${name}</h4>
            <p>${new Date(date).toLocaleDateString("es-PE", {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })}</p>
        </div>

        <div class="amount ${type}">
            <span>${formatter.format(type === "expense" ? -amount : amount)}</span>
        </div>

        <div class="action">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="800px" width="800px" version="1.1" id="Layer_1" viewBox="0 0 496.158 496.158" xml:space="preserve" onclick="deleteTransaction(${id})">
                <path style="fill:#E04F5F;" d="M0,248.085C0,111.063,111.069,0.003,248.075,0.003c137.013,0,248.083,111.061,248.083,248.082  c0,137.002-111.07,248.07-248.083,248.07C111.069,496.155,0,385.087,0,248.085z"/>
                <path style="fill:#FFFFFF;" d="M383.546,206.286H112.612c-3.976,0-7.199,3.225-7.199,7.2v69.187c0,3.976,3.224,7.199,7.199,7.199  h270.934c3.976,0,7.199-3.224,7.199-7.199v-69.187C390.745,209.511,387.521,206.286,383.546,206.286z"/>
            </svg>
        </div>
        `;

        list.appendChild(li);
    });
}

function deleteTransaction(id) {
    const confirmDelete = confirm("¿Quiere borrar el elemento?");
    if (confirmDelete) {
        const index = transaction.findIndex(trx => trx.id === id);
        if (index !== -1) {
            transaction.splice(index, 1);
            alert("Transacción eliminada correctamente.");
            updateTotal();
            saveTransactions();
            renderList();
        } else {
            alert("Transacción no encontrada.");
        }
    } else {
        alert("La transacción no se ha eliminado.");
    }
}

function addTransaction(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const newTransaction = {
        id: transaction.length + 1,
        name: formData.get("name"),
        amount: parseFloat(formData.get("amount")),
        date: new Date(formData.get("date")),
        type: formData.get("type") === "on" ? "income" : "expense",
    };

    const incomeTotal = transaction
        .filter(trx => trx.type === "income")
        .reduce((total, trx) => total + trx.amount, 0);
    const expenseTotal = transaction
        .filter(trx => trx.type === "expense")
        .reduce((total, trx) => total + trx.amount, 0);

    if (newTransaction.type === "expense" && expenseTotal + newTransaction.amount > incomeTotal) {
        alert("No se puede agregar esta transacción. Los gastos superan los ingresos.");
        return;
    }

    transaction.push(newTransaction);

    e.target.reset();
    updateTotal();
    saveTransactions();
    renderList();
}

function saveTransactions() {
    transaction.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem("transaction", JSON.stringify(transaction));
}

updateTotal();
renderList();
