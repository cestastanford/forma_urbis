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


/*
*   Creates the namespace object for the data module.
*/
if (!window.FUR) window.FUR = {};
FUR.data = (function(undefined) {


    /*
    *   Constants
    */
    var DATASET_INDEX_URL = 'data/datasets.json';
    var FILTER_TEMPLATES_URL = 'data/filters.json';
    var LAYER_HIERARCHY_URL = 'data/layers.json';
    var json = FUR.misc.json;
    var danger = FUR.misc.danger;
    var exports = FUR.data;


    /*
    *   Instance variables
    */
    var datasets = { raster: [], vector: [] };
    var layerHierarchy;
    var filterTemplates;
    var filterAssets = {};

    /*
    *   Returns a promise to load dataset metadata.
    */
    var loadDatasetMetadata = function(datasetIndex) {

        /*  map the array of URLs to an array of promises
        *   for loading the JSON at the URLs.
        */
        var promises = datasetIndex.datasets.map(function(datasetIndex) {

            return json(datasetIndex);
        });

        return Promise.all(promises);
    };


    /*
    *   Accepts a sparse array of vector datasets, and returns a promise to
    *   download the datasets' GeoJSON from their respective URLs.
    */
    var loadVectorDatasetGeoJSON = function(datasetsIncoming) {

        var promises = datasets.vector.map(function(vectorDataset) {
            return json(vectorDataset.url);
        });

        return Promise.all(promises);
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

                var match = datasets.vector.filter(function(dataset) {
                    return dataset.name === current.children[i].source;
                })[0];

                if (!match) match = datasets.raster.filter(function(dataset) {
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
    var setupLayerHierarchy = function(layerHierarchyIncoming) {

        return new Promise(function(resolve, reject) {

            if (verifyLayerGroup(layerHierarchyIncoming)) {

                layerHierarchy = layerHierarchyIncoming.children;

                resolve();

            } else reject('Invalid Layer Hierarchy');
        });
    };


    /*
    *   Finds all feature types in the datasets.
    */
    var getFeatureTypes = function() {

        var featureTypes = {};

        //  In each vector dataset...
        for (var i = 0; i < datasets.vector.length; i++) {
            var dataset = datasets.vector[i];

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

        };

        for (var i = 0; i < datasets.vector.length; i++) {

            var vectorDataset = datasets.vector[i];
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
    var setupFilterTemplates = function(filterTemplatesIncoming) {

        return new Promise(function(resolve, reject) {

            filterTemplates = filterTemplatesIncoming.list;

            filterAssets.featureTypes = getFeatureTypes();
            filterAssets.subtypes = getSubtypes();

            resolve();
        });

    };


    /*
    *   Prints to the console the status of the data model.
    */
    var consoleStatus = function() {

        console.log('Data Status');
        console.log('---------------------');
        console.log('Datasets: ' + datasets.vector.length + ' vector and ' + datasets.raster.length + ' raster loaded.  ', datasets);
        console.log('Layer Hierarchy: ' + layerHierarchy.length + ' top-level entries.  ', layerHierarchy);
        console.log('Filter Templates: loaded.  ', filterTemplates);
        console.log('Filter Assets: ', filterAssets);

    };


    /*
    *   Executes the asynchronous loading process.
    */
    Promise.resolve()
    .then(function() { return json(DATASET_INDEX_URL); }) // downloads the dataset index
    .then(loadDatasetMetadata) // downloads the dataset maps listed in the index
    .then(function(datasetsIncoming) { // separates the datasets by type

        datasetsIncoming.forEach(function(dataset) { datasets[dataset.type].push(dataset); });

    })
    .then(loadVectorDatasetGeoJSON) // downloads the vector data for the vector datasets
    .then(function(geoJSON) { // saves the vector GeoJSON with the corresponding dataset

        for (var i = 0; i < geoJSON.length; i++) datasets.vector[i].data = geoJSON[i];

    })

    .then(function() { return json(LAYER_HIERARCHY_URL); }) // downloads the layer hierarchy
    .then(setupLayerHierarchy) // verifies and publishes the layer hierarchy

    .then(function () { return json(FILTER_TEMPLATES_URL); }) // downloads the filter templates
    .then(setupFilterTemplates) // gathers required data and publishes the filter templates

    .then(function() {

        FUR.data.ready = true;
        FUR.data.layerHierarchy = layerHierarchy;
        FUR.data.filterTemplates = filterTemplates;
        FUR.data.filterAssets = filterAssets;

        consoleStatus();

    })
    .catch(danger);



    /*
    *   Module Exports
    */
    return {
        ready: false,
    };

})();
