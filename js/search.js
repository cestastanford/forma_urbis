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

(function() {

    /*
    *   Angular module for the application data.
    */
    var module = angular.module('Search', ['Data']);


    /*
    *   Service that stores the search results.
    */
    module.factory('SearchResults', ['$log', '$http', '$q', function($log, $http, $q) {

        var exports = {

            filteredActiveDatasets: [],

        };

        return exports;

    }]);


    /*
    *   Service that allows changes to the search parameters
    *   and updates the search results on parameter change.
    */
    module.factory('ModifySearch', ['$log', '$http', '$q', 'SearchResults', 'Filters', function($log, $http, $q, SearchResults, Filters) {

        /*
        *   Internal state variables.
        */
        var activeDatasets = [];
        var activeFilters = [];
        var activeFilterValues = [];

        /*
        *   Exports object
        */
        var exports = {};

        /*
        *   Adds a source dataset to the search.
        *
        *   Parameters: dataset object to be added
        */
        exports.addDataset = function(dataset) {
            /* start progress indicator here */

            //  filter the new layer
            var filteredDataset = filterDataset(dataset); // returns a promise
            return filteredDataset.then(function(filteredDataset) {

                //  update the model
                activeDatasets.push(dataset);
                SearchResults.filteredActiveDatasets.push(filteredDataset);

                /* stop progress indicator here */
            });
        };


        /*
        *   Removes a source dataset from the search.
        *
        *   Parameters: dataset object to be removed
        */
        exports.removeDataset = function(dataset) {

            //  update the model
            var index = activeDatasets.indexOf(dataset);
            activeDatasets.splice(index, 1);
            //  this works because we always add and remove datasets
            //  from activeDatasets and filteredActiveDatasets together,
            //  so indices match up.
            SearchResults.filteredActiveDatasets.splice(index, 1);
        };


        /*
        *   Sets the dataset list.  Used for initial setup to load several
        *   datasets at once.  Must be followed by 'setFilters'.
        *
        *   Parameters: an array of datasets
        */
        exports.setDatasets = function(datasets) {

            //  set all datasets
            activeDatasets = datasets;
        };


        /*
        *   Applies new filters to the search.
        *
        *   Parameters: array of filter names, array of filter values
        */
        exports.setFilters = function(filterNames, filterValues) {
            /* start progress indicator here */

            //  update the model
            activeFilters = filterNames.map(function(f) { return Filters.filterTemplates[f]; });
            activeFilterValues = filterValues;

            //  filter the new datasets
            var promises = activeDatasets.map(function(ds) { return filterDataset(ds); });
            return Promise.all(promises).then(function(filteredDatasets) {

                //  this preserves index consistency because Promise.all
                //  returns results in the same order as the promise array.
                SearchResults.filteredActiveDatasets = filteredDatasets;

                /* stop progress indicator here */
            });
        };


        /*
        *   Spawns a WebWorker to filter the given layer by the active
        *   filters, returning a promise to finish filtering the layer.
        */
        var filterDataset = function(dataset) {
            /* start progress indicator here */

            return $q(function(resolve, reject) {

                if (activeFilters.length > 0) {

                    var worker = new Worker('js/filterWorker.js');

                    worker.addEventListener('message', function(event) {

                        if (event.data.hasOwnProperty('message')) $log.log('From worker: ', event.data.message);
                        else resolve(event.data);   /* stop progress indicator here */
                    });

                    worker.addEventListener('error', function(event) {

                        reject(event);
                    });

                    worker.postMessage({
                        dataset: dataset,
                        activeFilters: activeFilters,
                        activeFilterValues: activeFilterValues
                    });

                } else resolve(dataset); /* stop progress indicator here */

            });

        };


        return exports;

    }]);

})();
