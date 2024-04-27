const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const { MongoClient } = require("mongodb");
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const querystring = require('querystring');

const orderModule = require('./public/javascripts/orders')
const mongodbModule = require("./public/javascripts/mongodb")
const { url } = require('inspector');

const mongodbUrl = "mongodb://localhost:27017";
let client = new MongoClient(mongodbUrl);
const dbName = 'orders';
const collectionName = 'order';

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

app.get('/getOrderId', async (req, res) => {
    // Kết nối tới MongoDB
    const client = new MongoClient(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Gọi hàm lấy ID cuối cùng
    const lastOrderID = await mongodbModule.getnextIDNumber(client, dbName, collectionName);

    // Trả về ID cuối cùng dưới dạng JSON
    res.json({ lastOrderID });
});

app.post('/createManyOrders' ,async (req, res, next) => {
    const order = req.body;
    mongodbModule.addManyOrders(order);
    const message  = `${order.length} orders created successfully!`
    res.json({message: message})
});

app.get('/addOrderJSON', (req, res) => {
    const filePath = path.join(__dirname, 'JSON', 'order.json'); // Đường dẫn đến file JSON

    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).send('Unable to read file');
        }

        try {
            const orders = JSON.parse(data); // Phân tích dữ liệu JSON thành mảng đơn hàng
            await mongodbModule.addManyOrders(orders); // Thêm các đơn hàng vào cơ sở dữ liệu
            res.status(200).send('Orders added successfully');
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Error parsing JSON');
        }
    });
});

app.delete('/api/delete/:orderID', async (req, res) => {
    const orderID = req.params.orderID;
    try {
        const deletedCount = await mongodbModule.deleteOrder(orderID);
        if (deletedCount === 1) {
            res.send(`Đã xóa đơn hàng có ID = ${orderID} thành công.`);
        } else {
            res.send(`Không tìm thấy đơn hàng có ID = ${orderID}.`);
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send('Đã xảy ra lỗi khi xóa đơn hàng.');
    }
});

app.delete('/api/deleteAll', async (req, res) => {
    try {
        const deletedCount = await mongodbModule.deleteAllOrders();
        res.send(`${deletedCount} đơn hàng đã được xóa thành công.`);
    } catch (error) {
        console.error('Error deleting all orders:', error);
        res.status(500).send('Đã xảy ra lỗi khi xóa tất cả đơn hàng.');
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
    const paymentMethod = req.query.paymentMethod;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const query = {};

    if (paymentMethod) {
        query.paymentMethod = { $regex: paymentMethod, $options: 'i' }
    }
    if (minPrice) {
        query.totalAmount = { $gte: parseFloat(minPrice) };
    }

    if (minPrice && maxPrice) {
        query.totalAmount = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    } else if (minPrice) {
        query.totalAmount = { $lte: parseFloat(minPrice) };
    } else if (maxPrice) {
        query.totalAmount = { $gte: parseFloat(maxPrice) };
    }

    try {
        const searchResult = await mongodbModule.findDocuments(query);
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

app.get('/getOrderDetails', async (req, res) => {
    const orderID = req.query.orderID; // Lấy orderID từ query parameter

    try {
        // Gọi hàm để lấy chi tiết đơn hàng dựa trên orderID
        const orderDetails = await mongodbModule.getOrderDetailsByID(orderID);

        if (orderDetails) {
            // Nếu tìm thấy chi tiết đơn hàng, gửi về dữ liệu dưới dạng JSON
            res.json(orderDetails);
        } else {
            // Nếu không tìm thấy, trả về mã lỗi 404 - Not Found
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Internal server error' }); // Trả về mã lỗi 500 - Internal Server Error
    }
});

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

        // Lấy thông tin đơn hàng hiện có từ cơ sở dữ liệu
        const existingOrder = await ordersCollection.findOne({ orderID: orderID });

        // So sánh thông tin mới với thông tin hiện có
        const isDataChanged =
            newOrder.orderDate !== existingOrder.orderDate ||
            newOrder.totalAmount !== existingOrder.totalAmount ||
            newOrder.orderStatus !== existingOrder.orderStatus ||
            newOrder.paymentMethod !== existingOrder.paymentMethod ||
            newOrder.image !== existingOrder.image;

        // Kiểm tra xem thông tin có được thay đổi không
        if (!isDataChanged) {
            res.json({ message: "Không có thông tin nào được cập nhật" });
            return;
        }

        // Thực hiện cập nhật chỉ khi có thông tin được thay đổi
        await ordersCollection.updateOne({ orderID: orderID }, {
            $set: {
                orderDate: newOrder.orderDate,
                totalAmount: newOrder.totalAmount,
                orderStatus: newOrder.orderStatus,
                paymentMethod: newOrder.paymentMethod,
                image: newOrder.image
            }
        });

        const content = `Order ID = ${newOrder.orderID} updated successfully !!!`;
        res.json({ message: content }); // Response to fetch()
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).send('Internal server error');
    }
});


