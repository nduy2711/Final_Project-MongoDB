const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const orderModule = require('./public/javascripts/orders')
const mongodbModule = require("./public/javascripts/mongodb");

// Kết nối đến cơ sở dữ liệu MongoDB
mongodbModule.connectToMongoDB()
    .then(() => {
        console.log('Connect to MongoDB successfully');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        server.close();
    });

const server = app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

process.on('SIGINT', () => {
    mongodbModule.closeMongoDBConnection()
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use(express.static(path.join(__dirname, 'public', 'pages')));
app.use(express.static(path.join(__dirname)));
app.use(express.static('pages'));
app.use(express.json());


app.use(express.urlencoded({
    extended: true
}))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pages/home.html');
})

app.get('/order', async (req, res) => {
    try {
        const orders = await mongodbModule.findOrderList();
        const html = orderModule.output(orders);
        res.send(html)
    } catch (err) {
        console.error('Failed to fetch documents', err);
        res.status(500).send('Failed to fetch documents');
    }
})

app.post('/createManyOrders', async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const db = client.db('orders');
        const collection = db.collection('order');

        const orderDate = req.body.orderDate;
        const totalAmount = req.body.totalAmount;
        const orderStatus = req.body.orderStatus;
        const paymentMethod = req.body.paymentMethod;
        const image = req.file.filename;

        const newId = 'OD202400' + (await collection.countDocuments({}) + 1).toString().padStart(4, '0');

        const order = {
            orderID: newId,
            orderDate: orderDate,
            totalAmount: totalAmount,
            orderStatus: orderStatus,
            paymentMethod: paymentMethod,
            image: image
        };

        const insertedDocument = await collection.insertOne(order);

        const message = `${insertedDocument.insertedCount} product created successfully!`;
        res.json({ message: message });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/search', async (req, res) => {
    const { orderID } = req.query.orderID;
    const { orderStatus } = req.query.orderStatus;
    const query = {};

    if (orderID) {
        query.orderID = id;
    }
    if (orderStatus) {
        query.orderStatus = { $regex: orderStatus, $options: 'i' };
    }

    try {
        const searchResult = await mongodbModule.findDocuments(query);
        if (searchResult.length === 0) {
            res.status(404).send('No document found.');
        } else if (searchResult.length === 1) {
            res.json(searchResult[0]);
        } else {
            res.json(searchResult);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to search orders');
    }
});

app.delete('/delete/:orderID', async (req, res) => {
    const orderID = req.params.orderID;
    try {
        await mongodbModule.deleteOrder(orderID);
        res.send(`Đã xóa đơn hàng có ID = ${orderID} thành công.`);
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send('Đã xảy ra lỗi khi xóa đơn hàng.');
    }
});

app.post('/deleteMultipleOrders', async (req, res) => {
    const orderIDs = req.body.orderIDs;
    try {
        const deleteResults = await mongodbModule.deleteOrders(orderIDs);
        res.send(`Deleted ${deleteResults} orders.`);
    } catch (error) {
        console.error('Error deleting orders:', error);
        res.status(500).send('An error occurred while deleting orders.');
    }
});

app.get('/api/orderIDs', async (req, res) => {
    try {
        const orderIDs = await mongodbModule.getOrderIDs();
        res.json(orderIDs);
    } catch (error) {
        console.error('Error fetching order IDs:', error);
        res.status(500).send('Đã xảy ra lỗi khi lấy danh sách order IDs.');
    }
});

app.get('/read', async (req, res) => {
    const priceRange = req.query.priceRange;

    // Khởi tạo một biến để lưu trữ điều kiện tìm kiếm
    let searchCondition = {};

    // Xác định điều kiện tìm kiếm dựa trên mức giá được chọn
    const paymentMethod = req.query.paymentMethod;
    if (paymentMethod) {
        searchCondition.paymentMethod = { $regex: paymentMethod, $options: 'i' }
    }
    if (priceRange === 'below100') {
        searchCondition = { totalAmount: { $lt: 100 } };
    } else if (priceRange === '100to200') {
        searchCondition = { totalAmount: { $gte: 100, $lte: 200 } };
    } else if (priceRange === 'above200') {
        searchCondition = { totalAmount: { $gt: 200 } };
    }

    try {
        const searchResult = await mongodbModule.findDocuments(searchCondition);
        const tableRowsHTML = searchResult.map(order => {
            return `
                <tr>
                    <td>${order.orderID}</td>
                    <td>${order.orderDate}</td>
                    <td>$${order.totalAmount}</td>
                    <td>${order.orderStatus}</td>
                    <td>${order.paymentMethod}</td>
                    <td><img src="/public/images/${order.image}" alt="" style="max-width: 100px;"></td>
                </tr>
            `;
        }).join('');
        res.send(`
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        background-color: #fff;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                    }
                    th, td {
                        padding: 12px 15px;
                        text-align: left;
                    }
                    th {
                        background-color: #007bff;
                        color: #fff;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                    img {
                        max-width: 100px;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                    }
                    .back-icon {
                        text-align: left;
                        margin-bottom: 20px;
                    }
                    .back-icon a {
                        text-decoration: none;
                        color: #000000;
                        font-size: 24px;
                    }
                </style>
            </head>
            <body>
                <div class="back-icon">
                    <a href="./search.html"><i class="fas fa-arrow-left"></i> Back to Search</a>
                </div>
                <h1 style="text-align: center;">Order List</h1>                
                <table border="1">
                    <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Total Amount</th>
                        <th>Order Status</th>
                        <th>Payment Method</th>
                        <th>Image</th>
                    </tr>
                    <tbody>
                        ${tableRowsHTML}
                    </tbody>
                </table>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to search orders');
    }
})

app.get('/read/for/update', async (req, res) => {
    const orderID = req.query.orderID;
    const orderStatus = req.query.orderStatus;

    const query = {};

    if (orderID) {
        query.orderID = { $regex: orderID, $options: 'i' };
    }

    if (orderStatus) {
        query.orderStatus = { $regex: orderStatus, $options: 'i' };
    }

    try {
        const searchResult = await mongodbModule.findDocuments(query);
        res.json(searchResult);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to search orders');
    }
});

app.put('/update', async (req, res) => {
    try {
        const newOrder = req.body;
        const orderID = newOrder.orderID;

        const ordersCollection = mongodbModule.dbCollection;
        await ordersCollection.updateOne({ orderID: orderID }, {
            $set: {
                totalAmount: newOrder.totalAmount,
                paymentMethod: newOrder.paymentMethod
            }
        });

        const content = `Order ID = ${newOrder.orderID} updated successfully !!!`;
        res.json({ message: content }); // Response to fetch()
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal server error');
    }
});