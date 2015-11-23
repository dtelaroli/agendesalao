angular.module('shared.directives', [])

.directive('standardTimeNoMeridian', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      etime: '=etime'
    },
    template: "<strong>{{stime}}</strong>",
    link: function(scope, elem, attrs) {

      scope.stime = epochParser(scope.etime, 'time');

      function prependZero(param) {
        if (String(param).length < 2) {
          return "0" + String(param);
        }
        return param;
      }

      function epochParser(val, opType) {
        if (val === null) {
          return "00:00";
        } else {
          if (opType === 'time') {
            var hours = parseInt(val / 3600);
            var minutes = (val / 60) % 60;

            return (prependZero(hours) + ":" + prependZero(minutes));
          }
        }
      }

      scope.$watch('etime', function(newValue, oldValue) {
        scope.stime = epochParser(scope.etime, 'time');
      });

    }
  };
})

.directive('ionicAutocomplete', function ($ionicPopover, ProfileService) {
  var popoverTemplate = 
   '<ion-popover-view style="margin-top:5px">' + 
       '<ion-content>' +
           '<div class="list">' +
              '<a class="item" ng-repeat="item in items" ng-click="selectItem(item)">{{item.name}}</a>' +
           '</div>' +
       '</ion-content>' +
   '</ion-popover-view>';
  return {
      restrict: 'A',
      scope: {
          params: '=ionicAutocomplete',
          inputSearch: '=ngModel'
      },
      link: function ($scope, $element, $attrs) {
          var popoverShown = false;
          var popover = null;
          $scope.items = [];

          $($element).keyup(function() {
              ProfileService.query({q: $scope.inputSearch}, function(profiles) {
                  $scope.items = profiles;
              });
          });

          //Add autocorrect="off" so the 'change' event is detected when user tap the keyboard
          $element.attr('autocorrect', 'off');


          popover = $ionicPopover.fromTemplate(popoverTemplate, {
              scope: $scope
          });
          $scope.$watch('items', function (items) {
              if (!popoverShown && items.length > 0) {
                  popover.show($element);
              }
          });

          $scope.selectItem = function (item) {
              $element.val(item.display);
              popover.hide();
              var popoverShown = false;
              $scope.params.onSelect(item);
          };
      }
  };
})

;
