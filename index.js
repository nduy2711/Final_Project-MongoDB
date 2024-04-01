const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const server = app.listen(3000, () => {
    console.log("Server is running on port 3000");
})

app.get('/', (req, res) => {

})

app.get('')

app.post()
