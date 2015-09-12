// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- map.js (JavaScript) -------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This script registers a controller and directive with the main module for
*   the map view.
*/

(function() {

    var module = angular.module('FormaUrbisRomae');

    /*
    *   This service allows raster layers to be shared from the layer list
    *   to the map.
    */
    module.factory('MapRasterService', function() {

        //  Exports object.
        var exports = {};

        //  Internal data
        var activeRasterLayers = [];

        //  Submits a raster layer to be displayed
        exports.addRasterLayer = function(layer) {

            activeRasterLayers.push(layer);

        };

        //  Remove a raster layer from display
        exports.removeRasterLayer = function(layer) {

            var index = activeRasterLayers.indexOf(layer);
            activeRasterLayers.splice(index, 1);

        };

        //  Expose the list of raster layers for use by the map
        exports.activeRasterLayers = activeRasterLayers;

        return exports;

    });

    /*
    *   This is the controller for the map; it creates it and watches for
    *   changes in the source layers for updating.  It also communicates with
    *   the URL controller to set and save the map bounds.
    */
    module.controller('MapController', function($scope, $rootScope, SearchResults, MapRasterService, URLController, Datasets) {

        /*
        *   The currently displayed raster and vector Leaflet layers.
        */
        var rasterLayersOnMap = [];
        var vectorLayersOnMap = [];


        /*
        *   The data sources for the map.
        */
        $scope.raster = MapRasterService.activeRasterLayers;
        $scope.vector = SearchResults;


        /*
        *   Initial map center and map zoom.
        */
        var MAP_OPTIONS = {

            center: [41.899152, 12.476776],
            zoom: 16,
            scrollWheelZoom: false,

        };


        /*
        *   Point marker style.
        */
        var MARKER_STYLE = {

            radius: 4,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,

        };


        /*
        *   Polygon style.
        */
        var POLYGON_STYLE = {

            weight: 1,
            opacity: 0.6,

        };


        /*
        *   Sets up the Leaflet map on the page.
        */
        var map = L.map('map', MAP_OPTIONS);

        URLController.done.then(function() {

            if (URLController.initialSearch && URLController.initialSearch.mapBounds) {

                map.fitBounds(URLController.initialSearch.mapBounds);

            };

        })


        /*
        *   Updates the URL bar when the map bounds change.
        */
        map.on('moveend zoomend', function() {

            URLController.setMapBounds(map.getBounds());

        });


        /*
        *   Sets up a watch for changes to the raster layers, updating the
        *   map if layers are added or removed.
        */
        $scope.$watchCollection('raster', function(now, before) {

            //  get the added or removed layers
            var added = now.filter(function(layer) { return before.indexOf(layer) < 0; });
            var removed = before.filter(function(layer) { return now.indexOf(layer) < 0; });

            if (added.length) addRasterLayers(added);
            if (removed.length) removeRasterLayers(removed);

        });


        /*
        *   Listens for 'refresh' events for the vector layers and refreshes the
        *   map when received.
        */
        $rootScope.$on('refresh', function() {

            for (var i = 0; i < vectorLayersOnMap.length; i++) {

                map.removeLayer(vectorLayersOnMap[i]);

            };

            createVectorLayers(SearchResults.filteredActiveDatasets);

        });


        /*
        *   Adds a new raster layer to the Leaflet map.
        */
        function addRasterLayers(rasterLayersToAdd) {

            for (var i = 0; i < rasterLayersToAdd.length; i++) {

                var rasterLayerToAdd = rasterLayersToAdd[i];

                var newRasterLayer = L.tileLayer(rasterLayerToAdd.url, {

                    tms: rasterLayerToAdd.tms,
                    attribution: rasterLayerToAdd.attribution,

                });

                map.addLayer(newRasterLayer);
                rasterLayersOnMap.push({

                    name: rasterLayerToAdd.name,
                    leafletLayer: newRasterLayer,

                });

            }
        };


        /*
        *   Removes a raster layer from the Leaflet map.
        */
        function removeRasterLayers(rasterLayersToRemove) {

            for (var i = 0; i < rasterLayersToRemove.length; i++) {

                var rasterLayerToRemove = rasterLayersToRemove[i];

                //  gets a reference to the existing layer on the map
                var rasterLayerOnMap = rasterLayersOnMap.filter(function(rasterLayerOnMap) {
                    return rasterLayerToRemove.name === rasterLayerOnMap.name;
                })[0];

                map.removeLayer(rasterLayerOnMap.leafletLayer);
                var index = rasterLayersOnMap.indexOf(rasterLayerOnMap);
                rasterLayersOnMap.splice(index, 1);

            }
        }


        /*
        *   Adds a vector layers to the Leaflet map.
        */
        function createVectorLayers(vectorDatasetsToAdd) {

            for (var i = 0; i < vectorDatasetsToAdd.length; i++) {

                var vectorDatasetToAdd = vectorDatasetsToAdd[i];

                var newVectorLayer = L.geoJson(vectorDatasetToAdd.data, {

                    onEachFeature: function(feature, layer) {

                        var dataset = Datasets.datasets.vector.filter(function(ds) { return ds.name === feature.datasetName; })[0];
                        var popupContent = feature.properties[dataset.fields[dataset.labelField].name];

                        layer.bindPopup(popupContent);

                        layer.on('mouseover', function(event) {

                            this.openPopup();

                        });

                        layer.on('click', function(event) {

                            $rootScope.$emit('detail', feature);

                        });

                    },

                    pointToLayer: function (feature, latlng) {

                        return L.circleMarker(latlng, $.extend({}, MARKER_STYLE, {color: vectorDatasetToAdd.color}));

                    },

                    style: $.extend({}, POLYGON_STYLE, {color: vectorDatasetToAdd.color}),

                });

                map.addLayer(newVectorLayer);
                if (vectorDatasetToAdd.data.totalFeatures && vectorDatasetToAdd.data.features[0].geometry.type !== 'Point') newVectorLayer.bringToBack();

                vectorLayersOnMap.push(newVectorLayer);

            }

        };

    });


    /*
    *   The directive for the map element in the HTML.
    */
    module.directive('map', function() {

        return {

            restrict: 'A',
            template: '<div id="map"></div>',
        };

    })

})();
