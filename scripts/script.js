const CONFIG = {

    GALLERY_CONTAINER_ID: 'gallery-container',

    LOAD_DELAY_MS: 500,

    ERROR_RETRY_COUNT: 2

};

function createErrorHandler(imagePath, retryCount = 0) {

    return (error) => {

        if (retryCount < CONFIG.ERROR_RETRY_COUNT) {

            console.warn(`Reloading attempt for ${imagePath}`);

            return loadImageAsPromise(imagePath, retryCount + 1);

        }

        console.error(`Loading failed: ${imagePath}`, error);

        return null;

    };

}

function loadImageAsPromise(imageInfo, retryCount = 0) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => {

            setTimeout(() => resolve(imageInfo), CONFIG.LOAD_DELAY_MS);

        };

        img.onerror = createErrorHandler(imageInfo.path, retryCount);

        img.src = imageInfo.path;

    });

}

function createImageElement(imageInfo) {

    const container = document.createElement('div');

    container.classList.add('container', 'noSelect');

    const imgContainer = document.createElement('div');

    imgContainer.classList.add('img-container');

    container.appendChild(imgContainer);

    const img = document.createElement('img');

    img.src = imageInfo.path;

    img.alt = imageInfo.name;

    img.draggable = false;

    imgContainer.appendChild(img);

    const dataContainer = document.createElement('div');

    dataContainer.classList.add('data-container');

    container.appendChild(dataContainer);

    const firstData = document.createElement('div');

    const firstFields = [

        { text: imageInfo.name },

        { text: imageInfo.device },

        { text: imageInfo.camera },

        { text: imageInfo.country }

    ];

    firstFields.forEach(field => {

        const element = document.createElement('div');

        element.textContent = field.text;

        firstData.appendChild(element);

    });

    dataContainer.appendChild(firstData);

    const secondData = document.createElement('div');

    const secondFields = [

        { text: imageInfo.focallength },

        { text: imageInfo.aperture },

        { text: imageInfo.shutterspeed },

        { text: imageInfo.iso },

        { text: imageInfo.ev }

    ];

    secondFields.forEach(field => {

        const element = document.createElement('div');

        element.textContent = field.text;

        secondData.appendChild(element);

    });

    dataContainer.appendChild(secondData);

    const emptyDiv = document.createElement('div');

    dataContainer.appendChild(emptyDiv);

    return container;

}

async function loadImagesFromAssets() {

    const galleryContainer = document.getElementById(CONFIG.GALLERY_CONTAINER_ID);

    galleryContainer.innerHTML = '';

    for (const imageInfo of assetImages) {

        try {

            const loadedImage = await loadImageAsPromise(imageInfo);

            if (loadedImage) {

                const imgElement = createImageElement(loadedImage);

                galleryContainer.appendChild(imgElement);

            }

        } catch (error) {

            console.error('Loading error', error);

        }

    }

}

document.addEventListener('DOMContentLoaded', () => {

    loadImagesFromAssets().catch(console.error);

});