var peopleController = angular.module('myApp.controller.people', [])
    .controller('PeopleListCtrl', ['$rootScope', '$scope', 'modal', '$route', 'people', function ($rootScope, $scope, modal, $route, people) {
        
        people.getPeople().then(function(results) {
            $scope.people = results;
        });

        $scope.open = function (personId) {
            var modalInstance = modal.openExtended({
                templateUrl: 'partials/people-detail.html',
                controller: personDetailCtrl,
                focus: "peopleDetailFirstName",
                resolve: {
                    person: function() {
                        if ($scope.people && personId) {
                            return findInList($scope.people, personId);
                        }
                        return;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                person = data[0];
                action = data[1];
                $scope.person = data[0];
                if (action === "save") {
                    people.savePerson(person).then(function(results) {
                        $route.reload();
                        $rootScope.$broadcast('event:alert-success', 'Successfully saved ' + person.firstName + ' ' + person.lastName + '!');
                    }, function(results) {
                        $rootScope.$broadcast('event:alert-failure', 'Failed to save ' + person.firstName + ' ' + person.lastName + '! Problem is ' + results.status + '.');
                    });
                } else if (action === "delete") {
                    people.deletePerson(person.id).then(function(results) {
                        $route.reload();
                        $rootScope.$broadcast('event:alert-success', 'Successfully deleted person!');
                    }, function(results) {
                        $rootScope.$broadcast('event:alert-failure', 'Failed to delete person! Problem is ' + results.status + '.');
                    });
                }
            });
        };
    }]);

// modal controllers
var personDetailCtrl = function ($scope, $modalInstance, person) {
    if (!person) person = {"firstName":"", "lastName":""};
    $scope.person = person;

    $scope.save = function() {
        $modalInstance.close([$scope.person, "save"]);
    };

    $scope.delete = function() {
        $modalInstance.close([$scope.person, "delete"]);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};
