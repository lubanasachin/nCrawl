'use strict';

/**
 * @ngdoc function
 * @name crawlReportApp.controller:reportCtrl
 * @description
 * Controller of the crawlReportApp
 */

angular.module('crawlReportApp')

	.controller('reportCtrl',['$scope','$http', function($scope,$http) {

		//get data from redis
		$scope.getData = function() {
			$http({
				url: "http://localhost:8000/crawl/",
				method: "GET",
                })
                .then(function(response,status) {
					var respdata = response.data;
					if(respdata.status == 'error') {
						console.log(resdata.descr);
					} else {
						var respObj = [],
							items = respdata.data;
						$scope.totalRecords = items.length;
	           			items.forEach(function(item) {
                			var itemObj = JSON.parse(item),
                    			link 	= Object.keys(itemObj),
								images 	= itemObj[link[0]]['images'],
								css 	= itemObj[link[0]]['css'],
								js 		= itemObj[link[0]]['script'];
							respObj.push({
								'link': link[0],
								'images': images,
								'css'	: css,
								'js'	: js
							});
						});
						$scope.reportData = respObj;
					}
                },function(response,status) {
                	console.log("Error!");
                });
		}

		//show modal dialog box
		$scope.showModal = function(url,type,data) {
			document.getElementById("overlayDiv").style.display = "block";
			document.getElementById("boxTitle").innerHTML = type.toUpperCase();
			var dataStr = '<table style="border:none;">';
			data.forEach(function(cont) {
				dataStr += "<tr><td style='text-align:left;text-indent:10px;'>"+cont+"</td></tr>";
			});
			dataStr += "</table>";
			document.getElementById("boxMessage").innerHTML = dataStr;
		}

		//close modal dialog box
		$scope.closeModal = function() {
			document.getElementById("overlayDiv").style.display = "none";
		}

		$scope.getData();
}]);
