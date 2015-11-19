angular.module('starter.controllers', [])

.controller('UserTypeCtrl', function($scope, $window) {
  $scope.redirect = function(href) {
    $window.location.href = href;
  };
});
