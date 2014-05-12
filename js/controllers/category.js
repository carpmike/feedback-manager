var categoryController = angular.module('myApp.controller.category', [])
    .controller('CategoryListCtrl', ['$rootScope', '$scope', '$modal', '$route', 'categories', function ($rootScope, $scope, $modal, $route, categories) {
        categories.getCategories().then(function(results) {
            $scope.categories = results;
        });

        $scope.open = function (categoryId) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/category-detail.html',
                controller: categoryDetailCtrl,
                resolve: {
                    category: function() {
                        if ($scope.categories && categoryId) {
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
                    $rootScope.$broadcast('event:alert-success', 'Successfully saved ' + category.name + '!');
                }, function(results) {
                	$route.reload();
                    $rootScope.$broadcast('event:alert-failure', 'Failed to save ' + category.name + '! Problem is ' + results.status + '.');
                });
            });
        };

    }]);

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