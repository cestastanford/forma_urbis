// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- selection.js (JavaScript) -------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This script creates a service that tracks the currently-selected and
*   currently-details vector feature.
*/

(function() {

    var module = angular.module('FormaUrbisRomae');

    module.factory('SelectionService', function($rootScope, SearchResults) {

        var indices = {

            selected: null,
            detailed: null,

        };

        var exports = { indices: indices };

        $rootScope.$on('refresh', function() {

            indices.selected = null;

        });

        function getIndices(feature) {

            for (var i = 0; i < SearchResults.filteredActiveDatasets.length; i++) {

                var featureList = SearchResults.filteredActiveDatasets[i].data.features;
                var index = featureList.indexOf(feature);

                if (index > -1) {

                    return { datasetIndex: i, featureIndex: index };

                };
            }
        };

        exports.select = function(feature) {

            indices.selected = getIndices(feature);
        };

        exports.detail = function(feature) {

            indices.detailed = getIndices(feature);

        };

        return exports;

    });

})();
