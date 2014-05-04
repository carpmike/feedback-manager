var mainModule = angular.module('myApp.controllers', ['ngResource', 'http-auth-interceptor', 'LocalStorageModule'])
    .controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$modal', '$resource', 'authService', 'localStorageService',
        function ($scope, $rootScope, $http, $location, $modal, $resource, authService, localStorageService) {
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

        // clean up the login failure flag
        $rootScope.$on('event:auth-loginConfirmed', function(event) {
            $rootScope.failedFirstTry = null;
        });

        // handle the authn error by forcing login - uses the auth.js modules
        $rootScope.$on('event:auth-loginRequired', function(event, rejection) {
            // console.log("got the login required event with status: " + rejection.status);  
            // check to see if the token is in local storage and if it is, add it to the http headers, otherwise prompt the user for credentials
            var authToken = localStorageService.get('FeedbockAuthToken');
            if (!rejection.failedFirstTry && authToken) {
                $http.defaults.headers.common['x-auth-token'] = authToken;
                authService.loginConfirmed();
                return;
            }

            $rootScope.failedFirstTry = rejection.failedFirstTry;

            var modalInstance = $modal.open({
                templateUrl: 'partials/login-form.html',
                controller: loginCtrl
            });

            modalInstance.result.then(function (user) {
                $http.post(fbURL + '/api/login',
                            {"username":user.username, "password":user.password},
                            {"ignoreAuthModule":true})
                    .success(function(results) {
                    
                    console.log("auth token: " + results.token);
                    $http.defaults.headers.common['x-auth-token'] = results.token;
                    
                    // store the token in local storage
                    localStorageService.set('FeedbockAuthToken', results.token);

                    // notify login confirmed
                    authService.loginConfirmed();
                })
                .error(function(data,status) {
                    console.log("got a failure when trying to authenticate: " + status);
                    $rootScope.$broadcast('event:auth-loginRequired', {"status":status, "failedFirstTry":true});
                });
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
                });
            });
        };
    }])
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
    .controller('FeedbackCtrl', ['$scope', '$log','$routeParams', '$q', '$location', '$http', 'people', 'categories', 'feedbacks', 'feedbackTypes',
                function ($scope, $log, $routeParams, $q, $location, $http, people, categories, feedbacks, feedbackTypes)
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
                // post save
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
    }])
    .controller('CategoryListCtrl', ['$scope', '$modal', '$route', 'categories', function ($scope, $modal, $route, categories) {
        categories.getCategories().then(function(results) {
            $scope.categories = results;
        });

        $scope.open = function (categoryId) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/category-detail.html',
                controller: categoryDetailCtrl,
                resolve: {
                    category: function() {
                        if ($scope.people && personId) {
                            return findInList($scope.categories, categoryId);
                        }
                        return;
                    }
                }
            });

            modalInstance.result.then(function (category) {
                $scope.category = category;
                categories.saveCategory(category).then(function(results) {
                    $route.reload();
                });
            });
        };

    }])
    .directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.on(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
    });

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

var categoryDetailCtrl = function ($scope, $modalInstance, category) {
    if (!category) category = {"name":""};
    $scope.category = category;

    $scope.ok = function() {
        $modalInstance.close($scope.category);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};

var loginCtrl = function ($scope, $modalInstance, $http, localStorageService) {
    var user = {"username":"", "password":""};
    $scope.user = user;
    console.log("failed first try? " + $scope.failedFirstTry);

    $scope.login = function() {
        $modalInstance.close($scope.user);
    };
};