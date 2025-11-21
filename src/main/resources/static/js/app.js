// ===== API Configuration =====
const API_BASE_URL = '/api';

// ===== State Management =====
let products = [];
let categories = [];
let suppliers = [];
let stocks = [];
let sales = [];

// ===== DOM Elements =====
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const themeToggle = document.getElementById('themeToggle');
const navItems = document.querySelectorAll('.sidebar-nav li');
const pages = document.querySelectorAll('.page');

// ===== Theme Management =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== Navigation =====
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            navigateToPage(pageId);
        });
    });

    // Handle hash navigation
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'dashboard';
        navigateToPage(hash);
    });

    // Initial navigation
    const initialPage = window.location.hash.slice(1) || 'dashboard';
    navigateToPage(initialPage);
}

function navigateToPage(pageId) {
    // Update nav items
    navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === pageId);
    });

    // Update pages
    pages.forEach(page => {
        page.classList.toggle('active', page.id === pageId);
    });

    // Load page data
    loadPageData(pageId);

    // Close mobile sidebar
    sidebar.classList.remove('active');
}

function loadPageData(pageId) {
    switch (pageId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'stock':
            loadStock();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'sales':
            loadSales();
            break;
    }
}

// ===== API Calls =====
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast('Error', error.message, 'error');
        return null;
    }
}

// ===== Dashboard =====
async function loadDashboardData() {
    // Load all data for dashboard stats
    const [productsData, categoriesData, suppliersData] = await Promise.all([
        fetchAPI('/products'),
        fetchAPI('/categories'),
        fetchAPI('/suppliers')
    ]);

    if (productsData) {
        products = productsData;
        document.getElementById('totalProducts').textContent = products.length;
    }

    if (categoriesData) {
        categories = categoriesData;
        document.getElementById('totalCategories').textContent = categories.length;
    }

    if (suppliersData) {
        suppliers = suppliersData;
        document.getElementById('totalSuppliers').textContent = suppliers.length;
    }

    // Calculate total sales (demo value)
    document.getElementById('totalSales').textContent = '$24,850';

    // Render recent products
    renderRecentProducts();

    // Initialize charts
    initCharts();
}

function renderRecentProducts() {
    const tbody = document.getElementById('recentProductsTable');
    const recentProducts = products.slice(0, 5);

    if (recentProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No products yet</h3>
                    <p>Add your first product to get started</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recentProducts.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    <div class="product-image">
                        <i class="fas fa-box"></i>
                    </div>
                    <span>${product.name || 'Unnamed Product'}</span>
                </div>
            </td>
            <td>${product.sku || 'N/A'}</td>
            <td>${getCategoryName(product.categoryId)}</td>
            <td>$${(product.price || 0).toFixed(2)}</td>
            <td>${product.quantity || 0}</td>
            <td><span class="status-badge ${getStockStatus(product.quantity)}">${getStockStatusText(product.quantity)}</span></td>
        </tr>
    `).join('');
}

function getCategoryName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
}

function getStockStatus(quantity) {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'in-stock';
}

function getStockStatusText(quantity) {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
}

// ===== Charts =====
let salesChart = null;
let categoryChart = null;

function initCharts() {
    initSalesChart();
    initCategoryChart();
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    if (salesChart) {
        salesChart.destroy();
    }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales',
                data: [3200, 4100, 2800, 5200, 4800, 3900, 4500],
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: value => '$' + value
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (categoryChart) {
        categoryChart.destroy();
    }

    const categoryNames = categories.length > 0
        ? categories.map(c => c.name).slice(0, 5)
        : ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

    const categoryData = categories.length > 0
        ? categories.map(() => Math.floor(Math.random() * 100) + 20).slice(0, 5)
        : [45, 32, 28, 18, 12];

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryNames,
            datasets: [{
                data: categoryData,
                backgroundColor: [
                    '#6366f1',
                    '#8b5cf6',
                    '#ec4899',
                    '#f59e0b',
                    '#10b981'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// ===== Products =====
async function loadProducts() {
    const data = await fetchAPI('/products');
    if (data) {
        products = data;
        renderProductsTable();
        populateCategoryFilter();
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTable');

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No products found</h3>
                    <p>Add your first product to get started</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-cell">
                    <div class="product-image">
                        <i class="fas fa-box"></i>
                    </div>
                    <span>${product.name || 'Unnamed Product'}</span>
                </div>
            </td>
            <td>${product.sku || 'N/A'}</td>
            <td>${getCategoryName(product.categoryId)}</td>
            <td>$${(product.price || 0).toFixed(2)}</td>
            <td>${product.quantity || 0}</td>
            <td><span class="status-badge ${getStockStatus(product.quantity)}">${getStockStatusText(product.quantity)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn" onclick="editProduct(${product.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct(${product.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function populateCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    const productCategory = document.getElementById('productCategory');

    const options = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (filter) {
        filter.innerHTML = '<option value="">All Categories</option>' + options;
    }

    if (productCategory) {
        productCategory.innerHTML = '<option value="">Select Category</option>' + options;
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const result = await fetchAPI(`/products/${id}`, { method: 'DELETE' });
    if (result !== null) {
        showToast('Success', 'Product deleted successfully', 'success');
        loadProducts();
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productName').value = product.name || '';
    document.getElementById('productSku').value = product.sku || '';
    document.getElementById('productCategory').value = product.categoryId || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productStock').value = product.quantity || '';
    document.getElementById('productDescription').value = product.description || '';

    const form = document.getElementById('productForm');
    form.setAttribute('data-edit-id', id);

    openModal('productModal');
}

// ===== Categories =====
async function loadCategories() {
    const data = await fetchAPI('/categories');
    if (data) {
        categories = data;
        renderCategoriesGrid();
    }
}

function renderCategoriesGrid() {
    const grid = document.getElementById('categoriesGrid');

    if (categories.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>No categories found</h3>
                <p>Add your first category to organize products</p>
            </div>
        `;
        return;
    }

    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    grid.innerHTML = categories.map((category, index) => {
        const color = colors[index % colors.length];
        const productCount = products.filter(p => p.categoryId === category.id).length;

        return `
            <div class="category-card">
                <div class="category-icon" style="background: ${color}20; color: ${color}">
                    <i class="fas fa-tag"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description || 'No description'}</p>
                <div class="category-stats">
                    <span><i class="fas fa-box"></i> ${productCount} products</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Suppliers =====
async function loadSuppliers() {
    const data = await fetchAPI('/suppliers');
    if (data) {
        suppliers = data;
        renderSuppliersGrid();
    }
}

function renderSuppliersGrid() {
    const grid = document.getElementById('suppliersGrid');

    if (suppliers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-truck"></i>
                <h3>No suppliers found</h3>
                <p>Add your first supplier to manage inventory sources</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = suppliers.map(supplier => {
        const initials = (supplier.name || 'NA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        return `
            <div class="supplier-card">
                <div class="supplier-header">
                    <div class="supplier-avatar">${initials}</div>
                    <div class="supplier-info">
                        <h3>${supplier.name || 'Unknown Supplier'}</h3>
                        <p>Supplier ID: ${supplier.id}</p>
                    </div>
                </div>
                <div class="supplier-details">
                    <span><i class="fas fa-envelope"></i> ${supplier.email || 'N/A'}</span>
                    <span><i class="fas fa-phone"></i> ${supplier.phone || 'N/A'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${supplier.address || 'N/A'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Stock =====
async function loadStock() {
    // Reload products for stock data
    const data = await fetchAPI('/products');
    if (data) {
        products = data;
        renderStockTable();
        updateLowStockCount();
    }
}

function renderStockTable() {
    const tbody = document.getElementById('stockTable');

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-warehouse"></i>
                    <h3>No stock data</h3>
                    <p>Add products to manage stock levels</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => {
        const minStock = 10;
        const maxStock = 100;

        return `
            <tr>
                <td>
                    <div class="product-cell">
                        <div class="product-image">
                            <i class="fas fa-box"></i>
                        </div>
                        <span>${product.name || 'Unnamed Product'}</span>
                    </div>
                </td>
                <td>${product.quantity || 0}</td>
                <td>${minStock}</td>
                <td>${maxStock}</td>
                <td><span class="status-badge ${getStockStatus(product.quantity)}">${getStockStatusText(product.quantity)}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" onclick="updateProductStock(${product.id})" title="Update Stock">
                            <i class="fas fa-plus-minus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateLowStockCount() {
    const lowStockCount = products.filter(p => (p.quantity || 0) < 10).length;
    document.getElementById('lowStockCount').textContent = lowStockCount;
}

function updateProductStock(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('stockProduct').innerHTML = `<option value="${product.id}">${product.name}</option>`;
    document.getElementById('stockQuantity').value = '';

    openModal('stockModal');
}

// ===== Sales =====
async function loadSales() {
    // Demo sales data
    const demoSales = [
        { id: 1, customer: 'John Doe', products: 3, total: 149.99, date: '2024-01-15', status: 'completed' },
        { id: 2, customer: 'Jane Smith', products: 5, total: 289.50, date: '2024-01-14', status: 'completed' },
        { id: 3, customer: 'Bob Wilson', products: 2, total: 79.99, date: '2024-01-13', status: 'pending' },
        { id: 4, customer: 'Alice Brown', products: 1, total: 29.99, date: '2024-01-12', status: 'completed' },
        { id: 5, customer: 'Charlie Davis', products: 4, total: 199.99, date: '2024-01-11', status: 'completed' }
    ];

    renderSalesTable(demoSales);
}

function renderSalesTable(sales) {
    const tbody = document.getElementById('salesTable');

    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No sales yet</h3>
                    <p>Sales will appear here once recorded</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>#${sale.id.toString().padStart(4, '0')}</td>
            <td>${sale.customer}</td>
            <td>${sale.products} items</td>
            <td>$${sale.total.toFixed(2)}</td>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td><span class="status-badge ${sale.status}">${sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</span></td>
        </tr>
    `).join('');
}

// ===== Modals =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            form.removeAttribute('data-edit-id');
        }
    }
}

// Close modal on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            closeModal(activeModal.id);
        }
    }
});

// ===== Form Handlers =====
document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const editId = form.getAttribute('data-edit-id');

    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        categoryId: parseInt(document.getElementById('productCategory').value) || null,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value
    };

    let result;
    if (editId) {
        result = await fetchAPI(`/products/${editId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    } else {
        result = await fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    if (result) {
        showToast('Success', `Product ${editId ? 'updated' : 'created'} successfully`, 'success');
        closeModal('productModal');
        loadProducts();
    }
});

document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    const result = await fetchAPI('/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
    });

    if (result) {
        showToast('Success', 'Category created successfully', 'success');
        closeModal('categoryModal');
        loadCategories();
    }
});

document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const supplierData = {
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value
    };

    const result = await fetchAPI('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData)
    });

    if (result) {
        showToast('Success', 'Supplier created successfully', 'success');
        closeModal('supplierModal');
        loadSuppliers();
    }
});

document.getElementById('stockForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productId = document.getElementById('stockProduct').value;
    const quantity = parseInt(document.getElementById('stockQuantity').value);
    const type = document.getElementById('stockType').value;

    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const newQuantity = type === 'add'
        ? (product.quantity || 0) + quantity
        : Math.max(0, (product.quantity || 0) - quantity);

    const result = await fetchAPI(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...product, quantity: newQuantity })
    });

    if (result) {
        showToast('Success', 'Stock updated successfully', 'success');
        closeModal('stockModal');
        loadStock();
    }
});

// ===== Search & Filter =====
document.getElementById('productSearch')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(query) ||
        (p.sku || '').toLowerCase().includes(query)
    );

    const tbody = document.getElementById('productsTable');
    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try a different search term</p>
                </td>
            </tr>
        `;
    } else {
        // Temporarily update products for rendering
        const originalProducts = [...products];
        products = filteredProducts;
        renderProductsTable();
        products = originalProducts;
    }
});

document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;

    if (categoryId) {
        const filteredProducts = products.filter(p => p.categoryId === categoryId);
        const originalProducts = [...products];
        products = filteredProducts;
        renderProductsTable();
        products = originalProducts;
    } else {
        renderProductsTable();
    }
});

// ===== Toast Notifications =====
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle';

    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// ===== Mobile Menu Toggle =====
menuToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();

    // Add theme toggle listener
    themeToggle?.addEventListener('click', toggleTheme);

    console.log('Inventory Pro initialized successfully!');
});
