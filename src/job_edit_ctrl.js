app.controller('JobEditCtrl', function ($rootScope, $scope) {
  // Listen for job descriptions from on high.
  $scope.$on('job', function(evt, job) {
    $scope.editjob = job;
  })

  $scope.update = function() {
    $rootScope.$broadcast('updatedJob', $scope.editjob);
  }
});
