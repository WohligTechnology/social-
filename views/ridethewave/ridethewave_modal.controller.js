(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('RidethewaveModalContoller', RidethewaveModalContoller);

	RidethewaveModalContoller.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$filter', '$sce', 'Utils', 'toasty'];

	function RidethewaveModalContoller($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, MyCache, $filter, $sce, Utils, toasty) {
		$scope.isloading1 = false;
		$scope.getBoardsModal = function () {
			$scope.isloading1 = true;
			var fullurl = 'http://59.163.47.61/service/sirfUser/getRidetheWaveforUser';
			$http.get(fullurl).success(function (data) {
				//console.log(data);
				if (data.statusCode == 1) {
					$scope.boardsModal = data.topicMasterList;
					$scope.isloading1 = false;

				}
				//console.log(single_object);
			});
		}
		$scope.getBoardsModal();
		$scope.selectTopic = function ($event) {
			//console.log('selectTopic');
			var thisElement = $event.target;
			//console.log(thisElement);
			if (!$(thisElement).closest('li').hasClass('selectedtopic')) {
				$(thisElement).closest('li').addClass('selectedtopic');
			} else {
				$(thisElement).closest('li').removeClass('selectedtopic');
			}
		}
		$scope.saveRideTheWave = function () {
			$scope.topicIds = [];
			$('li.selectedtopic').each(function () {
				var prop = $(this).attr('topic_id');
				$scope.topicIds.push(prop);
			});
			console.log($scope.topicIds);
			$scope.isloading = true;
			var fullurl = 'http://59.163.47.61/service/sirfUser/saveRidetheWaveforUser';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"topicId": $scope.topicIds
				}
			}).then(function (data) {
				$scope.isloading = false;
				if (data.data == true) {
					toasty.info({
						title: 'Update Topics Interests',
						msg: 'You have successfully updated topics interests!'
					});
				} else {
					toasty.error({
						title: 'Unable to set topics interests',
						msg: 'Some technical issues are occured!'
					});
				}
			});
		}
	}

})();