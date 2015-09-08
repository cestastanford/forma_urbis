// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- main.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


(function() {

    var module = angular.module('FormaUrbisRomae', ['Data', 'Search']);

    module.controller('Setup', function($scope, $log, $q, $timeout, Datasets, LayerHierarchy, Filters, SearchResults, ModifySearch, URLController) {

        //  object noting the status of each setup item.
        $scope.setupProgress = {

            datasets: Datasets.done.then().$$state,
            layerHierarchy: LayerHierarchy.done.then().$$state,
            filters: Filters.done.then().$$state,

        };

        // $q.all([Datasets.done, LayerHierarchy.done, Filters.done])
        // .then(function() {

        //     ModifySearch.setDatasets(Datasets.datasets.vector)
        //     return ModifySearch.setFilters(['matching-case-insensitive-word-prefix'], [{ subtypes: ['Feature Name'], input: ['maria']}]);

        // }).then(function() {

        //     $scope.doneLoading = true;

        // });

        // $scope.getClickedFeature = function() {

        //     $log.log(this.feature);

        // }

        // URLController.addLayer('fuckyeah');
        // URLController.addLayer('anotherone');
        // URLController.addLayer('tobedeleted');
        // URLController.removeLayer('tobedeleted');
        // URLController.setFilters(['matching-case-insensitive-word-prefix'], [{ subtypes: ['Feature Name', 'Excavator', 'Architect', 'Note'], input: ['maria']}]);
        // URLController.setMapBounds([[123, 45532], [435, 2111]]);

    });

})();

