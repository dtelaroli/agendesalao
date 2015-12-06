angular.module('app', ['ionic', 'ngCordova', 'ng-token-auth', 'ui.calendar', 'app.configs', 'app.services', 'app.directives', 'app.filters', 
  'app.interceptors', 'app.controllers', 'owner.controllers', 'client.controllers'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('selector', {
    url: '/',
    templateUrl: 'templates/selector.html',
    controller: 'SelectorCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('logout', {
    url: '/logout',
    controller: 'LogoutCtrl'
  })

  .state('owner', {
    url: '/owner',
    abstract: true,
    templateUrl: 'templates/owner/menu.html',
    resolve: {
      auth: function($auth) {
        return $auth.validateUser({config: 'owner'});
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

  .state('client', {
    url: '/client',
    abstract: true,
    templateUrl: 'templates/client/menu.html',
    resolve: {
      auth: function($auth) {
        return $auth.validateUser({config: 'client'});
      }
    }
  })
  
  .state('client.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/profile.html',
        controller: 'ClientProfileCtrl'
      }
    }
  })

  .state('client.dash', {
    url: '/dash',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/dash.html',
        controller: 'ClientDashCtrl'
      }
    }
  })

  .state('client.calendar', {
    url: '/calendar/{owner_id:int}/:date',
    views: {
      'menuContent': {
        templateUrl: 'templates/client/calendar.html',
        controller: 'ClientCalendarCtrl'
      }
    }
  })

  $urlRouterProvider.otherwise('/');
});
