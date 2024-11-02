const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Excel = require('exceljs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB connection
const username = 'admin';
const password = 'password';
const mongoURI = `mongodb://${username}:${password}@localhost:27017/orderDB?authSource=admin`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Successfully connected to MongoDB.');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Order Schema
const orderSchema = new mongoose.Schema({
    orderDate: Date,
    customer: String,
    productName: String,
    categoryId: String,
    quantity: Number,
    unitPrice: Number,
    cost: Number,
    sales: Number
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

// API Routes

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            error: 'Error fetching orders',
            details: error.message 
        });
    }
});

// GET single order
app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            error: 'Error fetching order',
            details: error.message 
        });
    }
});

// POST new order
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        const savedOrder = await order.save();
        res.status(201).json({ 
            message: 'Order created successfully', 
            order: savedOrder 
        });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ 
            error: 'Error saving order',
            details: error.message 
        });
    }
});

// PUT update order
app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.status(200).json({ 
            message: 'Order updated successfully',
            order 
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ 
            error: 'Error updating order',
            details: error.message 
        });
    }
});

// DELETE order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const order = await Order.findByIdAndDelete(id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.status(200).json({ 
            message: 'Order deleted successfully',
            deletedOrder: order 
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ 
            error: 'Error deleting order',
            details: error.message 
        });
    }
});

// GET orders summary
app.get('/api/orders/summary/stats', async (req, res) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: '$sales' },
                    totalCost: { $sum: '$cost' },
                    averageOrderValue: { $avg: '$sales' },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        const summary = result[0] || {
            totalOrders: 0,
            totalSales: 0,
            totalCost: 0,
            averageOrderValue: 0,
            totalQuantity: 0
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ 
            error: 'Error fetching summary',
            details: error.message 
        });
    }
});

// GET orders by date range
app.get('/api/orders/filter/date', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const query = {
            orderDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const orders = await Order.find(query).sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching filtered orders:', error);
        res.status(500).json({ 
            error: 'Error fetching filtered orders',
            details: error.message 
        });
    }
});

// API endpoint to export orders to Excel
app.get('/api/export-excel', async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        const workbook = new Excel.Workbook();
        const ordersSheet = workbook.addWorksheet('Orders');

        // Update columns to include customer
        ordersSheet.columns = [
            { header: 'Order ID', key: 'id', width: 25 },
            { header: 'Order Date', key: 'orderDate', width: 15 },
            { header: 'Customer', key: 'customer', width: 20 },  // เพิ่มคอลัมน์ customer
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Category ID', key: 'categoryId', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Unit Price', key: 'unitPrice', width: 12 },
            { header: 'Cost', key: 'cost', width: 12 },
            { header: 'Sales', key: 'sales', width: 12 }
        ];

        // Style header
        ordersSheet.getRow(1).font = { bold: true };
        ordersSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data including customer
        orders.forEach(order => {
            ordersSheet.addRow({
                id: order._id.toString(),
                orderDate: new Date(order.orderDate).toLocaleDateString(),
                customer: order.customer,  // เพิ่มข้อมูล customer
                productName: order.productName,
                categoryId: order.categoryId,
                quantity: order.quantity,
                unitPrice: order.unitPrice,
                cost: order.cost,
                sales: order.sales
            });
        });

        // Style number columns
        const numberColumns = ['quantity', 'unitPrice', 'cost', 'sales'];
        ordersSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                numberColumns.forEach(colKey => {
                    const cell = row.getCell(ordersSheet.getColumn(colKey).number);
                    cell.numFmt = '#,##0.00';
                });
            }
        });

        // Create Category worksheet
        const categorySheet = workbook.addWorksheet('Category');

        // Define columns for Category sheet
        categorySheet.columns = [
            { header: 'CatID', key: 'catId', width: 15 },
            { header: 'Category', key: 'category', width: 30 }
        ];

        // Style Category sheet header
        categorySheet.getRow(1).font = { bold: true };
        categorySheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add category data
        const categoryData = [
            { catId: 1, category: 'Beverages' },
            { catId: 2, category: 'Snacks' },
            { catId: 3, category: 'Personal Care Products' },
            { catId: 4, category: 'Household Cleaning Supplies' },
            { catId: 5, category: 'Packaged Foods' }
        ];

        categoryData.forEach(cat => {
            categorySheet.addRow(cat);
        });


        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=Orders.xlsx'
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).json({ error: 'Error exporting to Excel' });
    }
});

// Start server
const PORT = 5501;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});