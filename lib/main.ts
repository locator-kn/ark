/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');

// Plugins
var DatabasePlugin = require('bemily-database');
var UserPlugin = require('bemily-user');

// Thirdparty plugins
var AuthPlugin = require('bemily-authentication');

var auth = new AuthPlugin();

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
    console.log(err, 'bla');
});
server.route({
    method: 'GET',
    path: '/',
    config: {
        handler: function (request, reply) {
            reply('hello, ' + 'kjhasd');
        }
    }
});

server.register({
    register: userPlugin
}, routeOption, userPlugin.errorInit);

server.register({
    register: databasePlugin
}, routeOption, databasePlugin.errorInit);

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
