var Trip = require('ark-trip');
var Database = require('ark-database');
var StaticData = require('ark-staticdata');

var envVariables = require('./env.json');
var uri = 'http://locator.in.htwg-konstanz.de';

// Database plugin
// TODO: save params in env.json
var db = new Database('app', envVariables.db.production, uri, 5984);
var data = new StaticData();
var trip = new Trip();

console.log('Setting up Database and all needed Views and Data.');


db.setup(function (err) {

    if (err) {
        console.error('Setting up database in Database-Plugin failed')
    }
});

return;

trip.setup(db, function (err) {

    if (err) {
        console.error('Setting up search algo in Trip-Plugin failed')
    }
});

data.setup(db, function (err) {

    if (err) {
        console.error('Setting up all static data in Static-Data-Plugin failed')
    }
});
