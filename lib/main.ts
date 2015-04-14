/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');
var DatabasePlugin = require('bemily-database');
var UserPlugin = require('bemily-user');

var lout = require('lout');
var blipp = require('blipp');

var databasePlugin = new DatabasePlugin();
var userPlugin = new UserPlugin();

var routeOption = {
    routes: {
        prefix: '/api/v1'
    }
};

var server = new Hapi.Server();

server.connection({port: 3001});

server.register({
    register: userPlugin
}, routeOption, userPlugin.errorInit);

server.register({
    register: databasePlugin
}, routeOption, databasePlugin.errorInit);

server.register({
    register: lout
}, err => {
    if(err) {
        console.error('unable to register plugin lout:', err);
    }
});

server.register({
    register: blipp
}, err => {
    if(err) {
        console.error('unable to register plugin blipp:', err);
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
