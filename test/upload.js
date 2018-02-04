
const url = 'http://localhost:' + (process.env.PORT || 3030);
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

const post = async function (action) {
    const form = new FormData();
    form.append('file', fs.createReadStream(path.join(__dirname, 'test.jpg')));
    form.append('action', JSON.stringify(action));
    const response = await fetch(url, { method: 'POST', body: form });

    return response.json();
};

const tests = [
    [
        {
            name: 'square',
            resize: '600, 600',
            crop: true,
            output: 'png'
        },
        {
            name: 'default',
            resize: '600, 600',
            max: true,
            output: 'png'
        },
        {
            name: 'rotate',
            resize: '600, 600',
            rotate: '180',
            output: 'png'
        },
        {
            name: 'greyscale',
            resize: '600, 600',
            greyscale: true,
            output: 'png'
        }
    ]
];

const test = async function () {
    for (let test of tests) {
        console.group('Test: ' + JSON.stringify(test));
        const res = await post(test);
        for (let file of res.files) {
            fs.writeFileSync(path.join(tmpDir, file.id + '.' + file.output), Buffer.from(file.base64, 'base64'));
            console.log('File:', file.id + '.' + file.output);
        }
        console.groupEnd();
    }
};

test().catch(e => {
    console.log(e.stack);
    process.exit(1);
});
