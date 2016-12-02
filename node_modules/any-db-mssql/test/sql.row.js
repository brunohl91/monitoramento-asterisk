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

	describe('ROW', function(){
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

		it('should be possible to insert', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('INSERT INTO '+tableName+' VALUES (@value)', {value: 42}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rowCount, 1, 'rowCount should be 1');
				assert.strictEqual(result.rows.length, 0, 'rows.length should be 0');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should be possible to insert and get inserted data', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('INSERT INTO '+tableName+' OUTPUT INSERTED.a VALUES (@value)', {value: 23}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rowCount, 1, 'rowCount should be 1');
				assert.strictEqual(result.rows.length, result.rowCount, 'rowCount and rows.length mismatch');
				assert.strictEqual(result.rows[0].a, 23, 'Value from data base differs');
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
			connection.query('SELECT * FROM '+tableName+' WHERE a = @value', {value: 42}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 1, 'Looks like there is no row with value equal to 42 in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				assert.strictEqual(result.rows[0].a, 42, 'Value from data base differs');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should be possible to update', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('UPDATE '+tableName+' SET a = @newValue WHERE a = @oldValue', {oldValue: 23, newValue: 1234}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rowCount, 1, 'rowCount should be 1');
				connection.query('SELECT * FROM '+tableName+' WHERE a IN (@value)', {value: [23, 1234]}, function(err, result){
					assert.ifError(err);
					assert.strictEqual(result.rows.length, 1, 'Incorrect number of rows returned - there can be only one!');
					assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
					assert.strictEqual(result.rows[0].a, 1234, 'Value from data base should be new (1234) not old (23)');
					done();
				}).on('error', function(err){
					console.log(err);
					done();
				});
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should be possible to delete', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('DELETE FROM '+tableName+' WHERE a = @value', {value: 42}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rowCount, 1, 'rowCount should be 1');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});

		it('should not exist after deletion', function(done){
			connection.once('error', function(err){
				assert.ifError(err);
			});
			connection.query('SELECT * FROM '+tableName+' WHERE a = @value', {value: 42}, function(err, result){
				assert.ifError(err);
				assert.strictEqual(result.rows.length, 0, 'Looks like there are still some rows in the data base');
				assert.strictEqual(result.rowCount, result.rows.length, 'rowCount and rows.length mismatch');
				done();
			}).on('error', function(err){
				console.log(err);
				done();
			});
		});
	});
});