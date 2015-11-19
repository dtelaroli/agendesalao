angular.module('starter.configs', [])

.factory('$config', function() {
  return {
    host: 'https://warm-dusk-4656.herokuapp.com/owner'
    // host: 'http://localhost:3000/owner'
  };
});