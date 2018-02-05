
const url = 'http://localhost:' + (process.env.PORT || 3030);
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const post = async function (test) {
    const form = new FormData();
    form.append('file', fs.createReadStream(path.join(__dirname, 'media', test.file)));
    form.append('action', JSON.stringify(test.action));
    if (test.webhook !== undefined) {
        form.append('webhook', test.webhook);
    }
    const response = await fetch(url, { method: 'POST', body: form });

    return response.json();
};

module.exports = {
    post: post
};
