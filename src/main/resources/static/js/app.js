// API Base URL
const API_URL = '/api';

// Show specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get user info from localStorage
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showPage('login-page');
}

// API call helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }

    return data;
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.textContent = '';

    try {
        const data = await apiCall('/login', 'POST', { username, password });

        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Show dashboard
        showDashboard();
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

// Register form handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const fullName = document.getElementById('register-fullname').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');

    errorDiv.textContent = '';
    successDiv.textContent = '';

    try {
        await apiCall('/register', 'POST', { username, email, fullName, password });

        successDiv.textContent = 'Registration successful! Please login.';
        document.getElementById('register-form').reset();

        // Redirect to login after 2 seconds
        setTimeout(() => {
            showPage('login-page');
        }, 2000);
    } catch (error) {
        errorDiv.textContent = error.message;
    }
});

// Show dashboard and load data
async function showDashboard() {
    const user = getUser();
    if (user) {
        document.getElementById('user-name').textContent = `Welcome, ${user.fullName || user.username}`;
    }

    showPage('dashboard-page');
    await loadDashboardData();
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const data = await apiCall('/dashboard');

        // Update stats
        document.getElementById('stat-products').textContent = data.totalProducts || 0;
        document.getElementById('stat-categories').textContent = data.totalCategories || 0;
        document.getElementById('stat-suppliers').textContent = data.totalSuppliers || 0;
        document.getElementById('stat-stock').textContent = data.totalStockItems || 0;
        document.getElementById('stat-sales').textContent = data.totalSales || 0;
        document.getElementById('stat-clients').textContent = data.totalClients || 0;

        // Update value stats
        document.getElementById('stat-inventory-value').textContent =
            `$${(data.totalInventoryValue || 0).toFixed(2)}`;
        document.getElementById('stat-sales-value').textContent =
            `$${(data.potentialSalesValue || 0).toFixed(2)}`;
        document.getElementById('stat-low-stock').textContent = data.lowStockItems || 0;

        // Populate products table
        const productsBody = document.querySelector('#products-table tbody');
        productsBody.innerHTML = '';
        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.description || '-'}</td>
                    <td>${product.category ? product.category.name : '-'}</td>
                `;
                productsBody.appendChild(row);
            });
        } else {
            productsBody.innerHTML = '<tr><td colspan="4">No products found</td></tr>';
        }

        // Populate stock table
        const stockBody = document.querySelector('#stock-table tbody');
        stockBody.innerHTML = '';
        if (data.stockItems && data.stockItems.length > 0) {
            data.stockItems.forEach(stock => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${stock.id}</td>
                    <td>${stock.product ? stock.product.name : '-'}</td>
                    <td>${stock.quantity}</td>
                    <td>$${(stock.costPrice || 0).toFixed(2)}</td>
                    <td>$${(stock.sellingPrice || 0).toFixed(2)}</td>
                `;
                stockBody.appendChild(row);
            });
        } else {
            stockBody.innerHTML = '<tr><td colspan="5">No stock items found</td></tr>';
        }

        // Populate suppliers table
        const suppliersBody = document.querySelector('#suppliers-table tbody');
        suppliersBody.innerHTML = '';
        if (data.suppliers && data.suppliers.length > 0) {
            data.suppliers.forEach(supplier => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${supplier.id}</td>
                    <td>${supplier.name}</td>
                    <td>${supplier.contactName || '-'}</td>
                    <td>${supplier.email || '-'}</td>
                `;
                suppliersBody.appendChild(row);
            });
        } else {
            suppliersBody.innerHTML = '<tr><td colspan="4">No suppliers found</td></tr>';
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            logout();
        }
    }
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        showDashboard();
    } else {
        showPage('login-page');
    }
});
