angular.module('shared.configs', [])

.factory('$data', function() {
  var data = {
    host: 'http://localhost:3000'    
    // host: 'https://warm-dusk-4656.herokuapp.com'
  };
  return data;
})

.factory('$config', function($data) {
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
    },
    $data: function() {
      return $data;
    }
  };

  return configs;
});