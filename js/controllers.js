'use strict';

var mainModule = angular.module('myApp.controllers', ['ngResource'])
    .controller('MainCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {

        // tabs control what gets loaded in main content area
        $scope.changePath = function(path) {
            $location.url(path);
        };
    }])
    .controller('PeopleListCtrl', ['$scope', '$modal', 'people', function ($scope, $modal, people) {
        
        people.getPeople().then(function(results) {
            $scope.people = results;
        });

        $scope.open = function (personId) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/people-detail.html',
                controller: personDetailCtrl,
                resolve: {
                    person: function() {
                        return findInList($scope.people, personId);;
                    }
                }
            });

            modalInstance.result.then(function (person) {
                $scope.person = person;
                people.savePerson(person);
                alert("Updated person: " + person.lastName);
            });
        };
    }])
    .controller('FeedbackListCtrl', ['$scope', '$log','feedbacks', function ($scope, $log, feedbacks) {
        feedbacks.getFeedback().then(function(results) {
            $scope.feedback = results;
        });
    }])    
    .controller('FeedbackCtrl', ['$scope', '$log','$routeParams', '$http', 'people', 'categories', 'feedbacks', 'feedbackTypes',  function ($scope, $log, $routeParams, $http, people, categories, feedbacks, feedbackTypes) {
        $scope.master = {};
        $log.info("person id: " + $routeParams.personId);

        feedbacks.getFeedback($routeParams.feedbackId).then(function(results) {
            results.date = new Date(results.date);
            $scope.fb = results;
            $scope.category = results.category;

            people.getPeople().then(function(results) {
                $scope.person = findInList(results, $routeParams.personId);
                $scope.fb.person = $scope.person;
            });

            categories.getCategories().then(function(results) {
                $scope.categories = results;
                $scope.fb.category = findInList(results, $scope.fb.category.id);
            });

            feedbackTypes.getFeedbackTypes().then(function(results) {
                $scope.feedbackTypes = results;
                $scope.fb.feedbackType = findInList(results, $scope.fb.feedbackType.id);
            });
        });


        $scope.save = function(fb) {
            $log.info("saving");
            $http.put(fbURL + '/feedbacks/' + fb.id, fb).success(function(results){
                $scope.master = angular.copy(fb);
            })
            .error(function(data,status) {
                alert("Failed to save feedback. HTTP status: " + status);
            });
        };

        $scope.reset = function() {
            $log.info("resetting");
            $scope.fb = angular.copy($scope.master);
        };

        $scope.isUnchanged = function(fb) {
            return angular.equals(fb, $scope.master);
        };

        $scope.reset();
    }]);

// modal controllers
var personDetailCtrl = function ($scope, $modalInstance, person) {
    $scope.person = person;

    $scope.ok = function() {
        $modalInstance.close($scope.person);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};