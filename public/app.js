const state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoginMode: true
};

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const nameGroup = document.getElementById('name-group');
const toggleAuthModal = document.getElementById('toggle-auth');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit');
const authError = document.getElementById('auth-error');

// Nav Elements
const navDashboard = document.getElementById('nav-dashboard');
const navRecords = document.getElementById('nav-records');
const dashboardContent = document.getElementById('dashboard-content');
const recordsContent = document.getElementById('records-content');
const pageTitle = document.getElementById('page-title');
const logoutBtn = document.getElementById('logout-btn');
const addRecordBtn = document.getElementById('add-record-btn');

// Modal Elements
const recordModal = document.getElementById('record-modal');
const closeModal = document.getElementById('close-modal');
const recordForm = document.getElementById('record-form');
const recordError = document.getElementById('record-error');

// API Helper
const apiCall = async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`/api${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API Error');
        }
        return data;
    } catch (err) {
        throw err;
    }
};

// Initialization
const init = () => {
    if (state.token && state.user) {
        showDashboard();
    } else {
        showAuth();
    }
};

// Auth Logic
toggleAuthModal.addEventListener('click', () => {
    state.isLoginMode = !state.isLoginMode;
    authError.textContent = '';
    if (state.isLoginMode) {
        authTitle.textContent = 'Welcome Back';
        nameGroup.style.display = 'none';
        authSubmitBtn.textContent = 'Sign In';
        toggleAuthModal.innerHTML = "Don't have an account? <span>Register here</span>";
    } else {
        authTitle.textContent = 'Create Account';
        nameGroup.style.display = 'block';
        authSubmitBtn.textContent = 'Sign Up';
        toggleAuthModal.innerHTML = "Already have an account? <span>Login here</span>";
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    const endpoint = state.isLoginMode ? '/auth/login' : '/auth/register';
    const body = state.isLoginMode ? { email, password } : { email, password, name };
    
    try {
        authSubmitBtn.textContent = 'Loading...';
        const res = await apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        
        state.token = res.token;
        state.user = res.data.user;
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        authForm.reset();
        showDashboard();
    } catch (err) {
        authError.textContent = err.message;
    } finally {
        authSubmitBtn.textContent = state.isLoginMode ? 'Sign In' : 'Sign Up';
    }
});

logoutBtn.addEventListener('click', () => {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
});

// View Management
const showAuth = () => {
    authView.classList.add('active');
    dashboardView.classList.remove('active');
};

const showDashboard = () => {
    authView.classList.remove('active');
    dashboardView.classList.add('active');
    
    document.getElementById('user-name').textContent = state.user.name;
    document.getElementById('user-role').textContent = state.user.role;
    document.getElementById('user-avatar').textContent = state.user.name.charAt(0).toUpperCase();

    addRecordBtn.style.display = state.user.role === 'Admin' ? 'block' : 'none';

    loadDashboardSummary();
};

navDashboard.addEventListener('click', () => {
    navDashboard.parentElement.classList.add('active');
    navRecords.parentElement.classList.remove('active');
    dashboardContent.classList.add('active');
    recordsContent.classList.remove('active');
    pageTitle.textContent = 'Dashboard Overview';
    loadDashboardSummary();
});

navRecords.addEventListener('click', () => {
    navRecords.parentElement.classList.add('active');
    navDashboard.parentElement.classList.remove('active');
    recordsContent.classList.add('active');
    dashboardContent.classList.remove('active');
    pageTitle.textContent = 'Financial Records';
    loadRecords();
});

// Data Fetching
const loadDashboardSummary = async () => {
    try {
        const res = await apiCall('/dashboard/summary');
        const data = res.data;
        
        document.getElementById('stat-income').textContent = `$${data.totalIncome.toFixed(2)}`;
        document.getElementById('stat-expense').textContent = `$${data.totalExpenses.toFixed(2)}`;
        document.getElementById('stat-balance').textContent = `$${data.netBalance.toFixed(2)}`;
        
        const catContainer = document.getElementById('category-breakdown');
        catContainer.innerHTML = data.categoryTotals.map(cat => `
            <div class="breakdown-row">
                <span>${cat.category} <span class="badge">${cat.type}</span></span>
                <span class="${cat.type === 'income' ? 'positive' : 'negative'}">$${cat.totalAmount.toFixed(2)}</span>
            </div>
        `).join('') || '<p class="text-muted">No data available</p>';

        const actContainer = document.getElementById('recent-activity');
        actContainer.innerHTML = data.recentActivity.map(act => `
            <div class="activity-row">
                <div>
                    <strong>${act.category}</strong>
                    <div style="font-size:0.8rem;color:#94a3b8">${new Date(act.date).toLocaleDateString()}</div>
                </div>
                <span class="${act.type === 'income' ? 'positive' : 'negative'}">$${act.amount.toFixed(2)}</span>
            </div>
        `).join('') || '<p class="text-muted">No activity yet</p>';

    } catch (err) {
        console.error('Failed to load summary', err);
        if (err.message.includes('not logged in')) logoutBtn.click();
    }
};

const loadRecords = async () => {
    try {
        const res = await apiCall('/records');
        const tbody = document.getElementById('records-tbody');
        tbody.innerHTML = res.data.records.map(rec => `
            <tr>
                <td>${new Date(rec.date).toLocaleDateString()}</td>
                <td><span class="badge ${rec.type === 'income' ? 'positive' : 'negative'}">${rec.type}</span></td>
                <td>${rec.category}</td>
                <td class="${rec.type === 'income' ? 'positive' : 'negative'}">$${rec.amount.toFixed(2)}</td>
                <td>${rec.notes || '-'}</td>
                <td>
                    ${state.user.role === 'Admin' ? `<button class="btn icon-btn" onclick="deleteRecord('${rec._id}')">🗑️</button>` : '-'}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center">No records found</td></tr>';
    } catch (err) {
        console.error('Failed to load records', err);
    }
};

// Record Modal & Actions
addRecordBtn.addEventListener('click', () => {
    recordModal.classList.add('active');
    recordError.textContent = '';
    recordForm.reset();
});

closeModal.addEventListener('click', () => {
    recordModal.classList.remove('active');
});

recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    recordError.textContent = '';
    
    const type = document.getElementById('record-type').value;
    const amount = parseFloat(document.getElementById('record-amount').value);
    const category = document.getElementById('record-category').value;
    const notes = document.getElementById('record-notes').value;
    
    try {
        await apiCall('/records', {
            method: 'POST',
            body: JSON.stringify({ type, amount, category, notes })
        });
        
        recordModal.classList.remove('active');
        loadDashboardSummary(); // if we are on dashboard it updates it behind
        loadRecords(); // if we are on records it updates
    } catch (err) {
        recordError.textContent = err.message;
    }
});

window.deleteRecord = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
        await apiCall(`/records/${id}`, { method: 'DELETE' });
        loadRecords();
    } catch (err) {
        alert(err.message);
    }
};

init();
