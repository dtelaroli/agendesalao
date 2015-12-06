angular.module('client.controllers', [])

.controller('ClientProfileCtrl', function($scope, $auth, $state, $toast, Cep, Profile) {
  $scope.profile = new Profile();
  $scope.client = $auth.user;
  $scope.profile.name = $auth.user.name;
  if($auth.user.profile_id !== null) {
    $scope.profile.$get();
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
    });
  };
})

.controller('ClientDashCtrl', function($scope, $auth, $state, $toast, $ionicActionSheet, Profile, Event, Owner) {
  $scope.profile = new Profile();
  $auth.validateUser({config: 'client'}).then(function(client) {
    if(client.profile_id === null) {
      $state.go('client.profile');
    } else {
      $scope.profile.$get({id: client.profile_id});
    }
  });

  $scope.events = Event.query();
  $scope.histories = Event.query({action: 'history'});
  $scope.owner = {};
  $scope.owners = [];
  $scope.$watch('owner.q', function(q) {
    if(q === undefined || q.length === 0) {
      $scope.owners = [];
    } else {
      $scope.owners = Owner.query({q: q});
    }
  });

  $scope.doRefresh = function() {
    $scope.histories = Event.query({action: 'history'});
    $scope.events = Event.query(function() {
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

.controller('ClientCalendarCtrl', function($scope, $state, $stateParams, $ionicModal, $calendar, Owner) {
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

.controller('ClientModalCtrl', function($scope, $auth, $toast, Event) {
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