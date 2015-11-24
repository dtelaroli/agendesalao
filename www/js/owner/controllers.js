angular.module('owner.controllers', ['ng-token-auth', 'ionic-timepicker', 'ui.calendar'])

.config(function($authProvider, $configProvider, $authConfigProvider) {
  var config = $authConfigProvider.$get()('/owner');
  $authProvider.configure(config);
})

.controller('LoginCtrl', function($scope, $auth, $state, $config) {
  $scope.user = {};

  $scope.login = function(provider) {
    $auth.authenticate(provider).then(function(owner) {
      $scope.owner = owner;
      $config.set('owner', owner);
      
      if(owner.profile_id === null) {
        $state.go('owner.profile');
      } else {
        $state.go('owner.calendar');
      }
    }).catch(function(error) {
      alert('error' + error);
    });
  };
})

.controller('ProfileCtrl', function($scope, $auth, $state, $config, $filter, $timeout, CepService, ProfileService) {
  function createDateObj(hour) {
    var obj = {
      inputEpochTime: parseDate(hour),
      step: 10,
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
    if(typeof date === 'string') {
      var newDate = new Date(date);
      newDate.setYear(1970);
      newDate.setMonth(0);
      newDate.setDate(1);
      return newDate.getTime() / 1000;
    }
    return date * 60 * 60;
  }
  
  function formatDate(date) {
    var newDate = new Date();
    newDate.setTime(date * 1000);
    newDate.setYear(2000);
    newDate.setMonth(0);
    newDate.setDate(1);
    return newDate;
  }


  $scope.owner = $auth.user;
  $scope.profile = new ProfileService();
  if($auth.user.profile_id === null) {
    $scope.profile.owner = $auth.owner;
  } else {
    $scope.profile.$get({id: $auth.user.profile_id}, function() {
      $scope.timeStart.inputEpochTime = parseDate($scope.profile.owner.start);
      $scope.timeEnd.inputEpochTime = parseDate($scope.profile.owner.end); 
    });
  }  

  $scope.cep = {value: '', $present: false};

  $scope.timeStart = createDateObj(9);
  $scope.timeEnd = createDateObj(20);

  $scope.$watch('cep.value', function(cep) {
    if($scope.cep.value !== undefined && $scope.cep.value.length === 8) {
      CepService.get({cep: $scope.cep.value}, function(address) {
        if(!address.erro) {
          $scope.cep.$present = true;
          $scope.profile = angular.extend($scope.profile, {
            address: (address.logradouro + ' ' + address.complemento).trim(),
            number: address.number,
            neighborhood: address.bairro,
            city: address.localidade,
            state: address.uf,
            zipcode: address.cep,
          });
        }
      });
    }
  });

  $scope.registry = function() {
    $scope.profile.owner.start = formatDate($scope.timeStart.inputEpochTime),
    $scope.profile.owner.end = formatDate($scope.timeEnd.inputEpochTime),

    $scope.profile.$save(function(profile) {
      $config.set('profile', profile);
      // $state.go('owner.calendar');
    });
  };
})

.controller('CalendarCtrl', function($scope, $state, $auth, $config, $ionicModal, $ionicScrollDelegate, uiCalendarConfig) {
  $ionicModal.fromTemplateUrl('templates/owner/modal.html', {scope: $scope}).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.eventSources = [];
  $scope.uiConfig = {
    calendar: {
      defaultView: 'agendaWeek',
      height: 'auto',
      allDaySlot: false,
      lang: 'pt-br',
      timezone: 'local',
      minTime: '10:00',
      maxTime: '18:00',
      slotDuration: '00:15',
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

  $scope.selectClient = function(item) {
    $scope.modal.selected = item;
  };

  $scope.close = function() {
    $scope.modal.hide();
  };

  $scope.uiConfig.calendar.defaultView = 'agendaWeek';
  $scope.uiConfig.calendar.events = [
    {id: 1, foo: 'bar', title: 'All Day Event', start: new Date(2015, 11, 1), end: new Date(2016, 5, 1)},
    {id: 2, title: 'All Day Event', start: new Date(2015, 10, 2)},
    {id: 3, title: 'All Day Event', start: new Date(2015, 11, 3)}
  ];

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

.controller('ModalCtrl', function($scope) {
  $scope.title = 'Agendar Cliente';
})

.controller('AccountCtrl', function($scope, $auth) {

});
