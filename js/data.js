// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- data.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


/*
*   Creates the namespace object for the data module.
*/
if (!FUR) window.FUR = {};
FUR.data = (function(undefined) {


    /*
    *   Locations of data sets
    */
    var LAYER_INDEX_URL = 'data/layers.json';
    var FILTER_TEMPLATES_URL = 'data/filters.json';
    var FOLDER_MAP_URL = 'data/folders.json';
    var json = FUR.misc.json;
    var danger = FUR.misc.danger;


    /*
    *   Instance variables
    */
    this.layers;
    this.mappedLayers;
    this.folders;
    this.filters;

    /*
    *   Accepts an array of layer map URLs from the layer index file as an
    *   argument; returns a promise to load the layers maps.
    */
    var loadLayerMaps = function(layerIndexObject) {

        /*  map the array of URLs to an array of promises
        *   for loading the JSON at the URLs.
        */
        var promises = layerIndexObject.layers.map(function(layerMapURL) {

            return json(layerMapURL);
        });

        return Promise.all(promises);
    };


    /*
    *   Accepts a sparse array of vector layers, and returns a promise to
    *   download the layers' GeoJSON from their respective URLs.
    */
    var loadVectorLayerGeoJSON = function(layers) {

        this.layers = layers;

        var vectorLayers = layers.filter(function(layer) {
            return layer.type === 'vector';
        });

        var promises = vectorLayers.map(function(vectorLayer) {
            return json(vectorLayer.url);
        });

        return Promise.all(promises);
    };


    /*
    *   Attaches each vector data object to its respective vector layer.
    */
    var attachVectorData = function(vectorData) {

        return new Promise(function(resolve, reject) {
            var counter = 0;
            for (var i = 0; i < this.layers.length; i++) {

                var layer = this.layers[i];
                if (layer.type === 'vector') layer.data = vectorData[counter++];
            }
            resolve();
        });
    };


    /*
    *   Recursively verifies that each layer in the folder
    *   hierarchy has been loaded.
    */
    var verifyFolders = function(current) {

        for (var i = 0; i < current.children.length; i++) {

            if (current.children[i].role === 'group') {

                if (!verifyFolders(current.children[i])) {

                    return false;
                }
            } else {

                var match = layers.filter(function(layer) {
                    return layer.name === current.children[i].source;
                });

                if (match < 1) {

                    return false;
                }
            }
        }

        return true;
    };


    /*
    *   Executes the asynchronous loading process.
    */
    json(LAYER_INDEX_URL)
    .then(loadLayerMaps, danger)
    .then(loadVectorLayerGeoJSON, danger)
    .then(attachVectorData, danger)
    .then(function() { return json(FOLDER_MAP_URL); }, danger)
    .then(function(folderData) {

        if (verifyFolders(folderData)) this.folders = folderData;
        else FUR.misc.danger('Folder verification failed!');

    }, danger)
    .then(function () { return json(FILTER_TEMPLATES_URL); }, danger)
    .then(function(data) { console.log(data.filters); }, danger);


    /*
    *   Module Exports
    */
    return {

        ready: false,
        layers: this.layers,
        filters: this.filters,

    };

})();
