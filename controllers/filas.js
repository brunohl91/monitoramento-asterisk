
var express = require('express')
  , router = express.Router()

router.get('/', function (req, res) {
  
  res.send(global.filas.filas)

})

router.get('/all', function (req, res) {
  var arr = [];
  for (var f in global.filas.filas) {
    if (f != "undefined") {
      arr.push(f)
    }
  }
  res.send(arr)
})

router.get('/reload', function (req, res) {
  global.filas.reload();
  res.send({ "status": 200, "msg": "Módulo de filas recarregado." });
})

router.get('/status/:fila', function (req, res) {
  var q = global.filas.getQueueInformation( req.params.fila )
  res.send( q )
})

module.exports = router