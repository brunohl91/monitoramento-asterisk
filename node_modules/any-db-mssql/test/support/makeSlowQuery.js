var assert = require('assert');

/**
 * makeSlowQuery is just a helper function used for testing asynchronous requests.
 *
 * @param {any-db~Connection} connection
 * @param {number} delaySeconds - minimum number of seconds to delay before finishing query
 * @param {Function} done - call back after finishing or error
 */
module.exports = function makeSlowQuery(connection, delaySeconds, done) {
	connection.once('error', function(err){
		assert.ifError(err);
	});

	// Based on http://stackoverflow.com/a/11277048
	// This may be disallowed by data base, so we have to emulate slow down anyway :(.
	/*var q = [
		'DECLARE @EndTime DATETIME;',
		'SET @EndTime = DATEADD(s, '+delaySeconds+', GETDATE());', // Set your delay here
		'DECLARE @dummy INT;',
		'SET @dummy = 0;',
		'WHILE @EndTime > GETDATE() SET @dummy = @dummy + 1;',
		'SELECT @dummy AS test;' // Add your desired query here
	];*/
	var q = ['SELECT 1 AS test'];

	//var start = Date.now();

	connection.query(q.join(''), false, function(err, result){
		assert.ifError(err);
		assert.strictEqual(result.rows.length, 1, 'rows.length should be 1');

		//var end = Date.now();
		//assert.ok(end - start >= delaySeconds * 1000, 'There should be at least '+delaySeconds+' seconds delay');

		// Emulate slow query by waiting for at least delaySeconds before calling back.
		setTimeout(done, delaySeconds * 1000);
	}).on('error', function(err){
		console.log(err);
	});
};