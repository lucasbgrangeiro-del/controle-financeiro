/**
 * Main Application Logic (app.js)
 * Handles UI interactions, navigation, and rendering.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.module');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all navs and modules
            navItems.forEach(nav => nav.classList.remove('active'));
            modules.forEach(mod => mod.classList.remove('active'));

            // Add active to clicked nav
            item.classList.add('active');

            // Show corresponding module
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Update Title
            pageTitle.textContent = item.textContent.trim();
        });
    });

    // --- Theme Toggle Logic ---
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');
    const themeText = themeBtn.querySelector('span');

    // Check saved theme
    const savedTheme = localStorage.getItem('financeApp_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.replace('dark-theme', 'light-theme');
        updateThemeUI('light');
    }

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        if (isDark) {
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('financeApp_theme', 'light');
            updateThemeUI('light');
        } else {
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('financeApp_theme', 'dark');
            updateThemeUI('dark');
        }
    });

    function updateThemeUI(theme) {
        if (theme === 'light') {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            themeText.textContent = 'Tema Escuro';
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            themeText.textContent = 'Tema Claro';
        }
    }

    // --- Initial Dashboard Render ---
    renderDashboard();
    renderCards();
    renderCashFlow();

    // --- Modals Logic ---
    const backdrop = document.getElementById('modal-backdrop');
    const modals = document.querySelectorAll('.modal');
    const btnCloseModals = document.querySelectorAll('.btn-close-modal');

    function openModal(modalId) {
        backdrop.classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    function closeAllModals() {
        backdrop.classList.remove('active');
        modals.forEach(m => m.classList.remove('active'));
    }

    btnCloseModals.forEach(btn => btn.addEventListener('click', closeAllModals));
    backdrop.addEventListener('click', closeAllModals);

    // Open Modal Triggers
    document.getElementById('btn-new-card').addEventListener('click', () => openModal('modal-card'));
    document.getElementById('btn-add-cash-flow').addEventListener('click', () => openModal('modal-cash'));
    document.getElementById('btn-add-split').addEventListener('click', () => openModal('modal-split'));

    document.getElementById('btn-add-credit-expense').addEventListener('click', () => {
        const data = Store.getData();
        const select = document.getElementById('expense-card-id');
        select.innerHTML = '<option value="">Selecione um cartão...</option>';
        data.creditCards.forEach(card => {
            select.innerHTML += `<option value="${card.id}">${card.name}</option>`;
        });
        openModal('modal-credit-expense');
    });

    // --- Forms Logic ---

    // 1. New Card Form
    document.getElementById('form-card').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();

        const newCard = {
            id: Store.generateId(),
            name: document.getElementById('card-name').value,
            closingDay: document.getElementById('card-closing').value,
            dueDay: document.getElementById('card-due').value,
            limit: parseFloat(document.getElementById('card-limit').value || 0)
        };

        data.creditCards.push(newCard);
        Store.saveData(data);

        closeAllModals();
        e.target.reset();
        renderCards();
    });

    // 2. New Cash Flow Form
    document.getElementById('form-cash').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();

        const newCash = {
            id: Store.generateId(),
            date: document.getElementById('cash-date').value,
            origin: document.getElementById('cash-origin').value,
            description: document.getElementById('cash-desc').value,
            amount: parseFloat(document.getElementById('cash-amount').value)
        };

        data.cashFlow.push(newCash);
        Store.saveData(data);

        closeAllModals();
        e.target.reset();
        renderCashFlow();
        renderDashboard();
    });

    // 3. New Credit Card Expense Form
    document.getElementById('form-credit-expense').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();

        const amount = parseFloat(document.getElementById('expense-amount').value);
        const installments = parseInt(document.getElementById('expense-installments').value);

        const newExpense = {
            id: Store.generateId(),
            type: 'CREDIT_CARD',
            cardId: document.getElementById('expense-card-id').value,
            date: document.getElementById('expense-date').value,
            description: document.getElementById('expense-desc').value,
            amount: amount,
            installments: installments
        };

        data.transactions.push(newExpense);
        Store.saveData(data);

        closeAllModals();
        e.target.reset();
        renderCards();
        renderCreditTransactions();
        renderDashboard();
    });

    // 4. New Split Expense Form
    document.getElementById('form-split').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();

        const checkedParticipants = Array.from(document.querySelectorAll('input[name="split-participants"]:checked')).map(cb => cb.value);

        const newSplit = {
            id: Store.generateId(),
            date: new Date().toISOString().split('T')[0],
            payer: document.getElementById('split-payer').value,
            description: document.getElementById('split-desc').value,
            amount: parseFloat(document.getElementById('split-amount').value),
            participants: checkedParticipants
        };

        if (checkedParticipants.length === 0) {
            alert('Selecione pelo menos um participante para dividir a conta.');
            return;
        }

        data.splitExpenses.push(newSplit);
        Store.saveData(data);

        closeAllModals();
        e.target.reset();
        renderSplitExpenses();
        renderDashboard();
    });

});

// --- Render Functions ---

function renderDashboard() {
    const data = Store.getData();

    // Calcula movimentação de caixa (dinheiro)
    let totalCash = data.cashFlow.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    document.getElementById('dash-cash-flow').textContent = Store.formatCurrency(totalCash);

    // Calcular faturas (Simplificado para o momento)
    let currentCredit = data.transactions
        .filter(t => t.type === 'CREDIT_CARD')
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    document.getElementById('dash-credit-current').textContent = Store.formatCurrency(currentCredit);

    // Calcular Saldo de Rateio do Usuário Logado (Lucas)
    let myBalance = 0; // Positivo = Tenho a receber, Negativo = Tenho a pagar (Simplificado)
    data.splitExpenses.forEach(exp => {
        const splitAmount = exp.amount / exp.participants.length;
        if (exp.payer === 'Lucas') {
            // Lucas pagou a mais, recebe de volta dos outros
            const othersCount = exp.participants.filter(p => p !== 'Lucas').length;
            myBalance += splitAmount * othersCount;
        } else if (exp.participants.includes('Lucas')) {
            // Lucas deve a quem pagou
            myBalance -= splitAmount;
        }
    });

    const elBalance = document.getElementById('dash-split-balance');
    elBalance.textContent = Store.formatCurrency(myBalance);
    elBalance.className = 'amount ' + (myBalance > 0 ? 'positive' : (myBalance < 0 ? 'negative' : 'neutral-color'));
}

function renderCards() {
    const data = Store.getData();
    const cardsList = document.getElementById('cards-list');

    if (data.creditCards.length === 0) {
        cardsList.innerHTML = '<div class="generic-message text-secondary">Nenhum cartão cadastrado.</div>';
        return;
    }

    cardsList.innerHTML = '';
    data.creditCards.forEach(card => {
        // Calculate spent amount (mock logic for now)
        const spent = data.transactions
            .filter(t => t.cardId === card.id)
            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        const limitStr = card.limit > 0 ? Store.formatCurrency(card.limit) : 'Ilimitado';
        const percent = card.limit > 0 ? Math.min((spent / card.limit) * 100, 100) : 0;

        const cardHTML = `
            <div class="credit-card-ui">
                <div class="card-bank">
                    <span>${card.name}</span>
                    <i class="fa-brands fa-cc-visa" style="opacity: 0.5;"></i>
                </div>
                <div>
                    <p class="card-limit">Gasto: ${Store.formatCurrency(spent)} / ${limitStr}</p>
                    <div class="card-limit-bar">
                        <div class="card-limit-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
                <div style="margin-top: 15px; font-size: 0.8rem; color: var(--text-secondary); display:flex; justify-content:space-between;">
                    <span>Fecha dia ${card.closingDay}</span>
                    <span>Vence dia ${card.dueDay}</span>
                </div>
            </div>
        `;
        cardsList.innerHTML += cardHTML;
    });
}

function renderCashFlow() {
    const data = Store.getData();
    const tbody = document.querySelector('#table-cash-flow tbody');

    if (data.cashFlow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;" class="text-secondary">Nenhuma movimentação.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    // Sort by date descending
    const sorted = [...data.cashFlow].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(item => {
        const isExpense = item.amount < 0;
        const badgeClass = isExpense ? 'badge expense' : 'badge income';
        const badgeText = isExpense ? 'Saída' : 'Entrada';
        const amountColor = isExpense ? 'color: var(--negative)' : 'color: var(--positive)';

        // Format Date (YYYY-MM-DD -> DD/MM/YYYY)
        const dateParts = item.date.split('-');
        const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.date;

        const row = `
            <tr>
                <td>${dateStr}</td>
                <td><strong>${item.origin}</strong></td>
                <td>${item.description}</td>
                <td><span class="${badgeClass}">${badgeText}</span></td>
                <td style="font-weight: 600; ${amountColor}">${Store.formatCurrency(item.amount)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderCreditTransactions() {
    const data = Store.getData();
    const tbody = document.querySelector('#table-credit-transactions tbody');

    // Filtramos apenas as do tipo CREDIT_CARD
    const creds = data.transactions.filter(t => t.type === 'CREDIT_CARD').sort((a, b) => new Date(b.date) - new Date(a.date));

    if (creds.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;" class="text-secondary">Nenhum lançamento.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    creds.forEach(item => {
        const cardObj = data.creditCards.find(c => c.id === item.cardId);
        const cardName = cardObj ? cardObj.name : 'Desconhecido';

        // Format Date
        const dateParts = item.date.split('-');
        const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.date;

        const row = `
            <tr>
                <td>${dateStr}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">${cardName}</span></td>
                <td>${item.description}</td>
                <td>1/${item.installments}</td>
                <td style="font-weight: 600; color: var(--negative);">${Store.formatCurrency(item.amount)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderSplitExpenses() {
    const data = Store.getData();
    const tbody = document.querySelector('#table-split-flow tbody');
    const balancesDiv = document.getElementById('split-balances');

    if (data.splitExpenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;" class="text-secondary">Nenhum rateio.</td></tr>';
        balancesDiv.innerHTML = '<div class="text-secondary">Nenhum rateio registrado.</div>';
        return;
    }

    // --- Render Table ---
    tbody.innerHTML = '';
    const sorted = [...data.splitExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(item => {
        const dateParts = item.date.split('-');
        const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.date;

        const row = `
            <tr>
                <td>${dateStr}</td>
                <td><span class="badge income">${item.payer}</span></td>
                <td>${item.description} <br><small class="text-secondary">Rateio: ${item.participants.join(', ')}</small></td>
                <td style="font-weight: 600;">${Store.formatCurrency(item.amount)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // --- Render Balances ---
    let balances = {
        'Lucas': 0, 'Ivson': 0, 'Artur': 0, 'Duva': 0
    };

    data.splitExpenses.forEach(exp => {
        const split = exp.amount / exp.participants.length;

        // Quem pagou recebe de volta o total menos a parte dele (se ele participou)
        const othersToPay = exp.participants.filter(p => p !== exp.payer).length;
        balances[exp.payer] += (split * othersToPay);

        // Quem participou e NÃO pagou deve a sua parte
        exp.participants.forEach(p => {
            if (p !== exp.payer) {
                balances[p] -= split;
            }
        });
    });

    balancesDiv.innerHTML = '';
    Object.keys(balances).forEach(person => {
        const bal = balances[person];
        if (bal !== 0 || data.splitExpenses.length > 0) {
            const isPos = bal > 0;
            const isNeg = bal < 0;
            const bClass = isPos ? 'positive' : (isNeg ? 'negative' : 'neutral-color');
            const lbl = isPos ? 'A Receber' : (isNeg ? 'A Pagar' : 'Zerado');
            balancesDiv.innerHTML += `
                <div class="card glass-effect" style="flex: 1; padding: 1rem; min-width: 140px;">
                    <h4 style="color: var(--text-secondary); margin-bottom: 5px;">${person}</h4>
                    <div style="font-size: 1.2rem; font-weight: bold;" class="amount ${bClass}">${Store.formatCurrency(bal)}</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;" class="${bClass}">${lbl}</div>
                </div>
            `;
        }
    });

}

