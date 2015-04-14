/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

// Plugins
var DatabasePlugin = require('bemily-database');
var UserPlugin = require('bemily-user');
var AuthPlugin = require('bemily-authentication');

var swagger = require('hapi-swagger');
var blipp = require('blipp');
var Joi = require('joi');

var databasePlugin = new DatabasePlugin();
var auth = new AuthPlugin(true);

var databasePlugin = new DatabasePlugin('app', 'http://emily.iriscouch.com', 80);
var userPlugin = new UserPlugin();

var routeOption = {
    routes: {
        prefix: '/api/v1'
    }
};

var server = new Hapi.Server();

server.connection({port: 3001});

server.register(auth, routeOption, function (err) {
    if(err) {
        console.error('unable to register auth plugin:', err);
    }
});

server.route({
    method: 'GET',
    path: '/todo/{id}/',
    config: {
        handler: (a, b) => {
            b();
        },
        description: 'Get todo',
        notes: 'Returns a todo item by the id passed in the path',
        tags: ['api'],
        validate: {
            params: {
                username: Joi.number()
                    .required()
                    .description('the id for the todo item'),
            }
        }
    }
});

server.register({
    register: userPlugin
}, routeOption, userPlugin.errorInit);

server.register({
    register: databasePlugin
}, routeOption, databasePlugin.errorInit);

server.register({
    register: swagger
}, err => {
    if(err) {
        console.error('unable to register plugin swagger:', err);
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
