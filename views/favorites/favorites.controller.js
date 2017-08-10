(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('FavoritesController', FavoritesController);

	FavoritesController.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', '$filter', 'toasty'];

	function FavoritesController($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, $filter, toasty) {
		$scope.isFavouriteEmpty = true;
		$scope.currentuserId = $routeParams.userId;
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
		$scope.isNextAvailable = true;

		function loadContent(favName) {
			//console.log('loadContent');
			$scope.favName.slickConfig1Loaded = false;
			allfavName = '';
			$rootScope.favName = favName;
			//var fullurl = 'service/sirf/pages?topic='+favName+'&limit='+limit+'&offset='+offset;
			var fullurl = 'http://59.163.47.61/service/sirfUser/getUserFavouritePosts?userID=' + $routeParams.userId + '&favouriteName=' + favName + '&currentUser=' + $rootScope.userDetails.user_Id + '&limit=25&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				if (data.statusCode == 1) {
					if (!$scope.favName) {
						$scope.favName = [];
						$scope.favName.topic = favName;
					}
					if (data.userfavContent[favName].length > 0) {
						$scope.isFavouriteEmpty = false;
					} else {
						$scope.isFavouriteEmpty = true;
					}
					if (data.userfavContent[favName].length < limit) {
						$scope.isNextAvailable = false;
					}
					//console.log(data.userfavContent.mveafavName4);
					//console.log(favName);
					$.each(data.userfavContent[favName], function (i, item) {

						$scope.favName[i + offset] = item;

					});
					//console.log('$scope.favName');
					//console.log($scope.favName);
					var topicNameVar = favName.toString();
					//allTopics = {'topic':topics,'posts':$scope.topics.posts};
					offset = limit + offset;
					SessionService.unset('favName');
					//SessionService.set(0, JSON.stringify(allTopics));
					var scopefavName = $scope.favName;
					var setfavName = {};
					setfavName[favName] = $scope.favName;
					//console.log(setfavName);
					SessionService.set('topics', JSON.stringify(favName));
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
				} else {
					toasty.error({
						title: data.statusMessage,
						msg: 'Please enter valid link',
						timeout: 0,
					});
				}
				$scope.favName.slickConfig1Loaded = true;
			});
		}

		$scope.topicName = $routeParams.favName;
		var limit = 25;
		var offset = 0;
		var allfavName = new Array();
		$scope.favName = [];
		allfavName = $scope.favName;
		$scope.favName.slickConfig1Loaded = true;
		loadContent($routeParams.favName);

		$scope.isValidUser = false;
		if ($routeParams.userId == $rootScope.userDetails.user_Id) {
			$scope.isValidUser = true;
		} else {
			$scope.isValidUser = false;
		}

		function loadOnSucess() {
			$scope.nextPosts = function () {
				loadContent($routeParams.favName);
			}

			$scope.getPerm = function (permlink) {
				var permalink = permlink.split('/');
				return permalink[permalink.length - 2];
			}
			$scope.favName.slickConfig1Loaded = true;
		};

		$rootScope.removeFavouritePost = function (sirfId, favouriteName, $event) {
			var currentIndex = $($event.currentTarget).closest('.slick-slide.slick-active').index('.slick-slide.slick-active');
			$($event.currentTarget).closest('.favoritesngrepeat').find('.loadingdataoverlay').removeClass('ng-hide');
			var fullurl = 'http://59.163.47.61/service/sirfUser/deleteUserFavouriteLineItem';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"subscriberUserId": $rootScope.userDetails.user_Id,
					"favouriteName": favouriteName,
					"sirfId": sirfId
				}, //'Action=UP_VOTE&topicId='+$scope.currentID
			}).then(function (data) {
				//console.log(data.data);
				if (data.data.success == true) {
					$($event.currentTarget).closest('.slick-slide.slick-active').remove();
					toasty.info({
						title: 'Removed favorite',
						msg: 'You have successfully removed ' + favouriteName + '!'
					});
				} else {
					toasty.error({
						title: 'Not removed favorite',
						msg: 'Some technical issues are occured, not removed ' + favouriteName + '!'
					});
				}
			});
		}

	}

})();