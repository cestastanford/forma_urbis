// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- main.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


(function() {

    //  Instantiation of the main module.
    var module = angular.module('FormaUrbisRomae', ['Data']);

    module.controller('MyFirstController', [
    '$scope',
    '$log',
    '$q',
    'Datasets',
    'LayerHierarchy',
    'FilterTemplates',
    function($scope, $log, $q, Datasets, LayerHierarchy, FilterTemplates) {

        /*
        *   Prints to the console the status of the data model.
        */
        var consoleStatus = function() {

            $log.log('Data Status');
            $log.log('---------------------');
            $log.log('Datasets: ' + Datasets.datasets.vector.length + ' vector and ' + Datasets.datasets.raster.length + ' raster loaded.  ', Datasets.datasets);
            $log.log('Layer Hierarchy: ' + LayerHierarchy.layerHierarchy.length + ' top-level entries.  ', LayerHierarchy.layerHierarchy);
            $log.log('Filter Templates: loaded.  ', FilterTemplates.filterTemplates);
            $log.log('Filter Assets: ', FilterTemplates.filterAssets);

        };

        $q.all([Datasets.done, LayerHierarchy.done, FilterTemplates.done])
        .then(consoleStatus);

        $scope.access = [Datasets, LayerHierarchy, FilterTemplates];

    }]);

})();

