var mainController = angular.module('myApp.controller.main', ['ngResource', 'http-auth-interceptor', 'LocalStorageModule'])
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

        // for alert messages;
        $rootScope.alerts = [];

        $rootScope.$on('event:alert-success', function(event, message) {
            $rootScope.alerts.push({type: 'success', msg: message});
        });

        $rootScope.$on('event:alert-failure', function() {

        });

        $rootScope.addAlert = function() {
            $rootScope.$broadcast('event:alert-success');
        };

        $rootScope.closeAlert = function(index) {
            $rootScope.alerts.splice(index, 1);
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
    }]);

// modal controllers
var loginCtrl = function ($scope, $modalInstance, $http, localStorageService) {
    var user = {"username":"", "password":""};
    $scope.user = user;
    console.log("failed first try? " + $scope.failedFirstTry);

    $scope.login = function() {
        $modalInstance.close($scope.user);
    };
};