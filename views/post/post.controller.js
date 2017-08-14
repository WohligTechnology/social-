(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('PostController', PostController);

	PostController.$inject = ['$scope', '$cookies', '$timeout', '$routeParams', '$route', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$filter', '$sce', 'Utils', 'toasty', 'Upload', '$window'];

	function PostController($scope, $cookies, $timeout, $routeParams, $route, $rootScope, SessionService, $parse, $http, MyCache, $filter, $sce, Utils, toasty, Upload, $window) {
		var cp = this;
		$scope.userDetails = $cookies.getObject('userDetails') || {};
		$scope.errorLinkUpload = false;
		$scope.onLoad = true;
		$scope.filesInput;
		$scope.isUrl = false;
		$scope.isloading = false;
		$scope.imageUpload = true;
		$scope.uploadedImagePath;
		$scope.boards;
		$scope.step2 = false;
		$scope.uploadImageContainer = true;
		$scope.uploadGifContainer = false;
		$scope.uploadVideoContainer = false;
		$scope.uploadTextContainer = false;
		$scope.linkInput;
		$scope.initImageUpload = function ($event) {
			$scope.uploadImageContainer = true;
			$scope.uploadGifContainer = false;
			$scope.uploadVideoContainer = false;
			$scope.uploadTextContainer = false;
			$('.uploadButtons button').removeClass('selected');
			$($event.target).addClass('selected');
		}
		$scope.initGifUpload = function ($event) {
			$scope.uploadImageContainer = false;
			$scope.uploadGifContainer = true;
			$scope.uploadVideoContainer = false;
			$scope.uploadTextContainer = false;
			$('.uploadButtons button').removeClass('selected');
			$($event.target).addClass('selected');
		}
		$scope.initVideoUpload = function ($event) {
			$scope.uploadImageContainer = false;
			$scope.uploadGifContainer = false;
			$scope.uploadVideoContainer = true;
			$scope.uploadTextContainer = false;
			$('.uploadButtons button').removeClass('selected');
			$($event.target).addClass('selected');
		}
		$scope.initTextUpload = function ($event) {
			$scope.uploadImageContainer = false;
			$scope.uploadGifContainer = false;
			$scope.uploadVideoContainer = false;
			$scope.uploadTextContainer = true;
			$('.uploadButtons button').removeClass('selected');
			$($event.target).addClass('selected');
		}
		$scope.addLinkToText = function (link) {
			cp.post.linkURL = link;
			$('#linkURL:not(hidden)').addClass('filled');
			$scope.isloading = false;
			$scope.imageUpload = false;
			$scope.step2 = true;
		}
		var imgIncrement = 0;
		$scope.moreImage = [];
		$scope.addMoreImage = function () {
			imgIncrement++;
			$scope.moreImage.push(imgIncrement);
		}

		cp.post = {
			isPostPrivate: false
		};
		$scope.$watch('files', function () {
			$scope.upload($scope.files);
		});
		$scope.$watch('file', function () {
			if ($scope.file != null) {
				$scope.files = [$scope.file];
			}
		});
		$scope.getBoards = function () {
			var fullurl = 'http://59.163.47.61/service/sirf/getTopicMaster';
			$http.get(fullurl).success(function (data) {
				if (data.statusCode == 1) {
					$scope.boards = data.topicMasterList;
				}
			});
		}
		$scope.getBoards();
		$scope.cancelCreatePost = function () {
			$route.reload();
		}
		$scope.createPost = function () {
			console.log("cp", cp)
			cp.post.permLink = $filter('spaceless')(cp.post.title) + '/';
			$scope.currentpermLink = $filter('spaceless')(cp.post.title);
			cp.dataLoading = true;
			if (cp.post.selfText == null) {
				cp.post.selfText = "&nbsp;"
			}
			$scope.formCreatePost.$setPristine();
			$scope.formCreatePost.$setUntouched();
			var fullurl = 'http://59.163.47.61/service/sirfUser/createPost';
			$http({
				method: 'POST',
				url: fullurl,
				data: cp.post
			}).then(function (data) {
				console.log("response data", data)
				cp.dataLoading = false;
				if (data.data.statusCode == 1) {
					toasty.info({
						title: 'Created Post',
						msg: 'You have successfully created post!'
					});
					var postLink = '#/details/' + cp.post.board + '/' + data.data.subRedditId + '/' + $scope.currentpermLink + '/myPost/' + $scope.userDetails.user_Id + '/0/0/0';
					$timeout(function () {
						$window.location.href = postLink;
					}, 1000);
				} else {
					toasty.error({
						title: data.data.statusMessage
					});
				}
			});
		}
		$scope.isSelected = false;
		$scope.changePrivacy = function () {
			if (!$scope.isSelected) {
				cp.post.isPostPrivate = true;
				$scope.isSelected = true;
			} else {
				cp.post.isPostPrivate = false;
				$scope.isSelected = false;
			}
		}
		$scope.log = '';
		$scope.upload = function (files) {
			if (files && files.length) {
				$scope.errorLinkUpload = false;
				if (!$scope.isUrl) {
					for (var i = 0; i < files.length; i++) {
						var file = files[i];
						if (!file.$error) {
							$scope.isloading = true;
							Upload.upload({
								url: 'http://59.163.47.61/service/sirfUser/upload',
								data: {
									document: file,
									fileName: 'abc.jpg',
									imageType: 'post'
								}
							}).then(function (resp) {
								if (resp.data.statusCode == 1) {
									$scope.isloading = false;
									$scope.imageUpload = false;
									$scope.step2 = true;
									$scope.uploadedImagePath = resp.data.urlPath;
									cp.post.linkURL = resp.data.urlPath;
									cp.post.thumbnail = resp.data.thumbnailPath;
								} else {
									toasty.error({
										title: resp.data.statusMessage
									});
								}
							}, null, function (evt) {
								console.log("evt", evt);
								var progressPercentage = parseInt(100.0 *
									evt.loaded / evt.total);
								$scope.log = 'progress: ' + progressPercentage +
									'% ' + evt.config.data.fileName + '\n' +
									$scope.log;
							});
						}
					}
				} else {
					var imgUrl = files;
					/*var options = new FormData();
            	    // parameter name of file:
            	    options.name = "document";
            	    // name of the file:
            	    options.fileName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
            	    // mime type:
            	    options.contentType = "image/jpeg";
            	    console.log(options);*/
					$scope.isloading = true;
					Upload.upload({
						url: 'service/sirfUser/upload',
						data: {
							document: files,
							fileName: 'abc.jpg',
							imageType: 'post'
						}
					}).then(function (resp) {
						$scope.isloading = false;
						$scope.imageUpload = false;
						$timeout(function () {
							$scope.log = 'file: ' +
								resp.config.data.file.name +
								', Response: ' + JSON.stringify(resp.data) +
								'\n' + $scope.log;
						});
					}, null, function (evt) {
						var progressPercentage = parseInt(100.0 *
							evt.loaded / evt.total);
						$scope.log = 'progress: ' + progressPercentage +
							'% ' + evt.config.data.file.name + '\n' +
							$scope.log;
					});
				}
			} else {
				if (!$scope.onLoad) {
					$scope.errorLinkUpload = true;
				}
			}
			$scope.onLoad = false;
		};

	}

})();