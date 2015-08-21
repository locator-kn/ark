/// <reference path="../typings/node/node.d.ts" />
declare var Promise;
var Hapi = require('hapi');

// home made plugins
var arkPlugins = require('./plugins.js');

// parse env values and check if on travis
var envVariables;
if (process.env.travis) {

    // travis
    envVariables = require('./../../placeholderEnv.json');

} else {

    // check if imageMagick is installed before starting the server
    if (!(require('shelljs').which('convert'))) {
        throw new Error('ImageMagick not installed. Unable to run application. Please install it! Server shut down');
    }

    // production
    envVariables = require('./../../env.json');
}

// set up server
var server = new Hapi.Server();
server.connection({port: 3001, labels: 'api'});
server.connection({port: 3002, labels: 'realtime'});


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

// Register plugins
server.register([
 /*   {
        register: require('chairo'),
        options: {
            log: 'silent'
        }
    },*/ // wait for support of hapi 9.x.x
    {
        register: require('inert')
    },
    {
        register: require('vision')
    },
    {
        register: require('hapi-swagger'),
        option: {
            apiVersion: require('./../package.json').version
        }
    },
    {
        register: require('blipp')
    },
/*    {
        register: require('good'),
        options: {
            reporters: [{
                reporter: require('good-console'),
                events: {log: '*', response: '*', error: '*', request: '*'}
            }]
        }
    },*/ // wait for support of hapi 9.x.x
], err => {

    if (err) {
        throw err;
    }

    // register home made plugins
    Promise.all([registerGeneralPlugins(), registerRealtimePlugins(), registerApiPlugins()])
        .then(() => {

            // start the server
            server.start(err => {
                if (err) {
                    return console.error('error starting server:', err);
                }
                console.log('Server running at:', server.info.uri);
            });
        }).catch(err => {
            throw err
        });
});

function registerGeneralPlugins() {
    return new Promise((resolve, reject) => {

        server.register(arkPlugins.getGeneralPlugins(envVariables),
            {
                routes: {
                    prefix: '/api/v1'
                }
            }, err => {

                if (err) {
                    console.error('unable to init plugin:', err);
                    return reject(err)
                }
                resolve();
            });
    })
}

function registerRealtimePlugins() {
    return new Promise((resolve, reject) => {

        server.select('realtime').register(arkPlugins.getRealtimePlugins(envVariables),
            {
                routes: {
                    prefix: '/api/v1/r'
                }
            }, err => {

                if (err) {
                    console.error('unable to init plugin:', err);
                    return reject(err)
                }
                resolve();
            });
    })
}

function registerApiPlugins() {
    return new Promise((resolve, reject) => {

        server.select('api').register(arkPlugins.getPrefixPlugins(),
            {
                routes: {
                    prefix: '/api/v1'
                }
            }, err => {

                if (err) {
                    console.error('unable to init plugin:', err);
                    return reject(err)
                }
                resolve();
            });
    })
}

module.exports = server;
