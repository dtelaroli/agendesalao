angular.module('client.controllers', ['ng-token-auth', 'ui.calendar'])

.config(function($authProvider, $authConfigProvider) {
  var config = $authConfigProvider.$get()('/client');
  $authProvider.configure(config);
})

.controller('LoginCtrl', function($scope, $auth, $state) {
  $scope.user = {};

  $scope.login = function(provider) {
    $auth.authenticate(provider).then(function(owner) {
      if(owner.profile_id === null) {
        $state.go('client.profile');
      } else {
        $state.go('client.calendar');
      }
      $scope.$emit('client:refresh', [owner]);
    });
  };
})

.controller('ProfileCtrl', function($scope, $auth, $state, $toast, CepService, ProfileService) {
  $scope.profile = new ProfileService();
  if($auth.user.profile_id === null) {
    $scope.profile.client = $auth.user;
  } else {
    $scope.profile.$get({id: $auth.user.profile_id}, function(profile) {
      $scope.$emit('client:refresh', [profile.client]);
    });
  }

  $scope.cep = {value: '', $present: false};

  $scope.$watch('profile.zipcode', function(zipcode) {
    if(zipcode !== undefined && zipcode.length === 8) {
      CepService.get({cep: $scope.profile.zipcode}, function(address) {
        if(!address.erro) {
          $scope.profile.zipcode.$present = true;
          $scope.profile.address = (address.logradouro + ' ' + address.complemento).trim();
          $scope.profile.number = address.number;
          $scope.profile.neighborhood = address.bairro;
          $scope.profile.city = address.localidade;
          $scope.profile.state = address.uf;
          $scope.profile.zipcode = address.cep;
          $scope.profile.zipcode_present = true;
        }
      });
    }
  });

  $scope.registry = function() {
    $scope.profile.$save(function(profile) {
      $toast.show('Salvo com sucesso');
      $scope.$emit('client:refresh', [profile.client]);
    });
  };
})

.controller('DashCtrl', function($scope, $auth, ProfileService, EventService) {
  $scope.profile = new ProfileService();
  if($auth.user.profile_id === null) {
    $state.go('client.profile');
  } else {
    $scope.profile.$get({id: $auth.user.profile_id}, function(profile) {
      $scope.$emit('client:refresh', [profile.owner]);
    });
  }

  $scope.events = new EventService();
  $scope.events.$query();

})

.controller('CalendarCtrl', function($scope, $state, $auth, $ionicModal, $ionicScrollDelegate, 
  $ionicActionSheet, $toast, EventService, uiCalendarConfig) {
  
  $ionicModal.fromTemplateUrl('templates/owner/modal.html', {scope: $scope})
    .then(function(modal) {
    $scope.modal = modal;
  });

  $scope.uiConfig = {
    eventSources: [],
    calendar: {
      height: 'auto',
      allDaySlot: false,
      editable: true,
      eventDurationEditable: false,
      eventOverlap: false,
      lang: 'pt-br',
      timezone: 'local',
      defaultView: 'agendaDay',
      header:{
        left: 'title',
        right: 'today agendaDay,agendaWeek,month'
      },
      dayClick: function(date, jsEvent, view) {
        function hasEvent(date) {
          var allEvents = $(uiCalendarConfig.calendars.monthly).fullCalendar('clientEvents');
          return $.grep(allEvents, function (v) { 
            return +v.start === +date; 
          }).length > 0;
        }

        if (view.name === 'month') {
          $(uiCalendarConfig.calendars.monthly).fullCalendar('gotoDate', date);
          $(uiCalendarConfig.calendars.monthly).fullCalendar('changeView', 'agendaDay');
        } else if(hasEvent(date)) {
          $toast.show('Já existe cliente marcado neste horário');
        } else {
          $scope.modal.date = date.toDate();
          $scope.modal.show();
        }
      },
      eventClick: function(event) {
        $ionicActionSheet.show({
          titleText: 'Remover Cliente <strong>' + event.title + '</strong> para às ' + event.start.format('HH:mm') + 'h?',
          cancelText: 'Cancelar',
          destructiveText: 'Remover',
          destructiveButtonClicked: function(index) {
            EventService.delete({id: event.id}, function() {
              $toast.show('Cliente removido');
              $(uiCalendarConfig.calendars.monthly).fullCalendar('removeEvents', event.id);
            });
            return true;
          }
        });
      },
      eventDrop: function(event, delta, revertFunc) {
        $ionicActionSheet.show({
          buttons: [{ text: 'Remarcar Horário' }],
          titleText: 'Remarcar <strong>' + event.title + '</strong> para às ' + event.start.format('HH:mm') + 'h?',
          cancelText: 'Cancelar',
          cancel: function() {
            revertFunc();
          },
          buttonClicked: function(index) {
            EventService.update({id: event.id, start: event.start}, function() {
              $toast.show('Cliente remarcado');
            }, function() {
              revertFunc();
            });
            return true;
          }
        });
      }
    }
  };

  EventService.query(function(events) {
    $scope.uiConfig.calendar.events = events;
  });

  $scope.$root.$on('client:refresh', function(e, params) {
    var client = params[0];
  });
  $scope.$emit('client:refresh', [$auth.user]); 

  $scope.left = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('next');
  };

  $scope.right = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('prev');
  };

  var scrollSize = window.screen.height / 5 * 4;

  $scope.down = function() {
    $scope._scroll(scrollSize * -1);
  };

  $scope.up = function() {
    $scope._scroll(scrollSize);
  };

  $scope._scroll = function(top) {
    var pos = $ionicScrollDelegate.getScrollPosition();
    $ionicScrollDelegate.scrollTo(pos.left, pos.top + top, true);
  }
})

.controller('ModalCtrl', function($scope, $toast, EventService) {
  $scope.isEmail = true;
  $scope.isTel = true;
  $scope.type = 'text';

  $scope.event = new EventService();

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
    $scope.event.owner = item.owner;
    $scope.event.name = item.name;
    $scope.event.client = item.mobile;
  };

  $scope.close = function() {
    $scope.modal.hide();
  };

  $scope.schedule = function() {
    $scope.event.start = $scope.modal.date;
    $scope.event.estimated_time = $scope.uiConfig.calendar.slotDuration;
    $scope.event.$save(function(event) {
      $scope.modal.hide();
      $toast.show('Agendado com Sucesso');
      $scope.uiConfig.calendar.events.push(event);
      $scope.event = new EventService();
    });
  };
});
