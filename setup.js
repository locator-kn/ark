var Trip = require('ark-trip');
var Database = require('ark-database');
var StaticData = require('ark-staticdata');

// Database plugin
// TODO: save params in env.json
var db = new Database('app', envVariables.db, uri, 5984);
var data = new StaticData();
var trip = new Trip();


console.log('Setting up Database and all needed Views and Data.');

db.setup(function(err) {

    if (err) {
        console.log('Setting up database failed')
    }
});

trip.setup(db, function(err) {

    if(err) {
        console.log('Setting up Search algo in Trip failed')
    }
});

data.setup(db, function(err){

    if (err) {
        console.log('Setting up all static database failed')
    }
});
