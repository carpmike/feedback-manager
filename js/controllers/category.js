var categoryController = angular.module('myApp.controller.category', [])
    .controller('CategoryListCtrl', ['$rootScope', '$scope', '$route', 'modal', 'categories', function ($rootScope, $scope, $route, modal, categories) {
        categories.getCategories().then(function(results) {
            $scope.categories = results;
        });

        $scope.open = function (categoryId) {
            var modalInstance = modal.openExtended({
                templateUrl: 'partials/category-detail.html',
                controller: categoryDetailCtrl,
                focus: "categoryName",
                resolve: {
                    category: function() {
                        if ($scope.categories && categoryId) {
                            return findInList($scope.categories, categoryId);
                        }
                        return;
                    }
                }
            });

            modalInstance.result.then(function (data) {
                category = data[0];
                action = data[1];
                $scope.category = category;
                if (action === "save") {
                    categories.saveCategory(category).then(function(results) {
                        $route.reload();
                        $rootScope.$broadcast('event:alert-success', 'Successfully saved ' + category.name + '!');
                    }, function(results) {
                        $rootScope.$broadcast('event:alert-failure', 'Failed to save ' + category.name + '! Problem is ' + results.status + '.');
                    });
                } else if (action === "delete") {
                    categories.deleteCategory(category.id).then(function(results) {
                        $route.reload();
                        $rootScope.$broadcast('event:alert-success', 'Successfully deleted category!');
                    }, function(results) {
                        $rootScope.$broadcast('event:alert-failure', 'Failed to delete category! Problem is ' + results.status + '.');
                    });
                }

            });
        };

    }]);

var categoryDetailCtrl = function ($scope, $modalInstance, category) {
    if (!category) category = {"name":""};
    $scope.category = category;

    $scope.save = function() {
        $modalInstance.close([$scope.category, "save"]);
    };

    $scope.delete = function() {
        $modalInstance.close([$scope.category, "delete"]);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};