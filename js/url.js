// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- url.js (JavaScript) -------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This script creates the service that reads from and updates the URL bar
*   to enable loading and saving application states.
*/

(function() {

    var module = angular.module('FormaUrbisRomae');

    /*  Controller for the URL bar.  If the URL contains meaningful
    *   data on application launch the controller attempts to recreate
    *   those search conditions.  The controller also updates the URL with
    *   a string representing the current application state.
    */
    module.factory('URLController', function($log, $location, LayerHierarchy, Filters) {


        /*
        *   Exports object.
        */
        var exports = {};


        /*
        *   Internal state variable.
        */
        var initialSearch = null;

        var layers = [];
        var filters = [];
        var mapBounds = [];
        var encodedFilterValues = {};


        /*
        *   Checks that all layers and filters in the search actually exist.
        */
        function verifySearch(search) {

            var initialSearch = { layers: [], filters: [], mapBounds: [], filterValues: [] };

            if (typeof search.layers === 'string') initialSearch.layers.push(search.layers);
            else initialSearch.layers = search.layers;
            delete search.layers;
            // for (var i = 0; i < initialSearch.layers.length; i++) {

            //     if (!LayerHierarchy.isValidLayer(initialSearch.layers[i])) return false;
            // }

            if (typeof search.filters === 'string') initialSearch.filters.push(search.filters);
            else initialSearch.filters = search.filters;
            delete search.filters;
            // for (var i = 0; i < initialSearch.filters.length; i++) {

            //     if (!Filters.isValidFilter(initialSearch.filters[i])) return false;
            // }

            initialSearch.mapBounds = search.mapBounds; delete search.mapBounds;

            for (var key in search) {
                if (search.hasOwnProperty(key)) {

                    var filterName_valueType = key.split('.');
                    var index = initialSearch.filters.indexOf(filterName_valueType[0]);
                    if (!initialSearch.filterValues[index]) initialSearch.filterValues[index] = { subtypes: [], input: [] };
                    if (typeof search[key] === 'string') initialSearch.filterValues[index][filterName_valueType[1]].push(search[key]);
                    else initialSearch.filterValues[index][filterName_valueType[1]] = (search[key]);
                }
            }

            return initialSearch;
        };


        /*
        *   Loads initial state from URL, if URL contains valid data.
        */
        if ($location.path() === '/search') {

            initialSearch = verifySearch($location.search());

            if (initialSearch) {
                $log.log('initial search: ', initialSearch);

            //    LayerListController.setLayers(initialSearch.layers);
            //    FilterListController.setFilters(initialSearch.filters, initialSearch.filterValues);
            //    MapController.setMapBounds(initialSearch.mapBounds);

            } else $log.log('Invalid URL!');
        }


        /*
        *   Sets the URL.
        */
        function setURL() {

            var search = encodedFilterValues;
            search.layers = layers;
            search.filters = filters;
            search.mapBounds = mapBounds;

            $location.path('/search');
            $location.search(search);
        };


        /*
        *   Adds a layer to the URL bar.
        */
        exports.addLayer = function(layerName) {

            layers.push(layerName);
            setURL();
        };


        /*
        *   Removes a layer from the URL bar.
        */
        exports.removeLayer = function(layerName) {

            var index = layers.indexOf(layerName);
            layers.splice(index, 1);
            setURL();
        };


        /*
        *   Sets the filters in the URL bar.
        */
        exports.setFilters = function(filterNames, filterValues) {

            filters = filterNames;

            //  need to encode filter values and names
            //  because search() only encodes objects
            //  with a depth of one level.
            for (var i = 0; i < filterNames.length; i++) {
                var subtypesKey = filterNames[i] + '.subtypes';
                var subtypesValues = filterValues[i].subtypes;

                var inputKey = filterNames[i] + '.input';
                var inputValues = filterValues[i].input;

                encodedFilterValues[subtypesKey] = subtypesValues;
                encodedFilterValues[inputKey] = inputValues;
            }

            setURL();
        };


        /*
        *   Sets the map bounds in the URL bar.
        */
        exports.setMapBounds = function(mapBoundsArray) {

            mapBounds = mapBoundsArray;
            setURL();
        };


        return exports;
    });

})();
