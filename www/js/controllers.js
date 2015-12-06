angular.module('app.controllers', [])

.config(function($authProvider, $authConfigProvider) {
  var owner = $authConfigProvider.$get()('owner');
  var client = $authConfigProvider.$get()('client');
  $authProvider.configure([
    { default: client },
    { owner: owner },
    { client: client }
  ]);
})

.controller('SelectorCtrl', function($scope, $auth, $state, $localStorage) {
  var state = $localStorage.get('state');
  if(state !== undefined) {
     $state.go(state);
  }

  $scope.redirect = function(module, state) {
    $localStorage.set('module', module);
    $localStorage.set('state', state);

    $auth.validateUser({config: module}).then(function() {
      var state = $localStorage.get('state');
      $state.go(state);
    }).catch(function() {
      $state.go('login');
    });    
  };
})

.controller('LoginCtrl', function($scope, $auth, $state, $localStorage) {  
  $scope.login = function(provider) {
    var module = $localStorage.get('module');
    $auth.authenticate(provider, {config: module}).then(function(user) {
      var state = $localStorage.get('state');
      $state.go(state);
    });
  };
})

.controller('LogoutCtrl', function($scope, $auth, $state, $localStorage) {
  $scope.$on('$stateChangeSuccess', function(e, state) {
    if(state.url === '/logout') {
      $localStorage.unset('module');
      $localStorage.unset('state');
      $auth.signOut().then(function() {
        $state.go('selector');
      });
    }
  });
});
