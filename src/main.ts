/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

var swagger = require('hapi-swagger');
var blipp = require('blipp');
var Joi = require('joi');

// ark plugins
var Database = require('ark-database');
var Trip = require('ark-trip');
var User = require('ark-user');

// testing plugins
var loc = require('ark-locationpool');
var location = new loc();

// init ark plugins
var db = new Database('app', 'https://locator-kn.iriscouch.com', 80);
var trip = new Trip();
var user = new User();


var prefixedArkPlugins = [trip, user, location];

var routeOption = {
    routes: {
        prefix: '/api/v1'
    }
};

var server = new Hapi.Server();

server.connection({port: (process.env.PORT || 3001)});


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
