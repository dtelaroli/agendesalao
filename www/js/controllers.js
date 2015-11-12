angular.module('starter.controllers', ['ng-token-auth'])

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

  $scope.$watch('cep.value', function(cep) {
    if($scope.cep.value.length == 8) {
      CepService.get({cep: $scope.cep.value}, function(address) {
        $scope.cep.$present = true;
        $scope.user.address = address.logradouro + ', ' + address.bairro + ', ' + address.localidade + ' - ' + address.uf;
        $scope.user = angular.extend($scope.user, address);
      });
    }
  });
})

.controller('DashCtrl', function($scope, $auth) {
  
});
