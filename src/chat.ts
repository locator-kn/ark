var Hapi = require('hapi');
var which = require('shelljs').which;

var blipp = require('blipp');

var Database:any = require('ark-database');
var Chat:any = require('ark-chat');
var Realtime:any = require('ark-realtime');

var Mailer:any = require('ark-mailer');
var ArkAuth:any = require('ark-authentication');
// defines
var uri = 'http://locator.in.htwg-konstanz.de';
var apiPrefix = '/api/v1';
var realtimePrefix = apiPrefix + '/r';

var routeOptionsRealtime = {
    routes: {
        prefix: realtimePrefix
    }
};


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

var envVariables,
    rport,
    cookieTtl = 60000;

var db = new Database('app', envVariables, uri, 5984);

var mailer = new Mailer(envVariables.mailgun);
var chat = new Chat();
var realtime = new Realtime(envVariables.auth);

var arkAuth = new ArkAuth(false, 60000000, envVariables.auth);

var server = new Hapi.Server();
server.connection({port: (rport || 3002), labels: 'realtime'});

server.register({
    register: db
}, db.errorInit);

server.select('realtime').register([arkAuth, mailer], routeOptionsRealtime, err => {
    if (err) {
        console.error('unable to init plugin:', err);
    }
});

server.select('realtime').register({
    register: realtime
}, routeOptionsRealtime, err => {
    if (err) {
        console.error('unable to init plugin:', err);
    }
});
server.select('realtime').register({
    register: chat
}, routeOptionsRealtime, err => {
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


server.start(() => {
    console.log('Database ', db.staticdata.db.name, ' running on ',
        db.staticdata.db.connection.host, ' port:', db.staticdata.db.connection.port);
    console.log('Authentication cookie ttl:', cookieTtl / 3600000, 'minutes');
    console.log('Mailer info:', envVariables.mailgun['DOMAIN']);
    console.log('Server running at:', server.info.uri);
});

module.exports = server;
