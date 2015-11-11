angular.module('starter.controllers', ['ng-token-auth'])

.config(function($authProvider) {
    $authProvider.configure({
        apiUrl: 'http://localhost:3000',
        storage: 'localStorage',
        omniauthWindowType: 'newWindow'
    });
})

.controller('LoginCtrl', function($scope, $auth, $state) {
  $auth.validateUser().then(function() {
    // $state.go('admin.dash');
  });

  $scope.login = function(provider) {
    $auth.authenticate(provider)
      .then(function(resp) {
        $state.go('admin.dash');
      })
      .catch(function(resp) {
        alert('Erro')
      });
  };
})

.controller('DashCtrl', function($scope, $auth) {
  
});
