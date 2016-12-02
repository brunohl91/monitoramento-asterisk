
var Parser = function () {

  var obj = {}

  obj.statusRamais = {
    "-1": "NotFound",
    "0": "Idle",
    "1": "InUse",
    "2": "Busy",
    "4": "Unavailable",
    "8": "Ringing",
    "16": "OnHold",
  }

  obj.statusAgentes = {
    "0": "Unknown",
    "1": "Idle",
    "2": "InUse",
    "3": "Busy",
    "4": "Invalid",
    "5": "Unavailable",
    "6": "Ringing",
    "7": "Ringinuse",
    "8": "OnHold",
  }

  obj.parseCoreShowHints = function ( hints ) {

    var ramais = {};
    var parking = {};

    var objHints = hints.content.split('\n')
    for (var i = 0; i < objHints.length; i++) {
      var linha = objHints[i].replace(/\s|Wa.*/g, '').replace(/\:.*\:/g, '@').split('@')
      if (linha.length == 3) {
        ramais[linha[0]] = {
          'contexto': linha[1],
          'status': linha[2],
        }
      }
    }

    return ramais;

  }

  obj.parseExtensionStatus = function ( statusCode ) {
    return obj.statusRamais[statusCode]
  }

  return obj;

}

module.exports = Parser