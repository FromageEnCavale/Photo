document.addEventListener('DOMContentLoaded', () => {

    const mq = window.matchMedia('(min-width: 500px)');

    const container = document.getElementById('scroll-container');

    function handleScrollFeature(e) {

        e.preventDefault();

        const speedMultiplier = 10;

        container.scrollLeft += e.deltaY * speedMultiplier;

    }

    function initSequentialLoading() {

        const images = Array.from(document.querySelectorAll('img[data-src]'));

        let index = 0;

        const appearanceDelay = 250;

        function loadNext() {

            if (index >= images.length) return;

            const img = images[index++];

            const src = img.getAttribute('data-src');

            img.src = src;

            img.addEventListener('load', () => {

                setTimeout(() => {

                    img.classList.add('loaded');

                    loadNext();

                }, appearanceDelay);

            }, {once: true});

            img.addEventListener('error', () => {

                console.error(`Loading error for ${src}`);

                loadNext();

            }, {once: true});

        }

        loadNext();

    }

    function updateScrollListener(evt) {

        if (evt.matches) {

            container.addEventListener('wheel', handleScrollFeature, {passive: false});

        } else {

            container.removeEventListener('wheel', handleScrollFeature);

        }

    }

    initSequentialLoading();

    updateScrollListener(mq);

    mq.addEventListener('change', updateScrollListener);

});