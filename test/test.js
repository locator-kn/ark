var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
// Test shortcuts
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Server', function () {
    var server = require('../index');
    it('should work', function (done) {

        done();
    });

    //it('should register routes', function (done) {
    //    var options = {
    //        method: 'GET',
    //        url: '/test'
    //    };
    //    server.inject(options, function (response) {
    //        var result = response.result;
    //        expect(result).to.equal('test');
    //        done();
    //    });
    //
    //});

});
