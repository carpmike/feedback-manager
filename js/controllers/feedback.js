var feedbackController = angular.module('myApp.controller.feedback', [])
    .controller('FeedbackListCtrl', ['$scope', '$location', '$routeParams', 'feedbacks', function ($scope, $location, $routeParams, feedbacks) {
        feedbacks.getFeedback().then(function(results) {
            $scope.feedback = results;
        });

        $scope.open = function() {
            $location.url('/feedback/0');
        };

        $scope.edit = function(feedbackId) {
            $location.url('/feedback/' + feedbackId);
        };
    }])
    .controller('FeedbackCtrl', ['$rootScope', '$scope', '$log','$routeParams', '$q', '$location', '$http', 'people', 'categories', 'feedbacks', 'feedbackTypes',
                function ($rootScope, $scope, $log, $routeParams, $q, $location, $http, people, categories, feedbacks, feedbackTypes)
        {
        // $scope.master = {};

        $scope.returnToList = function() {
            $location.url('/feedback');
        };

        if (parseInt($routeParams.feedbackId, 10) < 1) {
            $scope.fb = {id: null};

            $q.all([
                people.getPeople().then(function(results) {
                    $scope.people = results;
                }),
                categories.getCategories().then(function(results) {
                    $scope.categories = results;
                }),
                feedbackTypes.getFeedbackTypes().then(function(results) {
                    $scope.feedbackTypes = results;
                })
            ])
            .then(function() {
            });
        } else {
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
        }

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.save = function(fb) {
            $log.info("saving fb: " + fb.id + " text: " + fb.text);
            feedbacks.saveFeedback(fb).then(function(results) {
                $rootScope.$broadcast('event:alert-success', 'Successfully saved feedback!');
            }, function(results) {
                $rootScope.$broadcast('event:alert-failure', 'Failed to save feedback! Problem is ' + results.status + '.');
            });
        };

        $scope.delete = function(fb) {
            $log.info("deleting fb: " + fb.id);
            feedbacks.deleteFeedback(fb.id).then(function(results) {
                $scope.returnToList();
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
