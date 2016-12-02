
var express = require('express')
  , router = express.Router()

router.get('/', function (req, res) {
  res.send( global.ramais.ramais )
})

router.get('/reload', function (req, res) {
  global.ramais.reload();
  res.send({ "status": 200, "msg": "Módulo de ramais recarregado." });
})

router.get('/status/:ramal', function (req, res) {
  var status = global.ramais.getExtensionStatus( req.params.ramal )
  res.send( status )
})

router.get('/redial/:origem/:destino', function (req, res) {
  // verifica se o ramal é válido
  // verifica se o destino é válido
  // adiciona ao listener
})

module.exports = router