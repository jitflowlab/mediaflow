
const Photo = require('./src/Photo');
const Utility = require('./src/Utility');

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
    const main = async function () {
        if (req.body.action === undefined) {
            throw new Error('Missing "process" field.');
        }
        if (req.files === undefined) {
            throw new Error('Missing files to process.');
        }
        const actions = JSON.parse(req.body.action);
        const files = req.files;
        const data = [];

        if (files.length) {
            for (let file of files) {
                for (let action of actions) {
                    let response = {};
                    if (Photo.isPhoto(file.originalname)) {
                        response = await Photo.process(file, action);
                    } else {
                        throw new Error('Not a valid media extension.');
                    }

                    data.push(Object.assign({
                        id: Utility.generateId(),
                        name: action.name
                    }, response));
                }
            }
        }

        return {
            files: data
        };
    };
    res.send(await main().catch(e => {
        console.log('INTERNAL_ERROR');
        console.log(e.stack);
        return {
            error: e.message
        };
    }));
});

app.listen(process.env.PORT || 3030);
