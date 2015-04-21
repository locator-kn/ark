/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

var swagger = require('hapi-swagger');
var blipp = require('blipp');
var Joi = require('joi');
var loc = require('backend-locationpool');
var db = require('backend-database');
var Fs = require('fs');

var cradle = require('cradle');

var dbLive = new(cradle.Connection)().database('alice');


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
var routeConfig = {
    validate: {
        payload: {
            file: Joi.required().description('file name for picture upload')
        }
    },
    payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 1000000000000
    },

    handler: function (request, reply) {
        var doc = {
            _id: 'fooDocumentIDs'
        };
        var idData = {
            id: doc._id
        };

        var attachmentData = {
            name: request.payload.file.hapi.filename,
            'Content-Type': 'multipart/form-data'
        };

        request.payload.file.pipe(dbLive.saveAttachment(idData, attachmentData, function (err, reply2) {
            if (err) {
                reply({status: err});
                console.error('cradle', err);
                return
            }
            reply({status: 'ok!'});
            console.dir(reply2)
        }));




        //request.payload.file.pipe(image);
    }
};

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


server.route({ method: 'POST', path: '/selfies', config: routeConfig });

server.register({
    register: database
},routeOption, database.errorInit);

server.register({
    register: location
},routeOption, location.errorInit);

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
