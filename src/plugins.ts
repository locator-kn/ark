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


exports.getPrefixPlugins = () => {
    var trip = new Trip();
    var user = new User();
    var loc = new Locationpool();
    var staticData = new StaticData();

    return [trip, user, loc, staticData];
};

exports.getPlugins = (envVariables) => {

    var cookieTtl = envVariables['defaults']['cookie_ttl'] || 31556926000;
    var uri = envVariables['db']['uri'] || 'http://locator.in.htwg-konstanz.de';

    var arkAuth = new ArkAuth(false, cookieTtl, envVariables.auth);
    var mailer = new Mailer(envVariables.mailgun);
    var db = new Database('app', envVariables, uri, envVariables['db']['port']);

    console.log('Authentication cookie ttl:', cookieTtl / 3600000, 'minutes');
    console.log('Database ', db.staticdata.db.name, ' running on ',
        db.staticdata.db.connection.host, ' port:', db.staticdata.db.connection.port);
    console.log('Mailer info:', envVariables.mailgun['DOMAIN']);

    return [db, arkAuth, mailer]
};

exports.getRealtimePlugins = (envVariables) => {

    var chat = new Chat();
    var realtime = new Realtime(envVariables.auth);

    // Order is important!!
    return [realtime, chat];

};
