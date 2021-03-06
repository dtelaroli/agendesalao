angular.module('app.controllers', [])

.config(function($authProvider, $authConfigProvider) {
  var owner = $authConfigProvider.$get()('owner');
  var client = $authConfigProvider.$get()('client');
  $authProvider.configure([
    { owner: owner },
    { client: client }
  ]);
})

.controller('SelectorCtrl', function($scope, $auth, $state, $localStorage) {
  var state = $localStorage.get('state');
  if(state !== undefined && $auth.user.signedIn) {
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

.controller('LoginCtrl', function($scope, $auth, $state, $localStorage, $ionicHistory) {  
  $scope.$on('$ionicView.enter', function () {
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
  });

  $scope.login = function(provider) {
    var module = $localStorage.get('module');
    $auth.authenticate(provider, {config: module}).then(function(user) {
      var state = $localStorage.get('state');
      $state.go(state, {}, {reload: true});
    });
  };
})

.controller('LogoutCtrl', function($scope, $auth, $state, $localStorage, $ionicHistory) {
  $scope.$on('$ionicView.enter', function(e, state) {
    $localStorage.unset('module');
    $localStorage.unset('state');
    $auth.signOut().then(function() {
      $state.go('selector');
    });
  });
});
