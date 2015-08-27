// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- main.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


(function() {

    //  Instantiation of the main module.
    var module = angular.module('FormaUrbisRomae', ['Data', 'Search']);

    module.controller('MyFirstController', [
    '$scope',
    '$log',
    '$q',
    '$timeout',
    'Datasets',
    'LayerHierarchy',
    'Filters',
    'SearchResults',
    'ModifySearch',
    function($scope, $log, $q, $timeout, Datasets, LayerHierarchy, Filters, SearchResults, ModifySearch) {

        // /*
        // *   Prints to the console the status of the data model.
        // */
        // var consoleDataStatus = function() {

        //     $log.log('Data Status');
        //     $log.log('---------------------');
        //     $log.log('Datasets: ' + Datasets.datasets.vector.length + ' vector and ' + Datasets.datasets.raster.length + ' raster loaded.  ', Datasets.datasets);
        //     $log.log('Layer Hierarchy: ' + LayerHierarchy.layerHierarchy.length + ' top-level entries.  ', LayerHierarchy.layerHierarchy);
        //     $log.log('Filter Templates: loaded.  ', Filters.filterTemplates);
        //     $log.log('Filter Assets: ', Filters.filterAssets);

        // };

        $scope.SearchResults = SearchResults;

        $q.all([Datasets.done, LayerHierarchy.done, Filters.done])
        .then(function() {

            ModifySearch.setDatasets([Datasets.datasets.vector[0]])
            return ModifySearch.setFilters(['matching-case-insensitive-word-prefix'], [{ subtypes: ['Feature Name'], input: ['maria']}]);

        }).then(function() {

            $scope.SearchResults = SearchResults;

        });

    }]);

})();

