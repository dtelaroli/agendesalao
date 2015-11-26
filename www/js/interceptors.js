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