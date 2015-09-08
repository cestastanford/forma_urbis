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

    //  Creation of the custom directives for the views.
    module.

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
    'URLController',
    function($scope, $log, $q, $timeout, Datasets, LayerHierarchy, Filters, SearchResults, ModifySearch, URLController) {

        $scope.SearchResults = SearchResults;

        $q.all([Datasets.done, LayerHierarchy.done, Filters.done])
        .then(function() {

            ModifySearch.setDatasets(Datasets.datasets.vector)
            return ModifySearch.setFilters(['matching-case-insensitive-word-prefix'], [{ subtypes: ['Feature Name'], input: ['maria']}]);

        }).then(function() {

            $scope.SearchResults = SearchResults;

        });

        $scope.getClickedFeature = function() {

            $log.log(this.feature);

        }

        URLController.addLayer('fuckyeah');
        URLController.addLayer('anotherone');
        URLController.addLayer('tobedeleted');
        URLController.removeLayer('tobedeleted');
        URLController.setFilters(['matching-case-insensitive-word-prefix'], [{ subtypes: ['Feature Name', 'Excavator', 'Architect', 'Note'], input: ['maria']}]);
        URLController.setMapBounds([[123, 45532], [435, 2111]]);

    }]);


})();

