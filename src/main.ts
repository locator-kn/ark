/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

var swagger = require('hapi-swagger');
var blipp = require('blipp');

// ark plugins
var Database = require('ark-database');
var Trip = require('ark-trip');
var User = require('ark-user');
var Locationpool = require('ark-locationpool');
var StaticData = require('ark-staticdata');
var ArkAuth = require('ark-authentication');

// stream testing
var stream = require('stream');
var Joi = require('joi');
var gm = require('gm');
var Readable = stream.Readable ||
    require('readable-stream').Readable;

var cradle = require('cradle');

var dbLive = new (cradle.Connection)().database('alice');

// end stream testing

if (!process.env.travis) {
    var envVariables = require('./../../env.json');
} else {
    var envVariables = require('./../../placeholderEnv.json');
}


// init ark plugins
//var db = new Database('app', envVariables.db, 'http://locator.in.htwg-konstanz.de', 5984);
var db = new Database('app', envVariables.db, 'http://localhost');
var trip = new Trip();
var user = new User();
var loc = new Locationpool();
var staticData = new StaticData();
var arkAuth = new ArkAuth(false, 600000, envVariables.auth);


var prefixedArkPlugins = [trip, user, loc, staticData, arkAuth];

var routeOption = {
    routes: {
        prefix: '/api/v1'
    }
};

var server = new Hapi.Server();

server.connection({port: (process.env.PORT || 3001)});


server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
        handler: {
            directory: {
                path: 'public'
            }
        },
        auth: false
    }
});

// register ark plugins without routes
server.register({
    register: db
}, db.errorInit);

// register ark plugins with routes (prefix)
server.register(prefixedArkPlugins, routeOption, err => {
    if (err) {
        console.error('unable to init plugin:', err);
    }
});

server.register({
    register: swagger
}, err => {
    if (err) {
        console.error('unable to register plugin swagger:', err);
    }
});

server.register({
    register: blipp
}, err => {
    if (err) {
        console.error('unable to register plugin blipp:', err);
    }
});
server.start(function () {
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
