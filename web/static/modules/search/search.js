var searchCtrl = [ '$scope', '$rootScope', '$state', '$stateParams', '$http', '$timeout', function($scope, $rootScope, $state, $stateParams, $http, $timeout) {
	var content = $state.params.searchText;
	$scope.content = content;
	var id = $state.params.id;
	$scope.info = 'Fetching';
	$scope.infotype = 'info';
	var dStart = Date.now();
	$scope.resAva = true;
	$http.post('/api/search', {
		content: content
	}).then(function(data) {
		var dEnd = Date.now();
		$scope.infotype = 'success';
		$scope.fullList = [];
		for (var i in data.data) {
			if (typeof(data.data[i]) !== 'number') {
				continue;
			}
			$scope.fullList.push({
				id: i,
				rank: data.data[i]
			});
		}
		$scope.info = 'Searching done. Used ' + (dEnd - dStart) + 'ms. Found ' + $scope.fullList.length + ' people.';
		$scope.fullList.sort(function(a, b) {
			return b.rank - a.rank;
		});
		$scope.totpage = $scope.fullList.length;
		$scope.curpage = 1;
		$scope.changePage();
	}).catch(function(error) {
		$scope.infotype = 'danger';
		$scope.info = 'Error: Server error';
	});
	$scope.curpage = 1;
	$scope.totpage = 1;
	$scope.pagesize = 16;
	var showPerson = function(pinfo) {
		var clst = $scope.content.split(' ');
		var hlname = pinfo.name || "No name";
		for (var i in clst) {
			hlname = hlname.replace(new RegExp(clst[i], 'gi'), function(orc) {
				return "<span class='hlsearch'>" + orc + "</span>";
			});
		}
		// hlname += '(' + pinfo.rank + ')';
		$('#pinfo_' + pinfo.id).find('#name').html(hlname);
		// $('#pinfo_' + pinfo.id).find('#content').html(pinfo.html);
	};
	$scope.changePage = function() {
		$timeout(function() {
			$scope.curList = $scope.fullList.slice(($scope.curpage - 1) * $scope.pagesize, $scope.curpage * $scope.pagesize);
			for (var i in $scope.curList) {
				if ($scope.curList[i].name === undefined) {
					$scope.fetchPerson($scope.curList[i], showPerson);
				} else {
					(function(i) {
						$timeout(function() {
							showPerson($scope.curList[i]);
						}, 100);
					})(i);
				}
			}
		}, 100);
	};
	$scope.fetchPerson = function(pinfo) {
		$http.get('/static/data/' + pinfo.id + '.html').then(function(data) {
			var ele = $(data.data);
			var namee = ele.find('.fn');
			if (namee.length > 1) {
				namee = $(namee[0]);
			}
			while (typeof(namee.children) === 'function' && namee.children().length > 0) {
				namee = $(namee.children()[0]);
			}
			pinfo.name = namee.html();
			pinfo.html = ele.html();
			showPerson(pinfo);
		}).catch(function(error) {
			pinfo.name = 'Error';
			pinfo.html = 'Error';
			showPerson(pinfo);
		});
	};
} ];

