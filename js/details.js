// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- details.js (JavaScript) ---------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This script registers a controller and directive with the main module for
*   the results list view.
*/

(function() {

    var module = angular.module('FormaUrbisRomae');

    module.controller('DetailsController', function($rootScope, $scope, Datasets) {

        $scope.feature = null;
        $scope.dataset = null;

        $rootScope.$on('detail', function(scope, feature) {

            $scope.feature = feature;
            $scope.dataset = Datasets.datasets.vector.filter(function(ds) { return ds.name === feature.datasetName; })[0];

        });

        $rootScope.$on('unDetail', function() {

            $scope.feature = null;
            $scope.dataset = null;

        });

    });

    module.directive('featureDetails', function() {

        return {

            restrict: 'A',
            templateUrl: 'templates/details.html'

        }

    })

})();
