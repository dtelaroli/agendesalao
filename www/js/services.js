angular.module('shared.services', ['ngResource', 'shared.configs'])

.factory('CepService', function($resource) {
  return $resource('https://viacep.com.br/ws/:cep/json/unicode', {}, {
    get: {
      headers: {'Accept': 'application/json'}
    }
  });
})

.factory('ProfileService', function($rest) {
  return $rest('/profiles', {
    update: {
      method: 'PUT'
    }
  });
})

.factory('EventService', function($rest) {
  return $rest('/events', {
    update: {
      method: 'PUT',
      params: {
        id: '@id'
      }
    }
  });
})

.factory('$rest', function($resource, $config) {
  return function(path, methods) {
    return $resource($config.host() + path + '/:id.:format', {format: 'json'}, methods);
  };
})

.factory('$authConfig', function($config) {
  var isMob = window.cordova !== undefined;
  return function(module) {
    return {
      apiUrl: $config.auth(module),
      storage: (isMob ? 'localStorage' : 'cookies'),
      omniauthWindowType: (isMob ? 'inAppBrowser' : 'newWindow'),
      signOutUrl: '/auth/sign_out',
      accountUpdatePath: '/auth',
      accountDeletePath: '/auth',
      tokenValidationPath: '/auth/validate_token',
      authProviderPaths: {
        facebook: '/auth/facebook',
        google: '/auth/google_oauth2'
      }
    }
  };
})

.factory('$toast', function($ionicLoading, $cordovaToast) {
  return {
    show: function(message) {
      if(!!window.cordova) {
        $cordovaToast.show(message, 3000, 'center');
      }
      else {
        $ionicLoading.show({template: message, noBackdrop: true, duration: 3000});
      }
    }
  };
});