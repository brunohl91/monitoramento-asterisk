/**
 * This is a helper for running tests. It will use configuration values passed
 * through environment variables.
 *
 * If `DB_INST` is provided, `DB_PORT` will be ignored.
 * Tedious will use defaults for some of those, if they're not provided.
 *
 * It uses configuration format specifed by Any-DB API, to keep it compatible,
 * but node-any-db-mssql supports both Any-DB and Tedious formats.
 *
 * For more information about configuration variables, check
 * {@link http://pekim.github.io/tedious/api-connection.html#function_newConnection}
 */
module.exports = {
	user: process.env.DB_USER || false,
	password: process.env.DB_PASS || false,
	host: process.env.DB_HOST || false,
	port: process.env.DB_PORT || false,
	database: process.env.DB_NAME || false,
	options: {
		instanceName: process.env.DB_INST || false
	}
};