var assert = require('assert');
var sql = require('tedious');
var EventEmitter = require('events').EventEmitter;

var adapter = require('../index.js');
var config = require('./support/config.js');

describe('Adapter', function(){

	'use strict';

	it('should provide createQuery() function', function(){
		assert.ok(adapter.createQuery);
		assert.ok(adapter.createQuery instanceof Function);
	});

	it('should return Query object', function(){
		var query = adapter.createQuery('SELECT 1 AS test');

		assert.ok(query);
	});

	describe('Query', function(){
		var query = false;
		var callback = function(){};

		before(function(){
			query = adapter.createQuery('SELECT @test AS test', [1], callback);
		});

		after(function(){
			query = false;
		});

		it('should have `text` property', function(){
			assert.strictEqual(query.text, 'SELECT @test AS test');
		});

		it('should have `values` property', function(){
			assert.ok(query.values instanceof Array);
			assert.strictEqual(query.values[0], 1);
		});

		it('should have `callback` property', function(){
			assert.ok(query.callback instanceof Function);
		});

		it('should have `callback` property pointing to the callback function passed when creating Query', function(){
			assert.strictEqual(query.callback, callback);
		});

		it('should be an instance of EventEmitter', function(){
			assert.ok(query instanceof EventEmitter);
		});
	});
});