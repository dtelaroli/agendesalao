angular.module('starter.controllers', ['ng-token-auth', 'ionic-timepicker'])

.config(function($authProvider) {
    $authProvider.configure([{
      default: {
        apiUrl: 'http://localhost:3000',
        storage: 'localStorage',
        omniauthWindowType: 'newWindow',
        signOutUrl:            '/owner_auth/sign_out',
        accountUpdatePath:     '/owner_auth',
        accountDeletePath:     '/owner_auth',
        tokenValidationPath:   '/owner_auth/validate_token',
        authProviderPaths: {
          facebook:  '/owner_auth/facebook',
          google:    '/owner_auth/google_oauth2'
        }
      }
    }, {
      end: {
        apiUrl: 'http://localhost:3000',
        storage: 'localStorage',
        omniauthWindowType: 'newWindow'
      }
    }
  ]);
})

.controller('SignInCtrl', function($scope, $auth, $state) {
  console.log('sdf3');
  $scope.user = {};

  $auth.validateUser().then(function(user) {
    $scope._login(user);
  });

  $scope.login = function(provider) {
    $auth.authenticate(provider)
      .then(function(user) {
        $scope._login(user);
      });
  };

  $scope._login = function(user) {
    $scope.user = angular.extend($scope.user, user);
    $scope.user.$logged = true;

    if(user.profile_id === undefined) {
      $state.go('signup');
    }
    else {
     $state.go('schedule');
    }
  }
})

.controller('SignUpCtrl', function($scope, $state, $auth, CepService, ProfileService) {
  console.log('sdf2')
  $scope.profile = new ProfileService();
  $auth.validateUser().then(function(user) {
    $scope.profile.user = user;
    if(user.profile_id !== undefined) {
      $state.go('schedule');
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
      $state.go('schedule');
    });
  };
})

.controller('ScheduleCtrl', function($scope, $state, $auth, $filter, ScheduleService) {
  console.log('sdf')
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
      $state.go('owner.calendar', {}, {reload: true});
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
        $state.go('owner.calendar', {}, {reload: true});
      });
    });
  };

})

.controller('CalendarCtrl', function($scope, $auth) {
  console.log('foo')
})

.controller('AccountCtrl', function($scope, $auth) {
  console.log('bar')
});;
