/// <reference path="../typings/hapi/hapi.d.ts" />
var Hapi = require('hapi');
var DatabaseService = require('./database/databaseService');

var dbInstance = new DatabaseService.DatabaseService();

var UserPlugin = require('./plugins/user/userPlugin').UserPlugin;
var userPlugin = new UserPlugin();

var server = new Hapi.Server();

server.connection({ port: 3001 });


server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, emily!');
    }
});

server.register({
    register: userPlugin,
    options: {
        database: 'http://localhost:5984',
        databaseInstance: dbInstance.db
    }
}, userPlugin.errorInit);

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
