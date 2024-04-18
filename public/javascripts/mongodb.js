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

module.exports = {
    connectToMongoDB,
    closeMongoDBConnection,
    findDocuments,
    findOrderList,
    addManyOrders
}