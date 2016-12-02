
/**
 * TODO:
 * - Backend
 *   - Serviço para instalação? Forever?
 *
 * FUTURO:
 * - Associar com DB (odbc, sqlite ou mongo) para gravar status?
 * - Redial
 *     Utilizar o que já tenho implementado, mas melhorar um pouco
 *  - Tratar quando a ligação se conecta a Fila AgentConnect - AgentComplete
 */

// Variáveis e Objetos
/*
var express = require('express')
  , app = express()
  // , server = require('http').createServer(app)
  , server = require('http').Server(app)
  , io = require('socket.io').listen(server)
*/
var app = require('express')()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)

global.ramais = require('./modules/ramais')()
global.filas = require('./modules/filas')()
global.sms = require('./modules/sms')()

// Utilizar controllers
app.use(require('./controllers'));

// Iniciar aplicação
server.listen(3050, function () {

  console.log("Escutando na porta 3050");
  // global.sms.send();

})

// Quando há eventos, o socket deve enviá-los a todos
global.filas.emitter.on('queue', function ( data ) {
  io.emit('queue', data);
})
global.ramais.emitter.on('ramal', function ( data ) {
  io.emit('ramal', data);
})

// Websocket
io.on('connection', function(socket){
  
  console.log('Houve um conexão');
  // io.emit('broadcast', { "broadcast": "msg" })
  // socket.emit('single', { "broadcast": "msg" })

  socket.on('enviarSms', function (data) {
    global.sms.send({
      "destination": data.numero,
      "message": data.mensagem,
    });
  });

  socket.emit('info', {
    "ramais": global.ramais.ramais,
    "filas": global.filas.filas,
  });
  
});
