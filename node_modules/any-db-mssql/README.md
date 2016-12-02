# any-db-mssql

This is the MSSQL adapter for [Any-DB][1]. It relies on the [Tedious][2]
database driver to create connection and query objects that conform to the
[Any-DB API][3].

This adapter is not yet fully compatible with Any-DB, because Query objects
are not instances of [`stream.Readable`][4], they are just event emitters.
It means that they do not provide `pause` and `resume` methods yet.

## API extensions

The connections this module creates inherit from the constructor
functions in `require('tedious')`, so any methods that `tedious` supports
beyond those specified by Any-DB [Connection][5] are also available to you.

Keep in mind that these methods will *not* necessarily work with
other backends.

Module extends Any-DB API by providing support for both positional and
named parameters. Positional parameters are actually emulated (they're
converted to named parameters) because Tedious does not support them.

Module provides additional read-only variables:

- `namedParameterPrefix`, defaults to '@'
- `positionalParameterPrefix`, defaults to '?'

which can be used when building SQL queries. In most other data bases,
named parameters are marked with colon prefix, but MSSQL uses at character.

Additionally parameter values can be objects, each with two properties:

- `type`
- `value`

Where type is a Tedious type object, which can be obtained through a call to
`getTypeByName('typeName')` function, also provided by this module.
Aside from "native" types used by Tedious and MSSQL, following "generic"
types are recognized (following example set by [Sails][6]):

- `integer`
- `float`
- `real`
- `boolean`
- `text`
- `string`
- `date`
- `time`
- `datetime`
- `binary`

Unrecognized types will be handled as binary type.

Tedious type can be obtained through a call to `detectParameterType(value)`
function too. Difference is that `getTypeByName` "translates" type name to
Tedious type, while `detectParameterType` returns Tedious type based on the
JavaScript type of value passed to it.


## Install

    npm install any-db-mssql


## Running tests

Before running tests, set some environment variables to configure access
to the data base (in Windows shell, replace `export` with `set`):

    export DB_NAME=test
    export DB_USER=sa
    export DB_PASS=test123
    export DB_INST=SQLEXPRESS
    export DB_HOST=localhost

Each of the environment variables mentioned above is optional,
test will use defaults if value will not be provided.

Install all dependencies needed for testing:

    npm install

Run tests the node way:

    npm test

See test configuration file ([test/support/config.js][7]) for more information.

To test against any-db-adapter-spec, call its test from any-db-mssql
adapter's directory set as current directory, i.e., it can be called
right after `npm test` mentioned above:

    node ../node-any-db-adapter-spec/bin/test-any-db-adapter --url 'mssql://'$DB_USER':'$DB_PASS'@'$DB_HOST'/'$DB_NAME'?instanceName='$DB_INST

In Windows shell, use following command line:

	node ..\node-any-db-adapter-spec\bin\test-any-db-adapter --url "mssql://%DB_USER%:%DB_PASS%@%DB_HOST%/%DB_NAME%?instanceName=%DB_INST%"

`node-any-db-adapter-spec` files should exist before running command
mentioned above.


## Documentation

Generate documentation using [JSDoc][8]:

    jsdoc -c jsdoc.json -d documentation index.js


## License

3-clause BSD

[1]: https://github.com/grncdr/node-any-db
[2]: http://pekim.github.io/tedious/
[3]: https://github.com/grncdr/node-any-db-adapter-spec
[4]: http://nodejs.org/api/stream.html#stream_class_stream_readable
[5]: https://github.com/grncdr/node-any-db-adapter-spec#connection
[6]: http://sailsjs.org/#/documentation/concepts/ORM/Attributes.html?q=attribute-options
[7]: test/support/config.js
[8]: http://usejsdoc.org/
