// API Base URL
const API_URL = '/api';

// State
let currentUser = null;
let categories = [];
let products = [];
let suppliers = [];
let stocks = [];
let clients = [];
let sales = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }

    // Setup form handlers
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('supplier-form').addEventListener('submit', handleSupplierSubmit);
    document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);
    document.getElementById('client-form').addEventListener('submit', handleClientSubmit);
    document.getElementById('sale-form').addEventListener('submit', handleSaleSubmit);
});

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

function showDashboard() {
    showPage('dashboard');
    document.getElementById('user-name').textContent = currentUser.fullName || currentUser.username;
    loadDashboardData();
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');

    // Update active menu
    document.querySelectorAll('.nav-menu a').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    // Load data for section
    switch (sectionId) {
        case 'dashboard-home':
            loadDashboardData();
            break;
        case 'categories-section':
            loadCategories();
            break;
        case 'products-section':
            loadProducts();
            break;
        case 'suppliers-section':
            loadSuppliers();
            break;
        case 'stock-section':
            loadStock();
            break;
        case 'clients-section':
            loadClients();
            break;
        case 'sales-section':
            loadSales();
            break;
    }
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');

    // Load dropdowns if needed
    if (modalId === 'product-modal') {
        loadCategoryDropdown('product-category');
    } else if (modalId === 'stock-modal') {
        loadProductDropdown('stock-product');
        loadSupplierDropdown('stock-supplier');
    } else if (modalId === 'sale-modal') {
        loadClientDropdown('sale-client');
        loadStockDropdown();
        addSaleItem();
    }
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    // Reset forms
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    if (form) form.reset();

    // Clear sale items
    if (modalId === 'sale-modal') {
        document.getElementById('sale-items-container').innerHTML = '';
    }
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            showDashboard();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const fullName = document.getElementById('register-fullname').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, fullName, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            showPage('login-page');
        } else {
            errorDiv.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showPage('login-page');
}

// Dashboard Data
async function loadDashboardData() {
    try {
        const [catRes, prodRes, stockRes, clientRes] = await Promise.all([
            fetch(`${API_URL}/categories`),
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/stocks`),
            fetch(`${API_URL}/clients`)
        ]);

        const cats = await catRes.json();
        const prods = await prodRes.json();
        const stockItems = await stockRes.json();
        const clientList = await clientRes.json();

        document.getElementById('stat-categories').textContent = cats.length;
        document.getElementById('stat-products').textContent = prods.length;
        document.getElementById('stat-stock').textContent = stockItems.length;
        document.getElementById('stat-clients').textContent = clientList.length;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Categories CRUD
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategories() {
    const tbody = document.getElementById('categories-table-body');
    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${cat.description || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editCategory(${cat.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const description = document.getElementById('category-description').value;

    try {
        const url = id ? `${API_URL}/categories/${id}` : `${API_URL}/categories`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            hideModal('category-modal');
            loadCategories();
        } else {
            const data = await response.json();
            alert(data.message || 'Error saving category');
        }
    } catch (error) {
        alert('Error saving category');
    }
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (cat) {
        document.getElementById('category-id').value = cat.id;
        document.getElementById('category-name').value = cat.name;
        document.getElementById('category-description').value = cat.description || '';
        document.getElementById('category-modal-title').textContent = 'Edit Category';
        showModal('category-modal');
    }
}

async function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
            loadCategories();
        } catch (error) {
            alert('Error deleting category');
        }
    }
}

// Products CRUD
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = products.map(prod => `
        <tr>
            <td>${prod.id}</td>
            <td>${prod.name}</td>
            <td>${prod.brand || '-'}</td>
            <td>${prod.categoryName || '-'}</td>
            <td>${prod.warrantyMonths || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editProduct(${prod.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${prod.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadCategoryDropdown(selectId) {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const cats = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Category</option>' +
            cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const brand = document.getElementById('product-brand').value;
    const category_id = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const warranty_months = document.getElementById('product-warranty').value;

    try {
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, brand, category_id, description, warranty_months })
        });

        if (response.ok) {
            hideModal('product-modal');
            loadProducts();
        } else {
            const data = await response.json();
            alert(data.message || 'Error saving product');
        }
    } catch (error) {
        alert('Error saving product');
    }
}

function editProduct(id) {
    const prod = products.find(p => p.id === id);
    if (prod) {
        document.getElementById('product-id').value = prod.id;
        document.getElementById('product-name').value = prod.name;
        document.getElementById('product-brand').value = prod.brand || '';
        document.getElementById('product-description').value = prod.description || '';
        document.getElementById('product-warranty').value = prod.warrantyMonths || '';
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        showModal('product-modal');
        document.getElementById('product-category').value = prod.categoryId;
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            loadProducts();
        } catch (error) {
            alert('Error deleting product');
        }
    }
}

// Suppliers CRUD
async function loadSuppliers() {
    try {
        const response = await fetch(`${API_URL}/suppliers`);
        suppliers = await response.json();
        renderSuppliers();
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

function renderSuppliers() {
    const tbody = document.getElementById('suppliers-table-body');
    tbody.innerHTML = suppliers.map(sup => `
        <tr>
            <td>${sup.id}</td>
            <td>${sup.name}</td>
            <td>${sup.contactPerson || '-'}</td>
            <td>${sup.phone || '-'}</td>
            <td>${sup.email || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editSupplier(${sup.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteSupplier(${sup.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function handleSupplierSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('supplier-id').value;
    const name = document.getElementById('supplier-name').value;
    const contact_person = document.getElementById('supplier-contact').value;
    const phone = document.getElementById('supplier-phone').value;
    const email = document.getElementById('supplier-email').value;
    const address = document.getElementById('supplier-address').value;

    try {
        const url = id ? `${API_URL}/suppliers/${id}` : `${API_URL}/suppliers`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, contact_person, phone, email, address })
        });

        if (response.ok) {
            hideModal('supplier-modal');
            loadSuppliers();
        } else {
            const data = await response.json();
            alert(data.message || 'Error saving supplier');
        }
    } catch (error) {
        alert('Error saving supplier');
    }
}

function editSupplier(id) {
    const sup = suppliers.find(s => s.id === id);
    if (sup) {
        document.getElementById('supplier-id').value = sup.id;
        document.getElementById('supplier-name').value = sup.name;
        document.getElementById('supplier-contact').value = sup.contactPerson || '';
        document.getElementById('supplier-phone').value = sup.phone || '';
        document.getElementById('supplier-email').value = sup.email || '';
        document.getElementById('supplier-address').value = sup.address || '';
        document.getElementById('supplier-modal-title').textContent = 'Edit Supplier';
        showModal('supplier-modal');
    }
}

async function deleteSupplier(id) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        try {
            await fetch(`${API_URL}/suppliers/${id}`, { method: 'DELETE' });
            loadSuppliers();
        } catch (error) {
            alert('Error deleting supplier');
        }
    }
}

// Stock CRUD
async function loadStock() {
    try {
        const response = await fetch(`${API_URL}/stocks`);
        stocks = await response.json();
        renderStock();
    } catch (error) {
        console.error('Error loading stock:', error);
    }
}

function renderStock() {
    const tbody = document.getElementById('stock-table-body');
    tbody.innerHTML = stocks.map(stock => `
        <tr>
            <td>${stock.id}</td>
            <td>${stock.productName || '-'}</td>
            <td>${stock.supplierName || '-'}</td>
            <td>${stock.quantity}</td>
            <td>$${stock.costPrice?.toFixed(2) || '0.00'}</td>
            <td>$${stock.sellingPrice?.toFixed(2) || '0.00'}</td>
            <td>${stock.location || '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editStock(${stock.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteStock(${stock.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadProductDropdown(selectId) {
    try {
        const response = await fetch(`${API_URL}/products`);
        const prods = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Product</option>' +
            prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadSupplierDropdown(selectId) {
    try {
        const response = await fetch(`${API_URL}/suppliers`);
        const sups = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Supplier</option>' +
            sups.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

async function handleStockSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('stock-id').value;
    const product_id = document.getElementById('stock-product').value;
    const supplier_id = document.getElementById('stock-supplier').value;
    const quantity = document.getElementById('stock-quantity').value;
    const cost_price = document.getElementById('stock-cost').value;
    const selling_price = document.getElementById('stock-selling').value;
    const location = document.getElementById('stock-location').value;

    try {
        const url = id ? `${API_URL}/stocks/${id}` : `${API_URL}/stocks`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id,
                supplier_id,
                quantity,
                cost_price,
                selling_price,
                location,
                deposited_by_user_id: currentUser.id
            })
        });

        if (response.ok) {
            hideModal('stock-modal');
            loadStock();
        } else {
            const data = await response.json();
            alert(data.message || 'Error saving stock');
        }
    } catch (error) {
        alert('Error saving stock');
    }
}

function editStock(id) {
    const stock = stocks.find(s => s.id === id);
    if (stock) {
        document.getElementById('stock-id').value = stock.id;
        document.getElementById('stock-quantity').value = stock.quantity;
        document.getElementById('stock-cost').value = stock.costPrice;
        document.getElementById('stock-selling').value = stock.sellingPrice;
        document.getElementById('stock-location').value = stock.location || '';
        document.getElementById('stock-modal-title').textContent = 'Edit Stock';
        showModal('stock-modal');
        document.getElementById('stock-product').value = stock.productId;
        document.getElementById('stock-supplier').value = stock.supplierId;
    }
}

async function deleteStock(id) {
    if (confirm('Are you sure you want to delete this stock item?')) {
        try {
            await fetch(`${API_URL}/stocks/${id}`, { method: 'DELETE' });
            loadStock();
        } catch (error) {
            alert('Error deleting stock');
        }
    }
}

// Clients CRUD
async function loadClients() {
    try {
        const response = await fetch(`${API_URL}/clients`);
        clients = await response.json();
        renderClients();
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

function renderClients() {
    const tbody = document.getElementById('clients-table-body');
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.contactPhone || '-'}</td>
            <td>${client.contactEmail || '-'}</td>
            <td>${client.isCreditClient ? 'Yes' : 'No'}</td>
            <td>${client.creditLimit ? '$' + client.creditLimit.toFixed(2) : '-'}</td>
            <td>
                <button class="btn btn-edit" onclick="editClient(${client.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteClient(${client.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function handleClientSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const name = document.getElementById('client-name').value;
    const contact_phone = document.getElementById('client-phone').value;
    const contact_email = document.getElementById('client-email').value;
    const address = document.getElementById('client-address').value;
    const is_credit_client = document.getElementById('client-credit').checked;
    const credit_limit = document.getElementById('client-limit').value;

    try {
        const url = id ? `${API_URL}/clients/${id}` : `${API_URL}/clients`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, contact_phone, contact_email, address, is_credit_client, credit_limit })
        });

        if (response.ok) {
            hideModal('client-modal');
            loadClients();
        } else {
            const data = await response.json();
            alert(data.message || 'Error saving client');
        }
    } catch (error) {
        alert('Error saving client');
    }
}

function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (client) {
        document.getElementById('client-id').value = client.id;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-phone').value = client.contactPhone || '';
        document.getElementById('client-email').value = client.contactEmail || '';
        document.getElementById('client-address').value = client.address || '';
        document.getElementById('client-credit').checked = client.isCreditClient;
        document.getElementById('client-limit').value = client.creditLimit || '';
        document.getElementById('client-modal-title').textContent = 'Edit Client';
        showModal('client-modal');
    }
}

async function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        try {
            await fetch(`${API_URL}/clients/${id}`, { method: 'DELETE' });
            loadClients();
        } catch (error) {
            alert('Error deleting client');
        }
    }
}

// Sales
async function loadSales() {
    try {
        const response = await fetch(`${API_URL}/sales`);
        sales = await response.json();
        renderSales();
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function renderSales() {
    const tbody = document.getElementById('sales-table-body');
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${new Date(sale.saleDate).toLocaleString()}</td>
            <td>${sale.clientName || '-'}</td>
            <td>$${sale.totalAmount?.toFixed(2) || '0.00'}</td>
            <td>${sale.paymentMethod}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteSale(${sale.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadClientDropdown(selectId) {
    try {
        const response = await fetch(`${API_URL}/clients`);
        const clientList = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Client</option>' +
            clientList.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

let stocksForSale = [];

async function loadStockDropdown() {
    try {
        const response = await fetch(`${API_URL}/stocks`);
        stocksForSale = await response.json();
    } catch (error) {
        console.error('Error loading stock:', error);
    }
}

let saleItemCount = 0;

function addSaleItem() {
    const container = document.getElementById('sale-items-container');
    const itemHtml = `
        <div class="sale-item" id="sale-item-${saleItemCount}">
            <div class="form-group">
                <label>Stock Item</label>
                <select id="sale-stock-${saleItemCount}" onchange="updateSaleTotal()" required>
                    <option value="">Select Item</option>
                    ${stocksForSale.map(s => `<option value="${s.id}" data-price="${s.sellingPrice}" data-qty="${s.quantity}">${s.productName} (Qty: ${s.quantity}, $${s.sellingPrice?.toFixed(2)})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" id="sale-qty-${saleItemCount}" min="1" value="1" onchange="updateSaleTotal()" required>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="text" id="sale-price-${saleItemCount}" readonly>
            </div>
            <button type="button" class="btn btn-danger" onclick="removeSaleItem(${saleItemCount})">X</button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHtml);
    saleItemCount++;
    updateSaleTotal();
}

function removeSaleItem(index) {
    const item = document.getElementById(`sale-item-${index}`);
    if (item) {
        item.remove();
        updateSaleTotal();
    }
}

function updateSaleTotal() {
    let total = 0;
    const container = document.getElementById('sale-items-container');
    const items = container.querySelectorAll('.sale-item');

    items.forEach(item => {
        const select = item.querySelector('select');
        const qtyInput = item.querySelector('input[type="number"]');
        const priceInput = item.querySelector('input[type="text"]');

        if (select.value) {
            const option = select.options[select.selectedIndex];
            const price = parseFloat(option.dataset.price) || 0;
            const qty = parseInt(qtyInput.value) || 0;
            const subtotal = price * qty;
            total += subtotal;
            priceInput.value = '$' + subtotal.toFixed(2);
        } else {
            priceInput.value = '';
        }
    });

    // Apply discount
    const discount = parseFloat(document.getElementById('sale-discount').value) || 0;
    if (discount > 0) {
        total = total * (1 - discount / 100);
    }

    document.getElementById('sale-total').textContent = total.toFixed(2);
}

async function handleSaleSubmit(e) {
    e.preventDefault();
    const client_id = document.getElementById('sale-client').value;
    const payment_method = document.getElementById('sale-payment').value;
    const discount_applied = document.getElementById('sale-discount').value;

    // Collect items
    const items = [];
    const container = document.getElementById('sale-items-container');
    const itemElements = container.querySelectorAll('.sale-item');

    itemElements.forEach(item => {
        const select = item.querySelector('select');
        const qtyInput = item.querySelector('input[type="number"]');
        if (select.value) {
            items.push({
                stock_id: parseInt(select.value),
                quantity: parseInt(qtyInput.value)
            });
        }
    });

    if (items.length === 0) {
        alert('Please add at least one item');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id,
                user_id: currentUser.id,
                payment_method,
                discount_applied,
                items
            })
        });

        if (response.ok) {
            hideModal('sale-modal');
            saleItemCount = 0;
            loadSales();
            alert('Sale completed successfully!');
        } else {
            const data = await response.json();
            alert(data.message || 'Error creating sale');
        }
    } catch (error) {
        alert('Error creating sale');
    }
}

async function deleteSale(id) {
    if (confirm('Are you sure you want to delete this sale?')) {
        try {
            await fetch(`${API_URL}/sales/${id}`, { method: 'DELETE' });
            loadSales();
        } catch (error) {
            alert('Error deleting sale');
        }
    }
}

// Listen for discount changes
document.getElementById('sale-discount')?.addEventListener('input', updateSaleTotal);
