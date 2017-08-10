(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['$scope', '$timeout', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$location', '$anchorScroll', '$compile'];

	function HomeController($scope, $timeout, $rootScope, SessionService, $parse, $http, MyCache, $location, $anchorScroll, $compile) {
		$scope.nextTopicLoaded = false;
		$scope.nextTopicLoading = false;
		$scope.isNextAvailable = true;
		$scope.isNextPostAvailable = true;
		var categoryLimit = 5;
		var categoryOffset = 0;
		$scope.sortType = '';
		var limit = 25;
		var offset = 0;
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
		$scope.topics = [];
		$scope.slickConfig1Loading = false;
		var arrayText = [];
		var objectTextString, objectText1, objectText2, objectText3;

		Object.size = function (obj) {
			var size = 0,
				key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		};
		$scope.posts = {};
		$scope.addnext = function () {
			$scope.slickConfig1Loading = true;
			var fullurl = 'http://59.163.47.61/service/sirf/pages?categoryLimit=' + categoryLimit + '&categoryOffset=' + categoryOffset + '&sortType=' + $scope.sortType + '&limit=' + limit + '&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				var size = Object.size(data.categoriesGroupMap);
				if (size < categoryLimit) {
					$scope.isNextAvailable = false;
				}
				categoryOffset = categoryLimit + categoryOffset;

				$.each(data.categoriesGroupMap, function (i, item) {
					$scope.posts[i] = item;

				});

				//var compiledContainer = $compile(angular.element('<div ng-include="\'topicslanding.html\'"></div><div class="loadingdataoverlay" ng-show="isloadingremoveFavourite"><div class="loadingdata"></div></div>'))($scope);
				//$('.sliderContainer').append(compiledContainer);
				$scope.slickConfig1Loading = false;
				$timeout(function () {
					$('.col-md-12.row-block.content').find('.slides li').hoverIntent(config)
				}, 100);
			});
		}
		$scope.addnext();








		$scope.getPerm = function (permlink) {
			if (permlink) {
				var permalink = permlink.split('/');
				if (permalink[permalink.length - 2]) {
					return permalink[permalink.length - 2];
				}
			}
			//return permalink[permalink.length-2];
		}
		//loadCon();
		$(window).bind("scroll", function () {
			$('.col-md-12.row-block.content').find('.slides li').removeClass('active');
			$('.col-md-12.row-block.content').find('.slides li').withinviewport().each(function () {
				$(this).addClass('active');
			});
		});
		$timeout(function () {
			$('.col-md-12.row-block.content').find('.slides li').removeClass('active');
			$('.col-md-12.row-block.content').find('.slides li').withinviewport().each(function () {
				$(this).addClass('active');
			});
		}, 2000);


		var oldWidth, oldHeight;

		function openCart(evt) {
			var target = evt.target;
			if ($(target).parent().is("li.active:first")) {
				$('.flex-prev').hide();
			}
			if ($(target).parent().is("li.active:last")) {
				$('.flex-next').hide();
			}
			//$(this).addClass("open");
			//$(this).css('bottom','0');
			$(this).animate({
				'zoom': '120%',
				'bottom': 0
			}, 200);
			$(this).find('.home-views-pan').css('display', 'block');
			//$(this).zoomTo({targetsize:0, duration:600});
			evt.stopPropagation();
		}

		//hide cart slide on exit
		function closeCart(evt) {
			//$(this).css('zoom','1');
			//$(this).css('bottom','-25px');
			$(this).find('.home-views-pan').hide();
			$('.flex-next').show();
			$('.flex-prev').show();
			$(this).animate({
				'zoom': '100%',
				'bottom': '-25px'
			}, 0);
			//$(this).zoomTo({targetsize:0, duration:600});
			evt.stopPropagation();
		}

		var config = {
			over: openCart, // function = onMouseOver callback (REQUIRED)    
			timeout: 250, // number = milliseconds delay before onMouseOut    
			out: closeCart // function = onMouseOut callback (REQUIRED)    
		};
		$timeout(function () {
			$('.col-md-12.row-block.content').find('.slides li').hoverIntent(config)
		}, 100);


		$scope.sortByNewest = function () {
			$scope.isNextAvailable = true;
			$scope.posts = {};
			$scope.slickConfig1Loading = false;
			arrayText = [];
			objectTextString = '';
			objectText1 = '';
			objectText2 = '';
			objectText3 = '';
			$scope.sortType = 'New';
			$('.selectedLabel').text('New');
			categoryLimit = 5;
			categoryOffset = 0;
			limit = 25;
			offset = 0;
			$timeout(function () {
				$scope.addnext();
			}, 100);
		}
		$scope.sortByPopularity = function () {
			$scope.isNextAvailable = true;
			$scope.posts = {};
			$scope.slickConfig1Loading = false;
			arrayText = [];
			objectTextString = '';
			objectText1 = '';
			objectText2 = '';
			objectText3 = '';
			$scope.sortType = '';
			$('.selectedLabel').text('Popularity');
			categoryLimit = 5;
			categoryOffset = 0;
			limit = 25;
			offset = 0;
			$timeout(function () {
				$scope.addnext();
			}, 100);
		}
		var slideroffset = 25;

		function loadNextContent(ele) {

			var categoryLimit = 1;
			var categoryOffset = $scope.currentTopicId; // time being added minus 1
			$scope.topics.slickConfig1Loaded = false;
			var allTopics = '';

			//var fullurl = 'service/sirf/pages?topicid='+topics+'&limit='+limit+'&offset='+offset;
			var fullurl = 'http://59.163.47.61/service/sirf/pages?categoryLimit=' + categoryLimit + '&categoryOffset=' + categoryOffset + '&sortType=' + $scope.sortType + '&limit=' + limit + '&offset=' + slideroffset;
			$http.get(fullurl).success(function (data) {
				$scope.topicName = data.categoriesGroupMap[parseInt($scope.currentTopicId) + 1].topicMaster.topic_Desc;
				$scope.topics.slickConfig1Loaded = true;

				$.each(data.categoriesGroupMap[parseInt($scope.currentTopicId) + 1].sirfpost, function (i, item) {
					if ((item.subReddit_Thumbnail == 'nsfw' || item.subReddit_Thumbnail == 'image' || item.subReddit_Thumbnail == 'default' || item.subReddit_Thumbnail == null || item.subReddit_Thumbnail == '' || item.subReddit_Thumbnail == 'self' || !item.subReddit_Thumbnail)) {
						item.subReddit_Thumbnail = 'images/no_image.png';
					}
					$(ele.abc[0]).find('.slides').append(
						'<li>' +
						'<a class="topiclistimage" href="#/details/' + $scope.topicName + '/' + item.subReddit_ID + '/' + $scope.getPerm(item.subReddit_Permalink) + '/0/0/0/0/' + ($scope.sortType ? $scope.sortType : 0) + '/" style="background-image: url(' + item.subReddit_Thumbnail + ')">' +
						'<div class="ellipsis titleLabel" title="' + item.subReddit_Title + '">' + item.subReddit_Title + '</div>' +
						'</a>' +
						'<div class="home-views-pan">' +
						'<div>' +
						'<i class="fa fa-arrow-up" aria-hidden="true"></i><i class="fa fa-arrow-down" aria-hidden="true"></i>' +
						'<div class="pull-right">' + item.viewsCount + ' views</div>' +
						'</div>' +
						'</div>' +
						'</li>'
					);
					ele.abc.addSlide(item, i + parseInt(slideroffset));


				});
				ele.abc.setProps();
				if ($(data.categoriesGroupMap[parseInt($scope.currentTopicId) + 1].sirfpost).length < limit) {
					$scope.isNextPostAvailable = false;
				}
				//slideroffset = limit+slideroffset;






				$timeout(function () {
					$('.col-md-12.row-block.content').find('.slides li').hoverIntent(config)
				}, 100);

			});
		}
		$scope.nextSliderPosts = function (ele) {
			$scope.currentTopicId = ele.abc[0].offsetParent.id;
			if (ele.abc.currentSlide == (ele.abc.pagingCount - 3)) {
				if (ele.abc.count >= 25) {
					slideroffset = ele.abc.count;
					$timeout(function () {
						loadNextContent(ele);
					}, 300);
				}
			}
		}


	}

})();