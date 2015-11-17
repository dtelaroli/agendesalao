angular.module('starter.services', ['ngResource'])

.factory('API', function() {
  return {
    host: 'https://warm-dusk-4656.herokuapp.com'
  };
})

.factory('CepService', function($resource) {
  return $resource('https://viacep.com.br/ws/:cep/json/unicode', {}, {
    get: {
      headers: {'Accept': 'application/json'}
    }
  });
})

.factory('ProfileService', function($resource, API) {
  return $resource(API.host + '/profiles/:id.:format', {format: 'json'}, {
    update: {
      method: 'PUT'
    }
  });
})

.factory('ScheduleService', function($resource, API) {
  return $resource(API.host + '/schedules/:id.:format', {format: 'json'}, {
    update: {
      method: 'PUT'
    }
  });
});;