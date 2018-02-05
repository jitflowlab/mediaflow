
const utility = require('./utility');
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

const test = async function () {
    for (let test of tests) {
        if (test.file === 'test.avi') {
            continue;
        }
        console.group('Test: ' + JSON.stringify(test));
        const res = await utility.post(test);
        if (res.files.length) {
            for (let file of res.files) {
                fs.writeFileSync(path.join(tmpDir, file.id + '.' + file.output), Buffer.from(file.base64, 'base64'));
                console.log('File:', file.id + '.' + file.output);
            }
        }
        console.groupEnd();
    }
};

test().catch(e => {
    console.log(e.stack);
    process.exit(1);
});

