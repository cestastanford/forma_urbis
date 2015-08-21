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
    var layerMaps;
    var layers;
    var mappedLayers;
    var filters;

    /*
    *   Loads the layer index file.
    */
    var promise_loadLayerIndex = FUR.util.json(LAYER_INDEX_URL);
    promise_loadLayerIndex.then(function(data) {

        loadLayerMaps.

    })
    .error(FUR.util.danger(message));
    /*
    *   Loads the layer map files.
    */
    var promises_loadLayerMaps = [];
    for ()




    .fail(function(error) {

        FUR.util.danger('No layer index found at \'' + LAYER_INDEX + '\'.');

    })
    .done(function(data) {


        var layers = data.layers;
        for (var i = 0; i < layers.length; i++) {



        }

    )};

// --------------- work in progress above ---------------- //

    /*
    *   Execution entry point.  #raisedOnC
    */
    var main = (function(this) {

        loadLayerIndex();
        loadVectorLayers();


        loadVectorLayers();
        mapVectorLayers();
        loadFilters();
        preprocessLayersForFilters();

        return 0;

    })(this);


    /*
    *   Exports
    */
    return {

        ready: false;
        layers: layers;
        filters: filters;

    }

})();
