var assert = require('assert');
var sql = require('tedious');
var EventEmitter = require('events').EventEmitter;

var adapter = require('../index.js');

describe('Adapter Extended', function(){

	'use strict';

	it('should provide namedParameterPrefix property', function(){
		assert.ok(adapter.namedParameterPrefix, 'Extended adapter should provide namedParameterPrefix');
		assert.strictEqual(adapter.namedParameterPrefix, '@', 'Tedious used @ for named parameters');
		assert.throws(function(){ adapter.namedParameterPrefix = ':'; }, 'namedParameterPrefix should be read only');
	});

	it('should provide positionalParameterPrefix property', function(){
		assert.ok(adapter.positionalParameterPrefix, 'Extended adapter should provide positionalParameterPrefix');
		assert.strictEqual(adapter.positionalParameterPrefix, '?', 'Adapter recognizes only ? for positional parameters');
		assert.throws(function(){ adapter.positionalParameterPrefix = '!'; }, 'positionalParameterPrefix should be read only');
	});

	it('should provide `getTypeByName()` function', function(){
		assert.ok(adapter.getTypeByName);
		assert.strictEqual(adapter.getTypeByName instanceof Function, true);
	});

	['integer','float','boolean','text','string','date','datetime','time','binary'].forEach(function(type){
		it('should recognize generic data type '+type, function(){
			assert.ok(adapter.getTypeByName(type), '`'+type+'` was not recognized');
		});
	});

	it('may provide `detectParameterType()` function', function(){
		if (adapter.hasOwnProperty('detectParameterType')) {
			assert.strictEqual(adapter.detectParameterType instanceof Function, true);
		}
	});

	describe('detectParameterType()', function(){
		if (!adapter.hasOwnProperty('detectParameterType')) {
			return;
		}

		it('should correctly recognize boolean type as a Bit', function(){
			assert.strictEqual(adapter.detectParameterType(true), sql.TYPES.Bit, '`true` should be recognized as a Bit');
			assert.strictEqual(adapter.detectParameterType(false), sql.TYPES.Bit, '`false` should be recognized as a Bit');
			assert.notStrictEqual(adapter.detectParameterType(1), sql.TYPES.Bit, 'Number should NOT be recognized as a Bit');
		});

		it('should correctly recognize Array\'s first item type', function(){
			assert.strictEqual(adapter.detectParameterType([true]), sql.TYPES.Bit, '`true` should be recognized as a Bit');
			assert.strictEqual(adapter.detectParameterType([false]), sql.TYPES.Bit, '`false` should be recognized as a Bit');
			assert.strictEqual(adapter.detectParameterType([]), sql.TYPES.Null, 'Empty Array should be recognized as a Null');
			assert.notStrictEqual(adapter.detectParameterType([1]), sql.TYPES.Bit, 'Number should NOT be recognized as a Bit');
		});

		it('should correctly recognize Date type as a DateTimeOffset', function(){
			assert.strictEqual(adapter.detectParameterType(new Date()), sql.TYPES.DateTimeOffset, 'Date should be recognized as a DateTimeOffset');
		});

		it('should correctly recognize integer number as an Int', function(){
			assert.strictEqual(adapter.detectParameterType(1), sql.TYPES.Int, '1 should be recognized as an Int');
			assert.strictEqual(adapter.detectParameterType(-1), sql.TYPES.Int, '-1 should be recognized as an Int');
			assert.notStrictEqual(adapter.detectParameterType(1.1), sql.TYPES.Int, '1.1 should NOT be recognized as an Int');
			assert.notStrictEqual(adapter.detectParameterType(-1.1), sql.TYPES.Int, '-1.1 should NOT be recognized as an Int');
		});

		it('should correctly recognize floating point number as a Real', function(){
			assert.strictEqual(adapter.detectParameterType(1.1), sql.TYPES.Real, '1.1 should be recognized as an Int');
			assert.strictEqual(adapter.detectParameterType(-1.1), sql.TYPES.Real, '-1.1 should be recognized as an Int');
			assert.notStrictEqual(adapter.detectParameterType(1), sql.TYPES.Real, '1 should NOT be recognized as an Int');
			assert.notStrictEqual(adapter.detectParameterType(-1), sql.TYPES.Real, '-1 should NOT be recognized as an Int');
		});

		it('should correctly recognize YYYY-MM-DD string as a Date', function(){
			assert.strictEqual(adapter.detectParameterType('2014-09-01'), sql.TYPES.Date, '2014-09-01 should be recognized as a Date');
			assert.notStrictEqual(adapter.detectParameterType('20-11-2144'), sql.TYPES.Date, '20-11-2144 should NOT be recognized as a Date');
		});

		it('should correctly recognize HH:MM string as a Time', function(){
			assert.strictEqual(adapter.detectParameterType('12:34'), sql.TYPES.Time, '12:34 should be recognized as a Time');
			assert.notStrictEqual(adapter.detectParameterType('123:45'), sql.TYPES.Time, '123:45 should NOT be recognized as a Time');
		});

		it('should correctly recognize HH:MM::SS string as a Time', function(){
			assert.strictEqual(adapter.detectParameterType('12:34:56'), sql.TYPES.Time, '12:34:56 should be recognized as a Time');
			assert.notStrictEqual(adapter.detectParameterType('12:34:5'), sql.TYPES.Time, '12:34:5 should NOT be recognized as a Time');
		});

		it('should correctly recognize YYYY-MM-DD HH:MM::SS.ss string as DateTime2', function(){
			var dates = [
				// MSSQL does not implement full ISO 8601 standard:
				// when string contains letter "T", MSSQL rejects time value without seconds specified,
				// it also rejects any time value that contains only hour value (omitting minutes and seconds),
				// it also rejects formats without colons.
				//'2014-09-01T12:34',
				'2014-09-01 12:34',
				'2014-09-01T12:34:56',
				'2014-09-01 12:34:56',
				'2014-09-01T12:34:56.789',
				'2014-09-01 12:34:56.789'
			];

			dates.forEach(function(date){
				assert.strictEqual(adapter.detectParameterType(date), sql.TYPES.DateTime2, date+' should be recognized as a DateTimeOffset');
			});
		});

		it('should correctly recognize YYYY-MM-DDTHH:MM::SS+TZD time as a DateTimeOffset', function(){
			var dates = [
				// MSSQL does not implement full ISO 8601 standard:
				// when string contains letter "T", MSSQL rejects time value without seconds specified,
				// it also rejects any time value that contains only hour value (omitting minutes and seconds),
				// it also rejects formats without colons.
				//'2014-09-01T12:34Z',
				//'2014-09-01 12:34Z',
				//'2014-09-01T12:34+1000',
				//'2014-09-01 12:34+1000',
				//'2014-09-01T12:34+10:00',
				//'2014-09-01 12:34+10:00',
				//'2014-09-01T12:34-1000',
				//'2014-09-01 12:34-1000',
				//'2014-09-01T12:34-10:00',
				//'2014-09-01 12:34-10:00',
				//'2014-09-01T12:34:56+1000',
				//'2014-09-01 12:34:56+1000',
				'2014-09-01T12:34:56+10:00',
				'2014-09-01 12:34:56+10:00',
				//'2014-09-01T12:34:56-1000',
				//'2014-09-01 12:34:56-1000',
				'2014-09-01T12:34:56-10:00',
				'2014-09-01 12:34:56-10:00',
				//'2014-09-01T12:34:56.789+1000',
				//'2014-09-01 12:34:56.789+1000',
				'2014-09-01T12:34:56.789+10:00',
				'2014-09-01 12:34:56.789+10:00',
				//'2014-09-01T12:34:56.789-1000',
				//'2014-09-01 12:34:56.789-1000',
				'2014-09-01T12:34:56.789-10:00',
				'2014-09-01 12:34:56.789-10:00',
			];

			dates.forEach(function(date){
				assert.strictEqual(adapter.detectParameterType(date), sql.TYPES.DateTimeOffset, date+' should be recognized as a DateTimeOffset');
			});
		});
	});
});