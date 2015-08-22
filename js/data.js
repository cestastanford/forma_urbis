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
    var FILTER_INDEX_URL = 'data/filters.json';


    /*
    *   Instance variables
    */
    this.layers;
    this.mappedLayers;
    this.filters;


    /*
    *   Accepts a URL to the layer index as an argument; returns a promise
    *   to load the index file.
    */
    var loadLayerIndex = function(indexURL) {

        return FUR.misc.json(indexURL);
    };


    /*
    *   Accepts an array of layer map URLs from the layer index file as an
    *   argument; returns a promise to load the layers maps.
    */
    var loadLayerMaps = function(layerIndexObject) {

        /*  map the array of URLs to an array of promises
        *   for loading the JSON at the URLs.
        */
        var promises = layerIndexObject.layers.map(function(layerMapURL) {

            return FUR.misc.json(layerMapURL);
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
            return FUR.misc.json(vectorLayer.url);
        });

        return Promise.all(promises);
    };


    /*
    *   Attaches each vector data object to its respective vector layer.
    */
    var attachVectorData = function(vectorData) {

        var counter = 0;
        for (var i = 0; i < this.layers.length; i++) {

            var layer = this.layers[i];
            if (layer.type === 'vector') layer.data = vectorData[counter++];
        }
    };


    /*
    *   Executes the asynchronous loading process.
    */
    loadLayerIndex(LAYER_INDEX_URL)
    .then(loadLayerMaps).catch(FUR.misc.danger)
    .then(loadVectorLayerGeoJSON).catch(FUR.misc.danger)
    .then(attachVectorData).catch(FUR.misc.danger);


    /*
    *   Module Exports
    */
    return {

        ready: false,
        layers: this.layers,
        filters: this.filters,

    };

})();
