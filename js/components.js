var components = angular.module('myApp.components', []);

components.service('modal', function($modal, $timeout) {
  var extended = angular.extend($modal);
  $modal.openExtended = function(modalOptions) {
    var modalInstance = $modal.open(modalOptions);
    console.log("Got the focus: " + modalOptions.focus);
    if (typeof(modalOptions.focus) != "undefined") {
      modalInstance.opened.then( function() {
        $timeout(function() {
          document.getElementById(modalOptions.focus).focus();
          // the 400 is ms for the timeout to wait to fire
        }, 400);
      });
    }
    return modalInstance;
  };
  return extended;
});