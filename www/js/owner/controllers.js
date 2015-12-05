angular.module('owner.controllers', ['ng-token-auth', 'ionic-timepicker', 'ui.calendar'])

.config(function($authProvider, $authConfigProvider) {
  var config = $authConfigProvider.$get()('/owner');
  $authProvider.configure(config);
})

.controller('LoginCtrl', function($scope, $auth, $state, $config) {
  $scope.login = function(provider) {
    $auth.authenticate(provider).then(function(owner) {
      if(owner.profile_id === null) {
        $state.go('owner.profile');
      } else {
        $state.go('owner.calendar');
      }
    });
  };
})

.controller('ProfileCtrl', function($scope, $auth, $state, $toast, 
  Cep, Profile) {
  function createDateObj(hour) {
    var obj = {
      inputEpochTime: parseDate(hour),
      step: 5,
      format: 24,
      setLabel: 'Selecionar',
      closeLabel: 'Fechar',
      callback: function(val) {
        if(val !== undefined) {
          obj.inputEpochTime = val;
        }
      }
    };
    return obj;
  };

  function parseDate(date) {
    return moment(new Date(date)).utc().year(1970).month(0).date(1).time() / 1000;
  }
  
  function formatDate(date) {
    return moment(new Date(date * 1000)).utc().year(2000).month(0).date(1).toISOString();
  }

  $scope.owner = $auth.user;

  $scope.profile = new Profile();
  $scope.profile.name = $scope.owner.name;
  if($scope.owner.profile_id !== null) {
    $scope.profile.$get({id: $auth.user.profile_id}).then(function(profile) {
      $scope.timeStart.inputEpochTime = parseDate(profile.owner.start);
      $scope.timeEnd.inputEpochTime = parseDate(profile.owner.end);
      $scope.timeClient.inputEpochTime = parseDate(profile.owner.time_per_client);
    });
  }

  $scope.cep = {value: ''};

  $scope.timeStart = createDateObj('2010-01-01T09:00:00Z');
  $scope.timeEnd = createDateObj('2010-01-01T20:00:00Z');
  $scope.timeClient = createDateObj('2010-01-01T00:20:00Z');
  
  $scope.$watch('profile.zipcode', function(zipcode) {
    if(zipcode !== undefined && zipcode.length === 8) {
      Cep.get({cep: $scope.profile.zipcode}).then(function(address) {
        if(!address.erro) {
          $scope.profile.address = (address.logradouro + ' ' + address.complemento).trim();
          $scope.profile.number = address.number;
          $scope.profile.neighborhood = address.bairro;
          $scope.profile.city = address.localidade;
          $scope.profile.state = address.uf;
          $scope.profile.zipcode = address.cep;
        }
      });
    }
  });

  $scope.registry = function() {
    $scope.owner.start = formatDate($scope.timeStart.inputEpochTime);
    $scope.owner.end = formatDate($scope.timeEnd.inputEpochTime);
    $scope.owner.time_per_client = formatDate($scope.timeClient.inputEpochTime);

    $scope.profile.owner = $scope.owner;
    var method = !$scope.profile.id ? '$save' : '$update';
    $scope.profile[method]().then(function(profile) {
      $toast.show('Salvo com sucesso');
      $scope.profile = new Profile();
    });
  };
})

.controller('CalendarCtrl', function($scope, $state, $auth, $ionicModal, $calendar, $toast, Event, uiCalendarConfig) {
  $scope.uiConfig = $calendar();
  $ionicModal.fromTemplateUrl('templates/owner/modal.html', {scope: $scope})
    .then(function(modal) {
    $scope.uiConfig.modal = modal;
  });

  $scope.uiConfig.config($auth.owner);
})

.controller('ModalCtrl', function($scope, $toast, Event, Profile) {
  $scope.isEmail = true;
  $scope.isTel = true;
  $scope.type = 'text';

  $scope.event = new Event();
  $scope.service = Profile;

  $scope.$watch('event.name', function(value) {
    if(value === undefined || value.length === 0) {
      $scope.isTel = true;
      $scope.isEmail = true;
      $scope.type = 'text';
    } else if(value.match(/^\d/)) {
      $scope.isTel = true;
      $scope.isEmail = false;
      $scope.type = 'tel';
    } else {
      $scope.isTel = false;
      $scope.isEmail = true;
      $scope.type = 'email';
    }
  });

  $scope.type = function() {
    return $scope.isEmail ? 'email' : 'tel';
  };

  $scope.selectClient = function(item) {
    $scope.event.client_id = item.client.id;
    $scope.event.name = item.name;
    $scope.event.client = item.mobile;
  };

  $scope.render = function(item) {
    return '<img src="'+ item.client.image +'"/><h3>'+  item.name +'</h3><p>'+ item.neighborhood +'</p>';
  };

  $scope.close = function() {
    $scope.uiConfig.modal.hide();
  };

  $scope.schedule = function() {
    $scope.event.start = $scope.uiConfig.modal.date;
    $scope.event.estimated_time = $scope.uiConfig.calendar.slotDuration;
    $scope.event.$save().then(function(event) {
      $scope.uiConfig.modal.hide();
      $scope.uiConfig.calendar.events.push(event);
      $toast.show('Agendado com Sucesso');
      $scope.event = new Event();
    });
  };
});
