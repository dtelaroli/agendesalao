// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('owner', ['ionic', 'owner.controllers', 'shared.directives', 'shared.filters'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

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
      auth: function($auth, $state) {
        return $auth.validateUser().catch(function() {
          $state.go('login');
        });
      }
    }
  })
  
  .state('owner.profile', {
    url: '/profile',
    views: {
      'owner-profile': {
        templateUrl: 'templates/owner/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('owner.schedule', {
    url: '/schedule',
    views: {
      'owner-schedule': {
        templateUrl: 'templates/owner/schedule.html',
        controller: 'ScheduleCtrl'
      }
    }
  })
  
  .state('owner.calendar', {
    url: '/calendar',
    views: {
      'owner-calendar': {
        templateUrl: 'templates/owner/calendar.html',
        controller: 'CalendarCtrl'
      }
    }
  })

  .state('owner.account', {
    url: '/account',
    views: {
      'owner-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/owner/calendar');
});
