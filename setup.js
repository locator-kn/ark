var Trip = require('ark-trip');
var Database = require('ark-database');
var StaticData = require('ark-staticdata');

var envVariables = require('./env.json');
var uri = 'http://locator.in.htwg-konstanz.de';

// Database plugin
// TODO: save params in env.json
var db = new Database('app', envVariables.db, uri, 5984); // TODO: create databse if not exist
var data = new StaticData();
var trip = new Trip();

console.log('Setting up Database and all needed Views and Data:');

// views
db.setup(null, function (err, data) {

    if (err) {
        console.error('Setting up database in Database-Plugin failed', err);
        return;
    }
    console.log('Database setup successful: ', data);
});

// trip algo logic view
db.setup(trip.getSetupData(), function (err, data) {

    if (err) {
        console.error('Setting up search algo in Trip-Plugin failed', err);
        return;
    }
    console.log('Search-Trip setup successful: ', data)
});

// no static data setup for now
return;


// static data
db.setup(data.getSetupData(), function (err, data) {

    if (err) {
        console.error('Setting up all static data in Static-Data-Plugin failed', err);
        return;
    }
    console.log('Static-Data setup successful: ', data)
});


