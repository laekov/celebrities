var homeCtrl = [ '$scope', '$rootScope', '$state', '$stateParams', '$http', function($scope, $rootScope, $state, $stateParams, $http) {
	$scope.searchcontent = '';
	$scope.search = function() {
		var text = $scope.searchcontent.trim();
		if (text.length > 0) {
			$state.go('main.search', {
				searchText: text
			});
		}
	};
	$('#searchtext').keydown(function(key) {
		if (key.which === 13) {
			$scope.search();
		}
	});
} ];

