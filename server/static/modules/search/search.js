var searchCtrl = [ '$scope', '$rootScope', '$state', '$stateParams', '$http', function($scope, $rootScope, $state, $stateParams, $http) {
	var content = $state.params.searchText;
	$scope.content = content;
} ];

