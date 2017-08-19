(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('ProfileController', ProfileController);

	ProfileController.$inject = ['$scope', '$timeout', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$location', '$anchorScroll', 'toasty', '$routeParams', '$cookies'];

	function ProfileController($scope, $timeout, $rootScope, SessionService, $parse, $http, MyCache, $location, $anchorScroll, toasty, $routeParams, $cookies) {
		var vm = this;
		$scope.isSubscribed = false;
		$rootScope.isFavouriteEmpty = true;
		$rootScope.isSubscriberEmpty = false;
		$scope.isCoverPhotoEmpty = true;
		$scope.isProfilePhotoEmpty = true;
		$scope.isUserFound = false;
		$scope.isloading = true;
		var console = window.console || {
			log: function () {}
		};
		/*console.log(($(window).width() * 250) / 1024);
$('.avatar-view').css('height',($(window).width() * 250) / 1024);*/
		$(function () {
			$timeout(function () {
				$('.list-group.table-condensed').show()
			}, 500);
		});

		$scope.nextTopicLoaded = false;
		$scope.nextTopicLoading = false;
		$scope.expandCat = function () {
			$scope.nextTopicLoaded = false;
			loadConNext();
		};

		//====================================
		// Slick 3
		//====================================
		$scope.gotoAnchor = function (x) {
			var elm = $(x);
			var elmTop;
			if (elm) {
				elmTop = elm.offset().top;
			} else {
				elmTop = 1;
			}
			$("body").animate({
				scrollTop: parseInt(elmTop - 83)
			}, "slow");
		};
		$rootScope.loadUserPage = function () {
			$scope.topicsmypost = [];
			$scope.topicsfavorites = [];
			$scope.topicssubscribed = [];
			$scope.slickConfig1Loading = false;
			$rootScope.slickConfigmypost = {};
			$rootScope.slickConfigfavorites = {};
			$rootScope.slickConfigsubscribed = {};
			$scope.isCurrentUser = false;
			$scope.slidesNumber = Math.floor((window.innerWidth - 30) / 200);
			var limit;
			switch ($scope.slidesNumber) {
				case 4:
					limit = 24;
					break;
				case 5:
					limit = 25;
					break;
				case 6:
					limit = 24;
					break;
			}
			var fullurl = 'http://59.163.47.61/service/sirfUser/getuserPage?userID=' + $routeParams.userId + '&limit=25&offset=0&currentUser=' + $rootScope.userDetails.user_Id;
			$http.get(fullurl).then(function (response) {
				console.log(response);
				if ($routeParams.userId == $rootScope.userDetails.user_Id) {
					$scope.isCurrentUser = true;
				}
				$scope.isloading = false;
				var data = response.data;
				if (data.statusCode == 1) {
					$scope.isSubscribed = data.userPageData['User Info'].userSubscribed;
					$scope.isUserFound = true;
					//console.log(data);
					$scope.otherUserPageData = null;
					$scope.otherUserPageData = data.userPageData;
					console.log(data.userPageData);
					if ($scope.otherUserPageData['User Info'].backgroundImage) {
						$scope.isCoverPhotoEmpty = false;
					} else {
						$scope.isCoverPhotoEmpty = true;
					}
					if ($scope.otherUserPageData['User Info'].profileImage) {
						$scope.isProfilePhotoEmpty = false;
					} else {
						$scope.isProfilePhotoEmpty = true;
					}
					//console.log('$rootScope');
					//console.log($rootScope);
					$timeout(function () {
						$scope.slickConfig = {
							dots: true,
							enabled: true,
							infinite: false,
							initialSlide: false,
							method: {},
							speed: 300,
							slidesToShow: Math.floor($scope.slidesNumber),
							slidesToScroll: Math.floor($scope.slidesNumber),
							centerMode: false,
							variableWidth: false,
							responsive: [{
									breakpoint: 1152,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 1025,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 600,
									settings: {
										slidesToShow: 2,
										slidesToScroll: 2,
										centerMode: true
									}
								},
								{
									breakpoint: 480,
									/*settings: {
									  slidesToShow: 1,
									  slidesToScroll: 1,
									  centerMode: false,
									  infinite: false,
									  variableWidth: false
									}*/
								}
								// You can unslick at a given breakpoint now by adding:
								// settings: "unslick"
								// instead of a settings object
							]
						};
						$rootScope.slickConfigmypost = {
							dots: true,
							enabled: true,
							infinite: false,
							initialSlide: false,
							method: {},
							speed: 300,
							slidesToShow: Math.floor($scope.slidesNumber),
							slidesToScroll: Math.floor($scope.slidesNumber),
							centerMode: false,
							variableWidth: false,
							responsive: [{
									breakpoint: 1152,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 1025,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 600,
									settings: {
										slidesToShow: 2,
										slidesToScroll: 2,
										centerMode: true
									}
								},
								{
									breakpoint: 480,
									/*settings: {
									  slidesToShow: 1,
									  slidesToScroll: 1,
									  centerMode: false,
									  infinite: false,
									  variableWidth: false
									}*/
								}
								// You can unslick at a given breakpoint now by adding:
								// settings: "unslick"
								// instead of a settings object
							]
						};
						$rootScope.slickConfigfavorites = {
							dots: true,
							enabled: true,
							infinite: false,
							initialSlide: false,
							method: {},
							speed: 300,
							slidesToShow: Math.floor($scope.slidesNumber),
							slidesToScroll: Math.floor($scope.slidesNumber),
							centerMode: false,
							variableWidth: false,
							responsive: [{
									breakpoint: 1152,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 1025,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 600,
									settings: {
										slidesToShow: 2,
										slidesToScroll: 2,
										centerMode: true
									}
								},
								{
									breakpoint: 480,
									/*settings: {
									  slidesToShow: 1,
									  slidesToScroll: 1,
									  centerMode: false,
									  infinite: false,
									  variableWidth: false
									}*/
								}
								// You can unslick at a given breakpoint now by adding:
								// settings: "unslick"
								// instead of a settings object
							]
						};
						$rootScope.slickConfigsubscribed = {
							dots: true,
							enabled: true,
							infinite: false,
							initialSlide: false,
							method: {},
							speed: 300,
							slidesToShow: Math.floor($scope.slidesNumber),
							slidesToScroll: Math.floor($scope.slidesNumber),
							centerMode: false,
							variableWidth: false,
							responsive: [{
									breakpoint: 1152,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 1025,
									settings: {
										/*slidesToShow: 5,
										slidesToScroll: 1,*/
									}
								},
								{
									breakpoint: 600,
									settings: {
										slidesToShow: 2,
										slidesToScroll: 2,
										centerMode: true
									}
								},
								{
									breakpoint: 480,
									/*settings: {
									  slidesToShow: 1,
									  slidesToScroll: 1,
									  centerMode: false,
									  infinite: false,
									  variableWidth: false
									}*/
								}
								// You can unslick at a given breakpoint now by adding:
								// settings: "unslick"
								// instead of a settings object
							]
						};
						$('.slickrow').show();
					}, 10);
					$timeout(function () {
						$('.slick-prev').addClass('slick-disabled'); /*$('.col-md-12.row-block.content').find('.slick-slide').hoverIntent(config);*/
						$scope.slickConfig1Loading = false;
					}, 2000);
					//console.log($scope.otherUserPageData);
					//console.log('Favourite');
					//console.log($scope.otherUserPageData['Favourite']);
					if ($scope.otherUserPageData['Favourite'].length > 0) {
						$rootScope.isFavouriteEmpty = false;
					}
				} else {
					$scope.isUserFound = false;
				}
			}, function (data, status) {

			});

		}
		$rootScope.loadUserPage();
		$scope.getPerm = function (permlink) {
			var permalink = permlink.split('/');
			return permalink[permalink.length - 2];
		}

		$scope.subscribeuser = function (user) {
			var fullurl = 'service/sirfUser/subscriberPage';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"subscriberUserId": user,
					"action": "ADD"
				}, //'Action=UP_VOTE&topicId='+$scope.currentID
			}).then(function (data) {
				//console.log(data.data);
				if (data.data.success == true) {
					$scope.isSubscribed = true;
					/*var fullurl = 'service/sirfUser/getuserPage?userID='+user+'&limit=25&offset=0&currentUser='+$rootScope.userDetails.user_Id;
					$http.get(fullurl).then(function (response){
						var data = response.data;
						console.log(data.userPageData);
						$scope.otherUserPageData = data.userPageData;
						//$rootScope.$apply();
						//$cookies.putObject('userPageData', $scope.otherUserPageData);
					});*/
					toasty.info({
						title: 'Successfully Subscribe',
						msg: 'You have successfully successfully subscribe!'
					});
				} else {
					$scope.isSubscribed = false;
					toasty.error({
						title: 'Not Subscribed',
						msg: 'Some technical issues are occured, not subscribed!'
					});
				}
			});
		}
		$scope.unsubscribeuser = function (user) {
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
					$scope.isSubscribed = false;
					/*var fullurl = 'service/sirfUser/getuserPage?userID='+user+'&limit=25&offset=0&currentUser='+$rootScope.userDetails.user_Id;
					$http.get(fullurl).then(function (response){
						var data = response.data;
						$scope.otherUserPageData = data.userPageData;
						//$rootScope.$apply();
					});*/
					toasty.info({
						title: 'Successfully Unsubscribe',
						msg: 'You have successfully unsubscribe!'
					});
				} else {
					$scope.isSubscribed = true;
					toasty.error({
						title: 'Not Unsubscribe',
						msg: 'Some technical issues are occured, not Unsubscribe!'
					});
				}
			});
		}
		/*//console.log('$scope.otherUserPageData.Subscribe');
    		$scope.currentUserPageData = $cookies.getObject('userPageData');
        	//console.log($scope.currentUserPageData.Subscribe);
        	 var subscribeResult = $.grep($scope.currentUserPageData.Subscribe, function(e){ return e.subscriber_id == $routeParams.userId; });
        	 if(subscribeResult.length > 0){
        		 $scope.isSubscribed = true;
        	 } else {
        		 $scope.isSubscribed = false;
        	 }
    		$rootScope.removeFavourite =function(favouriteName, $index){
    			var fullurl = 'service/sirfUser/deleteUserFavourite';
  			  $http({
  					method: 'POST',
  					url: fullurl,
  					data: {"currentUserId":$rootScope.userDetails.user_Id, "favouriteName":favouriteName},//'Action=UP_VOTE&topicId='+$scope.currentID
  				}).then(function (data){
  					//console.log(data.data);
  					if(data.data.success == true){
  						$rootScope.slickConfigfavorites.method.slickRemove($index);
  						if($('.favorites .slick-track .slick-slide').length == 0){
  							$rootScope.isFavouriteEmpty = true;
  						}
	  					toasty.info({
	  						title: 'Removed favorite',
	  						msg: 'You have successfully removed '+favouriteName+'!'
	  					});
  					} else {
  						toasty.error({
	  						title: 'Not removed favorite',
	  						msg: 'Some technical issues are occured, not removed '+favouriteName+'!'
	  					});
  					}
  				});
    		}*/

	}

})();