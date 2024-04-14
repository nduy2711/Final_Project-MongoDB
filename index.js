const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const oderModule = require('./public/javascripts/orders')
const mongodbModule = require("./public/javascripts/mongodb")

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
})

process.on('SIGINT', () => {
    mongodbModule.closeMongoDBConnection()
});

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname)));
app.use(express.static('./public/pages'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pages/home.html');
})

app.post('/createManyOrders', async (req, res) => {
    const order = req.body;
    console.log(order);
    mongodbModule.addManyOrders(order);
    const message  = `${order.length} orders created successfully!`
    res.json({message: message})
    //res.send(`Thêm thành công ${req.body.name}! Bạn có thể xem lại danh sách <a href=/order>tại đây</a>`)
});
