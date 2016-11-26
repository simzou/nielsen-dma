// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/app',
    paths: {
        lib: '../lib'
    },
    map: {
      '*': {
        'lib/d3': 'lib/d3.v4.min', // require('d3') will load 'd3.v4.min'
        'lib/topojson': 'lib/topojson.v1.min'
      }
    },
    deps: ['lib/d3', 'utils']
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['main']);
