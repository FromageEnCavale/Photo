/*
const fs = require('fs');

const path = require('path');

const ExifReader = require('exifreader');

const config = {

    supportedExtensions: ['.jpg', '.jpeg', '.png', '.tiff', '.heic'],

    outputFile: 'assets.js'

};

function isSupportedImage(filePath) {

    const ext = path.extname(filePath).toLowerCase();

    return config.supportedExtensions.includes(ext);

}

function extractExif(imagePath) {

    try {

        const imageBuffer = fs.readFileSync(imagePath);

        const tags = ExifReader.load(imageBuffer);

        const specificTags = {

            Make: tags.Make?.description,

            Model: tags.Model?.description,

            DateTimeOriginal: tags.DateTimeOriginal?.description,

            FocalLengthIn35mmFilm: tags.FocalLengthIn35mmFilm?.description,

            FNumber: tags.FNumber?.description,

            ExposureTime: tags.ExposureTime?.description,

            ISOSpeedRatings: tags.ISOSpeedRatings?.description || tags.ISO?.description,

            ExposureBiasValue: tags.ExposureBiasValue?.description

        };

        if (specificTags.FocalLengthIn35mmFilm !== undefined) {

            specificTags.FocalLengthIn35mmFilm = specificTags.FocalLengthIn35mmFilm + "mm";

        }

        if (specificTags.FNumber !== undefined && typeof specificTags.FNumber === 'string') {

            if (specificTags.FNumber.startsWith("f/")) {

                const num = parseFloat(specificTags.FNumber.substring(2));

                if (!isNaN(num)) {

                    specificTags.FNumber = "f/" + num.toFixed(2);

                }

            }

        }

        if (specificTags.ExposureTime !== undefined && typeof specificTags.ExposureTime === 'string') {

            if (!specificTags.ExposureTime.endsWith("s")) {

                specificTags.ExposureTime = specificTags.ExposureTime + "s";

            }

        }

        if (specificTags.ISOSpeedRatings !== undefined) {

            specificTags.ISOSpeedRatings = "ISO " + specificTags.ISOSpeedRatings;

        }

        if (specificTags.ExposureBiasValue !== undefined) {

            const bias = parseFloat(specificTags.ExposureBiasValue);

            if (!isNaN(bias)) {

                specificTags.ExposureBiasValue = bias + "ev";

            }

        }

        const filteredTags = {};

        for (const key in specificTags) {

            if (specificTags[key] !== undefined) {

                filteredTags[key] = specificTags[key];

            }

        }

        return filteredTags;

    } catch (error) {

        console.error(`Error for ${path.basename(imagePath)}: ${error.message}`);

        return {};

    }

}

function loadExistingImages() {

    if (!fs.existsSync(config.outputFile)) {

        return [];

    }

    try {

        const content = fs.readFileSync(config.outputFile, 'utf8');

        const jsCode = content.replace(/^const\s+assetImages\s*=\s*!/, '').replace(/;\s*$/, '');

        return eval(jsCode);

    } catch (error) {

        console.error(`Error reading existing file: ${error.message}`);

        return [];

    }

}

function toJSLiteral(value, indent = 0) {

    const indentStr = ' '.repeat(indent);

    const nextIndent = indent + 2;

    const nextIndentStr = ' '.repeat(nextIndent);

    if (value === null) {

        return 'null';

    } else if (typeof value === 'string') {

        return "'" + value.replace(/'/g, "\\'") + "'";

    } else if (typeof value === 'number' || typeof value === 'boolean') {

        return String(value);

    } else if (Array.isArray(value)) {

        if (value.length === 0) return '[]';

        let result = '[\n';

        result += value.map(item => nextIndentStr + toJSLiteral(item, nextIndent)).join(',\n');

        result += '\n' + indentStr + ']';

        return result;

    } else if (typeof value === 'object') {

        const keys = Object.keys(value);

        if (keys.length === 0) return '{}';

        let result = '{\n';

        result += keys.map(key => {

            const keyStr = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key) ? key : "'" + key.replace(/'/g, "\\'") + "'";

            return nextIndentStr + keyStr + ': ' + toJSLiteral(value[key], nextIndent);

        }).join(',\n');

        result += '\n' + indentStr + '}';

        return result;

    }

}

function saveImages(assetImages) {

    const content = "const assetImages = " + toJSLiteral(assetImages, 0) + ";\n";

    fs.writeFileSync(config.outputFile, content, 'utf8');

    console.log(`Generated file: ${config.outputFile} (${assetImages.length} images)`);

}

function run(inputFolder) {

    if (!fs.existsSync(inputFolder)) {

        console.error(`The file ${inputFolder} doesn't exist.`);

        process.exit(1);

    }

    const assetImages = loadExistingImages();

    const files = fs.readdirSync(inputFolder);

    let addedCount = 0;

    files.forEach(file => {

        const filePath = path.join(inputFolder, file);

        if (fs.statSync(filePath).isFile() && isSupportedImage(filePath)) {

            const relativePath = path.join('../assets', file);

            if (assetImages.some(image => image.path === relativePath)) {

                console.log(`Image already processed: ${file}`);

                return;

            }

            const exifData = extractExif(filePath);

            if (Object.keys(exifData).length > 0) {

                assetImages.unshift({

                    path: relativePath,

                    name: "",

                    ...exifData

                });

                addedCount++;

                console.log(`New image added: ${file}`);

            } else {

                console.log(`No EXIF data found for ${file}`);

            }

        }

    });

    if (addedCount > 0) {

        saveImages(assetImages);

        console.log(`${addedCount} new images processed.`);

    } else {

        console.log("No new images to add.");

    }

}

const args = process.argv.slice(2);

if (args.length === 0) {

    console.error("Usage: node script.js <image-folder>");

    process.exit(1);

}

run(args[0]);
*/