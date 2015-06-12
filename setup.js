var Trip = require('ark-trip').setup;
var Database = require('ark-database').setup;
var StaticData = require('ark-staticdata').setup;

// Database plugin
// TODO: save params in env.json
var db = new Database('app', envVariables.db, uri, 5984);
var data = new StaticData(db);
var trip = new Trip(db);


console.log('Setting up Database and all needed Views and Data.');

db.setup(function(err) {

    if (err) {
        console.log('Setting up database in Database-Plugin failed')
    }
});

trip.setup(function(err) {

    if(err) {
        console.log('Setting up search algo in Trip-Plugin failed')
    }
});

data.setup(function(err){

    if (err) {
        console.log('Setting up all static data in Static-Data-Plugin failed')
    }
});
