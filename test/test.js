
var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
// Test shortcuts
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Server', function () {
    it('should work', function (done) {
        var server = require('../index');
        done();
    });
});
