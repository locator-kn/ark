/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

var swagger = require('hapi-swagger');
var blipp = require('blipp');
var Joi = require('joi');
var loc = require('backend-locationpool');
var db = require('backend-database');

var location = new loc();
var database = new db('app');

var routeOption = {
    routes: {
        prefix: '/api/v1'
    }
};

var server = new Hapi.Server();

server.connection({port: 3001});

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
                    .description('the id for the todo item')
            }
        }
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

server.register({
    register: database
},routeOption, database.errorInit);

server.register({
    register: location
},routeOption, location.errorInit);

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
