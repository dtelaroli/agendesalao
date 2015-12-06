angular.module('app.configs', [])

.factory('$config', function($localStorage) {
  var $data = {
    // host: 'https://warm-dusk-4656.herokuapp.com'
    host: 'http://localhost:3000/'
  };
  var configs = {
    host: function() {
      return $data.host;
    },

    module: function() {
      return $localStorage.get('module', 'client');
    },

    auth: function(module) {
      return configs.host();
    },

    set: function(key, value) {
      $data[key] = value;
    },

    get: function(key) {
      return $data[key];
    },
    $data: function() {
      return $data; 
    }
  };

  return configs;
})

.factory('$localStorage', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    unset: function(key) {
      delete $window.localStorage[key];
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
})

.factory('$authConfig', function($config) {
  var isMob = window.cordova !== undefined;
  return function(module) {
    return {
      apiUrl: $config.host() + module,
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
});