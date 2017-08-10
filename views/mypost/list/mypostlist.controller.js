(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('MyPostListController', MyPostListController);

	MyPostListController.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', '$filter', '$compile', 'toasty'];

	function MyPostListController($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, $filter, $compile, toasty) {
		$scope.isPostEmpty = false;
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
		$scope.PostList = {};
		$scope.postUserList = [];
		$scope.isNextAvailable = true;

		function loadContent() {
			//console.log('loadContent');
			$scope.PostList.slickConfig1Loaded = false;
			//var fullurl = 'service/sirf/pages?topic='+PostList+'&limit='+limit+'&offset='+offset;
			var fullurl = 'http://59.163.47.61/service/sirfUser/getPosts?userID=' + $routeParams.userId + '&limit=' + limit + '&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				console.log(data.posts);
				$(data.posts).each(function () {
					$scope.postUserList.push(this);
				});
				if ($(data.posts).length < limit) {
					$scope.isNextAvailable = false;
				}
				console.log('isNextAvailable = ' + $scope.isNextAvailable);
				console.log($(data.posts).length + ' < ' + limit);
				console.log('$scope.postUserList');
				console.log($scope.postUserList);
				if (data.statusCode == 1) {
					if ($scope.postUserList.length > 0) {
						$scope.isPostEmpty = false;
					} else {
						$scope.isPostEmpty = true;
					}
					$scope.PostList.slickConfig1Loaded = true;
					//console.log(data.userfavContent.mveafavList4);
					//console.log(favList);
					//console.log('$scope.favList');
					//console.log($scope.favList);
					//allTopics = {'topic':topics,'posts':$scope.topics.posts};
					offset = limit + offset;
					SessionService.unset('PostList');
					//SessionService.set(0, JSON.stringify(allTopics));
					var scopePostList = $scope.PostList;
					var setPostList = {};
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
		$scope.PostList.slickConfig1Loaded = true;
		$scope.currentUserId = $routeParams.userId;
		console.log($routeParams.userId);
		console.log($rootScope.userDetails.user_Id);
		$scope.isValidUser = true;
		loadContent();
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
			$scope.PostList.slickConfig1Loaded = true;
		};
		$scope.isloadingremovePost = false;
		$scope.removePost = function (postId, $event) {
			$scope.isloadingremovePost = true;
			var fullurl = 'http://59.163.47.61/service/sirfUser/deletePost';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"sirfId": postId
				}, //'Action=UP_VOTE&topicId='+$scope.currentID
			}).then(function (data) {
				//console.log(data.data);
				if (data.data.success == true) {
					$($event.currentTarget).closest('.slick-slide.slick-active').remove();
					toasty.info({
						title: 'Successfully removed post',
						msg: 'You have successfully removed post!'
					});
				} else {
					toasty.error({
						title: 'Not removed',
						msg: 'Some technical issues are occured, not removed!'
					});
				}
				$scope.isloadingremovePost = false;
			});
		}



	}

})();