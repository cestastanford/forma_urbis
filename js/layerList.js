// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- layerList.js (JavaScript) ---------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This script creates registers a controller and directive with the main
*   module for the layer list view.
*/

(function() {

    var module = angular.module('FormaUrbisRomae');


    /*
    *   Controller for the layer list view.  Deals with synchronizing the
    *   checkboxes and sending any updates to the search model.
    */
    module.controller('LayerListController', function($scope, LayerHierarchy) {

        $scope.list = [];

        LayerHierarchy.done.then(function() {

            addSublayers(LayerHierarchy.layerHierarchy, [], 0);

        });


        /*  Recursively generates a single-depth list of layers
        *   for the view to display.
        */
        function addSublayers(children, ancestors, depth) {

            var descendants = [];

            for (var i = 0; i < children.length; i++) {

                var child = children[i];

                var item = {

                    depth: depth,
                    name: child.name,
                    ancestors: ancestors,
                    checked: false,

                };

                $scope.list.push(item);

                if (child.role === 'layer') {

                    item.type = child.source.type;
                    item.descendants = [];

                    descendants.push(item);

                } else {

                    item.type = 'group';

                    var updatedAncestors = ancestors.slice()
                    updatedAncestors.push(item);

                    item.descendants = addSublayers(child.children, updatedAncestors, depth + 1);

                    Array.prototype.push.apply(descendants, item.descendants);
                    descendants.push(item);
                }
            }

            return descendants;

        };


        /*
        *   Receives clicks on the layer checkboxes, checks/unchecks any
        *   boxes and updates the search model.
        */
        $scope.boxClicked = function(layer) {


            //  update all descendants
            for (var i = 0; i < layer.descendants.length; i++) {

                layer.descendants[i].checked = layer.checked;
            }

            //  check all ancestors to see if any should be changed.
            for (var i = layer.ancestors.length - 1; i > -1; i--) {

                var ancestor = layer.ancestors[i];
                var element = document.querySelector('input[type="checkbox"][name="' + ancestor.name + '"]');


                //  if all descendants are checked, check the parent
                if (ancestor.descendants.every(function(child) { return child.checked; })) {

                    element.indeterminate = false;
                    ancestor.checked = true;

                //  if no descendants are checked, uncheck the parent
                } else if (ancestor.descendants.every(function(child) { return !child.checked; })) {

                    element.indeterminate = false;
                    ancestor.checked = false;

                //  if some descendants are checked, intermediate-check the parent
                } else {

                    element.indeterminate = true;
                    ancestor.checked = false;

                }
            }
        }
    });


    /*
    *   HTML directive to display the layer list template.
    */
    module.directive('layers', function() {

        return {
            restrict: 'E',
            templateUrl: 'templates/layerList.html',
        };

    });

})()
