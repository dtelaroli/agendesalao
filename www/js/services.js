angular.module('starter.services', ['ngResource'])

.factory('CepService', function($resource) {
  return $resource('https://viacep.com.br/ws/:cep/json/unicode', {}, {
    get: {
      headers: {'Accept': 'application/json'}
    }
  });
})

.factory('UserService', function($resource) {
  return $resource('http://localhost:3000/users/:action.:format', {format: 'json'});
});