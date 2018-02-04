
const Utility = require('./Utility');

const accepted = [
    'resize',
    'crop',
    'max',
    'rotate',
    'greyscale'
];
const acceptedOutput = ['png', 'jpeg', 'jpg', 'webp', 'tiff'];
const sharp = require('sharp');

class Photo {
    static isPhoto (file) {
        return acceptedOutput.includes(Utility.getExtension(file));
    }

    static async process (file, action) {
        const transformer = sharp(file.buffer);
        for (let key of Object.keys(action)) {
            if (accepted.includes(key)) {
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
        if (!acceptedOutput.includes(output)) {
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
