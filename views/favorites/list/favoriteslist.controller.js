(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('FavoritesListController', FavoritesListController);

	FavoritesListController.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', '$filter', '$compile', 'toasty'];

	function FavoritesListController($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, $filter, $compile, toasty) {
		$scope.isFavouriteEmpty = true;
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
		$scope.favList = {};
		$scope.sirfUserFavList = [];
		$scope.isNextAvailable = true;
		$scope.thisUser = $routeParams.userId;

		function loadContent() {
			//console.log('loadContent');
			$scope.favList.slickConfig1Loaded = false;
			//var fullurl = 'service/sirf/pages?topic='+favList+'&limit='+limit+'&offset='+offset;
			var fullurl = 'http://59.163.47.61/service/sirfUser/getFavourites?userID=' + $routeParams.userId + '&currentUser=' + $rootScope.userDetails.user_Id + '&limit=' + limit + '&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				console.log(data.sirfUserFavList);
				$(data.sirfUserFavList).each(function () {
					$scope.sirfUserFavList.push(this);
				});
				if ($(data.sirfUserFavList).length < limit) {
					$scope.isNextAvailable = false;
				}
				console.log('$scope.sirfUserFavList');
				console.log($scope.sirfUserFavList);
				if (data.statusCode == 1) {
					if ($scope.sirfUserFavList.length > 0) {
						$scope.isFavouriteEmpty = false;
					} else {
						$scope.isFavouriteEmpty = true;
					}
					$scope.favList.slickConfig1Loaded = true;
					//console.log(data.userfavContent.mveafavList4);
					//console.log(favList);
					//console.log('$scope.favList');
					//console.log($scope.favList);
					//allTopics = {'topic':topics,'posts':$scope.topics.posts};
					offset = limit + offset;
					SessionService.unset('favList');
					//SessionService.set(0, JSON.stringify(allTopics));
					var scopefavList = $scope.favList;
					var setfavList = {};
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
		$scope.favList.slickConfig1Loaded = true;
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
			$scope.favList.slickConfig1Loaded = true;
		};
		$scope.isloadingremoveFavourite = false;
		$rootScope.removeFavourite = function (favouriteName, $event) {
			$scope.isloadingremoveFavourite = true;
			var currentIndex = $($event.currentTarget).closest('.favoritesngrepeat').index('.favoritesngrepeat');
			var fullurl = 'http://59.163.47.61/service/sirfUser/deleteUserFavourite';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"currentUserId": $rootScope.userDetails.user_Id,
					"favouriteName": favouriteName
				}, //'Action=UP_VOTE&topicId='+$scope.currentID
			}).then(function (data) {
				//console.log(data.data);
				if (data.data.success == true) {
					$($event.currentTarget).closest('.slick-slide.slick-active').remove();
					if ($('.favorites .slick-track .slick-slide').length == 0) {
						$rootScope.isFavouriteEmpty = true;
					}
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
				$scope.isloadingremoveFavourite = false;
			});
		}



	}

})();