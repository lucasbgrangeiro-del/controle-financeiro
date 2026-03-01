/**
 * Main Application Logic (app.js) - V2
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation ---
    const navItems = document.querySelectorAll('.nav-item');
    const modules = document.querySelectorAll('.module');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            modules.forEach(mod => mod.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            pageTitle.textContent = item.textContent.trim();
        });
    });

    // --- Theme ---
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');
    const themeText = themeBtn.querySelector('span');

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

    // --- Modals ---
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

    document.getElementById('budget-type')?.addEventListener('change', (e) => {
        const catGroup = document.getElementById('budget-category-group');
        catGroup.style.display = e.target.value === 'VARIABLE' ? 'block' : 'none';
    });

    document.getElementById('btn-new-card')?.addEventListener('click', () => openModal('modal-card'));
    document.getElementById('btn-add-balance')?.addEventListener('click', () => openModal('modal-balance'));
    document.getElementById('btn-add-budget')?.addEventListener('click', () => openModal('modal-budget'));

    document.getElementById('btn-add-credit-expense')?.addEventListener('click', () => {
        const data = Store.getData();
        const select = document.getElementById('expense-card-id');
        select.innerHTML = '<option value="">Selecione um cartão...</option>';
        data.creditCards.forEach(card => {
            select.innerHTML += `<option value="${card.id}">${card.name}</option>`;
        });
        openModal('modal-credit-expense');
    });

    // --- Forms ---
    document.getElementById('form-balance')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();
        data.availableBalances.push({
            id: Store.generateId(),
            bank: document.getElementById('balance-bank').value,
            description: document.getElementById('balance-desc').value,
            amount: parseFloat(document.getElementById('balance-amount').value)
        });
        Store.saveData(data);
        closeAllModals(); e.target.reset();
        refreshAll();
    });

    document.getElementById('form-budget')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();
        data.budgets.push({
            id: Store.generateId(),
            type: document.getElementById('budget-type').value,
            category: document.getElementById('budget-type').value === 'VARIABLE' ? document.getElementById('budget-category').value : '',
            description: document.getElementById('budget-desc').value,
            amount: parseFloat(document.getElementById('budget-amount').value),
            isArchived: false,
            archiveDate: null
        });
        Store.saveData(data);
        closeAllModals(); e.target.reset();
        document.getElementById('budget-category-group').style.display = 'none';
        refreshAll();
    });

    document.getElementById('form-card')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();
        data.creditCards.push({
            id: Store.generateId(),
            name: document.getElementById('card-name').value,
            closingDay: document.getElementById('card-closing').value,
            dueDay: document.getElementById('card-due').value,
            utilizedLimit: parseFloat(document.getElementById('card-limit').value || 0)
        });
        Store.saveData(data);
        closeAllModals(); e.target.reset();
        refreshAll();
    });

    document.getElementById('form-credit-expense')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = Store.getData();
        const totalAmount = parseFloat(document.getElementById('expense-amount').value);
        const installments = parseInt(document.getElementById('expense-installments').value);
        const cardId = document.getElementById('expense-card-id').value;

        if (!cardId) {
            alert("Por favor, selecione um cartão válido para lançar a despesa.");
            return;
        }

        data.creditPurchases.push({
            id: Store.generateId(),
            cardId: cardId,
            date: document.getElementById('expense-date').value,
            description: document.getElementById('expense-desc').value,
            currentInstallment: 1, // Start at 1
            totalInstallments: installments,
            installmentAmount: totalAmount / installments,
            isArchived: false
        });
        Store.saveData(data);
        closeAllModals(); e.target.reset();
        refreshAll();
    });

    // Globals
    window.archiveBudget = function (id) {
        if (confirm('Tem certeza que deseja marcar esta rubrica como paga/efetivada?')) {
            const data = Store.getData();
            const budget = data.budgets.find(b => b.id === id);
            if (budget) {
                budget.isArchived = true;
                budget.archiveDate = new Date().toISOString().split('T')[0];
                Store.saveData(data);
                refreshAll();
            }
        }
    };

    window.deleteBalance = function (id) {
        if (confirm('Remover este saldo?')) {
            const data = Store.getData();
            data.availableBalances = data.availableBalances.filter(b => b.id !== id);
            Store.saveData(data);
            refreshAll();
        }
    };

    window.deleteCard = function (id) {
        if (confirm('Apagar este cartão e suas despesas atreladas?')) {
            const data = Store.getData();
            data.creditCards = data.creditCards.filter(c => c.id !== id);
            data.creditPurchases = data.creditPurchases.filter(p => p.cardId !== id);
            Store.saveData(data);
            refreshAll();
        }
    };

    window.payInstallment = function (id) {
        if (confirm('Avançar uma parcela desta compra?')) {
            const data = Store.getData();
            const purchase = data.creditPurchases.find(p => p.id === id);
            if (purchase) {
                if (purchase.currentInstallment < purchase.totalInstallments) {
                    purchase.currentInstallment += 1;
                } else {
                    purchase.isArchived = true; // Terminou de pagar
                }
                Store.saveData(data);
                refreshAll();
            }
        }
    };

    window.updateCardLimit = function (id) {
        const data = Store.getData();
        const card = data.creditCards.find(c => c.id === id);
        if (card) {
            const nextLimit = prompt('Informe o limite de crédito utilizado atualmente do cartão:', card.utilizedLimit);
            if (nextLimit !== null) {
                card.utilizedLimit = parseFloat(nextLimit);
                Store.saveData(data);
                refreshAll();
            }
        }
    };

    window.updateBudgetAmount = function (id) {
        const data = Store.getData();
        const budget = data.budgets.find(b => b.id === id);
        if (budget) {
            const nextAmount = prompt(`Atualizar o saldo restante de ${budget.description}:`, budget.amount);
            if (nextAmount !== null) {
                budget.amount = parseFloat(nextAmount);
                Store.saveData(data);
                refreshAll();
            }
        }
    };

    window.editInstallment = function (id) {
        const data = Store.getData();
        const purchase = data.creditPurchases.find(p => p.id === id);
        if (purchase) {
            const nextInstallment = prompt(`Em qual parcela você está pagando atualmente? (De 1 até ${purchase.totalInstallments}):`, purchase.currentInstallment);
            if (nextInstallment !== null) {
                const parsed = parseInt(nextInstallment);
                if (parsed > 0 && parsed <= purchase.totalInstallments) {
                    purchase.currentInstallment = parsed;
                    Store.saveData(data);
                    refreshAll();
                } else {
                    alert('Número de parcela inválido.');
                }
            }
        }
    };

    window.deleteCreditPurchase = function (id) {
        if (confirm('Atenção: Tem certeza que deseja excluir esta despesa do cartão permanentemente?')) {
            const data = Store.getData();
            data.creditPurchases = data.creditPurchases.filter(p => p.id !== id);
            Store.saveData(data);
            refreshAll();
        }
    };

    window.Store.init(refreshAll);
});

// --- Renders ---
function refreshAll() {
    renderAvailableBalances();
    renderBudgets();
    renderCards();
    renderArchive();
    renderDashboard();
}

function renderAvailableBalances() {
    const data = Store.getData();
    const tbody = document.querySelector('#table-available-balances tbody');
    if (!tbody) return;

    if (data.availableBalances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;" class="text-secondary">Nenhum saldo cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.availableBalances.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.bank}</strong></td>
                <td>${item.description}</td>
                <td style="font-weight:600; color:var(--positive);">${Store.formatCurrency(item.amount)}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteBalance('${item.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function renderBudgets() {
    const data = Store.getData();
    const tFixed = document.querySelector('#table-budgets-fixed tbody');
    const tVar = document.querySelector('#table-budgets-variable tbody');
    if (!tFixed || !tVar) return;

    tFixed.innerHTML = ''; tVar.innerHTML = '';

    const activeBudgets = data.budgets.filter(b => !b.isArchived);
    const fixed = activeBudgets.filter(b => b.type === 'FIXED');
    const variable = activeBudgets.filter(b => b.type === 'VARIABLE');

    // MÁGICA: Buscar faturas ativas para injetar nas Variáveis
    const cartoesFaturas = [];
    data.creditCards.forEach(card => {
        const purchases = data.creditPurchases.filter(p => !p.isArchived && p.cardId === card.id);
        let debitoRemanescenteTotal = 0;
        purchases.forEach(p => {
            const debitoTotal = (p.totalInstallments - p.currentInstallment + 1) * p.installmentAmount;
            const debitoRemanescente = debitoTotal - p.installmentAmount;
            debitoRemanescenteTotal += debitoRemanescente;
        });
        const faturaAtual = card.utilizedLimit - debitoRemanescenteTotal;
        if (faturaAtual > 0) {
            cartoesFaturas.push({ id: card.id, name: card.name, amount: faturaAtual });
        }
    });

    if (fixed.length === 0) {
        tFixed.innerHTML = '<tr><td colspan="3" style="text-align:center;" class="text-secondary">Nenhuma despesa fixa.</td></tr>';
    } else {
        fixed.forEach(item => {
            tFixed.innerHTML += `
                <tr>
                    <td><strong>${item.description}</strong></td>
                    <td style="font-weight: 600; color:var(--negative)">
                        <span style="cursor:pointer;" title="Editar Valor" onclick="updateBudgetAmount('${item.id}')">${Store.formatCurrency(item.amount)} <i class="fa-solid fa-pen" style="font-size:0.75em;"></i></span>
                    </td>
                    <td>
                        <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="archiveBudget('${item.id}')">Efetivar</button>
                    </td>
                </tr>
            `;
        });
    }

    if (variable.length === 0 && cartoesFaturas.length === 0) {
        tVar.innerHTML = '<tr><td colspan="4" style="text-align:center;" class="text-secondary">Nenhuma despesa variável.</td></tr>';
    } else {
        // Render Variáveis manuais
        variable.forEach(item => {
            tVar.innerHTML += `
                <tr>
                    <td><span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">${item.category}</span></td>
                    <td><strong>${item.description}</strong></td>
                    <td style="font-weight: 600; color:var(--negative)">
                        <span style="cursor:pointer;" title="Editar Valor Restante" onclick="updateBudgetAmount('${item.id}')">${Store.formatCurrency(item.amount)} <i class="fa-solid fa-pen" style="font-size:0.75em;"></i></span>
                    </td>
                    <td>
                        <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="archiveBudget('${item.id}')">Efetivar</button>
                    </td>
                </tr>
            `;
        });

        // Render Faturas de Cartão (Automático)
        cartoesFaturas.forEach(c => {
            tVar.innerHTML += `
                <tr style="background: rgba(43, 88, 118, 0.1);">
                    <td><span class="badge" style="background: var(--accent); color: white;">Sistema Automático</span></td>
                    <td><strong>Fatura Cartão: ${c.name}</strong> <br><small class="text-secondary" style="font-size:0.75rem;">(Limite Util. - Débitos Restantes)</small></td>
                    <td style="font-weight: 600; color:var(--negative)">${Store.formatCurrency(c.amount)}</td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;" disabled title="Faturas fecham e efetivam de acordo com os lançamentos na aba de cartões">Auto</button>
                    </td>
                </tr>
            `;
        });
    }
}

function renderCards() {
    const data = Store.getData();
    const cardsList = document.getElementById('cards-list');
    const tTransactions = document.querySelector('#table-credit-transactions tbody');
    if (!cardsList || !tTransactions) return;

    if (data.creditCards.length === 0) {
        cardsList.innerHTML = '<div class="generic-message text-secondary">Nenhum cartão cadastrado.</div>';
        tTransactions.innerHTML = '<tr><td colspan="6" style="text-align:center;" class="text-secondary">Nenhum lançamento.</td></tr>';
        return;
    }

    cardsList.innerHTML = '';
    tTransactions.innerHTML = '';

    data.creditCards.forEach(card => {
        // Purchases for this card
        const purchases = data.creditPurchases.filter(p => !p.isArchived && p.cardId === card.id);

        let debitoRemanescenteTotal = 0;

        purchases.forEach(p => {
            const debitoTotal = (p.totalInstallments - p.currentInstallment + 1) * p.installmentAmount;
            const debitoRemanescente = debitoTotal - p.installmentAmount; // Excludes the current month's installment
            debitoRemanescenteTotal += debitoRemanescente;

            // Format Date
            const dateParts = p.date.split('-');
            const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : p.date;

            tTransactions.innerHTML += `
                <tr>
                    <td>${dateStr}</td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">${card.name}</span></td>
                    <td>${p.description}</td>
                    <td><span style="cursor:pointer; text-decoration:underline;" title="Editar Parcela Atual" onclick="editInstallment('${p.id}')">${p.currentInstallment}/${p.totalInstallments} <i class="fa-solid fa-pen" style="font-size:0.75em;"></i></span> <br><small class="text-secondary">${Store.formatCurrency(p.installmentAmount)}</small></td>
                    <td><span style="font-size: 0.85em; color: var(--text-secondary);">Total: ${Store.formatCurrency(debitoTotal)}</span><br><strong style="color:var(--negative)">Rem: ${Store.formatCurrency(debitoRemanescente)}</strong></td>
                    <td style="display:flex; gap: 5px; flex-wrap:wrap; align-items:center;">
                        <button class="btn btn-secondary" style="padding: 5px 8px; font-size: 0.8rem;" onclick="payInstallment('${p.id}')" title="Avançar uma parcela">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="btn btn-secondary" style="padding: 5px 8px; font-size: 0.8rem; border-color:var(--negative); color:var(--negative);" onclick="deleteCreditPurchase('${p.id}')" title="Excluir Lançamento">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        const faturaAtual = card.utilizedLimit - debitoRemanescenteTotal;

        cardsList.innerHTML += `
            <div class="credit-card-ui">
                <div class="card-bank">
                    <span>${card.name}</span>
                    <button class="btn btn-secondary" style="padding: 2px 5px; border:none; background:transparent;" onclick="deleteCard('${card.id}')"><i class="fa-solid fa-trash text-secondary"></i></button>
                </div>
                <!-- Limite Utilizado Input Dinamico -->
                <div style="margin-top:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.9rem; color:var(--text-secondary);">Limite Utilizado:</span>
                    <strong style="cursor:pointer; padding:5px; background:rgba(255,255,255,0.1); border-radius:4px;" onclick="updateCardLimit('${card.id}')">
                        ${Store.formatCurrency(card.utilizedLimit)} <i class="fa-solid fa-pen" style="font-size:0.7em;"></i>
                    </strong>
                </div>
                
                <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <p class="card-limit" style="font-size:1.1rem; color:var(--negative);">Fatura Calculada: ${Store.formatCurrency(faturaAtual)}</p>
                </div>
                
                <div style="margin-top: 15px; font-size: 0.8rem; color: var(--text-secondary); display:flex; justify-content:space-between;">
                    <span>Fecha dia ${card.closingDay}</span>
                    <span>Vence dia ${card.dueDay}</span>
                </div>
            </div>
        `;
    });
}

function renderArchive() {
    const data = Store.getData();
    const tbody = document.querySelector('#table-archive tbody');
    if (!tbody) return;

    const archived = data.budgets.filter(b => b.isArchived).sort((a, b) => new Date(b.archiveDate) - new Date(a.archiveDate));

    if (archived.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;" class="text-secondary">Nenhum registro arquivado.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    archived.forEach(item => {
        const dateParts = item.archiveDate.split('-');
        const dateStr = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.archiveDate;

        tbody.innerHTML += `
            <tr>
                <td>${dateStr}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">${item.type === 'FIXED' ? 'Fixa' : item.category}</span></td>
                <td style="text-decoration: line-through; color: var(--text-secondary);">${item.description}</td>
                <td style="font-weight: 600; color: var(--text-secondary);">${Store.formatCurrency(item.amount)}</td>
            </tr>
        `;
    });
}

function renderDashboard() {
    const data = Store.getData();

    // 1. Receitas (Disponibilidades)
    const totalReceitas = data.availableBalances.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Despesas Fixas (Não arquivadas)
    const activeBudgets = data.budgets.filter(b => !b.isArchived);
    const totalFixas = activeBudgets.filter(b => b.type === 'FIXED').reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Despesas Variáveis Comuns (Não arquivadas)
    const totalVariaveis = activeBudgets.filter(b => b.type === 'VARIABLE').reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Calcular Faturas Calculadas de Todos os Cartões e adicionar às variaveis
    let totalCartoes = 0;
    const cartoesFaturas = []; // Para listar no dashboard

    data.creditCards.forEach(card => {
        const purchases = data.creditPurchases.filter(p => !p.isArchived && p.cardId === card.id);
        let debitoRemanescenteTotal = 0;
        purchases.forEach(p => {
            const debitoTotal = (p.totalInstallments - p.currentInstallment + 1) * p.installmentAmount;
            const debitoRemanescente = debitoTotal - p.installmentAmount;
            debitoRemanescenteTotal += debitoRemanescente;
        });
        const faturaAtual = card.utilizedLimit - debitoRemanescenteTotal;

        if (faturaAtual > 0) {
            totalCartoes += faturaAtual;
            cartoesFaturas.push({ name: card.name, amount: faturaAtual });
        }
    });

    const despesasTotais = totalFixas + totalVariaveis + totalCartoes;
    const resultadoLiq = totalReceitas - despesasTotais;

    // Atualizar HTML Principal
    const dashReceitas = document.getElementById('dash-cash-flow');
    if (dashReceitas) dashReceitas.textContent = Store.formatCurrency(totalReceitas);

    const dashDespesas = document.getElementById('dash-credit-current');
    if (dashDespesas) {
        dashDespesas.textContent = Store.formatCurrency(despesasTotais);
    }

    const dashResult = document.getElementById('dash-split-balance');
    if (dashResult) {
        dashResult.textContent = Store.formatCurrency(resultadoLiq);
        dashResult.className = 'amount ' + (resultadoLiq >= 0 ? 'positive' : 'negative');
    }

    // Listas do Widget
    const ulReceitas = document.getElementById('list-dash-receitas');
    const ulDespesas = document.getElementById('list-dash-despesas');
    if (!ulReceitas || !ulDespesas) return;

    // Render Receitas
    if (data.availableBalances.length === 0) {
        ulReceitas.innerHTML = '<li class="text-secondary text-center">Nenhum saldo...</li>';
    } else {
        ulReceitas.innerHTML = '';
        data.availableBalances.forEach(b => {
            ulReceitas.innerHTML += `
                <li style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                    <span>${b.bank}</span>
                    <strong style="color:var(--positive);">${Store.formatCurrency(b.amount)}</strong>
                </li>
            `;
        });
    }

    // Render Despesas
    if (activeBudgets.length === 0 && cartoesFaturas.length === 0) {
        ulDespesas.innerHTML = '<li class="text-secondary text-center">Nenhuma despesa...</li>';
    } else {
        ulDespesas.innerHTML = '';
        // Fixas e Variáveis
        activeBudgets.forEach(b => {
            ulDespesas.innerHTML += `
                <li style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                    <span>${b.description} <small class="text-secondary">(${b.type === 'FIXED' ? 'Fixa' : b.category})</small></span>
                    <strong style="color:var(--negative);">${Store.formatCurrency(b.amount)}</strong>
                </li>
            `;
        });
        // Cartões
        cartoesFaturas.forEach(c => {
            ulDespesas.innerHTML += `
                <li style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
                    <span>Fatura Cartão <small class="text-secondary">(${c.name})</small></span>
                    <strong style="color:var(--negative);">${Store.formatCurrency(c.amount)}</strong>
                </li>
            `;
        });
    }
}
