/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

// convenient plugins for displaying routes
var swagger = require('hapi-swagger');

// Microservice Plugin
var Chairo = require('chairo');

// home made plugins
var arkPlugins = require('./plugins.js');

// parse env values and check if on travis
var envVariables;
if (process.env.travis) { // travis
    envVariables = require('./../../placeholderEnv.json');
} else {
    envVariables = require('./../../env.json');

    // check if imageMagick is installed before starting the server
    if (!(require('shelljs').which('convert'))) {
        throw new Error('ImageMagick not installed. Unable to run application. Please install it! Server shut down');
    }
}

// set up server
var server = new Hapi.Server();
server.connection({port: 3001, labels: 'api'});
server.connection({port: 3002, labels: 'realtime'});

var senecaOptions = {log: 'silent'}; // seneca has the tendency to log EVERYTHING

// Register plugins
server.register([{register: Chairo, options: senecaOptions}, {register: swagger}], err => {

    if (err) {
        throw err;
    }

    // register plugins
    server.register(arkPlugins.getGeneralPlugins(envVariables), err => {

        if (err) {
            console.error('unable to init plugin: ', err)
        }
    });

    // register ark plugins with routes (prefix)
    server.select('api').register(arkPlugins.getPrefixPlugins(), {
        routes: {
            prefix: '/api/v1'
        }
    }, err => {

        if (err) {
            console.error('unable to init plugin:', err);
        }
    });

    // register realtime plugins
    server.select('realtime').register(arkPlugins.getRealtimePlugins(envVariables), {
        routes: {
            prefix: '/api/v1/r'
        }
    }, err => {

        if (err) {
            console.error('unable to init plugin:', err);
        }
    });
});


// Add ability to reply errors with data
server.ext('onPreResponse', (request, reply:any) => {
    var response:any = request.response;
    if (!response.isBoom) {
        return reply.continue();
    }
    if (response.data) {
        response.output.payload.data = response.data;
    }
    return reply(response);
});

// logging stuff
server.register({
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {log: '*', response: '*', error: '*', request: '*'}
        }]
    }
}, err => {

    if (err) {
        return console.error(err);
    }
});


// start the server
server.start(err => {
    if (err) {
        return console.error('error starting server:', err);
    }
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
