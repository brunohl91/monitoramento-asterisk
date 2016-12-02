
var monitor = require('./monitor.js'),
    db = require('./db')()

const EventEmitter = require('events')

var SMS = function () {

  var obj = {};
  obj.monitor = monitor ()
  obj.emitter = new EventEmitter;

  obj.send = function ( options ) {

    options = options || {};
    var params = {
      "action": "KSendSMS",
      "device": options.device || "gsms",
      "destination": options.destination || "54984080633",
      "message": options.message || "Aqui e o Convert, para conversar responda 'oi convert'",
      "confirmation": true,
    }

    obj.monitor.ami.action( params, function(err, res) {
      if (err) {
        console.warn (err)
      }
      console.log(res);
    })

  }

  obj.monitor.ami.on('newsmsconfirmation', function (evt) {
    /*
      Reporta que há uma nova mensagem SMS do tipo confirmação no dispositivo; disponível apenas em dispositivos GSM.
      OBS: Este evento só é enviado caso exista um contexto de recebimento de ligações SMS ajustado no dialplan; caso contrário, as mensagem SMS são mantidas no SIM card, evitando assim a perda destas mensagens. 
      {
        "channel": "nome do canal (em formato 'Khomp/BxCy') onde a mensagem foi recebida;",
        "from": "número de telefone de onde a mensagem foi enviada (é fornecido pela operadora, e pode conter informação textual também);",
        "date": "data e hora do envio da mensagem SMS pela origem;",
        "deliverydate": "data e hora que a mensagem foi entregue pela operadora;",
        "status": "estado do recebimento da mensagem.",
        "message reference": "número de referência que identifica qual mensagem enviada está sendo confirmada.",
      }
     */
    console.log('newsmsconfirmation')
    console.log(evt);
  })

  obj.monitor.ami.on('newsms', function (evt) {
    /*
      Reporta que há uma nova mensagem SMS no dispositivo; disponível apenas em dispositivos GSM.
      OBS: Este evento só é enviado caso exista um contexto de recebimento de ligações SMS ajustado no dialplan; caso contrário, as mensagem SMS são mantidas no SIM card, evitando assim a perda destas mensagens. 
      {
        "channel": "nome do canal (em formato 'Khomp/BxCy') onde a mensagem foi recebida;",
        "from": "número de telefone de onde a mensagem foi enviada (é fornecido pela operadora, e pode conter informação textual também);",
        "date": "data e hora do envio da mensagem SMS pela origem;",
        "size": "tamanho da mensagem (em bytes);",
        "mode": "codificação utilizada no envio da mensagem;",
        "message": "corpo da mensagem enviada;",
        "smsalert": "quando setado como TRUE indica que a mensagem recebida é do tipo Alert, também chamada de Flash SMS;",
        
        Adicionais para mensagens longas
        "smsconcat": "setado como TRUE quando a mensagem for maior que 160 caracteres;",
        "smsconcatref": "identifica o número de referência da mensagem (identificador);",
        "smsconcatpartid": "identifica qual parte da mensagem esta mensagem corresponde;",
        "smsconcatparts": "identifica quantas partes no total a mensagem possui.",
      }
    */
    console.log('newsms')
    console.log(evt);
    obj.conversation( evt.message, evt.from );
  })

  obj.monitor.ami.on('newsmsbroadcast', function (evt) {
    /*
      Reporta que há uma nova mensagem SMS do tipo broadcast no dispositivo; disponível apenas em dispositivos GSM.
      {
        channel: "nome do canal (em formato 'Khomp/BxCy') onde a mensagem foi recebida;",
        serial: "número serial da mensagem;",
        id: "identificador da mensagem;",
        page: "número da página;",
        pagecount: "número de páginas;",
        size: "tamanho da mensagem (em bytes);",
        mode: "codificação utilizada no envio da mensagem;",
        message: "corpo da mensagem enviada.",
      }
    */
    console.log('newsmsbroadcast')
    console.log(evt);
  })

  obj.conversation = function ( msg, number ) {
    msg = msg.toLowerCase();
    for (var exp in obj.conversa) {
      if ( msg.indexOf(exp) > -1 ) {
        obj.send( {
          "destination": number.replace("+", ""),
          "message": obj.conversa[exp],
        })
        return true;
      }
    }
    console.log("Não encontrou nada");
  }

  obj.persistSent = function ( params ) {
  }

  obj.persistReceived = function ( params ) {
  }

  obj.updateStatusSent = function ( params ) {
  }

  obj.conversa = {
    "oi convert": "Ola, como voce esta?",
    "e voce?": "Tambem estou bem",
    "aonde voce esta": "Estou na Av. Presidente Vargas 1305, Sala 201, em Passo Fundo, RS",
    "qual seu telefone": "Meu telefone e 54-2103-7000",
  }

  return obj;

}

module.exports = SMS