
const Utility = require('./Utility');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const tmpDir = path.join(__dirname, '../', 'tmp');
const logDir = path.join(__dirname, '../', 'log');
const bin = process.env.FFMPEG_PATH || 'ffmpeg';
const acceptedInput = ['mp4', 'mov', 'avi'];
const acceptedOutput = ['mp4', 'webm', 'png'];

const commands = {
    png: [
        '{BIN} -i {INPUT} -ss 00:00:14.435 -vf scale={SCALE} -vframes 1 {OUTPUT}'
    ],
    mp4: [
        '{BIN} -i {INPUT} -vcodec h264 -acodec aac -strict -2 {OUTPUT}'
    ],
    webm: [
        '{BIN} -i {INPUT} -vcodec libvpx -qmin 0 -qmax 50 -crf 10 -b:v 1M -acodec libvorbis {OUTPUT}'
    ]
};

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
}

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

class Video {
    constructor (id, file) {
        this._id = id;
        this._file = file;
    }

    static isVideo (file) {
        return acceptedInput.includes(Utility.getExtension(file));
    }

    process (action) {
        const output = action.output;
        if (!acceptedOutput.includes(output)) {
            throw new Error(`"${output}" is not a valid output.`);
        }

        const ext = Utility.getExtension(this._file.originalname);
        const id = Utility.generateId();
        const fileInput = path.join(tmpDir, this._id + '.' + ext);
        const fileOutput = path.join(tmpDir, id + '.' + output);

        if (!fs.existsSync(fileInput)) {
            console.log('Input file:', fileInput);
            fs.writeFileSync(fileInput, this._file.buffer);
            if (!fs.existsSync(fileInput)) {
                throw new Error(`"${fileInput}" input file does not exist.`);
            }
        }
        for (let command of commands[output]) {
            const replacements = {
                BIN: bin,
                INPUT: fileInput,
                OUTPUT: fileOutput,
                SCALE: action.scale || ''
            };
            command = command.replace(/\{([A-Z]+)\}/g, function () {
                if (replacements[arguments[1]] !== undefined) {
                    return replacements[arguments[1]];
                }
                return '';
            });
            console.log('Command:', command);
            try {
                exec('echo "## ' + this._id + ' ##" >> ' + logDir + '/mediaflow.log 2>&1');
                exec(command + ' >> ' + logDir + '/mediaflow.log 2>&1');

                if (fs.existsSync(fileOutput)) {
                    console.log('FILE_EXISTS', 'Skipping next command.');
                    break;
                }
            } catch (e) {
                console.log('FAILED:', e.stack);
            }
        }

        if (!fs.existsSync(fileOutput)) {
            throw new Error('FFMPEG failed on: ' + fileOutput);
        }

        const buffer = fs.readFileSync(fileOutput);
        fs.unlink(fileInput, () => true);
        fs.unlink(fileOutput, () => true);

        return {
            output: output,
            base64: Buffer.from(buffer, 'base64')
        };
    }
}

module.exports = Video;
