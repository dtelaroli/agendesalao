angular.module('starter.controllers', [])

.controller('SelectorCtrl', function($scope, $window) {
  $scope.redirect = function(href) {
    $window.location.href = href;
  };
});
