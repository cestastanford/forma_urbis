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

        $scope.filterAssets = Filters.filterAssets;

        $scope.activeFilters = [];

        URLController.done.then(function() {

            if (URLController.initialSearch && URLController.initialSearch.filters) {

                $scope.activeFilters = URLController.initialSearch.filters;
                ModifySearch.setFilters($scope.activeFilters);
                URLController.setFilters($scope.activeFilters);

            }


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

        //  adds a new filter
        $scope.addFilter = function(templateName) {

            if (templateName) $scope.activeFilters.push({

                template: Filters.filterTemplates[templateName],
                values: [''],
                subtypes: {},

            });

            $scope.selectedTemplate = '';

        };

        //  removes a filter
        $scope.removeFilter = function(index) {

            $scope.activeFilters.splice(index, 1);

        };

        //  expose the Filters object to the view
        $scope.Filters = Filters;

    });

    /*
    *   Directive for the filters box.
    */
    module.directive('filters', function() {

        return {
            restrict: 'A',
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


    /*
    *   Directive for the date slider – doesn't work!
    *
    module.directive('noUiSlider', function() {

        return {

            restrict: 'E',
            link: function(scope, element) {

                var slider = element[0];
                console.log(element, noUiSlider);
                noUiSlider.create(slider, {

                    start: [-1000, 2015],
                    step: 1,
                    margin: 1,
                    connect: true,
                    direction: 'ltr',
                    orientation: 'horizontal',
                    behaviour: 'drag-tap',
                    range: {
                        min: -1000,
                        max: 2015,
                    },
                    pips: {
                        mode: 'values',
                        density: 3,
                        values: [-1000, 0, 500, 1000, 1500, 2000],
                        format: wNumb({
                            decimals: 0,
                            negative: 'BCE ',
                        }),
                    },

                });

                slider.noUiSlider.on('update', function(values) {

                    scope.activeFilters[$index].values[0] = Math.floor(values[0]);
                    scope.activeFilters[$index].values[1] = Math.floor(values[1]);

                });

                scope.$watchCollection('activeFilters[$index].values', function(updated) {

                    slider.noUiSlider.set(updated);

                });

                activeFilters[$index].values[0] = '';
                activeFilters[$index].values[1] = '';

            }

        }

    });
*/


})();
