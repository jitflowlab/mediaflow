/* eslint-env node, mocha */

const utility = require('./utility');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;
const tmpDir = path.join(__dirname, 'tmp');
if (fs.existsSync(tmpDir)) {
    exec('rm -rf ' + tmpDir);
}
fs.mkdirSync(tmpDir);

const tests = [
    {
        file: 'test.avi',
        action: [
            {
                output: 'mp4'
            },
            {
                output: 'webm'
            }
        ]
    },
    {
        file: 'test.jpg',
        action: [
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
    }
];

describe('Uploads', function () {
    this.timeout(0);

    for (let test of tests) {
        describe('Test: ' + JSON.stringify(test), function () {
            it(`should return ${test.action.length} processed files.`, async function () {
                const res = await utility.post(test);
                assert.equal(test.action.length, res.files.length);
                if (res.files.length) {
                    for (let file of res.files) {
                        fs.writeFileSync(
                            path.join(tmpDir, file.id + '.' + file.output),
                            Buffer.from(file.base64, 'base64')
                        );
                    }
                }
            });
        });
    }
});

