const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const mongodbUrl = "mongodb://localhost:27017";

let client = new MongoClient(mongodbUrl);
const dbName = 'orders';
const collectionName = 'order';

// global variable
let dbCollection;

async function connectToMongoDB() {
    try {
        client = await MongoClient.connect(mongodbUrl);
        dbCollection = client.db(dbName).collection(collectionName);
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
        return nextIDNumber;
    }
}


async function addManyOrders(orders) {
    const client = new MongoClient(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

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

module.exports = {
    connectToMongoDB,
    closeMongoDBConnection,
    findDocuments,
    findOrderList,
    addManyOrders,
    getnextIDNumber,
    addOrder
}