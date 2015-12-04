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
      $scope.$emit('owner:refresh', [owner]);
    });
  };
})

.controller('ProfileCtrl', function($scope, $auth, $state, $toast, 
  CepService, ProfileService) {
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
    return $.fullCalendar.moment(new Date(date)).utc().year(1970).month(0).date(1).time() / 1000;
  }
  
  function formatDate(date) {
    return $.fullCalendar.moment(new Date(date * 1000)).utc().year(2000).month(0).date(1).toISOString();
  }

  $scope.profile = new ProfileService();
  if($auth.user.profile_id === null) {
    $state.go('owner.profile');
  } else {
    $scope.profile.$get({id: $auth.user.profile_id}, function(profile) {
      $scope.timeStart.inputEpochTime = parseDate(profile.owner.start);
      $scope.timeEnd.inputEpochTime = parseDate(profile.owner.end);
      $scope.timeClient.inputEpochTime = parseDate(profile.owner.time_per_client);
      $scope.$emit('owner:refresh', [profile.owner]);
    });
  }

  $scope.cep = {value: '', $present: false};

  $scope.timeStart = createDateObj('2010-01-01T09:00:00Z');
  $scope.timeEnd = createDateObj('2010-01-01T20:00:00Z');
  $scope.timeClient = createDateObj('2010-01-01T00:20:00Z');
  
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
    $scope.profile.owner.start = formatDate($scope.timeStart.inputEpochTime);
    $scope.profile.owner.end = formatDate($scope.timeEnd.inputEpochTime);
    $scope.profile.owner.time_per_client = formatDate($scope.timeClient.inputEpochTime);

    $scope.profile.$save(function(profile) {
      $toast.show('Salvo com sucesso');
      $scope.$emit('owner:refresh', [profile.owner]);
    });
  };
})

.controller('CalendarCtrl', function($scope, $state, $auth, $ionicModal, 
  $ionicScrollDelegate, $ionicActionSheet, $toast, EventService, uiCalendarConfig) {
  
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

  function formatDate(date) {
    return $.fullCalendar.moment(date).utc().format('HH:mm');
  }

  function hiddenDays(owner) {
    var hidden = [];
    if(!owner.sun) hidden.push(0);
    if(!owner.mon) hidden.push(1);
    if(!owner.tue) hidden.push(2);
    if(!owner.wed) hidden.push(3);
    if(!owner.thu) hidden.push(4);
    if(!owner.fri) hidden.push(5);
    if(!owner.sat) hidden.push(6);
    return hidden;
  }

  $scope.$root.$on('owner:refresh', function(e, params) {
    var owner = params[0];
    $scope.uiConfig.calendar.minTime = formatDate(owner.start);
    $scope.uiConfig.calendar.maxTime = formatDate(owner.end);
    $scope.uiConfig.calendar.slotDuration = formatDate(owner.time_per_client);
    $scope.uiConfig.calendar.hiddenDays = hiddenDays(owner);
  });
  $scope.$emit('owner:refresh', [$auth.user]); 

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
    $scope.event.client_id = item.client.id;
    $scope.event.name = item.name;
    $scope.event.client = item.mobile;
  };

  $scope.render = function(item) {
    return '<img src="'+ item.client.image +'"/><h3>'+  item.name +'</h3><p>'+ item.neighborhood +'</p>';
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
