// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- filters.js (JavaScript) ---------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This script registers a controller and directive with the main module for
*   the filter view.
*/

(function() {

    var module = angular.module('FormaUrbisRomae');

    /*
    *   Controller for the filters box.
    */
    module.controller('FilterListController', function($scope, $timeout, Filters, ModifySearch, URLController) {

        var AUTOUPDATE_INTERVAL = 500;
        var refreshPending = false;

        $scope.activeFilters = [];

        if (URLController.initialSearch) {

            URLController.done = URLController.initialSearch.filtersPromise.then(function() {

                $scope.activeFilters = URLController.initialSearch.filters;
                ModifySearch.setFilters($scope.activeFilters);
                URLController.setFilters($scope.activeFilters);

            });

        }

        //  adds a new filter
        $scope.addFilter = function(templateName) {

            if (templateName) $scope.activeFilters.push({

                template: Filters.filterTemplates[templateName],
                values: [''],
                subtypes: {},

            });

        };

        //  removes a filter
        $scope.removeFilter = function(index) {

            $scope.activeFilters.splice(index, 1);

        };

        //  expose the Filters object to the view
        $scope.Filters = Filters;

        //  update the search once for every interval of changes
        $scope.$watch('activeFilters', function() {

            if (!refreshPending) {

                refreshPending = true;

                $timeout(function() {

                    ModifySearch.setFilters($scope.activeFilters);
                    URLController.setFilters($scope.activeFilters);
                    refreshPending = false;

                }, AUTOUPDATE_INTERVAL);

            };


        }, true);

    });

    /*
    *   Directive for the filters box.
    */
    module.directive('filters', function() {

        return {
            restrict: 'E',
            templateUrl: 'templates/filters.html',
        };

    });

    /*
    *   Directive for the individual filters.
    */
    module.directive('filter', function($http, $templateCache, $compile, $parse, $log) {

        return {

            restrict: 'E',
            link: function(scope, element, attributes) {

                var template = attributes.template;
                var url = 'templates/filters/' + template + '.html';
                var load = $http.get(url, { cache: $templateCache });
                load.then(function(template) {

                    element.replaceWith($compile(template.data)(scope));

                });
            },

        }

    });

})();
