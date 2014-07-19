angular.module('myApp.filters', [])
    .filter('yesNoFilter', function ($log) {
        return function (val, postfix) {
            var result = 'No';
            if (val === true) {
                result = 'Yes';
            }
            return result;
        };
    });