// resetData.js
const mongoose = require('mongoose');

// MongoDB connection with authentication
const username = 'admin';
const password = 'password';
const mongoURI = `mongodb://${username}:${password}@localhost:27017/orderDB?authSource=admin`;

// Define Order Schema
const orderSchema = new mongoose.Schema({
    orderDate: Date,
    productName: String,
    categoryId: String,
    customer: String,
    quantity: Number,
    unitPrice: Number,
    cost: Number,
    sales: Number
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

// Data to insert
const ordersData = [
    {
        orderDate: new Date('2024-09-15'),
        productName: 'Natural Mineral Water',
        categoryId: '1',
        customer: 'Jane Smith',
        quantity: 100,
        unitPrice: 12,
        cost: 10,
        sales: 1200
    },
    {
        orderDate: new Date('2024-09-20'),
        productName: 'Sparkling Water 330ml',
        categoryId: '1',
        customer: 'Michael Thompson',
        quantity: 160,
        unitPrice: 20,
        cost: 15,
        sales: 3200
    },
    {
        orderDate: new Date('2024-09-15'),
        productName: 'Alkaline Water',
        categoryId: '1',
        customer: 'Jane Smith',
        quantity: 80,
        unitPrice: 25,
        cost: 20,
        sales: 2000
    },
    {
        orderDate: new Date('2024-09-18'),
        productName: 'Potato Chips',
        categoryId: '2',
        customer: 'John Doe',
        quantity: 70,
        unitPrice: 35,
        cost: 30,
        sales: 2450
    },
    {
        orderDate: new Date('2024-09-20'),
        productName: 'Chocolate Bar',
        categoryId: '2',
        customer: 'Michael Thompson',
        quantity: 120,
        unitPrice: 42,
        cost: 40,
        sales: 5040
    },
    {
        orderDate: new Date('2024-09-22'),
        productName: 'Mixed Nuts',
        categoryId: '2',
        customer: 'John Doe',
        quantity: 110,
        unitPrice: 65,
        cost: 42,
        sales: 7150
    },
    {
        orderDate: new Date('2024-09-25'),
        productName: 'Shampoo',
        categoryId: '3',
        customer: 'Emily Roberts',
        quantity: 215,
        unitPrice: 85,
        cost: 80,
        sales: 18275
    },
    {
        orderDate: new Date('2024-09-28'),
        productName: 'Toothpaste',
        categoryId: '3',
        customer: 'Emily Roberts',
        quantity: 85,
        unitPrice: 25,
        cost: 15,
        sales: 2125
    },
    {
        orderDate: new Date('2024-10-22'),
        productName: 'Hand Soap',
        categoryId: '3',
        customer: 'Michael Thompson',
        quantity: 125,
        unitPrice: 75,
        cost: 50,
        sales: 9375
    },
    {
        orderDate: new Date('2024-10-25'),
        productName: 'Dishwashing Liquid',
        categoryId: '4',
        customer: 'Jane Smith',
        quantity: 200,
        unitPrice: 120,
        cost: 100,
        sales: 24000
    },
    {
        orderDate: new Date('2024-10-10'),
        productName: 'Floor Cleaner',
        categoryId: '4',
        customer: 'Michael Thompson',
        quantity: 20,
        unitPrice: 70,
        cost: 50,
        sales: 1400
    },
    {
        orderDate: new Date('2024-10-12'),
        productName: 'Paper Towels',
        categoryId: '4',
        customer: 'Jane Smith',
        quantity: 80,
        unitPrice: 50,
        cost: 40,
        sales: 4000
    },
    {
        orderDate: new Date('2024-10-15'),
        productName: 'Instant Noodles',
        categoryId: '5',
        customer: 'John Doe',
        quantity: 140,
        unitPrice: 60,
        cost: 50,
        sales: 8400
    },
    {
        orderDate: new Date('2024-10-20'),
        productName: 'Canned Tuna',
        categoryId: '5',
        customer: 'Jane Smith',
        quantity: 150,
        unitPrice: 120,
        cost: 100,
        sales: 18000
    },
    {
        orderDate: new Date('2024-10-30'),
        productName: 'Frozen Pizza',
        categoryId: '5',
        customer: 'Michael Thompson',
        quantity: 140,
        unitPrice: 150,
        cost: 120,
        sales: 21000
    }
];

async function resetDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');

        // Delete all existing orders
        await Order.deleteMany({});
        console.log('Deleted all existing orders');

        // Insert new orders
        await Order.insertMany(ordersData);
        console.log('Inserted new orders successfully');

        console.log('Database reset completed');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the reset function
resetDatabase();