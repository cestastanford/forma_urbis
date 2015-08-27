// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- selectDetail.js (JavaScript) -------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


/*
*   This module is responsible for coordinating the selection and detailing
*   process, along with recording the state of selection and detail.
*/

if (!window.FUR) window.FUR = {};
FUR.selectDetail = (function(undefined) {

    /*
    *   Instance Variables
    */
    var selectedFeatures = [];
    var detailedFeature = null;

    /*
    *   Selects a feature.
    */
    var selectFeature = function(layerName, ) {

        //  update model
        selectedFeatures.push(feature);

        //  update views
    };

    /*
    *   Deselects a feature.
    */
    var deselectFeature = function(feature) {

        //  update model
        var index = selectedFeatures.indexOf(feature);
        selectedFeatures.splice(index, 1);

        //  update views
    };

    /*
    *   Display a feature in the detail box
    */
    var detailFeature = function(feature) {

        //  update model
        detailedFeature = feature;
    }

    /*
    *   Set the focus on a specific feature.
    */
    var focusFeature = function(feature) {

        //  update views
    }

})();
