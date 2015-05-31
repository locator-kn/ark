/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');
var which = require('shelljs').which;

var swagger = require('hapi-swagger');
var blipp = require('blipp');

// ark plugins
var Database = require('ark-database');
var Trip = require('ark-trip');
var User = require('ark-user');
var Locationpool = require('ark-locationpool');
var StaticData = require('ark-staticdata');
var ArkAuth = require('ark-authentication');
var Mailer = require('ark-mailer');
var Chat = require('ark-chat');
var Realtime = require('ark-realtime');

var envVariables;
// ifbuild is triggerd in travis
if (process.env.travis) {
    envVariables = require('./../../placeholderEnv.json');

} else {
    // check if imageMagick is installed before starting the server
    if (!which('convert')) {
        throw new Error('ImageMagick not installed. Unable to run application. Please install it! Server shut down');
    }

    envVariables = require('./../../env.json');
}

// defines
var uri = 'http://locator.in.htwg-konstanz.de';
var apiPrefix = '/api/v1';
var realtimePrefix = apiPrefix + '/r';

// init ark plugins
var db = new Database('app', envVariables.db, uri, 5984);
var trip = new Trip();
var user = new User();
var loc = new Locationpool();
var staticData = new StaticData();
var arkAuth = new ArkAuth(false, 60000000, envVariables.auth);
var mailer = new Mailer(envVariables.mail, uri + apiPrefix);
var chat = new Chat();
var realtime = new Realtime();
// home made plugins

var prefixedArkPlugins = [trip, user, loc, staticData, mailer];
var realtimePlugins = [realtime, chat];

var routeOption = {
    routes: {
        prefix: apiPrefix
    }
};

var routeOptionsRealtime = {
    routes: {
        prefix: realtimePrefix
    }
};

var server = new Hapi.Server();

server.connection({port: (process.env.PORT || 3001), labels: 'api'});
server.connection({port: (process.env.PORT || 3002), labels: 'realtime'});

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

server.select('realtime').register(realtimePlugins, routeOptionsRealtime, err => {
    if (err) {
        console.error('unable to init plugin:', err);
    }
});


server.register([swagger], err => {
    if (err) {
        console.error('unable to register plugin swagger:', err);
    }
});

server.register([arkAuth], routeOption, err => {
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

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
