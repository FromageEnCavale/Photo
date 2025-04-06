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

        if (!specificTags.DateTimeOriginal || specificTags.DateTimeOriginal.startsWith('0000:')) {

            const now = new Date();

            const year = now.getFullYear();

            const month = String(now.getMonth() + 1).padStart(2, '0');

            const day = String(now.getDate()).padStart(2, '0');

            const hours = String(now.getHours()).padStart(2, '0');

            const minutes = String(now.getMinutes()).padStart(2, '0');

            const seconds = String(now.getSeconds()).padStart(2, '0');

            specificTags.DateTimeOriginal = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;

        }

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

        const jsCode = content.replace(/^const\s+assetImages\s*=\s*/, '').replace(/;\s*$/, '');

        return eval(jsCode);

    } catch (error) {

        console.error(`Error reading existing file: ${error.message}`);

        return [];

    }

}

function exifDateToJsDate(exifDate) {

    if (!exifDate) return new Date(0);

    const parts = exifDate.split(' ');

    if (parts.length !== 2) return new Date(0);

    const dateParts = parts[0].split(':');

    const timeParts = parts[1].split(':');

    if (dateParts.length !== 3 || timeParts.length !== 3) return new Date(0);

    const year = parseInt(dateParts[0]);

    const month = parseInt(dateParts[1]) - 1;

    const day = parseInt(dateParts[2]);

    const hour = parseInt(timeParts[0]);

    const minute = parseInt(timeParts[1]);

    const second = parseInt(timeParts[2]);

    return new Date(year, month, day, hour, minute, second);

}

function sortImagesByDate(images) {

    return images.sort((a, b) => {

        const dateA = exifDateToJsDate(a.DateTimeOriginal);

        const dateB = exifDateToJsDate(b.DateTimeOriginal);

        return dateB - dateA;

    });

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

        console.error(`The folder ${inputFolder} doesn't exist.`);

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

                assetImages.push({

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

        const sortedImages = sortImagesByDate(assetImages);

        saveImages(sortedImages);

        console.log(`${addedCount} new images processed and sorted by date.`);

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