'use strict';

var mainModule = angular.module('myApp.controllers', ['ngResource', 'http-auth-interceptor'])
    .controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$modal', 'authService', function ($scope, $rootScope, $http, $location, $modal, authService) {
        // set this in case there is a deep link - use it first, then remove it in "changePath"
        $scope.firstPath = $location.url();
        // tabs control what gets loaded in main content area
        $scope.changePath = function(path) {
            // if there is a deep link, go there first, then do it right for all future navigation
            if ($scope.firstPath) {
                $location.url($scope.firstPath);
                $scope.firstPath = null;
            } else {
                $location.url(path);
            }
        };

        // handle the authn error by forcing login - uses the auth.js modules
        $rootScope.$on('event:auth-loginRequired', function(event, rejection) {
            // console.log("got the login required event with status: " + rejection.status);  
            var modalInstance = $modal.open({
                templateUrl: 'partials/login-form.html',
                controller: loginCtrl
            });

            modalInstance.result.then(function (user) {
                var encodedUserNameAndPassword = window.btoa(user.username + ':' + user.password);
                $http.defaults.headers.common['Authorization'] = 'Basic ' + encodedUserNameAndPassword;
                console.log("auth string: " + $http.defaults.headers.common['Authorization']);
                authService.loginConfirmed();
            }); 
        });
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
                        return findInList($scope.people, personId);s
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
    .controller('FeedbackListCtrl', ['$scope', '$location', '$routeParams', 'feedbacks', function ($scope, $location, $routeParams, feedbacks) {
        feedbacks.getFeedback().then(function(results) {
            $scope.feedback = results;
        });

        $scope.edit = function(feedbackId) {
            $location.url('/feedback/' + feedbackId);
        };
    }])    
    .controller('FeedbackCtrl', ['$scope', '$log','$routeParams', '$q', '$location', '$http', 'people', 'categories', 'feedbacks', 'feedbackTypes',  function ($scope, $log, $routeParams, $q, $location, $http, people, categories, feedbacks, feedbackTypes) {
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

var loginCtrl = function ($scope, $modalInstance) {
    var user = {"username":"", "password":""};
    $scope.user = user;

    $scope.login = function() {
        $modalInstance.close($scope.user);
    };
};