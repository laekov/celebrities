var navCtrl = [ '$scope', '$rootScope', '$state', '$stateParams', '$http', '$timeout', function($scope, $rootScope, $state, $stateParams, $http, $timeout) {
	$scope.searchcontent = $state.params.searchText || $rootScope.searchText;
	$scope.search = function() {
		var text = $scope.searchcontent.trim();
		if (text.length > 0) {
			$rootScope.searchText = text;
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

