angular.module('starter.controllers', ['ng-token-auth', 'ionic-timepicker'])

.config(function($authProvider) {
    $authProvider.configure({
        apiUrl: 'http://localhost:3000',
        storage: 'localStorage',
        omniauthWindowType: 'newWindow'
    });
})

.controller('LoginCtrl', function($scope, $auth, $state, CepService) {

  $scope.user = {$logged: false};
  $scope.cep = {value: '', $present: false};

  $auth.validateUser().then(function(user) {
    $scope.user = user;
    $scope.user.$logged = true;
    // $state.go('admin.dash');
  });

  $scope.login = function(provider) {
    $auth.authenticate(provider)
      .then(function(resp) {
        $scope.user = resp;
        $scope.user.$logged = true;
        // $state.go('admin.dash');
      })
      .catch(function(resp) {
        alert('Erro');
      });
  };

  $scope.timeStart = {
    inputEpochTime: new Date(0, 0, 0, 9).getHours() * 60 * 60,
    step: 10,
    format: 24,
    setLabel: 'Selecionar',
    closeLabel: 'Fechar',
    callback: function(val) {
      $scope.timeStart.inputEpochTime = val;
    }
  };

  $scope.timeEnd = {
    inputEpochTime: new Date(0, 0, 0, 19).getHours() * 60 * 60,
    step: 10,
    format: 24,
    setLabel: 'Selecionar',
    closeLabel: 'Fechar',
    callback: function(val) {
      $scope.timeEnd.inputEpochTime = val;
    }
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
})

.controller('DashCtrl', function($scope, $auth) {
  
});
