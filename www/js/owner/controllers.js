angular.module('owner.controllers', ['ng-token-auth', 'ionic-timepicker', 'ui.calendar'])

.config(function($authProvider, $authConfigProvider) {
  var config = $authConfigProvider.$get()('/owner');
  $authProvider.configure(config);
})

.controller('LoginCtrl', function($scope, $auth, $state, $config) {
  $scope.user = {};

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

.controller('ProfileCtrl', function($scope, $auth, $state, $config, $filter, $toast, 
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
    $scope.profile.owner = $auth.owner;
  } else {
    $scope.profile.$get({id: $auth.user.profile_id}, function(profile) {
      $scope.timeStart.inputEpochTime = parseDate(profile.owner.start);
      $scope.timeEnd.inputEpochTime = parseDate(profile.owner.end);
      $scope.timeClient.inputEpochTime = parseDate(profile.owner.time_per_client);
      $scope.$emit('owner:update', [profile]);
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
      $toast.show('Salvo com sucesso!');
      $scope.$emit('owner:update', [profile.owner]);
    });
  };
})

.controller('CalendarCtrl', function($scope, $state, $auth, $config, $ionicModal, 
  $ionicScrollDelegate, uiCalendarConfig) {
  
  $ionicModal.fromTemplateUrl('templates/owner/modal.html', {scope: $scope})
    .then(function(modal) {
    $scope.modal = modal;
  });

  $scope.eventSources = [];
  $scope.uiConfig = {
    calendar: {
      height: 'auto',
      allDaySlot: false,
      selectable: false,
      editable: false,
      droppable: false,
      lang: 'pt-br',
      timezone: 'local',
      hiddenDays: [0],
      header:{
        left: 'title',
        right: 'today agendaDay,agendaWeek,month'
      },
      dayClick: function(date, jsEvent, view) {
        if (view.name === 'agendaDay') {
          $scope.modal.date = date.toDate();
          $scope.modal.show();
        } else {
          $(uiCalendarConfig.calendars.monthly).fullCalendar('gotoDate', date);
          $(uiCalendarConfig.calendars.monthly).fullCalendar('changeView', 'agendaDay');
        }
      },
      eventClick: function(e) {
      }
    }
  };

  function formatDate(date) {
    return $.fullCalendar.moment(date).utc().format('HH:mm');
  }

  $scope.$root.$on('owner:update', function(e, params) {
    var owner = params[0];
    if(owner === undefined) {
      return;
    }
    $scope.uiConfig.calendar.minTime = formatDate(owner.start);
    $scope.uiConfig.calendar.maxTime = formatDate(owner.end);
    $scope.uiConfig.calendar.slotDuration = formatDate(owner.time_per_client);
  });

  $scope.$emit('owner:update', [$auth.user]);

  $scope.uiConfig.calendar.defaultView = 'agendaWeek';
  $scope.uiConfig.calendar.events = [
    {id: 1, foo: 'bar', title: 'All Day Event', start: new Date(2015, 11, 1), end: new Date(2016, 5, 1)},
    {id: 2, title: 'All Day Event', start: new Date(2015, 10, 2)},
    {id: 3, title: 'All Day Event', start: new Date(2015, 11, 3)}
  ];

  $scope.selectClient = function(item) {
    $scope.modal.selected = item;
  };

  $scope.close = function() {
    $scope.modal.hide();
  };

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

.controller('AccountCtrl', function($scope, $auth) {

});
