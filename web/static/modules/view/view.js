var viewCtrl = [ '$scope', '$rootScope', '$state', '$stateParams', '$http', function($scope, $rootScope, $state, $stateParams, $http) {
	var id = $state.params.id;
	$scope.info = 'Fetching';
	$scope.infotype = 'info';
	$http.get('/static/data/' + id + '.html').then(function(data) {
		$scope.info = '';
		var rawStr = data.data;
		rawStr = rawStr.replace(/\/wiki\//g, 'https://en.wikipedia.org/wiki/');
		var ele = $(rawStr);
		$('#rawtable').html(ele.html());
	}).catch(function(error) {
		$scope.infotype = 'danger';
		$scope.info = 'Error: Person not found';
	});
} ];

