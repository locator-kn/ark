// ark plugins
var Trip:any = require('ark-trip');
var User:any = require('ark-user');
var Locationpool:any = require('ark-locationpool');
var StaticData:any = require('ark-staticdata');
var Database:any = require('ark-database');
var ArkAuth:any = require('ark-authentication');
var Mailer:any = require('ark-mailer');
var Chat:any = require('ark-chat');
var Realtime:any = require('ark-realtime');

// parse env values
var envVariables;
if (process.env.travis) { // travis
    envVariables = require('./../../placeholderEnv.json');
} else {
    envVariables = require('./../../env.json');

    // check if imageMagick is installed before starting the server
    if (!(require('shelljs').which('convert'))) {
        throw new Error('ImageMagick not installed. Unable to run application. Please install it! Server shut down');
    }
}

var uri = envVariables['db']['uri'] || 'http://locator.in.htwg-konstanz.de';
var cookieTtl = envVariables['defaults']['cookie_ttl'] || 31556926000;


exports.getPrefixPlugins = () => {
    var trip = new Trip();
    var user = new User();
    var loc = new Locationpool();
    var staticData = new StaticData();

    return [trip, user, loc, staticData];
};

exports.getPlugins = () => {
    var arkAuth = new ArkAuth(false, cookieTtl, envVariables.auth);
    var mailer = new Mailer(envVariables.mailgun);
    var db = new Database('app', envVariables, uri, envVariables['db']['port']);

    return [db, arkAuth, mailer]
};

exports.getRealtimePlugins = () => {

    var chat = new Chat();
    var realtime = new Realtime(envVariables.auth);

    // Order is important!!
    return [realtime, chat];

};
