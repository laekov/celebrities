var advCtrl = [ '$scope', '$rootScope', '$state', '$stateParams', '$http', '$timeout', function($scope, $rootScope, $state, $stateParams, $http, $timeout) {
	$scope.ctnts = {};
	($scope.searchLabels = [ 'name', 'born', 'education', 'occupation', 'nationality' ]).forEach(function(i, x) {
		$scope.ctnts[i] = '';
	});
	
	$scope.fixLen = function(x) {
		while (x.length < 12) {
			x += ' ';
		}
		return x;
	};
	$scope.search = function() {
		var text = [];
		$scope.searchLabels.forEach(function(x, i) {
			if (typeof($scope.ctnts[i]) === 'string' && $scope.ctnts[i].length) {
				text.push(x + ':' + $scope.ctnts[i].replace(/ /g, '_'));
			}
		});
		if (text.length > 0) {
			$state.go('main.search', {
				searchText: text.join(' ')
			}, {
				reload: true
			});
		}
	};
} ];
