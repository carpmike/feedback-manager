'use strict';

function findInList(list, id) {
    var it = null,
        l = list.length,
        i;
    for (i = 0; i < l; i = i + 1) {
        if (list[i].id == id) {
            it = list[i];
            break;
        }
    }
    return it;
}

// var fbURL = 'http://feedback-web.carpmike.cloudbees.net';
var fbURL = 'http://localhost:8080/feedback-web'
var to = 2000; // 2 second timeout

angular.module('myApp.domainClasses', [])
    .factory('people', ['$http', function ($http) {

        var people = {
            // returns a promise to get the people
            getPeople: function() {
                var peoplePromise = $http.get(fbURL + '/persons?max=50', { timeout: to })
                    .then(function(results){
                        //Success;
                        console.log(":FB:Success: " + results.status);
                        return results.data;               
                    }, function(results){
                        //error
                        console.log(":FB:Error: " + results.status);
                        return results.data;
                    });

                return peoplePromise;
            },
            savePerson: function(person) {
                var personPromise;
                if (person.id) {
                    personPromise = $http.put(fbURL + '/persons/' + person.id, person, { timeout: to })
                        .success(function(results){
                            console.log("Success: " + results.status);
                            return results.data; 
                        }).error(function(results, status){
                            alert("Failed to update person " + person.firstName + " " + person.lastName + ". HTTP status: " + status);
                            return results.data; 
                        });
                } else {
                    personPromise = $http.post(fbURL + '/persons', person, { timeout: to })
                        .success(function(results){
                            console.log("Success: " + results.status);
                            return results.data; 
                        }).error(function(results, status){
                            alert("Failed to save person " + person.firstName + " " + person.lastName + ". HTTP status: " + status);
                            return; 
                        });
                }

                return personPromise;
            }
        };

        return people;
    }])
    .factory('categories', ['$http', function ($http) {
        var categories = {
            // returns a promise to get the categories
            getCategories: function() {
                var categoriesPromise = $http.get(fbURL + '/categories', { timeout: to })
                    .then(function(results){
                        //Success;
                        console.log("Success: " + results.status);
                        return results.data;               
                    }, function(results){
                        //error
                        console.log("Error: " + results.status);
                        return results.data;
                    });

                return categoriesPromise;
            },
            saveCategory: function(category) {
                var categoryPromise;
                if (category.id) {
                    categoryPromise = $http.put(fbURL + '/categories/' + category.id, category, { timeout: to })
                        .success(function(results){
                            console.log("Success: " + results.status);
                            return results.data;
                        }).error(function(results, status){
                            alert("Failed to update category " + category.name + ". HTTP status: " + status);
                            return results.data;
                        });
                } else {
                    categoryPromise = $http.post(fbURL + '/categories', category, { timeout: to })
                        .success(function(results){
                            console.log("Success: " + results.status);
                            return results.data;
                        }).error(function(results, status){
                            alert("Failed to save category " + category.name + ". HTTP status: " + status);
                            return;
                        });
                }

                return categoryPromise;
            }
        };

        return categories;
    }])
    .factory('feedbacks', ['$http', function ($http) {
        var feedbacks = {
            // returns a promise to get the feedback
            getFeedback: function(fbId) {
                var feedbackPromise = $http.get(fbURL + '/feedbacks/' + (fbId ? fbId : ''))
                    .then(function(results){
                        //Success;
                        console.log("Success: " + results.status);
                        return results.data;               
                    }, function(results){
                        //error
                        console.log("Error: " + results.status);
                        return results.data;
                    });

                return feedbackPromise;
            }            
        };

        return feedbacks;
    }])
    .factory('feedbackTypes', ['$http', function ($http) {
        var feedbackTypes = {
            // returns a promise to get the feedbackTypes
            getFeedbackTypes: function() {
                var feedbackTypesPromise = $http.get(fbURL + '/feedbackTypes', { cache: true, timeout: to })
                    .then(function(results){
                        //Success;
                        console.log("Success: " + results.status);
                        return results.data;               
                    }, function(results){
                        //error
                        console.log("Error: " + results.status);
                        return results.data;
                    });

                return feedbackTypesPromise;
            }            
        };

        return feedbackTypes;
    }]);
    // .factory('httpInterceptor', ['$q', function ($q) {
    //     return {
    //         // On request success
    //         request: function (config) {
    //             console.log("request config: " + config); // Contains the data about the request before it is sent.

    //             // Return the config or wrap it in a promise if blank.
    //             return config || $q.when(config);
    //         },

    //         // On response success
    //         response: function (response) {
    //             // console.log(response); // Contains the data from the response.

    //             // Return the response or promise.
    //             return response || $q.when(response);
    //         },

    //         // On response failture
    //         responseError: function (rejection) {
    //             // console.log(rejection); // Contains the data about the error.
                
    //             if (rejection.status == 401) alert("response got a 401.");
                
    //             // Return the promise rejection.
    //             return $q.reject(rejection);
    //         }
    //     };
    // }])
    // .config(['$httpProvider', function ($httpProvider) {
    //     // Add the interceptor to the $httpProvider.
    //     $httpProvider.interceptors.push('httpInterceptor');
    // }]);

