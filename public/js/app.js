'use strict';
/**
 * @ngdoc Crawling Report Application
 * @name crawlReportApp
 * @description
 *
 * Main module of the application.
 */
angular
	.module('crawlReportApp', ['oc.lazyLoad','ui.router'])
	.config(['$stateProvider','$urlRouterProvider','$ocLazyLoadProvider',function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider) {
		$ocLazyLoadProvider.config({debug:false,events:true});
		
		//defaults to report
		$urlRouterProvider.otherwise('/report');

		//state provider
		$stateProvider

			.state('report',{
				templateUrl:'views/report.html',
				url:'/report',
				controller:'reportCtrl',
				resolve: {
					loadMyFiles:function($ocLazyLoad) {
						return $ocLazyLoad.load({
							name:'crawlReportApp',
							files:[
								'scripts/controllers/report.js'
							]
						})
					}
				}
			})


	}]);

    
