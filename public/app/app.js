
angular.module('monitor', [])

.controller('MonitorCtrl', function ($scope) {

  $scope.opcoes = {
    filas: {
      vazias: false,
    },
    ramais: {
      indisponiveis: false,
      filtro: '',
    },
    parking: {
      indisponiveis: false,
    },
  }

  $scope.info = {
    "ramais": {},
    "filas": {},
    "parking": {},
  }

  $scope.socket = io.connect('http://localhost:3050');

  $scope.socket.on('info', function (msg) {
    $scope.atribuirExtensoes( msg.ramais );
    $scope.info.filas = msg.filas;
    $scope.$apply();
  })

  $scope.socket.on('queue', function ( data ) {
    $scope.info.filas[data.q] = data.fila;
    $scope.$apply()
  });

  $scope.socket.on('ramal', function ( data ) {
    if ($scope.info.ramais[data.ramal]) {
      $scope.info.ramais[data.ramal]['status'] = data.status;
    }
    else {
      $scope.info.parking[data.ramal]['status'] = data.status;
    }
    $scope.$apply()
  });

  $scope.socket.on('disconnect', function (err) {
    console.log("ERR", err)
  });
  
  $scope.socket.on('connect_error', function (err) {
    console.log("ERR", err)
  });

  $scope.atribuirExtensoes = function ( exts ) {
    for (var n in exts) {
      $scope.atribuitExtensao( exts[n], n )
    }
  }

  $scope.atribuitExtensao = function ( ext, n ) {
    if (ext['contexto'] == 'blf') {
      $scope.info.ramais[n] = ext;
    }
    else if (ext['contexto'] == 'estacionamentos') {
      $scope.info.parking[n] = ext;
    }
    else {
      console.log("Extensão perdida", ext, n)
    }
  }

})

.filter('agentStatus', function () {
  return function ( nivel, tipo ) {
    var obj = {
      '0': { 
        'icon': 'glyphicon glyphicon-remove',
        'class': 'device_unknown',
        'desc': 'Desconhecido',
      },
      '1': { 
        'icon': 'glyphicon glyphicon-ok-circle',
        'class': 'device_not_inuse',
        'desc': 'Disponível',
      },
      '2': { 
        'icon': 'glyphicon glyphicon-earphone',
        'class': 'device_inuse',
        'desc': 'Em Ligação',
      },
      '3': { 
        'icon': 'glyphicon glyphicon-ban-circle',
        'class': 'device_busy',
        'desc': 'Ocupado',
      },
      '4': { 
        'icon': 'glyphicon glyphicon-remove',
        'class': 'device_invalid',
        'desc': 'Inválido',
      },
      '5': { 
        'icon': 'glyphicon glyphicon-remove',
        'class': 'device_unavailable',
        'desc': 'Indisponível',
      },
      '6': { 
        'icon': 'glyphicon glyphicon-earphone shake',
        'class': 'device_ringing',
        'desc': 'Tocando',
      },
      '7': { 
        'icon': 'glyphicon glyphicon-earphone shake',
        'class': 'device_ringinuse',
        'desc': 'Ocupado e Tocando',
      },
      '8': { 
        'icon': 'glyphicon glyphicon-time',
        'class': 'device_onhold',
        'desc': 'Em Espera',
      },
    }
    return obj[nivel][tipo];
  }
})

.filter('ramalStatus', function () {
  return function ( nivel, tipo ) {
    var obj = {
      'Unavailable': {
        'situacao': "Indisponível",
        'classe': "btn-default disabled",
      },
      'Idle': {
        'situacao': "Livre",
        'classe': "btn-success",
      },
      'Ringing': {
        'situacao': "Tocando",
        'classe': "btn-warning",
      },
      'Hold': {
        'situacao': "Em Espera",
        'classe': "btn-warning",
      },
      'Busy': {
        'situacao': "Facilidade",
        'classe': "btn-facilidade",
      },
      'InUse': {
        'situacao': "Em Uso",
        'classe': "btn-danger",
      },
    }
    return typeof(obj[nivel] != "undefined") ? obj[nivel][tipo] : '';
  }
})

.filter('difFromNow', function () {
  return function ( timestamp ) {
    return new Date().getTime() - timestamp;
  }
})
