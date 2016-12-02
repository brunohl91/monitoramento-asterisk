var assert = require('assert');

var adapter = require('../index.js');
var config = require('./support/config.js');
var makeSlowQuery = require('./support/makeSlowQuery.js');

var ConnectionPool = false;
try {
	ConnectionPool = require('any-db-pool');
}
catch (e) {
	ConnectionPool = false;
}

var delaySeconds = 2;
var ifPoolExists = ConnectionPool ? describe : describe.skip;

ifPoolExists('Slow query', function(){
	'use strict';

	this.timeout((delaySeconds + 1) * 1000);

	var connection = false;

	before(function(done){
		connection = adapter.createConnection(config, function(err){
			assert.ifError(err);
			done();
		});

		connection.on('error', function(err){
			assert.ifError(err);
		});
	});

	after(function(done){
		if (connection) {
			connection.end(done);
		}
		else {
			done('connection missing');
		}
	});

	it('should take intentionally long time to finish', function(done){
		makeSlowQuery(connection, delaySeconds, done);
	});
});

ifPoolExists('Pool', function(){
	'use strict';

	this.timeout((delaySeconds + 1) * 1000);

	var pool = false;

	before(function(){
		var poolParams = {
			min: 5,
			max: 15,
			reset: function(conn, done) {
				conn.query('ROLLBACK TRANSACTION', done);
			}
		};

		pool = new ConnectionPool(adapter, config, poolParams);
	});

	after(function(done){
		pool.close(done);
	});

	it('should exist', function(){
		assert.ok(pool);
	});

	['query', 'acquire', 'release', 'close'].forEach(function(name){
		it('should provide `'+name+'()` method', function(){
			assert.ok(pool.query, 'There should be a `'+name+'` provided by the ConnectionPool object');
			assert.ok(pool.query instanceof Function, '`'+name+'()` should be a function');
		});
	});

	it('should run simple query', function(done){
		pool.query('SELECT 1 AS test', function(err, result){
			assert.ifError(err);
			assert.strictEqual(result.rowCount, 1, 'There should be 1 row there');

			done();
		});
	});

	it('should acquire two different connections', function(done){
		var ids = {length: 0};

		var todo = 2;
		var onAcquired = function(id){
			ids[id] = true;
			ids.length++;
			if (ids.length >= todo) {
				onDone();
			}
		};

		var onDone = function(){
			var keys = Object.keys(ids);

			assert.strictEqual(ids.length, todo, 'There should be '+todo+' connections acquired');
			assert.strictEqual(ids.length, keys.length - 1, 'There should be '+todo+' connections acquired');

			done();
		};

		pool.acquire(function(err, connection){
			assert.ifError(err);
			onAcquired(connection.id);
			pool.release(connection);
		});

		pool.acquire(function(err, connection){
			assert.ifError(err);
			onAcquired(connection.id);
			pool.release(connection);
		});
	});

	it('should run multiple queries on multiple connections asynchronously', function(done){
		var results = [];
		var delays = [4, 3, 2, 1];

		this.timeout((delays[0]+1) * 2000);

		var onResult = function(value){
			results.push(value);
			if (results.length >= delays.length) {
				onDone();
			}
		};

		var onDone = function(){
			assert.strictEqual(results.length, delays.length, 'There should be '+delays.length+' result values');
			delays.forEach(function(delay, index){
				assert.strictEqual(results[delay-1], index, 'Result '+(delay-1)+' should be equal '+index);
			});
			done();
		};

		delays.forEach(function(delay, index){
			pool.acquire(function(err, connection){
				assert.ifError(err);

				makeSlowQuery(connection, delay, function(){
					onResult(index);
					pool.release(connection);
				});
			});
		});
	});
});