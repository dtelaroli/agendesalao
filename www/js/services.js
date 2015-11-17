angular.module('starter.services', ['ngResource'])

.factory('CONFIG', function() {
  return {
    // host: 'https://warm-dusk-4656.herokuapp.com/owner'
    host: 'http://localhost:3000/owner'
  };
})

.factory('CepService', function($resource) {
  return $resource('https://viacep.com.br/ws/:cep/json/unicode', {}, {
    get: {
      headers: {'Accept': 'application/json'}
    }
  });
})

.factory('ProfileService', function($resource, CONFIG) {
  return $resource(CONFIG.host + '/profiles/:id.:format', {format: 'json'}, {
    update: {
      method: 'PUT'
    }
  });
})

.factory('ScheduleService', function($resource, CONFIG) {
  return $resource(CONFIG.host + '/schedules/:id.:format', {format: 'json'}, {
    update: {
      method: 'PUT'
    }
  });
});