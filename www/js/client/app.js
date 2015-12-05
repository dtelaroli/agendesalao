// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('client', ['ionic', 'ngCordova', 'shared.configs', 'shared.services', 'client.controllers', 
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

  .state('client', {
    url: '/client',
    abstract: true,
    templateUrl: 'templates/client/menu.html',
    resolve: {
      auth: function($auth) {
        return $auth.validateUser();
      }
    }
  })
  
  .state('client.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('client.dash', {
    url: '/dash',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('client.calendar', {
    url: '/calendar/{owner_id:int}/:date',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/calendar.html',
        controller: 'CalendarCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/client/dash');
});
