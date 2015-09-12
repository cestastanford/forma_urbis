// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- results.js (JavaScript) ---------------------------------------------- //
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

    module.controller('ResultsListController', function($rootScope, $scope, SearchResults) {

        $rootScope.$on('refresh', function() {

            $scope.results = SearchResults.filteredActiveDatasets;

        });

        $scope.detail = function(feature) {

            $rootScope.$emit('detail', feature);

        };

    });

    module.directive('results', function() {

        return {

            restrict: 'A',
            templateUrl: 'templates/resultsList.html'

        }

    })

})();
