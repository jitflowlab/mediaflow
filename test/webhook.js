
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(multer().any());

app.post('/', async function (req, res) {
    console.log(req.files);
    res.send({
        success: true
    });
    process.exit(0);
});

app.listen(3131);
