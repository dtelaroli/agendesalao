angular.module('shared.services', ['ngResource', 'shared.configs'])

.factory('Cep', function($resource) {
  return $resource('https://viacep.com.br/ws/:cep/json/unicode', {}, {
    get: {
      headers: {'Accept': 'application/json'}
    }
  });
})

.factory('Profile', function($rest) {
  return $rest('/profiles', {
    update: {
      method: 'PUT'
    }
  });
})

.factory('Event', function($rest) {
  return $rest('/events', {
    update: {
      method: 'PUT'
    }
  });
})

.factory('Owner', function($rest) {
  return $rest('/owners');
})

.factory('$rest', function($resource, $config) {
  return function(path, methods) {
    return $resource($config.host() + path + '/:action/:id.:format', {format: 'json', id: '@id', action: '@action'}, methods);
  };
})

.factory('$authConfig', function($config) {
  var isMob = window.cordova !== undefined;
  return function(module) {
    return {
      apiUrl: $config.auth(module),
      storage: (isMob ? 'localStorage' : 'cookies'),
      omniauthWindowType: (isMob ? 'inAppBrowser' : 'newWindow'),
      signOutUrl: '/auth/sign_out',
      accountUpdatePath: '/auth',
      accountDeletePath: '/auth',
      tokenValidationPath: '/auth/validate_token',
      authProviderPaths: {
        facebook: '/auth/facebook',
        google: '/auth/google_oauth2'
      }
    }
  };
})

.factory('$toast', function($ionicLoading, $cordovaToast) {
  return {
    show: function(message) {
      if(!!window.cordova) {
        $cordovaToast.show(message, 3000, 'center');
      }
      else {
        $ionicLoading.show({template: message, noBackdrop: true, duration: 3000});
      }
    }
  };
})

.factory('$calendar', function($ionicActionSheet, $ionicScrollDelegate, $toast, uiCalendarConfig, Event) {
  var data = {
    modal: {},
    eventSources: [],
    calendar: {
      events: Event.query(),
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

        if (date.isBefore(new Date())) {
          $toast.show('Horário já ocorreu. Selecione outro horário.');
        } else if(view.name === 'month') {
          $(uiCalendarConfig.calendars.monthly).fullCalendar('gotoDate', date);
          $(uiCalendarConfig.calendars.monthly).fullCalendar('changeView', 'agendaDay');
        } else if(hasEvent(date)) {
          $toast.show('Este horário já foi reservado');
        } else {
          data.modal.date = date.toDate();
          data.modal.show();
        }
      },
      eventClick: function(event) {
        $ionicActionSheet.show({
          titleText: 'Remover <strong>' + event.title + '</strong> para às ' + event.start.format('HH:mm') + 'h?',
          cancelText: 'Cancelar',
          destructiveText: 'Remover',
          destructiveButtonClicked: function(index) {
            Event.delete({id: event.id}, function() {
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
            Event.update({id: event.id, start: event.start}, function() {
              $toast.show('Horário remarcado');
            }, function() {
              revertFunc();
            });
            return true;
          }
        });
      },
      eventAfterRender: function(event, element) {
        $(element).addTouch();
      }
    }
  };

  function formatDate(date) {
    return moment(date).utc().format('HH:mm');
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

  data.left = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('next');
  };

  data.right = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('prev');
  };

  var scrollSize = window.screen.height / 3;

  data.down = function() {
    _scroll(scrollSize * -1);
  };

  data.up = function() {
    _scroll(scrollSize);
  };

  var _scroll = function(top) {
    var pos = $ionicScrollDelegate.getScrollPosition();
    $ionicScrollDelegate.scrollTo(pos.left, pos.top + top, true);
  }

  data.config = function(owner) {
    data.calendar.minTime = formatDate(owner.start);
    data.calendar.maxTime = formatDate(owner.end);
    data.calendar.slotDuration = formatDate(owner.time_per_client);
    data.calendar.hiddenDays = hiddenDays(owner);
  };

  data.go = function(date) {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('gotoDate', new Date(date));
    $(uiCalendarConfig.calendars.monthly).fullCalendar('changeView', 'agendaDay');
  }

  data.events = function(events) {
    data.calendar.events = events;
  };

  return function(config) {
    data.calendar = angular.extend(data.calendar, config);
    return data;
  };
});