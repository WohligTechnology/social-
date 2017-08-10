(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('SubscribeListController', SubscribeListController);

	SubscribeListController.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', '$filter', '$compile', 'toasty'];

	function SubscribeListController($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, $filter, $compile, toasty) {
		$scope.isSubscribeEmpty = true;
		$scope.gotoAnchor = function (x) {
			var elm = $(x);
			var elmTop;
			if (x) {
				elmTop = elm.offset().top;
			} else {
				elmTop = 1;
			}
			$("body").animate({
				scrollTop: parseInt(elmTop - 83)
			}, "slow");
		};
		$scope.SubscribeList = {};
		$scope.subscribesUserList = [];
		$scope.isNextAvailable = true;

		function loadContent() {
			//console.log('loadContent');
			$scope.SubscribeList.slickConfig1Loaded = false;
			//var fullurl = 'service/sirf/pages?topic='+SubscribeList+'&limit='+limit+'&offset='+offset;
			var fullurl = 'http://59.163.47.61/service/sirfUser/getSubscribedUsers?userID=' + $routeParams.userId + '&limit=' + limit + '&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				console.log(data.subscribesUserList);
				$(data.subscribesUserList).each(function () {
					$scope.subscribesUserList.push(this);
				});
				if ($(data.subscribesUserList).length < limit) {
					$scope.isNextAvailable = false;
				}
				console.log('$scope.subscribesUserList');
				console.log($scope.subscribesUserList);
				if (data.statusCode == 1) {
					if ($scope.subscribesUserList.length > 0) {
						$scope.isSubscribeEmpty = false;
					} else {
						$scope.isSubscribeEmpty = true;
					}
					$scope.SubscribeList.slickConfig1Loaded = true;
					//console.log(data.userfavContent.mveafavList4);
					//console.log(favList);
					//console.log('$scope.favList');
					//console.log($scope.favList);
					//allTopics = {'topic':topics,'posts':$scope.topics.posts};
					offset = limit + offset;
					SessionService.unset('SubscribeList');
					//SessionService.set(0, JSON.stringify(allTopics));
					var scopeSubscribeList = $scope.SubscribeList;
					var setSubscribeList = {};
					//SessionService.set('topics', JSON.stringify($scope.topics));

					//SessionService.set('loadConNext', false);
					//$scope.allDataServ = JSON.parse(SessionService.get($routeParams.topic));
					// $scope.topics = $scope.allDataServ[$routeParams.topic];
					/*$scope.isloadConNext = JSON.parse(SessionService.get('loadConNext'));
							  if($scope.isloadConNext){
									$scope.topics = $scope.allDataServ[1][$routeParams.topic];
								  } else {
									$scope.topics = $scope.allDataServ[0][$routeParams.topic];
								  }*/
					loadOnSucess();
				}
			});
		}

		var limit = 25;
		var offset = 0;
		$scope.SubscribeList.slickConfig1Loaded = true;
		loadContent();
		$scope.isValidUser = false;
		if ($routeParams.userId == $rootScope.userDetails.user_Id) {
			$scope.isValidUser = true;
		} else {
			$scope.isValidUser = false;
		}


		function loadOnSucess() {
			$scope.nextList = function () {
				loadContent();
			}

			$scope.getPerm = function (permlink) {
				var permalink = permlink.split('/');
				return permalink[permalink.length - 2];
			}
			$scope.SubscribeList.slickConfig1Loaded = true;
		};
		$scope.isloadingremoveSubscribe = false;
		$scope.unsubscribeuser = function (user, $event) {
			$scope.isloadingremoveSubscribe = true;
			var currentIndex = $($event.currentTarget).closest('.subscribengrepeat').index('.subscribengrepeat');
			var fullurl = 'service/sirfUser/subscriberPage';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"subscriberUserId": user,
					"action": "DELETE"
				}, //'Action=UP_VOTE&topicId='+$scope.currentID
			}).then(function (data) {
				//console.log(data.data);
				if (data.data.success == true) {
					$($event.currentTarget).closest('.slick-slide.slick-active').remove();
					toasty.info({
						title: 'Successfully Unsubscribe',
						msg: 'You have successfully unsubscribe ' + user + ' !'
					});
				} else {
					toasty.error({
						title: 'Not Unsubscribe',
						msg: 'Some technical issues are occured, not Unsubscribe!'
					});
				}
				$scope.isloadingremoveSubscribe = false;
			});
		}



	}

})();