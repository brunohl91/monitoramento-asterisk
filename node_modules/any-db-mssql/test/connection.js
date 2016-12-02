var assert = require('assert');
var sql = require('tedious');
var EventEmitter = require('events').EventEmitter;

var adapter = require('../index.js');
var config = require('./support/config.js');

describe('Connection', function(){

	'use strict';

	var connection = false;

	var namedTarget = {
		test: 1,
		test1: 1.5,
		test2: 'two',
		test3: true,
		test4: new Date()
	};

	var positionalTarget = [];
	Object.keys(namedTarget).forEach(function(key){
		positionalTarget.push(namedTarget[key]);
	});

	before(function(done){
		connection = adapter.createConnection(config, function(err){
			assert.ifError(err);
			done();
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

	it('should be an instance of EventEmitter', function(){
		assert.ok(connection instanceof EventEmitter);
	});

	it('should provide adapter property pointing to Adapter object', function(){
		assert.ok(connection.adapter);
		assert.strictEqual(connection.adapter, adapter);
	});

	it('should provide query() function', function(){
		assert.ok(connection.query);
		assert.ok(connection.query instanceof Function);
	});

	it('should emit `error` event', function(done){
		var query = connection.query('INVALID SQL STATEMENT');

		query.on('error', function(err){
			assert.ok(err);
			done();
		});

		assert.ok(query);
	});

	it('should call back only once when error happens', function(done){
		var query = connection.query('INVALID SQL STATEMENT', false, function(err){
			assert.ok(err);
			done();
		});

		assert.ok(query);
	});

	it('should emit `error`, `close` and `end` events when there is an error', function(done){
		var emittedError = false;
		var emittedClose = false;
		var emittedEnd = false;

		var query = adapter.createQuery('INVALID SQL STATEMENT', false, function(err, result){
			assert.strictEqual(emittedError, false, 'Callback function should be first listener on `error` event');
			emittedError = true;
		});

		connection.query(query);

		query.on('error', function(){
			assert.strictEqual(emittedError, true, 'Additional `error` even listeners should be called after query callback function');
			emittedError = true;
		});

		query.on('close', function(){
			emittedClose = true;
		});

		query.on('end', function(){
			assert.ok(emittedError, 'Should emit `error` event');
			assert.ok(emittedClose, 'Should emit `close` event');

			done();
		});

		assert.ok(query);
	});

	it('should emit `query`, `fields`, `data`, `close` and `end` events', function(done){
		var emittedQuery = false;
		var emittedFields = false;
		var emittedData = false;
		var emittedClose = false;
		var emittedEnd = false;

		var query = adapter.createQuery('SELECT 1 AS test');

		connection.once('query', function(q){
			assert.strictEqual(q, query);
			emittedQuery = true;
		});

		connection.query(query);

		query.on('fields', function(fields){
			assert.strictEqual(emittedQuery, true, '`fields` event should be emitted AFTER `query` event');
			assert.strictEqual(emittedData, false, '`fields` event should be emitted BEFORE `data` event');
			assert.ok(fields.length, 'fields data should contain test item');
			assert.ok(fields[0].name, 'fields item should contain `name` property');
			assert.strictEqual(fields[0].name, 'test', 'field name is incorrect');
			emittedFields = true;
		});

		query.on('data', function(row){
			assert.strictEqual(emittedFields, true, '`data` event should be emitted AFTER `fields` event');
			assert.ok(row, 'Row is empty');
			assert.ok(row.test, 'test is missing from row');
			assert.strictEqual(row.test, 1);
			emittedData = true;
		});

		query.on('close', function(){
			assert.strictEqual(arguments.length, 0, '`close` event should not pass any arguments to listeners');
			emittedClose = true;
		});

		query.on('end', function(){
			assert.strictEqual(arguments.length, 0, '`end` event should not pass any arguments to listeners');
			assert.ok(emittedQuery, 'Should emit `query` event');
			assert.ok(emittedFields, 'Should emit `fields` event');
			assert.ok(emittedData, 'Should emit `data` event');
			assert.ok(emittedClose, 'Should emit `close` event');

			done();
		});

		assert.ok(query);
	});

	it('should emit `query`, `fields`, `close` and `end` events, but no `data` event when there are no results', function(done){
		var emittedQuery = false;
		var emittedFields = false;
		var emittedData = false;
		var emittedClose = false;
		var emittedEnd = false;

		var query = adapter.createQuery('SELECT 1 AS test WHERE 0 = 1');

		connection.once('query', function(q){
			emittedQuery = true;
		});

		connection.query(query);

		query.on('fields', function(fields){
			emittedFields = true;
		});

		query.on('data', function(row){
			emittedData = true;
		});

		query.on('close', function(){
			emittedClose = true;
		});

		query.on('end', function(){
			assert.ok(emittedQuery, 'Should emit `query` event');
			assert.ok(emittedFields, 'Should emit `fields` event');
			assert.strictEqual(emittedData, false, 'Should NOT emit `data` event');
			assert.ok(emittedClose, 'Should emit `close` event');

			done();
		});

		assert.ok(query);
	});

	it('should return valid value from a simple, pre-created query', function(done){
		var query = adapter.createQuery('SELECT 1 AS test', false, function(err, result){
			assert.ifError(err);
			assert.ok(result, 'There should be a result set passed to callback');
			assert.ok(result.fields, 'Result set should have `fields` property');
			assert.ok(Array.isArray(result.fields), '`fields` property should be an Array');
			assert.ok(result.rowCount, 'Result set should have `rowCount` property');
			assert.strictEqual(result.rowCount, 1, '`rowCount` property value should be equal to 1');
			assert.ok(result.rows, 'Result set should have `rows` property');
			assert.ok(Array.isArray(result.rows), '`rows` property should be an Array');
			assert.strictEqual(result.rows.length, result.rowCount, 'Result set should contain number of rows equat to `rowCount` value');
			assert.strictEqual(result.rows.length, 1, 'Result set should contain one row');
			assert.ok(result.rows[0].test, 'Result row should have test property');
			assert.strictEqual(result.rows[0].test, 1, 'Test property should have value equal to 1');
			done();
		});

		assert.ok(query);
		connection.query(query);
	});

	it('should return valid value from a parametrized (named) query', function(done){
		var sql = [];

		Object.keys(namedTarget).forEach(function(k, index){
			sql.push(adapter.namedParameterPrefix+k+' AS '+k);
		});

		var query = connection.query('SELECT '+sql.join(', '), namedTarget, function(err, result){
			assert.ifError(err);
			assert.ok(result);
			assert.ok(result.rows);
			assert.strictEqual(result.rows.length, 1);

			var r = result.rows[0];
			Object.keys(r).forEach(function(k){
				if (namedTarget[k] instanceof Date && r[k] instanceof Date) {
					assert.strictEqual(""+r[k], ""+namedTarget[k], k+' differs');
				}
				else {
					assert.strictEqual(r[k], namedTarget[k], k+' differs');
				}
			});

			done();
		});

		assert.ok(query);
	});

	it('should return valid value from a parametrized (named), pre-created query', function(done){
		var sql = [];

		Object.keys(namedTarget).forEach(function(k, index){
			sql.push(adapter.namedParameterPrefix+k+' AS '+k);
		});

		var query = adapter.createQuery('SELECT '+sql.join(', '), namedTarget, function(err, result){
			assert.ifError(err);
			assert.ok(result);
			assert.ok(result.rows);
			assert.strictEqual(result.rows.length, 1);

			var r = result.rows[0];
			Object.keys(r).forEach(function(k){
				if (namedTarget[k] instanceof Date && r[k] instanceof Date) {
					assert.strictEqual(""+r[k], ""+namedTarget[k], k+' differs');
				}
				else {
					assert.strictEqual(r[k], namedTarget[k], k+' differs');
				}
			});

			done();
		});

		assert.ok(query);
		connection.query(query);
	});

	it('should return valid value from a parametrized (positional) query', function(done){
		var target = {};
		var sql = [];

		positionalTarget.forEach(function(v, index){
			target['test'+index] = v;
			sql.push(adapter.positionalParameterPrefix+' AS test'+index);
		});

		var query = connection.query('SELECT '+sql.join(', '), positionalTarget, function(err, result){
			assert.ifError(err);
			assert.ok(result);
			assert.ok(result.rows);
			assert.strictEqual(result.rows.length, 1);

			var r = result.rows[0];
			Object.keys(r).forEach(function(k){
				if (target[k] instanceof Date && r[k] instanceof Date) {
					assert.strictEqual(""+r[k], ""+target[k], k+' differs');
				}
				else {
					assert.strictEqual(r[k], target[k], k+' differs');
				}
			});

			done();
		});

		assert.ok(query);
	});

	it('should return valid value from a parametrized (positional), pre-created query', function(done){
		var target = {};
		var sql = [];

		positionalTarget.forEach(function(v, index){
			target['test'+index] = v;
			sql.push(adapter.positionalParameterPrefix+' AS test'+index);
		});

		var query = adapter.createQuery('SELECT '+sql.join(', '), positionalTarget, function(err, result){
			assert.ifError(err);
			assert.ok(result);
			assert.ok(result.rows);
			assert.strictEqual(result.rows.length, 1);

			var r = result.rows[0];
			Object.keys(r).forEach(function(k){
				if (target[k] instanceof Date && r[k] instanceof Date) {
					assert.strictEqual(""+r[k], ""+target[k], k+' differs');
				}
				else {
					assert.strictEqual(r[k], target[k], k+' differs');
				}
			});

			done();
		});

		assert.ok(query);
		connection.query(query);
	});

	it('should return valid value from a parametrized (named) query with sub-query', function(done){
		var sql = [];
		var subSql = [];

		Object.keys(namedTarget).forEach(function(k, index){
			(index ? subSql : sql).push(adapter.namedParameterPrefix+k+' AS '+k);
		});

		var query = connection.query('SELECT '+sql.join(', ')+', * FROM (SELECT '+subSql.join(', ')+') AS t1', namedTarget, function(err, result){
			assert.ifError(err);
			assert.ok(result);
			assert.ok(result.rows);
			assert.strictEqual(result.rows.length, 1);
			assert.ok(result.rows[0]);

			var r = result.rows[0];
			Object.keys(r).forEach(function(k){
				if (namedTarget[k] instanceof Date && r[k] instanceof Date) {
					assert.strictEqual(""+r[k], ""+namedTarget[k], k+' differs');
				}
				else {
					assert.strictEqual(r[k], namedTarget[k], k+' differs');
				}
			});

			done();
		});

		assert.ok(query);
	});
});