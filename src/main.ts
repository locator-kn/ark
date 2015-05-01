/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

var swagger = require('hapi-swagger');
var blipp = require('blipp');
var Joi = require('joi');

// ark plugins
var Database = require('ark-database');
var Trip = require('ark-trip');
var User = require('ark-user');
var Locationpool = require('ark-locationpool');
var StaticData = require('ark-staticdata');
var ArkAuth = require('ark-authentication');

var envVariables = require('./../../env.json');

// init ark plugins
var db = new Database('app', envVariables.db, 'http://locator.in.htwg-konstanz.de', 5984);
var trip = new Trip();
var user = new User();
var loc = new Locationpool();
var staticData = new StaticData();
var arkAuth = new ArkAuth(false, 6000, envVariables.auth);


var prefixedArkPlugins = [trip, user, loc, staticData];

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
    handler: {
        directory: {
            path: 'public'
        }
    }
});

// register ark plugins without routes
server.register({
    register: db
}, db.errorInit);

server.register({
    register: arkAuth
}, arkAuth.errorInit);

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
