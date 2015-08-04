/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

// convenient plugins for displaying routes
var swagger = require('hapi-swagger');

// Microservice Plugin
var Chairo = require('chairo');

// home made plugins
var arkPlugins = require('./plugins.js');

// parse env values
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

// defines
var apiPrefix = '/api/v1';
var realtimePrefix = apiPrefix + '/r';

var routeOptionsRealtime = {
    routes: {
        prefix: realtimePrefix
    }
};
var routePrefix = {
    routes: {
        prefix: apiPrefix
    }
};

// set up server
var server = new Hapi.Server();
server.connection({port: 3001, labels: 'api'});
server.connection({port: 3002, labels: 'realtime'});

server.register([Chairo, swagger], err => {
    if (err) {
        throw err;
    }

    // Add a Seneca action

    var id = 0;
    server.seneca.add({generate: 'id'}, function (message, next) {

        return next(null, {id: ++id});
    });

    // register plugins
    server.register(arkPlugins.getPlugins(envVariables), err => {
        if (err) {
            console.error('unable to init plugin: ', err)
        }
    });

    // register ark plugins with routes (prefix)
    server.select('api').register(arkPlugins.getPrefixPlugins(), routePrefix, err => {
        if (err) {
            console.error('unable to init plugin:', err);
        }
    });

    // register realtime plugins
    server.select('realtime').register(arkPlugins.getRealtimePlugins(envVariables), routeOptionsRealtime, err => {
        if (err) {
            console.error('unable to init plugin:', err);
        }
    });
});


server.route({
    method: 'GET',
    path: '/id',
    handler: function (request, reply) {

        // Reply using a Seneca action

        return reply.act({generate: 'id'});
    }
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


server.start(err => {
    if (err) {
        return console.error('error starting server:', err);
    }
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
