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
      inputEpochTime: new Date(0, 0, 0, hour).getHours() * 60 * 60,
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
  
  $scope.timeStart = createDateObj(9);
  $scope.timeEnd = createDateObj(20);
  
  $scope.profile = new ProfileService();
  $scope.profile.$get({id: $auth.user.id}, function(profile) {
    $scope.timeStart.inputEpochTime = profile.owner.start;
    $scope.timeEnd.inputEpochTime = profile.owner.end;
    $scope.profile.zipcode_present = true;
  });

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
    $scope.profile.owner.start = $scope.timeStart.inputEpochTime,
    $scope.profile.owner.end = $scope.timeEnd.inputEpochTime,

    $scope.profile.$save(function(profile) {
      $state.go('owner.calendar');
    });
  };
})

.controller('CalendarCtrl', function($scope, $state, $auth, $config, $ionicModal, uiCalendarConfig) {
  $ionicModal.fromTemplateUrl('templates/owner/modal.html', {scope: $scope}).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.eventSources = [];
  $scope.uiConfig = {
    calendar: {
      defaultView: 'agendaWeek',
      height: 530,
      allDaySlot: false,
      selectable: false,
      editable: false,
      droppable: false,
      lang: 'pt-br',
      timezone: 'local',
      minTime: '8:00',
      maxTime: '20:00',
      slotDuration: '00:30',
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

  $scope.foo = function() {
    console.log('bar')
  }

  $scope.left = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('next');
  };

  $scope.right = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('prev');
  };
})

.controller('AccountCtrl', function($scope, $auth) {

});
