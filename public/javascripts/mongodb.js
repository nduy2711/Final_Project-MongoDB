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

async function getnextIDNumber(client, dbName, collectionName) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lastOrder = await collection.find().sort({ orderID: -1 }).limit(1).toArray();

    if (lastOrder.length === 0) {
        console.log("Khong co Id de lay");
        return 1;
    } else {
        const lastID = lastOrder[0].orderID;
        const nextIDNumber = parseInt(lastID.replace("OD202400", "")) + 1;
        console.log("co iD");
        console.log(lastID);
        return nextIDNumber;
    }
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

async function addOrder() {
    await connectToMongoDB();
    var orderID = await getID();
    var orderDate = document.getElementById("orderDate").value;
    var totalAmount = document.getElementById("totalAmount").value;
    var orderStatus = document.getElementById("orderStatus").value;
    var paymentMethod = document.getElementById("paymentMethod").value;
    var images = document.getElementById("image").files; // Lấy danh sách các tệp đã chọn
    for (var i = 0; i < images.length; i++) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var imageData = event.target.result; // Dữ liệu của tệp hình ảnh đã chọn
            var order = {
                orderID: orderID,
                orderDate: orderDate,
                totalAmount: totalAmount,
                orderStatus: orderStatus,
                paymentMethod: paymentMethod,
                image: imageData // Lưu dữ liệu hình ảnh vào đối tượng order
            };
        
            orders.push(order);
            outputMessage(`The order [${order.orderID}, ${orderDate}, ${orderStatus}] has been added`, 'red');
            //currentOrderID++; // Tăng giá trị của currentOrderID
        };
    
        reader.readAsDataURL(images[i]); // Đọc dữ liệu của từng tệp hình ảnh
    }
}

async function deleteOrders(orderID) {
    try {
        const deleteResults = await dbCollection.deleteMany({ _id: { $in: orderID } });
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

async function outputDBUD(orders) {
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
                    <td><a href="/pages/update.html?orderID=${order.orderID}">Edit</a></td>
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
                    <a href=""><i class="fas fa-arrow-left"></i> Back to Update</a>
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
                        <th>Edit</th>
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

async function getOrderById(orderID) {
    let client;
    try {
        client = await MongoClient.connect(mongodbUrl);
        console.log('Connected to MongoDB successfully!!!');
        const db = client.db(dbName);
        const ordersCollection = db.collection(collectionName);

        console.log('Orders Collection:', ordersCollection); // Log giá trị của ordersCollection

        const query = { orderID: { $regex: orderID, $options: 'i' } };
        console.log('Query:', query);

        const editOrder = await ordersCollection.findOne(query);
        console.log('Edit Order:', editOrder);

        return editOrder;
    } catch (err) {
        console.error('Error in getOrderById:', err);
        throw err;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

async function getOrderDetailsByID(orderID) {
    try {
        const documents = await findDocuments({ orderID: orderID }); // Hoặc sử dụng findOrderList() nếu phù hợp

        // Kiểm tra xem có đơn hàng nào khớp với orderID không
        const order = documents.find(doc => doc.orderID === orderID);

        if (order) {
            // Nếu tìm thấy đơn hàng, trả về thông tin chi tiết của đơn hàng
            return {
                orderID: order.orderID,
                orderDate: order.orderDate,
                totalAmount: order.totalAmount,
                orderStatus: order.orderStatus,
                paymentMethod: order.paymentMethod,
                image: order.image
            };
        } else {
            // Nếu không tìm thấy đơn hàng, trả về null hoặc một giá trị thích hợp
            return null;
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error fetching order details:', error);
        throw error; // Ném lỗi để bên ngoài có thể xử lý nếu cần
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
    getnextIDNumber,
    addOrder,
    getOrderById,
    outputDB,
    outputDBUD,
    findRead,
    getOrderDetailsByID,
    getOrderIDs,
    outputDB,
    findRead,
    dbCollection,
    mongodbUrl,
    dbName
}