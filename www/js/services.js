angular.module('shared.services', ['ngResource'])

.factory('$data', function() {
  var data = {};
  return {
    set: function(key, value) {
      data[key] = value;
    },
    get: function(key) {
      return data[key];
    }
  };
})

.factory('CepService', function($resource) {
  return $resource('https://viacep.com.br/ws/:cep/json/unicode', {}, {
    get: {
      headers: {'Accept': 'application/json'}
    }
  });
})

.factory('ProfileService', function($resource, $config) {
  return $resource($config.host + '/profiles/:id.:format', {format: 'json'}, {
    update: {
      method: 'PUT'
    }
  });
})

.factory('ScheduleService', function($resource, $config) {
  return $resource($config.host + '/schedules/:id.:format', {format: 'json'}, {
    saveAll: {
      method: 'POST',
      isArray: true
    },
    update: {
      method: 'PUT'
    }
  });
});