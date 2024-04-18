const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const multer = require('multer')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const orderModule = require('./public/javascripts/orders')
const mongodbModule = require("./public/javascripts/mongodb")
const { error } = require('console')

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

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use(express.static(path.join(__dirname, 'public', 'pages')));
app.use(express.static(path.join(__dirname)));
app.use(express.static('pages'));

app.use(express.urlencoded({
    extended: true
}))

// var storage = multer.diskStorage({
//     destination:function(req, file, cb) {
//         if(file.mimetype === "image/jpg" || 
//         file.mimetype === "image/jpg"||
//         file.mimetype === "image/jpg") {
//             cb(null, 'public/images')
//         } else {
//             cb(new Error('not image'), false)
//         }
//     },
//     filename:function(req, file, cb) {
//         cb(null, file.originalname);
//         cb(null, Date.now+'.jpg')
//     }
// })

// var upload = multer({storage:storage});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pages/home.html');
})

app.get('/order', async (req,res) =>
{
    try {
        const orders = await mongodbModule.findOrderList();
        const html = orderModule.output(orders);
        res.send(html) 
    } catch(err) {
        console.error('Failed to fetch documents', err);
        res.status(500).send('Failed to fetch documents');
    }
})

app.post('/createManyOrders' ,async (req, res, next) => {
    // const file = req.file;
    // if(file) {
    //     const error = new Error('Please upload a file')
    //     return next(error);
    // }
    const order = req.body;
    console.log(order);
    mongodbModule.addManyOrders(order);
    const message  = `${order.length} orders created successfully!`
    res.json({message: message})
    //res.send(`Thêm thành công ${req.body.name}! Bạn có thể xem lại danh sách <a href=/order>tại đây</a>`)
});
