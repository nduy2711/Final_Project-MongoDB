const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const mongodbUrl = "mongodb://localhost:27017";

let client = new MongoClient(url);
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
            then(() => {
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

async function findOrders() {
    const documents = await dbCollection.find().toArray();
    return documents;
}