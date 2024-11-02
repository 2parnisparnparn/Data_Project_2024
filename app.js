const API_BASE_URL = 'http://localhost:5501';

// Category mapping object
const categoryMapping = {
    'Natural Mineral Water': '1',
    'Sparkling Water 330ml': '1',
    'Alkaline Water': '1',
    'Potato Chips': '2',
    'Chocolate Bar': '2',
    'Mixed Nuts': '2',
    'Shampoo': '3',
    'Toothpaste': '3',
    'Hand Soap': '3',
    'Dishwashing Liquid': '4',
    'Floor Cleaner': '4',
    'Paper Towels': '4',
    'Instant Noodles': '5',
    'Canned Tuna': '5',
    'Frozen Pizza': '5'
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

function calculateSales() {
    const quantity = Number(document.getElementById('quantity').value) || 0;
    const unitPrice = Number(document.getElementById('unitPrice').value) || 0;
    const salesInput = document.getElementById('sales');
    salesInput.value = (quantity * unitPrice).toFixed(2);
}

async function submitOrder(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit order');
        }

        showAlert('Order submitted successfully!', 'success');
        return true;
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error submitting order', 'error');
        return false;
    }
}



// Event Listeners
window.onload = function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
};

document.getElementById('productName').addEventListener('change', function() {
    const selectedProduct = this.value;
    const categoryId = categoryMapping[selectedProduct];
    if (categoryId) {
        document.getElementById('categoryId').value = categoryId;
    }
});

document.getElementById('quantity').addEventListener('input', calculateSales);
document.getElementById('unitPrice').addEventListener('input', calculateSales);

document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        orderDate: document.getElementById('orderDate').value,
        customer: document.getElementById('customer').value,
        productName: document.getElementById('productName').value,
        categoryId: document.getElementById('categoryId').value,
        quantity: Number(document.getElementById('quantity').value),
        unitPrice: Number(document.getElementById('unitPrice').value),
        cost: Number(document.getElementById('cost').value),
        sales: Number(document.getElementById('sales').value)
    };

    const success = await submitOrder(formData);
    if (success) {
        const orderDate = document.getElementById('orderDate').value;
        document.getElementById('orderForm').reset();
        document.getElementById('orderDate').value = orderDate;
    }
});