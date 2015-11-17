angular.module('owner.filters', [])

.filter('day', function() {
  return function(day) {
    var days = {
      'mon': 'Segunda-Feira',
      'tue': 'Terça-Feira',
      'wed': 'Quarta-Feira',
      'thu': 'Quinta-Feira',
      'fri': 'Sexta-Feira',
      'sat': 'Sábado',
      'sun': 'Domingo'
    };
    return day === undefined ? days : days[day];
  }
});