/**
 * Local Storage Management (store.js)
 * Serves as the mock database for our application.
 */

const Store = {
    // Default Empty State
    _defaultState: {
        creditCards: [],      // [{ id, name, limit, closingDay, dueDay }]
        transactions: [],     // [{ id, type ('CREDIT_CARD', 'CASH', 'SPLIT'), cardId, date, description, amount, installments, currentInstallment }]
        cashFlow: [],         // [{ id, date, origin, description, amount }]
        splitExpenses: []     // [{ id, payer, participants: [], amount, description, date }]
    },

    // Initialize or load data
    init() {
        if (!localStorage.getItem('financeApp_data')) {
            this.saveData(this._defaultState);
        }
    },

    // Retrieve full data object
    getData() {
        return JSON.parse(localStorage.getItem('financeApp_data')) || this._defaultState;
    },

    // Save full data object
    saveData(data) {
        localStorage.setItem('financeApp_data', JSON.stringify(data));
    },

    // Generators for IDs
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
};

// Initialize the store on load
Store.init();
