angular.module('celebrities', [
	'ui.router',
	'oc.lazyLoad',
]).run([ 
	'$rootScope', 
	'$state', 
	'$stateParams', 
	function($rootScope, $state, $stateParams) {
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
	} 
]).config([ 
	'$stateProvider', 
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
		$stateProvider.state('home', {
			url: '/',
			templateUrl: '/static/modules/home/home.html',
			controller: homeCtrl,
		}).state('main', {
			url: '/cele',
			templateUrl: '/static/modules/common/nav.html',
			controller: navCtrl,
			abstract: true,
		}).state('main.search', {
			url: '/search/:searchText',
			templateUrl: '/static/modules/search/search.html',
			controller: searchCtrl,
		}).state('main.view', {
			url: '/view/:id',
			templateUrl: '/static/modules/view/view.html',
			controller: viewCtrl,
		}).state('404', {});
	} 
]).controller('mainCtrl', mainCtrl);
