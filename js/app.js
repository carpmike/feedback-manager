'use strict';

var app = angular.module('myApp', [
    'ngTouch',
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'http-auth-interceptor',
    'myApp.domainClasses',
    'myApp.controllers'
]);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/people', {templateUrl: 'partials/people-list.html', controller: 'PeopleListCtrl'});
    $routeProvider.when('/people/:personId', {templateUrl: 'partials/people-detail.html', controller: 'PersonDetailCtrl'});
    $routeProvider.when('/feedback', {templateUrl: 'partials/feedback-list.html', controller: 'FeedbackListCtrl'});
    $routeProvider.when('/feedback/:feedbackId', {templateUrl: 'partials/feedback-form.html', controller: 'FeedbackCtrl'});
    $routeProvider.when('/categories', {templateUrl: 'partials/category-list.html', controller: 'CategoryListCtrl'});
    $routeProvider.otherwise({redirectTo: '/feedback'});
}]);