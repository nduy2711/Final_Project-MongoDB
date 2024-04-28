const { MongoClient } = require("mongodb");

const mongodbUrl = "mongodb://localhost:27017";
const dbName = 'orders';
const collectionName = 'order';


// Khởi tạo client MongoDB
let client = new MongoClient(mongodbUrl);


const dbCollection = client.db(dbName).collection(collectionName);

async function connectToMongoDB() {
    try {
        await client.connect();
    } catch (err) {
        throw err;
    }
}

async function closeMongoDBConnection() {
    if(client) {
        await client.close()
            .then(() => {
                console.log('Disconnected from MongoDB');
                process.exit(0);
            })
            .catch((error) => {
                console.error('Failed to disconnect from MongoDB', error);
                process.exit(1);
            })
    } else {
        process.exit(0)
    }
}

async function findDocuments(query) {
    const documents = await dbCollection.find(query).toArray();
    return documents;
}

async function findOrderList() {
    const documents = await dbCollection.find().toArray();
    return documents;
}

async function findRead(Order) {
    const orderCollection = client.db(dbName).collection(collectionName);
    const result = await orderCollection.find(Order).sort({orderID: -1}.limit(10).toArray());
}

async function addManyOrders(orders) {
    const client = new MongoClient(mongodbUrl);

    try {
        await client.connect();
        console.log('Connected to MongoDB successfully!!');
        const ordersCollection = client.db(dbName).collection(collectionName);

        // Thêm dữ liệu vào collection
        const result = await ordersCollection.insertMany(orders);
        console.log(`${result.insertedCount} orders inserted successfully.`);

    } catch (err) {
        console.error('Error: ', err);
    } finally {
        // Đóng kết nối
        await client.close();
    }
}
async function deleteOrders(orderIDs) {
    try {
        const deleteResults = await dbCollection.deleteMany({ _id: { $in: orderIDs } });
        console.log(`Deleted ${deleteResults.deletedCount} orders.`);
        return deleteResults.deletedCount;
    } catch (error) {
        console.error('Error deleting orders:', error);
        throw error;
    }
}

async function deleteOrder(orderID) {
    try {
        const result = await dbCollection.deleteOne({ orderID: orderID });
        return result.deletedCount;
    } catch (error) {
        throw error;
    }
}

async function getOrderIDs() {
    try {
        const orders = await dbCollection.find().toArray();
        return orders.map(order => order.orderID);
    } catch (error) {
        throw error;
    }
}

async function outputDB() {
    try {
        let tableRowsHTML = '';
        orders.forEach(order => {
            tableRowsHTML += `
                <tr>
                    <td>${order.orderID}</td>
                    <td>${order.orderDate}</td>
                    <td>$${order.totalAmount}</td>
                    <td>${order.orderStatus}</td>
                    <td>${order.paymentMethod}</td>
                    <td><img src="/public/images/${order.image}" alt="" style="max-width: 100px;"></td>
                </tr>
            `;
        });

        return `
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
                    <a href="index.html"><i class="fas fa-arrow-left"></i> Back to Home</a>
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
                    ${tableRowsHTML}
                </table>
            </body>
            </html>
        `;
    } catch (error) {
        console.error('Error:', error);
        return 'Failed to generate order list';
    }
}

async function getnextIDNumber(client, dbName, collectionName) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lastOrder = await collection.find().sort({ orderID: -1 }).limit(1).toArray();

    if (lastOrder.length === 0) {
        return 1;
    } else {
        const lastID = lastOrder[0].orderID;
        const nextIDNumber = parseInt(lastID.replace("OD202400", "")) + 1;
        return nextIDNumber;
    }
}

module.exports = {
    connectToMongoDB,
    closeMongoDBConnection,
    findDocuments,
    findOrderList,
    addManyOrders,
    deleteOrder,
    deleteOrders,
    getOrderIDs,
    getnextIDNumber,
    outputDB,
    findRead,
    dbCollection,
    mongodbUrl,
    dbName
}