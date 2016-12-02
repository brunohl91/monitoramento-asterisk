
var amiConf = require('../config/ami'),
    libAmi = require('asterisk-manager')

var Monitor = function () {

  var obj = {};

  obj.config = amiConf.ami;

  obj.ami = libAmi( 
    obj.config.port, 
    obj.config.addr, 
    obj.config.user, 
    obj.config.secret, 
    true
  );

  obj.ami.keepConnected();

  return obj;

}

module.exports = Monitor