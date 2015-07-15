/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');
var which = require('shelljs').which;

// convenient plugins for displaying routes
var swagger = require('hapi-swagger');
var blipp = require('blipp');

// ark plugins
var Database:any = require('ark-database');
var Trip:any = require('ark-trip');
var User:any = require('ark-user');
var Locationpool:any = require('ark-locationpool');
var StaticData:any = require('ark-staticdata');
var ArkAuth:any = require('ark-authentication');
var Mailer:any = require('ark-mailer');

var envVariables;

// if build is triggerd in travis
if (process.env.travis) {
    envVariables = require('./../../placeholderEnv.json');

} else {
    // check if imageMagick is installed before starting the server
    if (!which('convert')) {
        throw new Error('ImageMagick not installed. Unable to run application. Please install it! Server shut down');
    }

    // production
    envVariables = require('./../../env.json');
}
var cookieTtl = envVariables['defaults']['cookie_ttl'] || 31556926000;

var portIdx;
var port = envVariables['defaults']['ark_port'];
var portExists = process.argv.indexOf('PORT') !== -1;

if (portExists) {
    portIdx = process.argv.indexOf('PORT');
    port = process.argv[portIdx + 1];
    console.log('Port of choice', port);
}

// defines
var uri = envVariables['db']['uri'] || 'http://locator.in.htwg-konstanz.de';
var apiPrefix = '/api/v1';

// init ark plugins
// TODO: save params in env.json
var db = new Database('app', envVariables, uri, envVariables['db']['port']);
var trip = new Trip();
var user = new User();
var loc = new Locationpool();
var staticData = new StaticData();
var arkAuth = new ArkAuth(false, cookieTtl, envVariables.auth);
var mailer = new Mailer(envVariables.mailgun);

var prefixedArkPlugins = [trip, user, loc, staticData];

var routeOption = {
    routes: {
        prefix: apiPrefix
    }
};

var server = new Hapi.Server();

server.connection({port: (port || 3001), labels: 'api'});

//server.register([realtime], realtime.errorInit);
// register ark plugins without routes
server.register({
    register: db
}, db.errorInit);

// register ark plugins with routes (prefix)
server.select('api').register(prefixedArkPlugins, routeOption, err => {
    if (err) {
        console.error('unable to init plugin:', err);
    }
});


server.register([swagger], err => {
    if (err) {
        console.error('unable to register plugin swagger:', err);
    }
});

server.register([arkAuth, mailer], routeOption, err => {
    if (err) {
        console.error('unable to init plugin:', err);
    }
});

server.register({
    register: blipp
}, err => {
    if (err) {
        console.error('unable to register plugin blipp:', err);
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

// log the payload on error
server.on('response', (request) => {

    if (request.response) {
        var code = request.response.statusCode;
    } else {
        return
    }

    if (code >= 400 && code < 500) {
        request.log(['ark', 'error', 'payload', '400'], request.payload)
    } else if (code >= 500) {
        request.log(['ark', 'error', 'payload', '500'], request.payload)
    }
});

var options = {
    reporters: [{
        reporter: require('good-file'),
        events: {error: '*', request: '500'},
        config: '/var/log/locator/internalError.log'
    }, {
        reporter: require('good-file'),
        events: {request: '400'},
        config: '/var/log/locator/clientError.log'
    }, {
        reporter: require('good-console'),
        events: {error: '*', request: '500'}
    }, {
        reporter: require('good-file'),
        events: {response: '*', log: '*', request: '*'},
        config: '/var/log/locator/locator.log'
    }, {
        reporter: require('good-file'),
        events: {log: 'corrupt'},
        config: '/var/log/locator/corruptFiles.log'
    }],
    requestHeaders: true,
    requestPayload: true,
    responsePayload: true
};
server.register({
    register: require('good'),
    options: options
}, err => {
    if (err) console.log(err);
});

server.start(() => {
    console.log('Database ', db.staticdata.db.name, ' running on ',
        db.staticdata.db.connection.host, ' port:', db.staticdata.db.connection.port);
    console.log('Authentication cookie ttl:', cookieTtl / 3600000, 'minutes');
    console.log('Mailer info:', envVariables.mailgun['DOMAIN']);
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
