var peopleController = angular.module('myApp.controller.people', [])
    .controller('PeopleListCtrl', ['$rootScope', '$scope', '$modal', '$route', 'people', function ($rootScope, $scope, $modal, $route, people) {
        
        people.getPeople().then(function(results) {
            $scope.people = results;
        });

        $scope.open = function (personId) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/people-detail.html',
                controller: personDetailCtrl,
                resolve: {
                    person: function() {
                        if ($scope.people && personId) {
                            return findInList($scope.people, personId);
                        }
                        return;
                    }
                }
            });

            modalInstance.result.then(function (person) {
                $scope.person = person;
                people.savePerson(person).then(function(results) {
                    $route.reload();
                    $rootScope.$broadcast('event:alert-success');
                });
            });
        };
    }]);

// modal controllers
var personDetailCtrl = function ($scope, $modalInstance, person) {
    if (!person) person = {"firstName":"", "lastName":""};
    $scope.person = person;

    $scope.ok = function() {
        $modalInstance.close($scope.person);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};
