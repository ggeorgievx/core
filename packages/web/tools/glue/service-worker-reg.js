/* Only register a service worker if it's supported */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../shared/service-worker.js')
        .then(function () {
            return navigator.serviceWorker.ready;
        })
        .catch(function (error) {
            console.log(error);
        });
}
