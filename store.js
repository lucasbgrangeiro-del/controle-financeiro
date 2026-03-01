/**
 * Local Storage Management (store.js)
 * Serves as the mock database for our application.
 */

const Store = {
    // Default Empty State (V2)
    _defaultState: {
        availableBalances: [], // [{ id, description, bank, amount }]
        budgets: [], // [{ id, type: 'FIXED'|'VARIABLE', category, description, amount, isArchived: false, archiveDate: null }]
        creditCards: [], // [{ id, name, utilizedLimit: 0 }]
        creditPurchases: [], // [{ id, cardId, description, currentInstallment: 1, totalInstallments: 10, installmentAmount: 100, isArchived: false }]
        archivedItems: [] // Generic archive reference
    },

    // Initialize or load data
    init() {
        // Migration safeguard: if loading V1 data, overwrite with V2 empty state to avoid crashes
        let data = JSON.parse(localStorage.getItem('financeApp_data'));
        if (!data || !data.availableBalances) {
            console.log("Initializing V2 Data Store...");
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
