
const Photo = require('./Photo');
const Video = require('./Video');
const Utility = require('./Utility');

const FormData = require('form-data');
const fetch = require('node-fetch');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const manifest = require('./../package.json');

const tmpDir = path.join(__dirname, '../', 'tmp');
const debug = true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(multer().any());

function deleteFiles (files) {
    files.forEach(file => {
        fs.unlink(file, () => true);
    });
}

app.get('/', function (req, res) {
    return res.send('MediaFlow (' + manifest.version + ')');
});

app.post('/', async function (req, res) {
    const main = async function () {
        if (req.body.action === undefined) {
            throw new Error('Missing "process" field.');
        }
        if (req.files === undefined) {
            throw new Error('Missing files to process.');
        }
        const actions = JSON.parse(req.body.action);
        const webhook = req.body.webhook || false;
        const files = req.files;
        const totalActions = actions.length;
        const data = [];
        const jobId = Utility.generateId();
        let actionIteration = 0;

        if (files.length) {
            !debug || console.group('Request');
            !debug || console.log('Actions:', req.body.action);
            !debug || console.log('Webhook:', webhook);

            for (let file of files) {
                !debug || console.group('File: ' + file.originalname);
                !debug || console.log(file);
                for (let action of actions) {
                    !debug || console.group('Action:' + JSON.stringify(action));
                    const object = (function () {
                        if (Photo.isPhoto(file.originalname)) {
                            return new Photo(jobId, file);
                        } else if (Video.isVideo(file.originalname)) {
                            return new Video(jobId, file);
                        } else {
                            throw new Error('Not a valid media extension.');
                        }
                    }());
                    !debug || console.log('Type:', object.constructor.name);

                    const push = (response) => {
                        data.push(Object.assign({
                            id: Utility.generateId(),
                            name: action.name
                        }, response));
                    };

                    if (webhook) {
                        object.process(action).then(response => {
                            actionIteration++;
                            push(response);
                            if (actionIteration === totalActions) {
                                const files = [];
                                const form = new FormData();
                                form.append('id', jobId);
                                for (let file of data) {
                                    const tmpFile = path.join(tmpDir, Utility.generateId() + '.' + file.output);
                                    fs.writeFileSync(tmpFile, file.base64);
                                    files.push(tmpFile);
                                    form.append('files', fs.createReadStream(tmpFile));
                                }
                                fetch(webhook, { method: 'POST', body: form })
                                    .then(() => {
                                        deleteFiles(files);
                                    })
                                    .catch(e => {
                                        console.log('WEBHOOK_FAILED');
                                        console.log(e.stack);
                                        deleteFiles(files);
                                    });
                                console.log('## JOBS COMPLETED ##');
                            }
                        });
                    } else {
                        push(await object.process(action));
                    }

                    !debug || console.groupEnd();
                }
                !debug || console.groupEnd();
            }
            !debug || console.log('End');
            !debug || console.groupEnd();
        }

        return {
            id: jobId,
            webhook: webhook,
            files: webhook ? [] : data
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

const server = app.listen(process.env.PORT || 3030);
server.timeout = 0;

console.group('Running MediaFlow (' + manifest.version + ')');
console.log('Port:', process.env.PORT || 3030);
console.log('FFMPEG Path:', process.env.FFMPEG_PATH || 'ffmpeg');
console.log('Timeout:', server.timeout);
console.groupEnd();
