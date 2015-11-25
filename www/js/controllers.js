angular.module('shared.controllers', [])

.controller('UserTypeCtrl', function($scope, $window) {
  var $config = JSON.parse($window.localStorage['config'] || '{}');
  if($config.module !== undefined) {
    $window.location.href = $config.module;
  }

  $scope.redirect = function(href) {
    $window.localStorage['config'] = JSON.stringify({module: href});
    $window.location.href = href;
  };
})

.controller('SignOutCtrl', function($state, $window) {
  delete $window.localStorage['config'];
  $state.go('selector');
});
