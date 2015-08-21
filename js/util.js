// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- util.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


/*
*   Creates the namespace object for the util module.
*/
if (!FUR) window.FUR = {};
FUR.util = (function(undefined) {


    /*
    *   Opens an XHR to download a JSON file, returning a Promise for
    *   the stuff.
    */
    var json = function(url) {

        return new Promise(function(resolve, reject) {

            //  create the request
            var request = new XMLHttpRequest();

            //  prepare the request
            request.open('GET', url);

            //  listen for response load
            request.onload = function() {

                //  call the resolve function if request succeeded
                if (request.status === 200) resolve(request.response);

                //  call the reject function if request failed
                else reject(request.statusText);

            };

            //  listen for failure
            request.onerror = function() {
                reject('Network Error');
            };

            //  send the request
            request.send();

        });
    };

    /*
    *   Displays a danger message on the screen.
    */
    var danger = function(message, object) {
        console.log('Danger: ' + message, object);
    };

    return {

        json: json;
        danger: danger;

    }

})();
