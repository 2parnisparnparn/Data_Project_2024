const API_BASE_URL = 'http://localhost:5501';
let orders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentSort = { field: 'orderDate', direction: 'desc' };

// Category mapping
const categoryMapping = {
    '1': 'Beverages',
    '2': 'Snacks',
    '3': 'Personal Care Products',
    '4': 'Household Cleaning Supplies',
    '5': 'Packaged Foods'
};

// Utility Functions
function showAlert(message, type) {
    const alert = document.getElementById(type === 'success' ? 'successAlert' : 'errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function showSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Data Fetching Functions
async function fetchOrders() {
    try {
        showSpinner();
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        orders = await response.json();
        filteredOrders = [...orders];
        updateSummary();
        renderOrdersTable();
        updatePagination();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error fetching orders', 'error');
    } finally {
        hideSpinner();
    }
}

async function fetchSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/summary/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch summary');
        }
        const summary = await response.json();
        updateSummaryDisplay(summary);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Filter Functions
function handleDateFilter(value) {
    const customDateRange = document.getElementById('customDateRange');
    customDateRange.style.display = value === 'custom' ? 'block' : 'none';

    if (value !== 'custom') {
        applyDateFilter(value);
    }
}

function applyDateFilter(filterType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);

        switch (filterType) {
            case 'today':
                return orderDate.getTime() === today.getTime();
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return orderDate.getTime() === yesterday.getTime();
            case 'thisWeek':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                return orderDate >= weekStart;
            case 'thisMonth':
                return orderDate.getMonth() === today.getMonth() &&
                       orderDate.getFullYear() === today.getFullYear();
            case 'all':
                return true;
            default:
                return true;
        }
    });

    updateFilteredOrders(filtered);
}

function applyCustomDateFilter() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    endDate.setHours(23, 59, 59, 999);

    if (startDate && endDate) {
        const filtered = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= startDate && orderDate <= endDate;
        });
        updateFilteredOrders(filtered);
    }
}

function handleCategoryFilter(categoryId) {
    const filtered = categoryId === 'all' 
        ? orders 
        : orders.filter(order => order.categoryId === categoryId);
    updateFilteredOrders(filtered);
}

function handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
        filteredOrders = [...orders];
    } else {
        const search = searchTerm.toLowerCase();
        filteredOrders = orders.filter(order => 
            order.customer.toLowerCase().includes(search) ||
            order.productName.toLowerCase().includes(search)
        );
    }
    currentPage = 1;
    renderOrdersTable();
    updatePagination();
    updateSummary(); // เพิ่มบรรทัดนี้
}

function updateFilteredOrders(filtered) {
    filteredOrders = filtered;
    currentPage = 1;
    renderOrdersTable();
    updatePagination();
    updateSummary();
}

// Sort Functions
function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }

    filteredOrders.sort((a, b) => {
        let comparison = 0;
        if (field === 'orderDate') {
            comparison = new Date(a[field]) - new Date(b[field]);
        } else if (['quantity', 'unitPrice', 'cost', 'sales'].includes(field)) {
            comparison = a[field] - b[field];
        } else {
            comparison = String(a[field]).localeCompare(String(b[field]));
        }
        return currentSort.direction === 'asc' ? comparison : -comparison;
    });

    renderOrdersTable();
}

// Pagination Functions
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevButton').disabled = currentPage === 1;
    document.getElementById('nextButton').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderOrdersTable();
        updatePagination();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderOrdersTable();
        updatePagination();
    }
}

// Modal Functions
function openModal(orderId) {
    const order = orders.find(o => o._id === orderId);
    if (order) {
        document.getElementById('editOrderId').value = order._id;
        document.getElementById('editOrderDate').value = new Date(order.orderDate).toISOString().split('T')[0];
        document.getElementById('editCustomer').value = order.customer;
        document.getElementById('editProductName').value = order.productName;
        document.getElementById('editQuantity').value = order.quantity;
        document.getElementById('editUnitPrice').value = order.unitPrice;
        document.getElementById('editCost').value = order.cost;
        document.getElementById('editSales').value = order.sales;
        
        document.getElementById('editModal').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
}

function calculateEditSales() {
    const quantity = Number(document.getElementById('editQuantity').value) || 0;
    const unitPrice = Number(document.getElementById('editUnitPrice').value) || 0;
    document.getElementById('editSales').value = (quantity * unitPrice).toFixed(2);
}

// CRUD Operations
async function deleteOrder(orderId) {
    if (!orderId) {
        showAlert('Invalid order ID', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this order?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete order');
            }

            const data = await response.json();
            showAlert(data.message, 'success');
            await fetchOrders();
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error deleting order', 'error');
        }
    }
}

// Render Functions
function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageOrders = filteredOrders.slice(start, end);

    pageOrders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(order.orderDate)}</td>
            <td>${order.customer}</td>
            <td>${order.productName}</td>
            <td>${categoryMapping[order.categoryId] || order.categoryId}</td>
            <td>${order.quantity}</td>
            <td>${formatCurrency(order.unitPrice)}</td>
            <td>${formatCurrency(order.cost)}</td>
            <td>${formatCurrency(order.sales)}</td>
            <td class="actions-cell">
                <button class="edit-button" onclick="openModal('${order._id}')">Edit</button>
                <button class="delete-button" onclick="deleteOrder('${order._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateSummary() {
    const summary = filteredOrders.reduce((acc, order) => ({
        totalOrders: acc.totalOrders + 1,
        totalSales: acc.totalSales + order.sales,
        totalCost: acc.totalCost + order.cost,
        totalQuantity: acc.totalQuantity + order.quantity
    }), {
        totalOrders: 0,
        totalSales: 0,
        totalCost: 0,
        totalQuantity: 0
    });

    summary.averageOrderValue = summary.totalOrders ? 
        summary.totalSales / summary.totalOrders : 0;

    updateSummaryDisplay(summary);
}

function updateSummaryDisplay(summary) {
    document.getElementById('totalOrders').textContent = summary.totalOrders;
    document.getElementById('totalSales').textContent = formatCurrency(summary.totalSales);
    document.getElementById('totalCost').textContent = formatCurrency(summary.totalCost);
    document.getElementById('averageOrderValue').textContent = 
        formatCurrency(summary.averageOrderValue);
}

// Event Listeners
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const orderId = document.getElementById('editOrderId').value;
    
    const formData = {
        orderDate: document.getElementById('editOrderDate').value,
        customer: document.getElementById('editCustomer').value,
        productName: document.getElementById('editProductName').value,
        quantity: Number(document.getElementById('editQuantity').value),
        unitPrice: Number(document.getElementById('editUnitPrice').value),
        cost: Number(document.getElementById('editCost').value),
        sales: Number(document.getElementById('editSales').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to update order');
        }

        const data = await response.json();
        showAlert(data.message, 'success');
        closeModal();
        await fetchOrders();
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error updating order', 'error');
    }
});

// Initialize
window.onload = function() {
    fetchOrders();
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
};

async function exportToExcel() {
    try {
        window.location.href = `${API_BASE_URL}/api/export-excel`;
        showAlert('Exporting to Excel...', 'success');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showAlert('Error exporting to Excel', 'error');
    }
}

