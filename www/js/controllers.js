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
  $scope.user = {};

  $auth.validateUser().then(function(user) {
    $scope._login(user);
  });

  $scope.login = function(provider) {
    $auth.authenticate(provider)
      .then(function(user) {
        $scope._login(user);
      })
      .catch(function(resp) {
        alert('Erro');
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
  $scope.profile = new ProfileService();
  $auth.validateUser().then(function(user) {
    $scope.profile.user = user;
    if(user.profile_id !== undefined) {
      $state.go('owner.dash');
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
    }, function(error) {
      console.error(error);
    });
  };
})

.controller('ScheduleCtrl', function($scope, $state, $auth, ProfileService) {
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

  $scope.timeStartObj = createDateObj(9);
  $scope.timeEndObj = createDateObj(20);

  $scope.timeLunchStartObj = createDateObj(12);
  $scope.timeLunchEndObj = createDateObj(13);

  $scope.timeBreakStartObj = createDateObj(16);
  $scope.timeBreakEndObj = createDateObj(17);

  $scope.days = [
    {id: 'mon', label: 'Segunda-feira'},
    {id: 'tue', label: 'Terça-feira'},
    {id: 'wed', label: 'Quarta-feira'},
    {id: 'thu', label: 'Quinta-feira'},
    {id: 'fri', label: 'Sexta-feira'},
    {id: 'sat', label: 'Sábado'},
    {id: 'sun', label: 'Domingo'}
  ];
  $scope.day = {selected: $scope.days[0]};

  $scope.hours = [];
  $scope.addHour = function() {
    $scope.hours.push({
      day: $scope.day.selected,
      start: $scope.timeStartObj.inputEpochTime,
      end: $scope.timeEndObj.inputEpochTime,
      startLunch: $scope.timeLunchStartObj.inputEpochTime,
      endLunch: $scope.timeLunchEndObj.inputEpochTime,
      startDinner: $scope.timeBreakStartObj.inputEpochTime,
      endDinner: $scope.timeBreakEndObj.inputEpochTime
    });
    $scope.days.shift();
    $scope.day.selected = $scope.days[0];
  };

  $scope.registry = function() {
    UserService.save(function(result) {
      console.log(result);
    }, function(error) {
      console.error(error);
    });
  };

})

.controller('DashCtrl', function($scope, $auth) {
  
});
