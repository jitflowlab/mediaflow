
const Utility = require('./Utility');

const methods = [
    'resize',
    'crop',
    'max',
    'rotate',
    'greyscale'
];
const accepted = ['png', 'jpeg', 'jpg', 'webp', 'tiff'];
const sharp = require('sharp');

class Photo {
    constructor (id, file) {
        this._id = id;
        this._file = file;
    }

    static isPhoto (file) {
        return accepted.includes(Utility.getExtension(file));
    }

    async process (action) {
        const transformer = sharp(this._file.buffer);
        for (let key of Object.keys(action)) {
            if (methods.includes(key)) {
                const value = action[key];
                let params = [];
                if (typeof value === 'string') {
                    params = value.split(',').map(item => {
                        item = item.trim();
                        item = parseInt(item);
                        return item;
                    });
                } else if (Array.isArray(value)) {
                    params = value;
                }
                (params.length
                    ? transformer[key].apply(transformer, params)
                    : transformer[key]());
            }
        }
        let output = action.output || 'png';
        if (output === 'jpg') {
            output = 'jpeg';
        }
        if (!accepted.includes(output)) {
            throw new Error(`"${output}" is not a valid output.`);
        }
        transformer[output]();

        // await transformer.toBuffer()
        return {
            output: output,
            base64: await transformer.toBuffer()
        };
    }
}

module.exports = Photo;
