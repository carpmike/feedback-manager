'use strict';

var mainModule = angular.module('myApp.controllers', ['ngResource'])
    .controller('MainCtrl', ['$scope', '$rootScope', '$window', '$location', function ($scope, $rootScope, $window, $location) {

        // tabs control what gets loaded in main content area
        $scope.changePath = function(path) {
            $location.url(path);
        };
    }])
    .controller('PeopleListCtrl', ['$scope', '$modal', '$route', 'people', function ($scope, $modal, $route, people) {
        
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
                people.savePerson(person).then(function(results) {
                    $route.reload();
                });
            });
        };
    }])
    .controller('FeedbackListCtrl', ['$scope', '$location', 'feedbacks', function ($scope, $location, feedbacks) {
        feedbacks.getFeedback().then(function(results) {
            $scope.feedback = results;
        });

        $scope.edit = function(feedbackId) {
            $location.url('/feedback/' + feedbackId);
        };
    }])    
    .controller('FeedbackCtrl', ['$scope', '$log','$routeParams', '$q', '$http', 'people', 'categories', 'feedbacks', 'feedbackTypes',  function ($scope, $log, $routeParams, $q, $http, people, categories, feedbacks, feedbackTypes) {
        // $scope.master = {};

        $scope.returnToList = function() {
            $location.url('/feedback');
        };

        feedbacks.getFeedback($routeParams.feedbackId).then(function(results) {
            results.date = new Date(results.date);
            $scope.fb = results;
            $log.info("feedback id: " + $scope.fb.id + " text:" + $scope.fb.text);
            $scope.category = results.category;

            $q.all([
                people.getPeople().then(function(results) {
                    $scope.person = findInList(results, $scope.fb.person.id);
                    $scope.fb.person = $scope.person;
                    $log.info("peeps");
                }),
                categories.getCategories().then(function(results) {
                    $scope.categories = results;
                    $scope.fb.category = findInList(results, $scope.fb.category.id);
                    $log.info("cats");
                }),
                feedbackTypes.getFeedbackTypes().then(function(results) {
                    $scope.feedbackTypes = results;
                    $scope.fb.feedbackType = findInList(results, $scope.fb.feedbackType.id);
                    $log.info("types");
                })
            ])
            .then(function() {
                // $scope.master = angular.copy($scope.fb);
                // $scope.reset();
                // $log.info("all - master: " + $scope.master.person.firstName);
            });
        });

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.save = function(fb) {
            $log.info("saving fb: " + fb.id + " text: " + fb.text);
            $http.put(fbURL + '/feedbacks/' + fb.id, fb).success(function(results){
                // $scope.master = angular.copy(fb);
            })
            .error(function(data,status) {
                alert("Failed to save feedback. HTTP status: " + status);
            });
        };

        // $scope.reset = function() {
        //     $log.info("resetting - master: " + $scope.master.feedbackType.id);
        //     $scope.fb = angular.copy($scope.master);
        //     $log.info("reset - fb: " + $scope.fb.feedbackType.id);
        //     $scope.fb.feedbackType = $scope.master.feedbackType;
        // };

        // $scope.isUnchanged = function(fb) {
        //     return angular.equals(fb, $scope.master);
        // };
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