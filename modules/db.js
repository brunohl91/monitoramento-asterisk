
var dbConf = require('../config/db')
  , db = require('any-db')

var DB = function () {

  var obj = {}
  obj.ramais = { "conf": dbConf.ramais, "db": null };
  obj.filas = { "conf": dbConf.filas, "db": null };
  obj.sms = { "conf": dbConf.sms, "db": null };

  obj.connect = function ( dbToConnect ) {
    return new Promise(function(resolve, reject) {
      try {
        dbToConnect.db = db.createConnection( dbToConnect.conf, function (err) {
          reject(err)
        })
        resolve()
      } catch (e) {
        reject (e)
      }
    });
  }

  obj.queryRamais = function () {
    var res = {};
    return new Promise(function(resolve, reject) {
      obj.connect( obj.ramais )
        .then(function () {
          var sql = 'SELECT ' + obj.ramais.conf.columns + ' FROM ' + obj.ramais.conf.table;
          obj.ramais.db.query(sql, function (error, result) {
            if (error) {
              reject (error)
            }
            if (typeof result != "undefined") {
              result.rows.find(function (elem) {
                res[elem.id] = elem;
              })
              resolve (res);
            }
            reject ({ "error": "Problema ao consultar" })
          })
        })
        .catch(function (err) {
          reject(err)
        })
    })
  }

  obj.queryFilas = function () {
    var res = {};
    return new Promise(function(resolve, reject) {
      obj.connect( obj.filas )
        .then(function () {
          var sql = 'SELECT ' + obj.filas.conf.columns + ' FROM ' + obj.filas.conf.table;
          obj.filas.db.query(sql, function (error, result) {
            if (error) {
              reject (error)
            }
            if (typeof result != "undefined") {
              result.rows.find(function (elem) {
                res[elem.id] = elem;
              })
              resolve (res);
            }
            reject ({ "error": "Problema ao consultar" })
          })
        })
        .catch(function (err) {
          reject(err)
        })
    })
  }

  return obj

}

module.exports = DB