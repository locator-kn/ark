
/// <reference path="../typings/hapi/hapi.d.ts" />
'use strict';

import Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({
    port: 3000
});


server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        reply('asd');
    }

});



function myTestFn(name: string, num: number) {
    //console.log('hallllll', name);
}

myTestFn('hjg', 123);
server.start(() => {
    console.log('Server running at:', server.info.uri);
});
