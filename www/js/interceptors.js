angular.module('shared.interceptors', [])
    
.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($q, $rootScope) {
    return {
      request: function(config) {
        if(config.url.indexOf('.html') === -1) {
          $rootScope.$broadcast('loading:show')
        }
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide');
        return response;
      },
      responseError: function(rejection) {
        switch(rejection.status) {
        case 0:
        case 200:
        case 404:
            break;

        case 401:
            $rootScope.$broadcast('auth:validation-error', rejection);
            break;

        default:
            $rootScope.$broadcast('app:error', rejection);
        }

        $rootScope.$broadcast('loading:hide');
        return rejection;
      }
    };
  });
})

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

.run(function($rootScope, $ionicLoading, $ionicPopup, $state) {
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: 'Carregando...'});
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });

  $rootScope.$on('auth:validation-error', function() {
    $state.go('login');
  });

  $rootScope.$on('app:error', function(event, rejection) {
    var errors = ['Erro desconhecido'];
    if(rejection !== undefined) {
      console.log(rejection)
      errors = rejection.data === undefined ? rejection.errors : rejection.data.errors
    }
    $ionicPopup.alert({
      title: 'Erro',
      template: errors.join('<br />')
    });
  });
});