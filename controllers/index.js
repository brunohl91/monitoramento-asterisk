
// Variáveis e Objetos
var express = require('express')
  , router = express.Router()
  , bodyParser = require('body-parser')
  , app = express()
  , path = require('path')

// Escutar bodies JSON e URLENCODED
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

// Aceitar conteúdo de outras fontes
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.use('/ramais', require('./ramais'))
router.use('/filas', require('./filas'))

// Raiz roda o programa normalmente
router.get('/', function(req, res) {
  res.send({
    "msg": "Olá, bem vindo ao sistema!",
    "opcoes": {
      "/ramais": "Lista todos os ramais",
      "/ramais/reload": "Recarrega o módulo de ramais",
      "/ramais/status/(ramal)": "Busca estado de ramal",
      "/filas": "Lista todas as filas",
      "/filas/reload": "Recarrega o módulo de filas",
      "/filas/status/(fila)": "Busca estado de fila",
    }
  });
})

router.get('/teste', function (req, res) {
  var caminho = path.join(__dirname, '../teste/socket/index.html');
  res.sendFile(caminho)
})

module.exports = router