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

//var fbURL = 'http://feedback-web.carpmike.cloudbees.net';
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
                        console.log("Success: " + results.status);
                        return results.data;               
                    }, function(results){
                        //error
                        console.log("Error: " + results.status);
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
                            return results.data; 
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
                var categoriesPromise = $http.get(fbURL + '/categories', { cache: true, timeout: to })
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

