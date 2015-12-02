// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('owner', ['ionic', 'ngCordova', 'shared.configs', 'shared.services', 'owner.controllers', 
  'shared.directives', 'shared.filters', 'shared.interceptors'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
    url: '/',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('owner', {
    url: '/owner',
    abstract: true,
    templateUrl: 'templates/owner/menu.html',
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      }
    }
  })
  
  .state('owner.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/owner/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('owner.calendar', {
    url: '/calendar',
    views: {
      'menuContent': {
        templateUrl: 'templates/owner/calendar.html',
        controller: 'CalendarCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/owner/calendar');
});
