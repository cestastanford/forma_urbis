// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- data.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


/*
*   Creates the namespace object for the data module.
*/
if (!window.FUR) window.FUR = {};
FUR.data = (function(undefined) {


    /*
    *   Locations of data sets
    */
    var DATASET_INDEX_URL = 'data/datasets.json';
    var FILTER_TEMPLATES_URL = 'data/filters.json';
    var LAYER_HIERARCHY_URL = 'data/layers.json';
    var json = FUR.misc.json;
    var danger = FUR.misc.danger;


    /*
    *   Instance variables
    */
    var datasets;
    var layerHierarchy;
    var filterTemplates;

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

        datasets = datasetsIncoming;

        var vectorDatasets = datasets.filter(function(dataset) {
            return dataset.type === 'vector';
        });

        var promises = vectorDatasets.map(function(vectorDataset) {
            return json(vectorDataset.url);
        });

        return Promise.all(promises);
    };


    /*
    *   Attaches each GeoJSON object to its respective vector dataset.
    */
    var attachGeoJSON = function(geoJSON) {

        var counter = 0;
        for (var i = 0; i < datasets.length; i++) {

            var dataset = datasets[i];
            if (dataset.type === 'vector') dataset.data = geoJSON[counter++];
        }
    };


    /*
    *   Recursively verifies that each dataset in the layer
    *   hierarchy has been loaded.
    */
    var verifyLayerGroup = function(current) {

        if (!current || !current.children) {
            console.error('Invalid layer group!');
            return false;
        }

        for (var i = 0; i < current.children.length; i++) {

            if (current.children[i].role === 'group') {

                if (!verifyLayerGroup(current.children[i])) {

                    return false;
                }
            } else {

                var match = datasets.filter(function(dataset) {
                    return dataset.name === current.children[i].source;
                });

                if (match < 1) {

                    return false;
                }
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
            } else reject();

        });
    };

    /*
    *   Verifies the layer hierarchy and adds it to a public instance variable.
    */
    var setupFilterTemplates = function(filterTemplatesIncoming) {

        filterTemplates = filterTemplatesIncoming.list;

    };

    /*
    *   Prints to the console the status of the data model.
    */
    var consoleStatus = function() {

        console.log('Status Report');
        console.log('---------------------');
        console.log('Datasets: ' + datasets.length + ' loaded.  ', datasets);
        console.log('Layer Hierarchy: ' + layerHierarchy.length + ' top-level entries.  ', layerHierarchy);
        console.log('Filter Templates: ' + filterTemplates.length + ' loaded.  ', filterTemplates);

    };

    /*
    *   Executes the asynchronous loading process.
    */
    Promise.resolve()
    .then(function() { return json(DATASET_INDEX_URL); }) // downloads the dataset index
    .then(loadDatasetMetadata) // downloads the dataset maps listed in the index
    .then(loadVectorDatasetGeoJSON) // downloads the vector data for the vector datasets
    .then(attachGeoJSON) // saves the vector GeoJSON with the corresponding dataset

    .then(function() { return json(LAYER_HIERARCHY_URL); }) // downloads the layer hierarchy
    .then(setupLayerHierarchy) // verifies and publishes the layer hierarchy

    .then(function () { return json(FILTER_TEMPLATES_URL); }) // downloads the filter templates
    .then(setupFilterTemplates) // gathers required data and publishes the filter templates

    .then(consoleStatus)
    .catch(danger);


    /*
    *   Module Exports
    */
    return {

        ready: false,
        layers: layerHierarchy,
        filters: filterTemplates,
        consoleStatus: consoleStatus,

    };

})();
