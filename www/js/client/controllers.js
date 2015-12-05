angular.module('client.controllers', ['ng-token-auth', 'ui.calendar'])

.config(function($authProvider, $authConfigProvider) {
  var config = $authConfigProvider.$get()('/client');
  $authProvider.configure(config);
})

.controller('LoginCtrl', function($scope, $auth, $state) {
  $scope.login = function(provider) {
    $auth.authenticate(provider).then(function(client) {
      if(client.profile_id === null) {
        $state.go('client.profile');
      } else {
        $state.go('client.dash');
      }
      $scope.$emit('client:refresh', [client]);
    });
  };
})

.controller('ProfileCtrl', function($scope, $auth, $state, $toast, Cep, Profile) {
  $scope.profile = new Profile();
  $scope.client = $auth.user;
  $scope.profile.name = $auth.user.name;
  if($auth.user.profile_id !== null) {
    $scope.profile.$get({id: $auth.user.profile_id});
  }

  $scope.cep = {value: ''};

  $scope.$watch('profile.zipcode', function(zipcode) {
    if(zipcode !== undefined && zipcode.length === 8) {
      Cep.get({cep: $scope.profile.zipcode}, function(address) {
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
    var method = !$scope.profile.id ? '$save' : '$update';
    $scope.profile.client_id = $scope.client.id;
    $scope.profile[method]().then(function(profile) {
      $toast.show('Salvo com sucesso');
      $scope.$emit('client:refresh', [profile.client]);
    });
  };
})

.controller('DashCtrl', function($scope, $auth, $state, $toast, $ionicActionSheet, Profile, Event, Owner) {
  $scope.profile = new Profile();
  if($auth.user.profile_id === null) {
    $state.go('client.profile');
  } else {
    $scope.profile.$get({id: $auth.user.profile_id});
  }  

  $scope.events = Event.query();
  $scope.histories = Event.query({action: 'history'});
  $scope.owner = {};
  $scope.owners = [];
  $scope.$watch('owner.q', function(q) {
    if(q !== undefined && q.length > 0) {
      $scope.owners = Owner.query({q: q});
    }
  });

  $scope.doRefresh = function() {
    $scope.histories = Event.query({action: 'history'});
    $scope.events = new Event();
    $scope.events.$query().finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.confirm = function(item) {
    $ionicActionSheet.show({
      titleText: 'Confirmar seu horário de ' + moment(item.start).format('HH:mm') + 'h?',
      cancelText: 'Cancelar',
      buttons: [{text: 'Confirmar'}],
      buttonClicked: function(index) {
        item.confirmed = true;
        item.$update({id: item.id}).then(function() {
          $toast.show('Agendamento confirmado');
        });
        return true;
      }
    });
  };

  $scope.cancel = function(item, index) {
    console.log(item)
    $ionicActionSheet.show({
      titleText: 'Cancelar seu horário de ' + moment(item.start).format('HH:mm') + 'h?',
      cancelText: 'Cancelar',
      destructiveText: 'Remover',
      destructiveButtonClicked: function(index) {
        item.$delete().then(function() {
          $scope.events.splice(index, 1);
          $toast.show('Agendamento cancelado');
        });
        return true;
      }
    });
  };
})

.controller('CalendarCtrl', function($scope, $state, $stateParams, $ionicModal, $calendar, Owner) {
  $scope.uiConfig = $calendar();
  $ionicModal.fromTemplateUrl('templates/client/modal.html', {scope: $scope})
    .then(function(modal) {
    $scope.uiConfig.modal = modal;
  });

  $scope.owner = Owner.get({id: $stateParams.owner_id}, function(owner) {
    $scope.uiConfig.config(owner);
    $scope.uiConfig.go($stateParams.date);
  });
})

.controller('ModalCtrl', function($scope, $auth, $toast, Event, Profile) {
  $scope.event = new Event();

  $scope.close = function() {
    $scope.uiConfig.modal.hide();
  };

  $scope.schedule = function() {
    $scope.event.owner_id = $scope.owner.id;
    $scope.event.start = $scope.uiConfig.modal.date;
    $scope.event.estimated_time = $scope.uiConfig.calendar.slotDuration;
    $scope.event.$save().then(function(event) {
      $scope.uiConfig.modal.hide();
      $scope.uiConfig.calendar.events.push(event);
      $toast.show('Agendado com Sucesso');
    });
  };
})
;