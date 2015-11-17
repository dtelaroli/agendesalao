angular.module('owner.services', ['ngResource'])

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
    update: {
      method: 'PUT'
    }
  });
});