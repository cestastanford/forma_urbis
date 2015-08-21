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
    *   Locations of data sets.
    */
    var LAYER_INDEX = 'data/layers.json';
    var FILTERS_INDEX = 'data/filters.json';

    /*
    *   Loads the index of layers and the
    */
    var
    $.getJSON(LAYER_INDEX)
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

        var promises = [];
        setupProgressView(promises);

        loadLayers();
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
