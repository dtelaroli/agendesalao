angular.module('starter.controllers', ['ng-token-auth', 'ionic-timepicker', 'ui.calendar'])

.config(function($authProvider) {
  function createConfig(path) {
    var isMob = window.cordova !== undefined;
    return {
      apiUrl: 'https://warm-dusk-4656.herokuapp.com',
      storage: (isMob ? 'localStorage' : 'cookies'),
      omniauthWindowType: (isMob ? 'inAppBrowser' : 'newWindow'),
      signOutUrl: path + '/sign_out',
      accountUpdatePath: path,
      accountDeletePath: path,
      tokenValidationPath: path + '/validate_token',
      authProviderPaths: {
        facebook: path + '/facebook',
        google: path + '/google_oauth2'
      }
    };
  }

  $authProvider.configure([{
    default: createConfig('/owner_auth')
  }, {
    end: createConfig('/auth')
  }]);
})

.controller('SignInCtrl', function($scope, $auth, $state) {
  $scope.user = {};

  $auth.validateUser().then(function(user) {
    $scope._login(user);
  });

  $scope.login = function(provider) {
    $auth.authenticate(provider)
      .then(function(user) {
        $scope._login(user);
      })
      .catch(function(error) {
        alert('error' + error);
      });
  };

  $scope._login = function(user) {
    $scope.user = angular.extend($scope.user, user);
    $scope.user.$logged = true;

    if(user.profile_id === undefined) {
      $state.go('owner.signup');
    }
    else {
     $state.go('owner.schedule');
    }
  }
})

.controller('SignUpCtrl', function($scope, $state, $auth, CepService, ProfileService) {
  $scope.profile = new ProfileService();
  $auth.validateUser().then(function(user) {
    $scope.profile.user = user;
    if(user.profile_id !== undefined) {
      $state.go('owner.schedule');
    }
  });
  $scope.cep = {value: '', $present: false};

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
    $scope.profile.$save(function(result) {
      $state.go('owner.schedule');
    });
  };
})

.controller('ScheduleCtrl', function($scope, $state, $auth, $filter, ScheduleService) {
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

  $scope.schedules = [];
  ScheduleService.query(function(schedules) {
    $scope.schedules = schedules;
    if(schedules.length > 0) {
      $state.go('owner.calendar');
    }
  });

  $scope.timeStartObj = createDateObj(9);
  $scope.timeEndObj = createDateObj(20);

  $scope.timeLunchStartObj = createDateObj(12);
  $scope.timeLunchEndObj = createDateObj(13);

  $scope.timeBreakStartObj = createDateObj(16);
  $scope.timeBreakEndObj = createDateObj(17);

  $scope.days = $filter('day')();
  $scope.day = {selected: 'mon'};
  $scope.keys = Object.keys($scope.days);

  $scope.add = function() {
    $scope.schedules.push(new ScheduleService({
      day: $scope.day.selected,
      start: $scope.timeStartObj.inputEpochTime,
      end: $scope.timeEndObj.inputEpochTime,
      startLunch: $scope.timeLunchStartObj.inputEpochTime,
      endLunch: $scope.timeLunchEndObj.inputEpochTime,
      startBreak: $scope.timeBreakStartObj.inputEpochTime,
      endBreak: $scope.timeBreakEndObj.inputEpochTime
    }));
    delete $scope.days[$scope.day.selected];
    $scope.keys = Object.keys($scope.days);
    $scope.day.selected = $scope.keys[0];
  };

  $scope.registry = function() {    
    angular.forEach($scope.schedules, function($schedule) {
      $schedule.$save(function(schedule) {
        $state.go('owner.calendar');
      });
    });
  };
})


.controller('CalendarCtrl', function($scope, $auth, uiCalendarConfig) {
  $scope.eventSources = [];
  $scope.uiConfig = {
    calendar: {
      defaultView: 'agendaWeek',
      height: 400,
      editable: true,
      header:{
        left: 'title',
        center: '',
        right: 'today agendaDay,agendaWeek,month'
      },
      events: [
        {title: 'All Day Event', start: new Date(2015, 11, 1), end: new Date(2015, 0, 1)},
        {title: 'All Day Event', start: new Date(2015, 10, 2)},
        {title: 'All Day Event', start: new Date(2015, 11, 3)}
      ]
    }
  };

  $scope.left = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('next');
  };

  $scope.right = function() {
    $(uiCalendarConfig.calendars.monthly).fullCalendar('prev');
  };
})

.controller('AccountCtrl', function($scope, $auth) {
});
