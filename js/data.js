// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- data.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //

/*
*   This module is responsible for loading, storing and providing access to all
*   user-provided data (datasets and layer arrangement) and semi-user-provided
*   data (filters and conversions).  It performs its core functions when first
*   run, setting the value of FUR.data.ready to 'true' when finished.
*/


(function() {

    /*
    *   Angular module for the application data.
    */
    var module = angular.module('Data', []);


    /*
    *   Service that downloads and provides access to the datasets.
    */
    module.factory('Datasets', ['$log', '$http', '$q', function($log, $http, $q) {

        var DATASET_INDEX_URL = 'data/datasets.json';

        var exports = {

            datasets: { vector: [], raster: [] },
            done: null,
        };


        /*
        *   Returns a promise to load dataset metadata.
        */
        var loadDatasetMetadata = function(response) {

            /*  map the array of URLs to an array of promises
            *   for loading the JSON at the URLs.
            */
            var promises = response.data.datasets.map(function(datasetURL) {

                return $http.get(datasetURL);
            });

            return $q.all(promises);
        };


        /*
        *   Accepts a sparse array of vector datasets, and returns a promise to
        *   download the datasets' GeoJSON from their respective URLs.
        */
        var loadVectorDatasetGeoJSON = function() {

            var promises = exports.datasets.vector.map(function(vectorDataset) {
                return $http.get(vectorDataset.url);
            });

            return $q.all(promises);
        };

        /*
        *   Loops through every feature in every dataset, recording a reference
        *   to its parent dataset.
        */
        var annotateFeatures = function() {

            for (var i = 0; i < exports.datasets.vector.length; i++) {

                var dataset = exports.datasets.vector[i];
                var datasetName = dataset.name;
                for (var j = 0; j < dataset.data.features.length; j++) {

                    var feature = dataset.data.features[j];
                    feature.datasetName = datasetName;
                }
            }
        };


        /*
        *   Executes the asynchronous loading process.
        */
        exports.done = $q.resolve()
        .then(function() { return $http.get(DATASET_INDEX_URL); }) // downloads the dataset index
        .then(loadDatasetMetadata) // downloads the dataset maps listed in the index
        .then(function(responses) { // separates the datasets by type

            responses.forEach(function(response) { exports.datasets[response.data.type].push(response.data); });

        })
        .then(loadVectorDatasetGeoJSON) // downloads the vector data for the vector datasets
        .then(function(responses) { // saves the vector GeoJSON with the corresponding dataset

            for (var i = 0; i < responses.length; i++) exports.datasets.vector[i].data = responses[i].data;

        })
        .then(annotateFeatures); // marks each feature with the dataset it comes from


        /*
        *   Returns exports.
        */
        return exports;


    }]);


    /*
    *   Service that downloads, verifies and provides access to the layer
    *   hierarchy.
    */
    module.factory('LayerHierarchy', ['$log', '$http', '$q', 'Datasets', function($log, $http, $q, Datasets) {

        var LAYER_HIERARCHY_URL = 'data/layers.json';

        var exports = {

            layerHierarchy: null,
            done: null,
        };


        /*
        *   Recursively verifies that each dataset in the layer
        *   hierarchy has been loaded.
        */
        var verifyLayerGroup = function(current) {

            if (!current || !current.children || current.children.length < 1) return false;

            for (var i = 0; i < current.children.length; i++) {

                if (current.children[i].role === 'group') {

                    if (!verifyLayerGroup(current.children[i])) {
                        danger('Layer group failed: ' + current.children[i].name);
                        return false;
                    }
                } else {

                    var match = Datasets.datasets.vector.filter(function(dataset) {
                        return dataset.name === current.children[i].source;
                    })[0];

                    if (!match) match = Datasets.datasets.raster.filter(function(dataset) {
                        return dataset.name === current.children[i].source;
                    })[0];

                    if (!match) {
                        danger('Layer failed: ' + current.children[i].name);
                        return false;
                    }

                    current.children[i].source = match;

                }
            }

            return true;
        };


        /*
        *   Verifies the layer hierarchy and adds it to a public instance variable.
        */
        var setupLayerHierarchy = function(response) {

            return $q(function(resolve, reject) {

                if (verifyLayerGroup(response.data)) {

                    exports.layerHierarchy = response.data.children;

                    resolve();

                } else reject('Invalid Layer Hierarchy');
            });
        };


        /*
        *   Executes the asynchronous loading process after datasets
        *   has finished downloading.
        */
        exports.done = Datasets.done
        .then(function() { return $http.get(LAYER_HIERARCHY_URL); }) // downloads the layer hierarchy
        .then(setupLayerHierarchy); // verifies and publishes the layer hierarchy


        /*
        *   Returns exports.
        */
        return exports;
    }]);


    /*
    *   Service that downloads the filter templates and creates any
    *   assets they might require.
    */
    module.factory('Filters', ['$log', '$http', '$q', 'Datasets', function($log, $http, $q, Datasets) {

        var FILTER_TEMPLATES_URL = 'data/filters.json';

        var exports = {

            filterTemplates: null,
            filterAssets: {},
            done: null,
        };


        /*
        *   Finds all feature types in the datasets.
        */
        var getFeatureTypes = function() {

            var featureTypes = {};

            //  In each vector dataset...
            for (var i = 0; i < Datasets.datasets.vector.length; i++) {
                var dataset = Datasets.datasets.vector[i];

                //  ...in each field...
                for (var j = 0; j < dataset.fields.length; j++) {
                    var field = dataset.fields[j];

                    //  ...if the field is of type 'feature-type'...
                    if (field.type === 'feature-type') {

                        //  ...add all possible values of that field to the list,
                        //  noting the count.
                        for (var k = 0; k < dataset.data.features.length; k++) {
                            var feature = dataset.data.features[k];
                            var type = feature.properties[field.name]
                            if (type) {
                                if (featureTypes[type]) {
                                    featureTypes[type] += 1;
                                } else featureTypes[type] = 1;
                            }
                        }
                    }
                }
            }

            return featureTypes;
        };


        /*
        *   Finds and list the subtypes found for each type in each dataset.
        */
        var getSubtypes = function() {

            var subtypes = {

                text: [],
                date: [],
                'feature-type': [],
                uniqueID: [],
                location: [],
                link: [],

            };

            for (var i = 0; i < Datasets.datasets.vector.length; i++) {

                var vectorDataset = Datasets.datasets.vector[i];
                for (var j = 0; j < vectorDataset.fields.length; j++) {

                    var type = vectorDataset.fields[j].type;
                    var subtype = vectorDataset.fields[j].subtype;

                    var index = subtypes[type].indexOf(subtype);
                    if (index < 0) {

                        subtypes[type].push(subtype);
                    }

                }

            }

            return subtypes;
        }


        /*
        *   Verifies the layer hierarchy and adds it to a public instance variable.
        */
        var setupFilterTemplates = function(response) {

            return $q(function(resolve, reject) {

                exports.filterTemplates = response.data.list;

                exports.filterAssets.featureTypes = getFeatureTypes();
                exports.filterAssets.subtypes = getSubtypes();

                resolve();
            });

        };


        /*
        *   Executes the asynchronous loading process after datasets
        *   has finished downloading.
        */
        exports.done = Datasets.done
        .then(function () { return $http.get(FILTER_TEMPLATES_URL); }) // downloads the filter templates
        .then(setupFilterTemplates); // gathers required data and publishes the filter templates


        /*
        *   Returns exports.
        */
        return exports;

    }]);
})();
