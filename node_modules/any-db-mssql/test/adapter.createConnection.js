var assert = require('assert');
var sql = require('tedious');

var adapter = require('../index.js');
var config = require('./support/config.js');

describe('Adapter', function(){

	'use strict';

	it('should provide createConnection() function', function(){
		assert.ok(adapter.createConnection);
		assert.ok(adapter.createConnection instanceof Function);
	});

	it('should return Connection object', function(){
		var connection = adapter.createConnection({}, function(err){
			if (!err) {
				connection.end();
			}
		});

		assert.ok(connection);
	});

	describe('Connection', function(){

		this.timeout(5000);

		it('should emit `error` event without callback set', function(done){
			var connection = adapter.createConnection({});

			connection.on('error', function(){
				done();
			});
		});

		it('should call back for `error` event', function(done){
			var connection = adapter.createConnection({}, function(err){
				assert.ok(err ? true : false);
				done();
			});
		});

		it('should emit `error` event when callback is set', function(done){
			var emittedError = false;

			var connection = adapter.createConnection({}, function(err){
				assert.strictEqual(emittedError, false, 'Callback should be first `error` listener');
				emittedError = true;
				done();
			});

			connection.on('error', function(err){
				assert.strictEqual(emittedError, true, '`error` event listeners should be called AFTER callback (if it was provided)');
				emittedError = true;
			});
		});

		it('should emit `close` event', function(done){
			var connection = adapter.createConnection(config, function(err){
				assert.ifError(err);
				connection.end();
			});

			connection.on('close', done);
		});

		it('should not throw exception when it is closed before connecting', function(done){
			var connection = adapter.createConnection(config, function(err){
				assert.ifError(err);
				done();
			});

			assert.doesNotThrow(function(){
				connection.end();
			});
		});
	});
});