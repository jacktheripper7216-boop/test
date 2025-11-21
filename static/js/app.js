// ===== API Configuration =====
const API_BASE = '/api';

// ===== State Management =====
let currentSection = 'dashboard';
let products = [];
let categories = [];
let suppliers = [];
let stocks = [];

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMenuToggle();
    loadDashboardData();
});

// ===== Navigation =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateToSection(section);
        });
    });
}

function navigateToSection(section) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

    // Update sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(`${section}-section`)?.classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        suppliers: 'Suppliers',
        stock: 'Stock Management'
    };
    document.getElementById('page-title').textContent = titles[section] || 'Dashboard';

    // Load section data
    currentSection = section;
    loadSectionData(section);

    // Close sidebar on mobile
    document.querySelector('.sidebar')?.classList.remove('active');
}

function initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    menuToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar?.contains(e.target) && !menuToggle?.contains(e.target)) {
            sidebar?.classList.remove('active');
        }
    });
}

// ===== Data Loading =====
async function loadDashboardData() {
    try {
        // Load all data in parallel
        const [productsRes, categoriesRes, suppliersRes, stocksRes] = await Promise.allSettled([
            fetch(`${API_BASE}/products`),
            fetch(`${API_BASE}/categories`),
            fetch(`${API_BASE}/suppliers`),
            fetch(`${API_BASE}/stocks`)
        ]);

        // Process results
        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
            products = await productsRes.value.json();
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
            categories = await categoriesRes.value.json();
        }
        if (suppliersRes.status === 'fulfilled' && suppliersRes.value.ok) {
            suppliers = await suppliersRes.value.json();
        }
        if (stocksRes.status === 'fulfilled' && stocksRes.value.ok) {
            stocks = await stocksRes.value.json();
        }

        // Update dashboard stats
        updateDashboardStats();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading data', 'error');
    }
}

function updateDashboardStats() {
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-categories').textContent = categories.length;
    document.getElementById('total-suppliers').textContent = suppliers.length;
    document.getElementById('total-stock').textContent = stocks.length;
}

async function loadSectionData(section) {
    switch (section) {
        case 'products':
            await loadProducts();
            break;
        case 'categories':
            await loadCategories();
            break;
        case 'suppliers':
            await loadSuppliers();
            break;
        case 'stock':
            await loadStock();
            break;
    }
}

// ===== Products =====
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            products = await response.json();
            renderProductsTable();
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-table-body').innerHTML =
            '<tr><td colspan="6" class="empty-state">Failed to load products</td></tr>';
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No products found. Click "Add Product" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><strong>${escapeHtml(product.name)}</strong></td>
            <td>${escapeHtml(product.description || '-')}</td>
            <td>${getCategoryName(product.category_id)}</td>
            <td>${getSupplierName(product.supplier_id)}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Product deleted successfully', 'success');
            loadProducts();
            loadDashboardData();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        showToast('Error deleting product', 'error');
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        showAddModal('product', product);
    }
}

// ===== Categories =====
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            categories = await response.json();
            renderCategoriesTable();
        } else {
            throw new Error('Failed to load categories');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categories-table-body').innerHTML =
            '<tr><td colspan="4" class="empty-state">Failed to load categories</td></tr>';
    }
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categories-table-body');

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No categories found. Click "Add Category" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td><strong>${escapeHtml(category.name)}</strong></td>
            <td>${escapeHtml(category.description || '-')}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editCategory(${category.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Category deleted successfully', 'success');
            loadCategories();
            loadDashboardData();
        } else {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        showToast('Error deleting category', 'error');
    }
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        showAddModal('category', category);
    }
}

// ===== Suppliers =====
async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE}/suppliers`);
        if (response.ok) {
            suppliers = await response.json();
            renderSuppliersTable();
        } else {
            throw new Error('Failed to load suppliers');
        }
    } catch (error) {
        console.error('Error loading suppliers:', error);
        document.getElementById('suppliers-table-body').innerHTML =
            '<tr><td colspan="6" class="empty-state">Failed to load suppliers</td></tr>';
    }
}

function renderSuppliersTable() {
    const tbody = document.getElementById('suppliers-table-body');

    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No suppliers found. Click "Add Supplier" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td>${supplier.id}</td>
            <td><strong>${escapeHtml(supplier.name)}</strong></td>
            <td>${escapeHtml(supplier.contact_name || '-')}</td>
            <td>${escapeHtml(supplier.email || '-')}</td>
            <td>${escapeHtml(supplier.phone || '-')}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editSupplier(${supplier.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${supplier.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteSupplier(id) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
        const response = await fetch(`${API_BASE}/suppliers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Supplier deleted successfully', 'success');
            loadSuppliers();
            loadDashboardData();
        } else {
            throw new Error('Failed to delete supplier');
        }
    } catch (error) {
        showToast('Error deleting supplier', 'error');
    }
}

function editSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
        showAddModal('supplier', supplier);
    }
}

// ===== Stock =====
async function loadStock() {
    try {
        const response = await fetch(`${API_BASE}/stocks`);
        if (response.ok) {
            stocks = await response.json();
            renderStockTable();
        } else {
            throw new Error('Failed to load stock');
        }
    } catch (error) {
        console.error('Error loading stock:', error);
        document.getElementById('stock-table-body').innerHTML =
            '<tr><td colspan="6" class="empty-state">Failed to load stock</td></tr>';
    }
}

function renderStockTable() {
    const tbody = document.getElementById('stock-table-body');

    if (stocks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No stock items found. Click "Add Stock" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = stocks.map(stock => `
        <tr>
            <td>${stock.id}</td>
            <td>${getProductName(stock.product_id)}</td>
            <td><strong>${stock.quantity}</strong></td>
            <td>${escapeHtml(stock.location || '-')}</td>
            <td>$${parseFloat(stock.price || 0).toFixed(2)}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="editStock(${stock.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStock(${stock.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteStock(id) {
    if (!confirm('Are you sure you want to delete this stock item?')) return;

    try {
        const response = await fetch(`${API_BASE}/stocks/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Stock item deleted successfully', 'success');
            loadStock();
            loadDashboardData();
        } else {
            throw new Error('Failed to delete stock');
        }
    } catch (error) {
        showToast('Error deleting stock', 'error');
    }
}

function editStock(id) {
    const stock = stocks.find(s => s.id === id);
    if (stock) {
        showAddModal('stock', stock);
    }
}

// ===== Modal Functions =====
function showAddModal(type, data = null) {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    const isEdit = data !== null;
    title.textContent = isEdit ? `Edit ${capitalize(type)}` : `Add ${capitalize(type)}`;

    let formHtml = '';

    switch (type) {
        case 'product':
            formHtml = `
                <form id="modal-form" onsubmit="saveProduct(event, ${data?.id || 'null'})">
                    <div class="form-group">
                        <label for="product-name">Name *</label>
                        <input type="text" id="product-name" required value="${escapeHtml(data?.name || '')}">
                    </div>
                    <div class="form-group">
                        <label for="product-description">Description</label>
                        <textarea id="product-description">${escapeHtml(data?.description || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="product-category">Category</label>
                        <select id="product-category">
                            <option value="">Select Category</option>
                            ${categories.map(c => `<option value="${c.id}" ${data?.category_id === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-supplier">Supplier</label>
                        <select id="product-supplier">
                            <option value="">Select Supplier</option>
                            ${suppliers.map(s => `<option value="${s.id}" ${data?.supplier_id === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Product'}</button>
                    </div>
                </form>
            `;
            break;

        case 'category':
            formHtml = `
                <form id="modal-form" onsubmit="saveCategory(event, ${data?.id || 'null'})">
                    <div class="form-group">
                        <label for="category-name">Name *</label>
                        <input type="text" id="category-name" required value="${escapeHtml(data?.name || '')}">
                    </div>
                    <div class="form-group">
                        <label for="category-description">Description</label>
                        <textarea id="category-description">${escapeHtml(data?.description || '')}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Category'}</button>
                    </div>
                </form>
            `;
            break;

        case 'supplier':
            formHtml = `
                <form id="modal-form" onsubmit="saveSupplier(event, ${data?.id || 'null'})">
                    <div class="form-group">
                        <label for="supplier-name">Company Name *</label>
                        <input type="text" id="supplier-name" required value="${escapeHtml(data?.name || '')}">
                    </div>
                    <div class="form-group">
                        <label for="supplier-contact">Contact Name</label>
                        <input type="text" id="supplier-contact" value="${escapeHtml(data?.contact_name || '')}">
                    </div>
                    <div class="form-group">
                        <label for="supplier-email">Email</label>
                        <input type="email" id="supplier-email" value="${escapeHtml(data?.email || '')}">
                    </div>
                    <div class="form-group">
                        <label for="supplier-phone">Phone</label>
                        <input type="tel" id="supplier-phone" value="${escapeHtml(data?.phone || '')}">
                    </div>
                    <div class="form-group">
                        <label for="supplier-address">Address</label>
                        <textarea id="supplier-address">${escapeHtml(data?.address || '')}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Supplier'}</button>
                    </div>
                </form>
            `;
            break;

        case 'stock':
            formHtml = `
                <form id="modal-form" onsubmit="saveStock(event, ${data?.id || 'null'})">
                    <div class="form-group">
                        <label for="stock-product">Product *</label>
                        <select id="stock-product" required>
                            <option value="">Select Product</option>
                            ${products.map(p => `<option value="${p.id}" ${data?.product_id === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="stock-quantity">Quantity *</label>
                        <input type="number" id="stock-quantity" required min="0" value="${data?.quantity || 0}">
                    </div>
                    <div class="form-group">
                        <label for="stock-price">Price</label>
                        <input type="number" id="stock-price" step="0.01" min="0" value="${data?.price || ''}">
                    </div>
                    <div class="form-group">
                        <label for="stock-location">Location</label>
                        <input type="text" id="stock-location" value="${escapeHtml(data?.location || '')}">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Stock'}</button>
                    </div>
                </form>
            `;
            break;
    }

    body.innerHTML = formHtml;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ===== Save Functions =====
async function saveProduct(event, id) {
    event.preventDefault();

    const data = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        category_id: parseInt(document.getElementById('product-category').value) || null,
        supplier_id: parseInt(document.getElementById('product-supplier').value) || null
    };

    try {
        const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast(id ? 'Product updated successfully' : 'Product created successfully', 'success');
            closeModal();
            loadProducts();
            loadDashboardData();
        } else {
            throw new Error('Failed to save product');
        }
    } catch (error) {
        showToast('Error saving product', 'error');
    }
}

async function saveCategory(event, id) {
    event.preventDefault();

    const data = {
        name: document.getElementById('category-name').value,
        description: document.getElementById('category-description').value
    };

    try {
        const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast(id ? 'Category updated successfully' : 'Category created successfully', 'success');
            closeModal();
            loadCategories();
            loadDashboardData();
        } else {
            throw new Error('Failed to save category');
        }
    } catch (error) {
        showToast('Error saving category', 'error');
    }
}

async function saveSupplier(event, id) {
    event.preventDefault();

    const data = {
        name: document.getElementById('supplier-name').value,
        contact_name: document.getElementById('supplier-contact').value,
        email: document.getElementById('supplier-email').value,
        phone: document.getElementById('supplier-phone').value,
        address: document.getElementById('supplier-address').value
    };

    try {
        const url = id ? `${API_BASE}/suppliers/${id}` : `${API_BASE}/suppliers`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast(id ? 'Supplier updated successfully' : 'Supplier created successfully', 'success');
            closeModal();
            loadSuppliers();
            loadDashboardData();
        } else {
            throw new Error('Failed to save supplier');
        }
    } catch (error) {
        showToast('Error saving supplier', 'error');
    }
}

async function saveStock(event, id) {
    event.preventDefault();

    const data = {
        product_id: parseInt(document.getElementById('stock-product').value),
        quantity: parseInt(document.getElementById('stock-quantity').value),
        price: parseFloat(document.getElementById('stock-price').value) || 0,
        location: document.getElementById('stock-location').value
    };

    try {
        const url = id ? `${API_BASE}/stocks/${id}` : `${API_BASE}/stocks`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast(id ? 'Stock updated successfully' : 'Stock created successfully', 'success');
            closeModal();
            loadStock();
            loadDashboardData();
        } else {
            throw new Error('Failed to save stock');
        }
    } catch (error) {
        showToast('Error saving stock', 'error');
    }
}

// ===== Helper Functions =====
function getCategoryName(id) {
    const category = categories.find(c => c.id === id);
    return category ? escapeHtml(category.name) : '-';
}

function getSupplierName(id) {
    const supplier = suppliers.find(s => s.id === id);
    return supplier ? escapeHtml(supplier.name) : '-';
}

function getProductName(id) {
    const product = products.find(p => p.id === id);
    return product ? escapeHtml(product.name) : '-';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '&#10003;',
        error: '&#10007;',
        warning: '&#9888;',
        info: '&#8505;'
    };

    toast.innerHTML = `
        <span style="font-size: 18px;">${icons[type]}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn var(--transition-base) reverse';
        setTimeout(() => toast.remove(), 250);
    }, 4000);
}

// ===== Global Search =====
document.getElementById('global-search')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    // Implement search functionality based on current section
    console.log('Searching for:', query);
});
