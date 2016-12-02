
var monitor = require('./monitor.js')
var parser = require('./parser.js')()
var db = require('./db')()

const EventEmitter = require('events')

var Filas = function () {

  var obj = {};
  obj.monitor = monitor ()
  obj.filas = {};
  obj.emitter = new EventEmitter;

  obj.getStatus = function () {

    return new Promise(function (resolve, reject) {

      var action = { 
        action:'queuestatus', 
      };

      obj.monitor.ami.action( action, function(err, res) {

        if (err) {
          reject(err)
        }
        else {
          obj.dealWithQueueStatusResponse(res)
          if (res.event == "QueueStatusComplete") {
            resolve(res)
          }
        }

      })
    })

  }

  obj.atribuirInfo = function ( info ) {
    if (typeof info == "object") {
      for (var n in info) {
        if (typeof obj.filas[n] != "undefined") {
          for (var prop in info[n]) {
            obj.filas[n][prop] = info[n][prop];
          }
        }
      }
    }
  }

  obj.createListeners = function () {

    obj.monitor.ami.on('join', function (evt) {
      // console.log('join', evt)
      obj.dealWithJoinAndLeave(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    obj.monitor.ami.on('leave', function (evt) {
      // console.log('leave', evt)
      obj.dealWithJoinAndLeave(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    obj.monitor.ami.on('queuememberadded', function (evt) {
      obj.dealWithMemberAddAndRemove(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    obj.monitor.ami.on('queuememberpaused', function (evt) {
      obj.dealWithMemberPause(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    obj.monitor.ami.on('queuememberremoved', function (evt) {
      obj.dealWithMemberAddAndRemove(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    obj.monitor.ami.on('queuememberstatus', function (evt) {
      obj.dealWithMemberStatus(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    obj.monitor.ami.on('agentconnect', function (evt) {
      console.log('agentconnect')
      obj.dealWithAgentConnect(evt)
        .then(function () {
          obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
        })
        .catch(function (err) {
          console.log(err)
        })
    })

    obj.monitor.ami.on('agentcomplete', function (evt) {
      obj.dealWithAgentComplete(evt);
      obj.emitter.emit('queue', { fila: obj.filas[evt.queue], q: evt.queue } );
    })

    // deal with queuecallerabandon => leave?
    // deal with queuememberpenalty => precisa?
    // deal with queuememberringinuse => precisa?
    // deal with AgentCalled => interessante para o futuro
    // deal with AgentDump => interessante para o futuro
    // deal with Agentlogin => interessante para o futuro
    // deal with Agentlogoff => interessante para o futuro
    // deal with AgentRingNoAnswer => interessante para o futuro

  }

  obj.removeListeners = function () {

    obj.monitor.ami.removeAllListeners('join');
    obj.monitor.ami.removeAllListeners('leave');
    obj.monitor.ami.removeAllListeners('queuememberadded');
    obj.monitor.ami.removeAllListeners('queuememberpaused');
    obj.monitor.ami.removeAllListeners('queuememberremoved');
    obj.monitor.ami.removeAllListeners('queuememberstatus');
    obj.monitor.ami.removeAllListeners('agentconnect');
    obj.monitor.ami.removeAllListeners('agentcomplete');

  }

  obj.dealWithQueueStatusResponse = function ( evt ) {
    
    var q = evt.queue;

    if (typeof obj["filas"][q] == "undefined" && evt.event != "QueueStatusComplete") {
      obj["filas"][q] = {
        members: [],
        callers: [],
      };
    }

    switch (evt.event) {
      case 'QueueParams':
        obj["filas"][q]["max"] = evt.max
        obj["filas"][q]["strategy"] = evt.strategy
        obj["filas"][q]["calls"] = evt.calls
        obj["filas"][q]["holdtime"] = evt.holdtime
        obj["filas"][q]["talktime"] = evt.talktime
        obj["filas"][q]["completed"] = evt.completed
        obj["filas"][q]["abandoned"] = evt.abandoned
        obj["filas"][q]["servicelevel"] = evt.servicelevel
        obj["filas"][q]["servicelevelperf"] = evt.servicelevelperf
        obj["filas"][q]["weight"] = evt.weight
      break;
      case 'QueueMember':
        obj["filas"][q]['members'].push({
          "event": evt.event,
          "name": evt.name,
          "location": evt.location,
          "membership": evt.membership,
          "penalty": evt.penalty,
          "callstaken": evt.callstaken,
          "lastcall": evt.lastcall,
          "status": evt.status,
          "paused": evt.paused,
          "timestamp": new Date().getTime(),
        })
      break;
      case 'QueueEntry':
        obj["filas"][q]['callers'].push({
          "channel": evt.channel,
          "numero": evt.calleridnum,
          "nome": evt.calleridname,
          "uniqueid": evt.uniqueid,
          "timestamp": new Date().getTime(),
        })
      break;
      case 'QueueStatusComplete':
        return obj["filas"];
      break;
    }
    
  }

  obj.dealWithJoinAndLeave = function ( evt ) {

    var q = evt.queue;
    if (typeof obj.filas[q] != 'undefined') {

      if (evt.event == 'Join') {
        obj.filas[q]['callers'].push({
          "channel": evt.channel,
          "numero": evt.calleridnum,
          "nome": evt.calleridname,
          "uniqueid": evt.uniqueid,
          "timestamp": new Date().getTime(),
        })
      }
      else {
        var callers = obj.filas[q]['callers']
        for (var p = 0; p < callers.length; p++) {
          if (evt.uniqueid == callers[p]['uniqueid']) {
            obj.filas[q]['callers'].splice(p, 1);
          }
        }
      }
      return obj.filas[q]['callers'];

    }
    else {
  
      obj.reload();
    }

  }

  obj.dealWithMemberAddAndRemove = function ( evt ) {
    
    // *31 e *32
    var q = evt.queue;
    if (typeof obj.filas[q] != 'undefined') {

      if (evt.event == 'QueueMemberAdded') {
        obj.filas[q]['members'].push({
          "event": evt.event,
          "name": evt.membername,
          "location": evt.location,
          "membership": evt.membership,
          "penalty": evt.penalty,
          "callstaken": evt.callstaken,
          "lastcall": evt.lastcall,
          "status": evt.status,
          "paused": evt.paused,
          "timestamp": new Date().getTime(),
        })
      }
      else { // QueueMemberRemoved
        var members = obj.filas[q]['members']
        for (var p = 0; p < members.length; p++) {
          if (evt.membername == members[p]['name']) {
            obj.filas[q]['members'].splice(p, 1);
          }
        }
      }

    }
    else {
  
      obj.reload();
    }

  }
  
  obj.dealWithMemberPause = function ( evt ) {

    // *33 (Pause) e *34 (UnPause)
    var q = evt.queue;
    if (typeof obj.filas[q] != 'undefined') {

      var members = obj.filas[q]['members'];
      for (var p = 0; p < members.length; p++) {
        if (evt.membername == members[p]['name']) {
          obj.filas[q]['members'][p]['paused'] = evt.paused;
        }
      }

    }
    else {
  
      obj.reload();
    }

  }

  obj.dealWithMemberStatus = function (evt) {

    // Não esquecer de configurações da fila eventwhencalled = 1 e eventmemberstatus = 1
    var q = evt.queue;
    if (typeof obj.filas[q] != 'undefined') {

      var members = obj.filas[q]['members'];
      for (var p = 0; p < members.length; p++) {
        if (evt.membername == members[p]['name']) {
          obj.filas[q]['members'][p]['status'] = evt.status;
        }
      }

    }
    else {
  
      obj.reload();
    }

  }

  obj.dealWithAgentConnect = function (evt) {

    return new Promise (function (resolve, reject) {

      var action = { 
        action:'status',
        channel: evt.bridgedchannel, 
      };

      obj.monitor.ami.action( action, function(err, res) {

        if (err) {
          reject(err);
        }

        if (res.evt == 'StatusComplete') {
          resolve();
        }

        var q = evt.queue;
        if (typeof obj.filas[q] != 'undefined') {
          var members = obj.filas[q]['members'];
          for (var p = 0; p < members.length; p++) {
            if (evt.membername == members[p]['name']) {
              obj.filas[q]['members'][p]['bridged'] = {
                "channel": evt.channel,
                "bridgedchannel": evt.bridgedchannel,
                "uniqueid": evt.uniqueid,
                "holdtime": evt.holdtime,
                "numero": res.calleridnum,
                "nome": res.calleridname,
              };
            }
          }

        }
        else {
      
          obj.reload();
        }

      })

    })

  }

  obj.dealWithAgentComplete = function (evt) {

    // Não esquecer de configurações da fila eventwhencalled = 1 e eventmemberstatus = 1
    var q = evt.queue;
    if (typeof obj.filas[q] != 'undefined') {

      var members = obj.filas[q]['members'];
      for (var p = 0; p < members.length; p++) {
        if (evt.membername == members[p]['name']) {
          //   talktime: '6', reason: 'agent' }
          obj.filas[q]['members'][p]['bridged'] = null;
        }
      }

    }
    else {
  
      obj.reload();
    }

  }

  obj.getQueueInformation = function ( queue ) {

    if (typeof obj.filas[queue] != "undefined") {
      return obj.filas[queue];
    }
    else {
      var ret = { 
        "status": 400, 
        "information": "Invalid", 
        "queuesAvailable": []
      }

      for (var q in obj.filas) {
        if (q != "undefined") {
          ret['queuesAvailable'].push(q)
        }
      }

      return ret;

    }

  }

  obj.reload = function () {
    obj.filas = {};
    obj.removeListeners();
    obj.getStatus()
      .then(function () {
        return db.queryFilas()
      })
      .then(function (info) {
        obj.atribuirInfo(info)
        obj.createListeners()
      })
      .catch(function (err) {
        console.log(err);
        obj.createListeners()
      })
  }

  console.log("Criou objeto de filas")
  obj.reload();

  return obj;

}

module.exports = Filas