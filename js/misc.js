// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //
// -- misc.js (JavaScript) ------------------------------------------------- //
// -- written by Cody M Leff (codymleff@gmail.com) ------------------------- //
// -- for Forma Urbis Romae at CESTA - Spatial History Lab ----------------- //
// ------------------------------------------------------------------------- //
// ------------------------------------------------------------------------- //


/*
*   Creates the namespace object for the misc module.
*/
if (!window.FUR) window.FUR = {};
FUR.misc = (function(undefined) {


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
                //  REQUEST STATUS 0 FOR LOCAL ONLY
                if (request.status === 200 || (request.status === 0 && request.response)) {
                    var response = JSON.parse(request.response);
                    resolve(response);
                }

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
    *   Displays a danger message on the console.
    */
    var danger = function(message, object) {
        console.error('Danger: ' + message, object);
    };

    /*
    *   Displays a result on the console.
    */
    var result = function(result) {
        console.log('Result: ', result);
    };

    return {

        json: json,
        danger: danger,
        result: result,

    }

})();
