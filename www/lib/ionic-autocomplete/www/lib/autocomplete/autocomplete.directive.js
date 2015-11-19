angular.module('autocomplete.directive', ['ngResource'])

.directive('ionicAutocomplete',
    function ($ionicPopover, $resource) {
        var popoverTemplate = 
         '<ion-popover-view style="margin-top:5px">' + 
             '<ion-content>' +
                 '<div class="list">' +
                    '<a class="item" ng-repeat="item in items" ng-click="selectItem(item)">{{item.display}}</a>' +
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
                    if($scope.inputSearch.length > 2) {
                        var ProfileService = new $resource('https://warm-dusk-4656.herokuapp.com/owner/profiles.json');
                        ProfileService.query(function(profiles) {
                            $scope.items = [{id: 1, display: 'foo'}];
                        })
                    }
                });

                //Add autocorrect="off" so the 'change' event is detected when user tap the keyboard
                $element.attr('autocorrect', 'off');


                popover = $ionicPopover.fromTemplate(popoverTemplate, {
                    scope: $scope
                });
                $element.on('focus', function (e) {
                    if (!popoverShown) {
                        popover.show(e);
                    }
                });

                $scope.selectItem = function (item) {
                    $element.val(item.display);
                    popover.hide();
                    $scope.params.onSelect(item);
                };
            }
        };
    }
);
