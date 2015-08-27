// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- search.js (JavaScript) ----------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


/*
*   This module is responsible for coordinating the various processes involved
*   in carrying out a search and sending the results to interested viewds,
*   along with saving the search results for later use.
*/


/*
*   Creates the namespace object for the data module.
*/
if (!window.FUR) window.FUR = {};
FUR.search = (function(undefined) {

    //  References to global entities
    var url = FUR.url;
    var map = FUR.map;
    var data = FUR.data;
    var misc = FUR.misc;
    var danger = misc.danger;
    var resultsList = FUR.resultsList;
    var blankFeatureCollectionJSON = JSON.stringify({
        type: 'FeatureCollection',
        crs: {
            type: 'name',
            'properties': {
                name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
            }
        },
        features: []
    });

    //  Instance Variables
    var activeDatasets = [];
    var activeFilters = [];
    var activeFilterValues = [];
    var activeFilteredDatasets = [];
    var mapBounds = null;


    /*
    *   Adds a source dataset to the search.
    *
    *   Parameters: dataset object to be added
    */
    var addDataset = function(dataset) {
        /* start progress indicator here */

        //  filter the new layer
        var filteredDataset = filterDataset(dataset); // returns a promise
        filteredDataset.then(function(filteredDataset) {

            //  update the model
            activeDatasets.push(dataset);
            activeFilteredDatasets.push(filteredDataset);

            //  update the views
            updateViews();

            /* stop progress indicator here */
        }, danger);
    };


    /*
    *   Removes a source dataset from the search.
    *
    *   Parameters: dataset object to be removed
    */
    var removeDataset = function(dataset) {

        //  update the model
        var index = activeDatasets.indexOf(dataset);
        activeDatasets.splice(index, 1);
        //  this works because we always add and remove datasets
        //  from activeDatasets and activeFilteredDatasets together,
        //  so indices match up.
        activeFilteredDatasets.splice(index, 1);

        //  update the views
        updateViews();

    };


    /*
    *   Applies new filters to the search.
    *
    *   Parameters: array of filter names, array of filter values
    */
    var updateFilters = function(filterNames, filterValues) {
        /* start progress indicator here */

        //  update the model
        activeFilters = filterNames.map(function(f) { return data.filterTemplates[f]; });
        activeFilterValues = filterValues;

        //  filter the new layers
        var promises = activeDatasets.map(function(ds) { return filterDataset(ds); });
        Promise.all(promises).then(function(filteredDatasets) {

            //  this preserves index consistency because Promise.all
            //  returns results in the same order as the promise array.
            activeFilteredDatasets = filteredDatasets;

            //  update the views
            updateViews();

        });
    };


    /*
    *   Called on updates to the map's bounds.
    */
    var updateMapBounds = function(newMapBounds) {

        //  update the model
        mapBounds = newMapBounds;

        //  update the views
        updateViews();
    };


    /*
    *   Spawns a WebWorker to filter the given layer by the active
    *   filters, returning a promise to finish filtering the layer.
    */
    var filterDataset = function(dataset) {

        if (activeFilters.length > 0) {

            return new Promise(function(resolve, reject) {

                var worker = new Worker('js/filterWorker.js');

                worker.addEventListener('message', function(event) {

                    if (event.data.hasOwnProperty('message')) console.log('From worker: ', event.data.message);
                    else resolve(event.data);
                });

                worker.addEventListener('error', function(event) {

                    reject(event);
                });

                worker.postMessage({
                    dataset: dataset,
                    activeFilters: activeFilters,
                    activeFilterValues: activeFilterValues
                });
            });

        } else return new Promise(function(resolve) { resolve(dataset); });

    };

    var updateViews = function() {
        console.log('Search Status');
        console.log('---------------------');
        console.log(activeDatasets.length + ' active datasets', activeDatasets);
        console.log(activeFilters.length + ' active filters', activeFilters);
        console.log('Filter values: ', activeFilterValues);
        console.log('Filtered datasets: ', activeFilteredDatasets);
        console.log('Map bounds: ', mapBounds);
    }

    return {

        addDataset: addDataset,
        removeDataset: removeDataset,
        updateFilters: updateFilters,
        updateMapBounds: updateMapBounds,
        updateViews: updateViews,

    }


})();
