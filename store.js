/**
 * Firebase Cloud Storage Management (store.js)
 * Replaces the local storage with real-time Firebase syncing.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGiapfyqT4ANFr3oVKmB-pHqiNWBO7yU4",
    authDomain: "aplicativo-financeiro-f1b07.firebaseapp.com",
    projectId: "aplicativo-financeiro-f1b07",
    storageBucket: "aplicativo-financeiro-f1b07.firebasestorage.app",
    messagingSenderId: "600091482742",
    appId: "1:600091482742:web:78fbb9033a10998986dd57"
    // measurementId: "G-H7H5HKXRJW" (optional, analytics not needed for core function)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência ao banco de dados principal
// Usamos um único documento central para simplificar e garantir coerência perfeita no "refreshAll"
const DOC_REF = doc(db, 'financeApp', 'mainData_v3');

window.Store = {
    // Default Empty State (V3)
    _localData: {
        availableBalances: [],
        budgets: [],
        creditCards: [],
        creditPurchases: [],
        archivedItems: []
    },

    _onDataChangeCallback: null,

    // Initialize the Firebase observer
    init(onDataChange) {
        this._onDataChangeCallback = onDataChange;
        let isFirstLoad = true;

        // Listener tempo real do Firebase (Sincronização em Nuvem)
        onSnapshot(DOC_REF, (docSnap) => {
            if (docSnap.exists()) {
                console.log("⬇️ Dados sincronizados da Nuvem (Firebase)");
                this._localData = docSnap.data();
                if (this._onDataChangeCallback) this._onDataChangeCallback();
            } else {
                console.log("☁️ Inicializando novo banco de dados na Nuvem...");
                // Se for a primeira vez que o banco abre e ele está vazio, tentar migrar dados antigos do LocalStorage do navegador da V2.
                let oldLocalDataStr = localStorage.getItem('financeApp_data');
                if (oldLocalDataStr) {
                    try {
                        let oldData = JSON.parse(oldLocalDataStr);
                        if (oldData && oldData.availableBalances) {
                            console.log("⬆️ Migrando dados Offline para o Firebase...");
                            this._localData = oldData;
                            this.saveData(oldData);
                        }
                    } catch (e) { }
                } else {
                    // Sem dados locais para migrar, salvar estado vazio inicial na nuvem
                    this.saveData(this._localData);
                }
            }
            isFirstLoad = false;
        }, (error) => {
            console.error("Erro na leitura do Firebase:", error);
            if (isFirstLoad) {
                alert("Atenção: Seu Banco de Dados do Firebase ainda não foi ativado ou está sem permissão. Exibindo dados salvos offline temporariamente.");
                // Fallback to local data so the app doesn't stay blank
                let oldLocalDataStr = localStorage.getItem('financeApp_data');
                if (oldLocalDataStr) {
                    try {
                        let oldData = JSON.parse(oldLocalDataStr);
                        if (oldData && oldData.availableBalances) {
                            this._localData = oldData;
                        }
                    } catch (e) { }
                }
                if (this._onDataChangeCallback) this._onDataChangeCallback();
                isFirstLoad = false;
            }
        });
    },

    // Retrieve full data object (retorna sempre os dados espelhados em tempo real)
    getData() {
        return JSON.parse(JSON.stringify(this._localData));
    },

    // Save full data object (Sobe para a Nuvem)
    saveData(data) {
        this._localData = data;
        setDoc(DOC_REF, data).then(() => {
            console.log("⬆️ Nuvem atualizada!");
        }).catch(err => {
            console.error("Erro ao subir dados para a nuvem:", err);
            alert("Erro ao salvar! Você pode estar sem internet.");
        });
    },

    // Generators for IDs
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
};
