(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('TopicListController', TopicListController);

	TopicListController.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', '$filter', '$compile', 'toasty', '$cookies', '$window'];

	function TopicListController($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, $filter, $compile, toasty, $cookies, $window) {

		$scope.getPerm = function (permlink) {
			if (permlink) {
				var permalink = permlink.split('/');
				if (permalink[permalink.length - 2]) {
					return permalink[permalink.length - 2];
				}
			}
		}
		$scope.nextTopicLoaded = false;
		$scope.nextTopicLoading = false;
		var categoryLimit = 1;
		var categoryOffset = $routeParams.topicId; // time being added minus 1
		$scope.sortType = $routeParams.sortType;
		var responseTopicId = parseInt($routeParams.topicId) + 1;
		var limit = 25;
		var offset = 0;
		var allTopics = new Array();
		$scope.topics = [];
		allTopics = $scope.topics;
		$scope.openLink = function (linkid, linkName) {
			$window.location.href = '#/topic/' + (linkid - 1) + '/' + linkName + '/0';
		}
		$scope.topics.slickConfig1Loaded = true;
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
		$rootScope.isListView = $cookies.getObject('isListView') || false;
		$scope.changeView = function (con) {
			$rootScope.isListView = con ? true : false;
			var cookieExp = new Date();
			cookieExp.setDate(cookieExp.getDate() + 7);
			$cookies.putObject('isListView', con, {
				expires: cookieExp
			});
		}
		console.log($rootScope.isListView);

		function loadContent(topics) {
			$scope.topics.slickConfig1Loaded = false;
			allTopics = '';

			//var fullurl = 'service/sirf/pages?topicid='+topics+'&limit='+limit+'&offset='+offset;
			var fullurl = 'http://59.163.47.61/service/sirf/pages?categoryLimit=' + categoryLimit + '&categoryOffset=' + categoryOffset + '&sortType=' + $scope.sortType + '&limit=' + limit + '&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				var fullurlboards = 'service/sirf/getTopicMaster?categoryLoadType=ALL';
				$http.get(fullurlboards).success(function (boardsdata) {
					if (boardsdata.statusCode == 1) {
						$scope.boardsList = boardsdata.topicMasterList;
					}
				});
				/*if(!$scope.topics){
					$scope.topics = [];
					$scope.topics.topic = topics;
				}*/
				$scope.topicName = data.categoriesGroupMap[responseTopicId].topicMaster.topic_Name;
				$scope.topicDesc = data.categoriesGroupMap[responseTopicId].topicMaster.topic_Desc;
				$scope.topics.slickConfig1Loaded = true;
				$.each(data.categoriesGroupMap[responseTopicId].sirfpost, function (i, item) {

					$scope.topics[i + offset] = item;

				});
				if ($(data.categoriesGroupMap[responseTopicId].sirfpost).length < limit) {
					$scope.isNextAvailable = false;
				}
				offset = limit + offset;
				var topicNameVar = topics.toString();
				//allTopics = {'topic':topics,'posts':$scope.topics.posts};

				SessionService.unset('topics');
				//SessionService.set(0, JSON.stringify(allTopics));
				var scopetopics = $scope.topics;
				var setTopics = {};
				setTopics[topics] = $scope.topics;
				SessionService.set('topics', JSON.stringify(setTopics));
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
			});
		}
		if (SessionService.get('topics') == "[object Object]") {
			$scope.allDataServDetail = '';
		} else {
			$scope.allDataServDetail = JSON.parse(SessionService.get('topics'));
		}

		loadContent();
		$scope.nextPosts = function () {
			loadContent();
		}

		function loadOnSucess() {



			$scope.topics.slickConfig1Loaded = true;
		};

	}

})();