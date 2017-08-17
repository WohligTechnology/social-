(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('RidethewaveContoller', RidethewaveContoller);

	RidethewaveContoller.$inject = ['$scope', '$timeout', '$cookies', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$filter', '$sce', 'Utils', 'toasty', '$ocModal', '$window'];

	function RidethewaveContoller($scope, $timeout, $cookies, $routeParams, $rootScope, SessionService, $parse, $http, MyCache, $filter, $sce, Utils, toasty, $ocModal, $window) {
		$rootScope.userDetails = $cookies.getObject('userDetails') || {};
		console.log($rootScope.userDetails.user_Id);
		$scope.isloading = false;
		$scope.usersBoards = [];
		$scope.getBoards = function () {
			$rootScope.getboardCalled = true;
			$scope.isloading = true;
			var fullurl = 'http://59.163.47.61/service/sirfUser/getRidetheWaveforUser';
			$http.get(fullurl).success(function (data) {
				//console.log(data);
				if (data.statusCode == 1) {
					$rootScope.boards = data.topicMasterList;
					$scope.usersBoards = data.topicUserList;
					if ($scope.usersBoards.length > 0) {

						console.log($scope.usersBoards);
						$scope.isloading = false;

						$($scope.usersBoards).each(function () {
							var Ids = this;
							var indexOfFilter = 0;
							$filter('filter')($rootScope.boards,
								function (d) {
									if (d.topic_Name == Ids) {
										d['selected'] = 'selectedtopic';
										//$rootScope.boards.splice(indexOfFilter, 1);
										$rootScope.boards[indexOfFilter] = d;
									}
									indexOfFilter = ++indexOfFilter;
									//return d.topic_id === Ids;
								})[0];
						});
					} else {
						$ocModal.open({
							url: 'ridethewavetpl.html',
							controller: 'RidethewaveContoller',
							closeOnEsc: false
						});
						$scope.isloading = false;
					}
				}
				//console.log(single_object);
			});
		}
		if ($rootScope.getboardCalled == false) {
			$scope.getBoards();
		}
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
		$scope.getPerm = function (permlink) {
			if (permlink) {
				var permalink = permlink.split('/');
				if (permalink[permalink.length - 2]) {
					return permalink[permalink.length - 2];
				}
			}
			//return permalink[permalink.length-2];
		}
		$scope.goBack = function () {
			$ocModal.close();
			$window.location.href = '#/';
		}
		$scope.saveRideTheWave = function () {
			$scope.isloading = true;
			$scope.topicIds = [];
			$('li.selectedtopic').each(function () {
				var prop = $(this).attr('topic_id');
				$scope.topicIds.push(prop);
			});
			console.log($scope.topicIds);
			var fullurl = 'http://59.163.47.61/service/sirfUser/saveRidetheWaveforUser';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"topicId": $scope.topicIds
				}
			}).then(function (data) {
				$ocModal.close();
				if (data.data.statusCode == 1) {
					toasty.info({
						title: 'Update Topics Interests',
						msg: 'You have successfully updated topics interests!'
					});
					if (data.data.sirfId) {
						$window.location.href = '#/ridethewave/details/' + data.data.topicName + '/' + data.data.sirfId + '/' + $scope.getPerm(data.data.permalink) + '/rideTheWave/' + $rootScope.userDetails.user_Id + '/0/0/0/';
					}
				} else {
					toasty.error({
						title: 'Unable to set topics interests',
						msg: data.data.statusMessage
					});
				}
				$scope.isloading = false;
			});
		}
	}

})();