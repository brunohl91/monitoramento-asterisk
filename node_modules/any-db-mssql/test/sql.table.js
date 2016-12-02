var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var adapter = require('../index.js');
var config = require('./support/config.js');

describe('SQL', function(){

	'use strict';

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

	describe('TABLE', function(){
		this.timeout(3000);
		var tableName = 'test_'+Date.now();

		it('should be possible to create', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('CREATE TABLE '+tableName+' (a int)', false, function(err, result){
				assert.ifError(err);
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should be possible to check for existance', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tableName', {tableName: tableName}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 1, 'Look like there is no table named '+tableName+' in the data base');
				assert.strictEqual(result.rowCount, 1, 'rowCount and rows.length mismatch');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should be possible to drop', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('DROP TABLE '+tableName, false, function(err, result){
				assert.ifError(err);
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});
	});
});