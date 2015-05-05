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

// stream testing
server.route({
    method: 'GET',
    path: '/selfies',
    config: {
        auth: false,
    },
    handler: (request, reply) => {
        var doc = {
            _id: 'fooDocumentID'
        };
        var idData = {
            id: doc._id
        };

        var stream = dbLive.getAttachment('fooDocumentIDs', 'locator.png', err => {
            if (err) {
                return console.log(err);
            }
            console.log('success');

        });
        stream.on('data', function () {
            console.log(arguments);
        });

        var readStream = new Readable().wrap(stream);
        reply(readStream);

    }
});

server.route({
    method: 'POST',
    path: '/selfies',
    config: {
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data',
            maxBytes: 1000000000000
        },
        auth: false,
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

            // create readStream
            var readStream = request.payload.file;

            // create writeStream
            var writeStream = dbLive.saveAttachment(idData, attachmentData, function (err, reply2) {
                if (err) {
                    reply({status: err});
                    console.error('cradle', err);
                    return
                }
                reply({status: 'ok!'});
                console.dir(reply2)
            });

            gm(readStream)
                .resize('2000', '2000')
                .stream()
                .pipe(writeStream);

            // pipe (stream) the image into the db and save it as an attachment
            //readStream.pipe(writeStream);

        },
        validate: {
            payload: {
                file: Joi.required().description('file name for picture upload')
            }
        }
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
