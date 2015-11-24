angular.module('shared.configs', [])

.factory('$config', function() {
  var $data = {
    // host: 'http://localhost:3000'    
    host: 'https://warm-dusk-4656.herokuapp.com'
  };

  var configs = {
    host: function() {
      return $data.host + $data.module;
    },

    auth: function(module) {
      $data.module = module;
      return configs.host();
    },

    set: function(key, value) {
      $data[key] = value;
    },

    get: function(key) {
      return $data[key];
    }
  };

  return configs;
});