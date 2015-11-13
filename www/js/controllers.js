angular.module('starter.controllers', ['ng-token-auth', 'ionic-timepicker'])

.config(function($authProvider) {
    $authProvider.configure({
        apiUrl: 'http://localhost:3000',
        storage: 'localStorage',
        omniauthWindowType: 'newWindow'
    });
})

.controller('LoginCtrl', function($scope, $auth, $state, CepService, UserService) {

  $scope.user = new UserService({$logged: false});
  $scope.cep = {value: '', $present: false};

  $auth.validateUser().then(function(user) {
    $scope.user = angular.extend($scope.user, user);
    $scope.user.$logged = true;
    // $state.go('admin.dash');
  });

  $scope.login = function(provider) {
    $auth.authenticate(provider)
      .then(function(resp) {
        $scope.user = angular.extend($scope.user, resp);
        $scope.user.$logged = true;
        // $state.go('admin.dash');
      })
      .catch(function(resp) {
        alert('Erro');
      });
  };

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

  $scope.$watch('cep.value', function(cep) {
    if($scope.cep.value.length == 8) {
      CepService.get({cep: $scope.cep.value}, function(address) {
        $scope.cep.$present = true;
        $scope.user.address = address.logradouro + ' ' + address.complemento + ', ' + address.bairro + ' - ' + address.localidade + ' / ' + address.uf;
        $scope.user = angular.extend($scope.user, address);
      });
    }
  });

  $scope.registry = function() {
    $scope.user.$save(function(result) {
      console.log(result);
    }, function(error) {
      console.error(error);
    });
  };
})

.controller('DashCtrl', function($scope, $auth) {
  
});
