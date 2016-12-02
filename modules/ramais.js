
var monitor = require('./monitor.js')
var parser = require('./parser.js')()
var db = require('./db')()

const EventEmitter = require('events')

var Ramais = function () {

  var obj = {};
  obj.monitor = monitor ()
  obj.ramais = {};
  obj.emitter = new EventEmitter;

  obj.getStatus = function () {

    return new Promise(function (resolve, reject) {

      var action = { 
        action:'command', 
        command:'core show hints' 
      };
      
      obj.monitor.ami.action( action, function(err, res) {

        if (err) {
          reject(err)
        }
        else {
          obj.ramais = parser.parseCoreShowHints(res)
          resolve(res)
        }

      })
    })

  }

  obj.atribuirNomes = function ( names ) {
    if (typeof names == "object") {
      for (var n in names) {
        if (typeof obj.ramais[n] != "undefined") {
          for (var prop in names[n]) {
            obj.ramais[n][prop] = names[n][prop];
          }
        }
      }
    }
  }

  obj.createListeners = function () {

    obj.monitor.ami.on('extensionstatus', function (evt) {
      obj.updateStatus(evt.exten, evt.status)
      obj.emitter.emit('ramal', { ramal: evt.exten, status: obj.ramais[evt.exten]['status'] } );
    })

    obj.monitor.ami.on('moduleloadreport', function (evt) {
      console.log(evt)
    })
    obj.monitor.ami.on('newpeeraccount', function (evt) {
      console.log(evt)
    })

  }

  obj.removeListeners = function () {

    obj.monitor.ami.removeAllListeners('extensionstatus');

  }

  obj.updateStatus = function ( exten, status ) {

    var statusTranslate = parser.parseExtensionStatus( status )
    if (typeof obj.ramais[exten] != "undefined") {
      obj.ramais[exten]['status'] = statusTranslate;
    }
    else {
      obj.reload();
    }

  }

  obj.getExtensionStatus = function ( exten ) {

    if (typeof obj.ramais[exten] != "undefined") {
      return obj.ramais[exten]['status'];
    }
    else {
      return "Invalid";
    }

  }

  obj.reload = function () {
    obj.ramais = {};
    obj.removeListeners();
    obj.getStatus()
      .then(function () {
        return db.queryRamais()
      })
      .then(function (names) {
        obj.atribuirNomes(names)
        obj.createListeners()
      })
      .catch(function (err) {
        console.log(err)
        obj.createListeners()
      })
  }

  console.log("Criou objeto de ramais")
  obj.reload();

  return obj;

}

module.exports = Ramais