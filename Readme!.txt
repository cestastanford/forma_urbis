Forma Urbis Romae Web Interface
------------------------------------

I wrote this in a summer, so it's very much a work in progress.  The first iteration was written in mostly plain JavaScript and is more complete, and the second iteration is written in AngularJS and has the foundation to be more responsive and powerful and incorporate some requested features, but it's far from finished.  I'll describe the second iteration here; the first is pretty similar.

The main goal of the project is to create a system that unify separate databases to allow for a unified browsing, searching and visualization experience.  I accomplished this by setting up the system to expect a metadata file describing each dataset using a common language.

-----------------------

Here's how to add a dataset:

1.  Export the dataset as a GeoJSON file.
2.  Place the GeoJSON file somewhere.
3.  Write a metadata file for the dataset and place it in 'data/datasets_metadata/'.  See note on writing metadata files.
4.  Add the path of the metadata page to the 'data/datasets.json' file.
5.  Add the dataset to the 'data/layer.json' layer hierarchy file.  See note on adding to the layer hierarchy.

-----------------------

Note on writing a metadata file: this file is a JSON file describing the database.  The structure is as follows:

>   "name" is a string representing the dataset.  It appears in the search results list and the details pane.  It's also used in the layer hierarchy file to reference the dataset source of a layer.  Make sure there aren't multiple datasets with the same name.

>   "type" is either "vector" or "raster".  In its current state, the interface can only accept GeoJSON for vector datasets and hierarchical tile sets for raster datasets.

>   "url" is the path to the dataset.  I've been storing them locally in the data/sources/ folder, but they could be kept anywhere locally or on different domain.  For raster datasets, the path has several placeholders so the system can navigate the tile hierarchy.

>   "labelField" is the index of the field in the "fields" array that should be used as the main label for an element.

>   "color" is the 3-hex-digit color code for a vector dataset's display color.

>   "attribution" is the string that'll appear at the bottom of the Leaflet map when the layer is loaded.

>   "tms" is one kind of standard for hierarchical tile sets, used, for example, when exporting tiles using GDAL; if the tiles aren't lining up with tms=false, try tms=true.

>   "fields" is a description of every field in a vector dataset.  It's an array of objects ordered in the order you'd like the dataset fields to appear in the details pane.  Each field object contains the following properties:

    >   "name" is the exact key of the property of the 'properties' object in the GeoJSON that you're referencing.

    >   "type" is the generalized type of the field.  The options currently written into the system are:

        >   "text", for any text attribute such as building name, architect, etc.

        >   "date", for any time attribute.

        >   "feature-type", for any type attribute.

        >   "uniqueID", for any sort of ID number or code.

        >   "location", for a place reference.

        >   "link", for a link to an outside resource.

    You can add more types; the place in the code that should be changed is at line 293 in data.js.

    >   "subtype" is a human-readable more specific description of the kind of data in the field.  These populate the checkboxes underneach each filter in the interface, allowing the user to search only for certain types of fields in each filter.  Examples include "Feature Name", "Architect" or "Note" for fields of type "text".  These can be anything, as they are gathered up by the system on first load.

    >   "format" is the data format of the field.  Each filter accepts a certain format of data, both from the input and the dataset – these are described in the "functionInputFormat" property of each filter in 'data/filters.json'.  For the system to work, the input and the data must already be in the functionInputFormat format, or there must be a conversion function in 'js/filterWorker.js' to convert between.

    >   "displayName" is the human-readable name that will appear in the feature details.

    >   "description" is a longer description that displays as a tooltip.

Use the existing examples as templates for new imports!

-----------------------

Note on adding to the layer hierarchy: this file (data/layers.json) is the one that actually defines which layers appear in the layers list.  It's JSON containing one main "root" object that contains any number of nested layer groups and actual layers.  A layer group is an object with a "name" property, a "role" property that is set to "group" and a "children" property containing whatever layer groups or layers it may contain.  A layer is an object with a "name" property, a "role" property that is set to "layer" and a "source" property that is set to the name of a database as specified in that database's metadata file.

-----------------------

If you're going to work on it, here's a quick description of how it works:

1. The Data module loads.  This module asynchronously downloads the list of datasets, downloads all dataset metadata files listed there, downloads any vector GeoJSON files that might be listed in the dataset metadata files, and exports a Datasets object that contains all of this.  Once that's done, the module checks that the layer hierarchy file references datasets that actually exist, links those datasets to the the hierarchy and exports a LayerHierarchy object with that information.  Finally, the module downloads the filter template file (data/filters.json) into a list of templates, then creates any resources that the filters might need, such as a list of all subtypes from all datasets or a list of all values of fields listed as type 'type'.  This gets exported in a Filters object.

2.  Once this is all done, the Search module loads.  This module provides the various views with methods to access and update the current vector feature search (defined by a set of layers run through a set of filters).  The ModifySearch object exports methods to manipulate the search by adding/removing datasets/filters, and module also exports a SearchResults object that contains the most recent filtered active datasets.

3.  Once the Search module has loaded, the URL bar controller checks the URL bar for a valid input string, and if found, it exports the details of that initial search for applying to the views, once they load.

4.  Now, the various controlling views.  The layer list view sets itself up to manage a hierarchical list of checkboxes for the layer hierarchy and call ModifySearch on any change.  It then reads in the initial search from the URL bar controller if present, updates its appearance and adds the new layers in ModifySearch.  Once that's done, the filter list view loads, setting itself up to create filter objects based on the templates available in the Filters.filterTemplates object and sending the active filters and their values to ModifySearch on any change.  If present from the URL controller, the controller reads the initial search parameters, updates its appearance and sends the filters to ModifySearch.  Both the layer list controller and the filters controller update the URL bar controller with any changes.

5.  Once this is done, the map view and controller load.  It gets its initial positioning from the URL bar controller, if present.  It receives updates to raster layers directly from the layer list controller and also listens in $rootScope for 'refresh' events signifying a change to the vector search results.  When either notification is received, the map adds or removes layers as appropriate.  Any time the map is moved, the controller updates the URL bar controller with its position.

6.  The results list also listens for 'refresh' events and updates its list accordingly.  When an element is clicked, it emits a 'detail' event that the details pane listens for and displays the appropriate detail on receipt.

-----------------------

Advanced Topics: If you're comfortable, feel free to add filters and conversions.  Filters need to be both described in data/filters.json and also have their operating functions in js/filterWorker.js, plus have an HTML template in templates/filters/.  Conversions also live in js/filterWorker.js.  Look at the existing ones for clues on how they work!

-----------------------

The current status of the project is that the core functionality works, but it's missing several features that I had hoped to implement before I left.  Hopefully this is a place that whoever takes over next can pick up easily from!  I apologize for some of the low-quality or uncommented code – near the end I was really rushed and not sleeping much and couldn't take the time I wanted to on the code.

good luck,
Cody
codymleff@gmail.com

