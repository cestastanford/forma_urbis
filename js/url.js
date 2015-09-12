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
    module.factory('URLController', function($q, $location, LayerHierarchy, Filters) {


        /*
        *   Exports object.
        */
        var exports = {

            initialSearch: null,
            done: null,

        };


        /*
        *   Saved state.
        */
        var layers = null;
        var encodedFilters = {};
        var mapBounds = null;


        /*
        *   Loads initial state from URL, if URL contains valid data.
        */
        exports.done = $q.all([Filters.done, LayerHierarchy.done]).then(function() {

            var hash = window.location.hash;
            var queryString = hash ? decodeURIComponent(window.location.hash.substring(2)) : null;
            var queryObject = queryString ? JSON.parse(queryString) : null;

            if (queryObject && queryObject.search) {

                exports.initialSearch = parseSearch(queryObject.search);

            }

        });


        /*
        *   Parses the search into native objects.
        */
        function parseSearch(search) {

            //  save layers
            if (typeof search.layers === 'string') layers.push(search.layers);
            else if (search.layers) layers = search.layers;
            else layers = null;
            delete search.layers;

            //  save map bounds
            mapBounds = search.mapBounds;
            var decodedMapBounds = mapBounds ? [[mapBounds[0], mapBounds[1]], [mapBounds[2], mapBounds[3]]] : null;
            delete search.mapBounds;

            //  non-filter-value key/value pairs have been removed from the
            //  search, so the rest are encoded filter values.
            encodedFilters = search;
            decodedFilters = decodeFilters(encodedFilters);

            return {

                layers: layers,
                filters: decodedFilters,
                mapBounds: decodedMapBounds,

            };

        };


        /*
        *   Decodes filter values into an array of filters.
        */
        function decodeFilters(encodedFilters) {

            var decodedFilters = null;

            for (var key in encodedFilters) {

                if (encodedFilters.hasOwnProperty(key)) {

                    if (!decodedFilters) decodedFilters = [];

                    var filterID_valueType = key.split('.');

                    var filterIndex = +(filterID_valueType[0].split('-')[1]);
                    if (!decodedFilters[filterIndex]) decodedFilters[filterIndex] = {};
                    var filter = decodedFilters[filterIndex];

                    var valueType = filterID_valueType[1];

                    if (valueType === 'template') {

                        var templateName = encodedFilters[key];
                        filter.template = Filters.filterTemplates[templateName];

                    }

                    if (valueType === 'subtypes') {

                        if (!filter.subtypes) filter.subtypes = {};

                        if (typeof encodedFilters[key] === 'string') {

                            var subtypeName = encodedFilters[key];
                            filter.subtypes[subtypeName] = true;

                        } else for (var i = 0; i < encodedFilters[key].length; i++) {

                            var subtypeName = encodedFilters[key][i];
                            filter.subtypes[subtypeName] = true;

                        }
                    }

                    else {

                        var valueIndex = key.split('_')[1];
                        if (!filter.values) filter.values = [];
                        filter.values[valueIndex] = encodedFilters[key];

                    }

                }
            }
            return decodedFilters;
        }


        /*
        *   Sets the URL.
        */
        function setURL() {

            var searchObject = { search: encodedFilters };
            searchObject.search.layers = layers;
            searchObject.search.mapBounds = mapBounds;
            var queryString = JSON.stringify(searchObject);
            var encodedQueryString = encodeURIComponent(queryString);

            window.location.hash = encodedQueryString;

        };


        /*
        *   Adds a layer to the URL bar.
        */
        exports.setLayers = function(incomingLayers) {

            layers = incomingLayers;
            setURL();

        };


        /*
        *   Sets the filters in the URL bar.
        */
        exports.setFilters = function(incomingFilters) {

            //  need to encode filters as an object with single-depth array
            //  properties for successful URL encoding.

            encodedFilters = {};

            for (var i = 0; i < incomingFilters.length; i++) {

                var filter = incomingFilters[i];
                var filterID = 'filter-' + i;

                //  encode template
                var templateKey = filterID + '.template';
                var templateValue = filter.template.name;
                encodedFilters[templateKey] = templateValue;

                //  encode subtypes
                var subtypesKey = filterID + '.subtypes';
                var subtypesValues = [];
                for (var subtype in filter.subtypes) {
                    if (filter.subtypes.hasOwnProperty(subtype)) {
                        if (filter.subtypes[subtype]) subtypesValues.push(subtype);
                    }
                }
                encodedFilters[subtypesKey] = subtypesValues;

                //  encode values
                for (var j = 0; j < filter.values.length; j++) {
                    var valueKey = filterID + '.value_' + j;
                    encodedFilters[valueKey] = filter.values[j];
                }
            }

            setURL();

        };


        /*
        *   Sets the map bounds in the URL bar.
        */
        exports.setMapBounds = function(mapBoundsObject) {

            mapBounds = [
                mapBoundsObject._northEast.lat,
                mapBoundsObject._northEast.lng,
                mapBoundsObject._southWest.lat,
                mapBoundsObject._southWest.lng
            ];

            setURL();

        };


        return exports;
    });

})();
