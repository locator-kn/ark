var Trip = require('ark-trip');
var Database = require('ark-database');

var envVariables = require('./env.json');
var uri = 'http://localhost';

// Database plugin
// TODO: save params in env.json
var db = new Database('app', envVariables, uri, 5984); // TODO: create databse if not exist
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

