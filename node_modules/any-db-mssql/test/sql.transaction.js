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

	describe('Transaction', function(){
		this.timeout(3000);
		var tableName = 'test_'+Date.now();

		before(function(done){
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

		after(function(done){
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

		it('should rollback inserted row', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});

			connection.query('BEGIN TRANSACTION');
			connection.query('DELETE FROM '+tableName);
			connection.query('INSERT INTO '+tableName+' VALUES (@value)', {value: 42});
			connection.query('SELECT * FROM '+tableName, false, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 1, 'Looks like there is no row in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				assert.strictEqual(result.rows[0].a, 42, 'Looks like some other rows are in the data base');
			});
			connection.query('ROLLBACK TRANSACTION');
			connection.query('SELECT * FROM '+tableName, false, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 0, 'Looks like some rows are there in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should commit inserted row', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});

			connection.query('BEGIN TRANSACTION');
			connection.query('DELETE FROM '+tableName);
			connection.query('INSERT INTO '+tableName+' VALUES (@value)', {value: 42});
			connection.query('COMMIT TRANSACTION');
			connection.query('SELECT * FROM '+tableName, false, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 1, 'Looks like there is no row in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				assert.strictEqual(result.rows[0].a, 42, 'Looks like some other rows are in the data base');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should rollback deleted row', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});

			connection.query('BEGIN TRANSACTION');
			connection.query('DELETE FROM '+tableName);
			connection.query('SELECT * FROM '+tableName, false, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 0, 'Looks like some rows are still in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
			});
			connection.query('ROLLBACK TRANSACTION');
			connection.query('SELECT * FROM '+tableName, false, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 1, 'Looks like there is no row in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				assert.strictEqual(result.rows[0].a, 42, 'Looks like some other rows are in the data base');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should commit deletion of a all rows', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});

			connection.query('BEGIN TRANSACTION');
			connection.query('DELETE FROM '+tableName);
			connection.query('COMMIT TRANSACTION');
			connection.query('SELECT * FROM '+tableName, false, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 0, 'Looks like some rows are still in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});
	});
});