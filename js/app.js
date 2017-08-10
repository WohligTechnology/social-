'use strict';
angular.module('SirfApp', ['slickCarousel', 'ngRoute', 'ngCookies', 'ngIframeResizer', 'videosharing-embed', 'ngSanitize', 'oc.modal', 'ngMessages', 'angular-toasty', 'ngFileUpload', 'angular-flexslider'])
	.config(config)
	.run(run)
	.directive('typeahead', function ($timeout, $http, $injector) {
		return {
			restrict: 'AEC',
			scope: {
				title: '@',
				retkey: '@',
				displaykey: '@',
				modeldisplay: '=',
				subtitle: '@',
				modelret: '='
			},

			link: function (scope, elem, attrs) {
				scope.current = 0;
				scope.selected = false;

				scope.da = function (txt) {
					console.log(txt);
					console.log($('.searchbox').val());
					scope.ajaxClass = 'loadImage';
					$http({
						method: 'Get',
						url: 'http://59.163.47.61/service/sirfUser/searchUsers?userInfo=' + $('.searchbox').val() + '&limit=5&offset=0'
					}).
					//$http({method: 'Get', url: 'service/sirfUser/searchUsers?userInfo=%'}).
					success(function (data, status) {
						scope.TypeAheadData = data['sirfuserList'];
						scope.ajaxClass = '';
					});

				}
				scope.handleSelection = function (key) {
					var $window = $injector.get('$window');
					var $timeout = $injector.get('$timeout');
					//$location.path('http://localhost:8080/SIRF/#/profile/'+key);
					scope.modeldisplay = "";
					scope.current = 0;
					scope.selected = true;
					$window.location.href = '#/profile/' + key;
					/*scope.modelret = key;*/

				}

				scope.isCurrent = function (index) {
					return scope.current == index;
				}

				scope.hideSuggestBox = function (index) {
					var $timeout = $injector.get('$timeout');
					$timeout(function () {
						scope.TypeAheadData = [];
					}, 500);
					$timeout(function () {
						$('.list-group.table-condensed').hide();
					}, 500);
					$timeout(function () {
						$('.searchbox').val('');
						if (scope.isRemoveinputtext == false) {
							$('typeahead .input-group.form-group').removeClass('form-groupfocus');
							$('.form-control.searchbox').removeClass('searchboxfocus');
						}
					}, 500);
				}
				scope.showSuggestBox = function (index) {
					var $timeout = $injector.get('$timeout');
					$('.form-control.searchbox').addClass('searchboxfocus');
					$('typeahead .input-group.form-group').addClass('form-groupfocus');
					$timeout(function () {
						$('.list-group.table-condensed').show();
					}, 1000);
				}
				scope.isRemoveinputtext = false;
				scope.hoverSuggestBox = function (index) {
					if (scope.isRemoveinputtext == false) {
						var $timeout = $injector.get('$timeout');
						$('.form-control.searchbox').addClass('searchboxfocus');
						$('typeahead .input-group.form-group').addClass('form-groupfocus');
						$timeout(function () {
							$('.list-group.table-condensed').show();
						}, 1000);
					}
				}
				scope.focusToSuggestBox = function (index) {
					$('.form-control.searchbox').focus();
					$timeout(function () {
						$('.list-group.table-condensed').show();
					}, 1000);
				}

				scope.setCurrent = function (index) {
					scope.current = index;
				}

				scope.removeSearchInputBox = function (index) {
					$('.form-control.searchbox').val('');
					scope.isRemoveinputtext = true;
					scope.showSuggestBox(index);
					var $timeout = $injector.get('$timeout');
					$timeout(function () {
						scope.isRemoveinputtext = false;
						scope.showSuggestBox(index)
					}, 1000);
				}


			},
			template: '<input type="text" ng-model="modeldisplay" ng-keyup="da(modeldisplay)"  ng-keydown="selected=false"' +
				'ng-class="ajaxClass" class="form-control searchbox"  placeholder="Search" ng-mouseover="focusToSuggestBox($index);" ng-blur="hideSuggestBox($index);" ng-focus="showSuggestBox($index);">' +
				'<i class="fa fa-times removesearchinput" aria-hidden="true" ng-click="removeSearchInputBox($index);"></i><i class="glyphicon glyphicon-search form-control-feedback fa fa-search" aria-hidden="true"></i>' +
				'<div class="input-group form-group"></div>' +
				'<div class="list-group table-condensed overlap" ng-hide="!modeldisplay.length || selected">' +
				//'<a href="#/profile/{{item.user_Id}}" class="list-group-item noTopBottomPad" ng-repeat="item in TypeAheadData|filter:model  track by $index" '+
				'<a href="javascript:void(0);" ng-click="handleSelection(item.user_Id)" class="list-group-item noTopBottomPad" ng-repeat="item in TypeAheadData|filter:model  track by $index" ' +
				'style="cursor:pointer" ' +
				'ng-class="{active:isCurrent($index)}" ' +
				'ng-mouseenter="setCurrent($index)">' +
				' {{item.user_Id}}' +
				'</a> ' +
				'</div>' +
				'</input>'
		};
	})
	.config(['$httpProvider', function ($httpProvider) {
		$httpProvider.interceptors.push(function ($q, $injector, $cookies, $rootScope) {
			var inFlightRequest = null;
			var isRefreshTokenHit = false;
			var newAuth = null;
			var completedHTTP = false;
			return {
				// On request success
				request: function (config) {
					var $http = $injector.get('$http');
					var deferred = $q.defer();
					deferred.resolve(config);

					return deferred.promise;
				},

				response: function (response, headers, config) {
					var deferred = $q.defer();
					deferred.resolve(config);
					var $http = $injector.get('$http');
					var AuthenticationService = $injector.get('AuthenticationService');
					if (response.data.renewAuthToken != null) {
						newAuth = 'Basic ' + response.data.renewAuthToken.authToken;
						//$http.defaults.headers.common['Authorization'] = 'Basic ' + response.data.renewAuthToken.authToken;
						AuthenticationService.SetAuthdata($rootScope.globals.currentUser.username, response.data.renewAuthToken.authToken);
					}
					deferred.promise;
					//console.log(response.config.headers.Authorization);
					// Return the promise response.
					return response || $q.when(response);
				},

				responseError: function (response) {
					//alert('responseError');
					// Access token invalid or expired
					if (response.status == 403 || response.status == 401) {
						//console.log(response.config.headers);
						var $http = $injector.get('$http');
						var $rootScope = $injector.get('$rootScope');
						var $location = $injector.get('$location');
						var $cookies = $injector.get('$cookies');
						var deferred = $q.defer();
						$rootScope.globals = {};
						$cookies.remove('globals');
						$http.defaults.headers.common.Authorization = 'Basic';
						$rootScope.loginDetails.isLoggedIn = false;
						$rootScope.loginDetails.isLoggedInClass = 'isLoggedInFalse';
						$rootScope.loginDetails.isLoggedInProfileClass = 'isLoggedInProfileClassFalse';
						$location.path('/');
						//$http(response.config).then(deferred.resolve, deferred.reject);

						// Refresh token!
						/*if(!inFlightRequest){
						   inFlightRequest = $injector.get('AuthenticationFactory').refreshToken();
						}
						//all requests will wait on the same auth request now:
						inFlightRequest.then(function (token) {
						  //clear the inFlightRequest so that new errors will generate a new AuthRequest.
						  inFlightRequest = null;
						  response.config.headers.Authorization = "";

						  $http(response.config).then(deferred.resolve, deferred.reject);
						}, function(err){
						    //error handling omitted for brevity
						});*/

						return deferred.promise;
					}

					return $q.reject(response);
				}
			}
		});
	}])
	.config(['toastyConfigProvider', function (toastyConfigProvider) {
		toastyConfigProvider.setConfig({
			sound: false,
			position: 'top-center',
			shake: false
		})
	}])
	.factory("interceptors", [function () {

		return {

			// if beforeSend is defined call it
			'request': function (request) {

				if (request.beforeSend)
					request.beforeSend();

				return request;
			},


			// if complete is defined call it
			'response': function (response) {

				if (response.config.complete)
					response.config.complete(response);

				return response;
			}
		};

	}])
	.config(function ($provide) {
		$provide.decorator('$controller', function ($delegate, $rootScope) {
			return function (constructor, locals, later, indent) {
				$(document).ready(function () {
					$('.form-control').each(function () {
						if ($(this).attr('placeholder') && ($(this).hasClass('searchbox') === false)) {
							$(this).next('.help-block').after('<span class="floating-label">' + $(this).attr('placeholder') + '</span>');
							$(this).removeAttr('placeholder');
						}
					});
					$('.form-control').bind('blur', function () {
						if ($(this).val()) {
							$(this).addClass('filled');
						} else {
							$(this).removeClass('filled');
						}
					});
				});
				if (typeof constructor === 'string' && !locals.$scope.controllerName) {
					locals.$scope.controllerName = constructor;
					$rootScope.bodyClass = constructor;
				}
				return $delegate(constructor, locals, later, indent);
			};
		});
	})
	/*.directive('validPasswordC', function() {
	  return {
	    require: 'ngModel',
	    scope: {
	      reference: '=validPasswordC',
	      validPasswordC: '='
	    },
	    link: function(scope, elm, attrs, ngModel) {
	    	ngModel.$parsers.unshift(function(viewValue, $scope) {
	        var noMatch = viewValue != scope.reference
	        ngModel.$setValidity('noMatch', !noMatch);
	 
	      });

	      scope.$watch("validPasswordC", function(value) {;
	      ngModel.$setValidity('noMatch', value === ngModel.$viewValue);
	      ngModel.$validate(); // validate again when match value changes

	      });
	    }
	  }
	})*/
	.directive('validateMatch', function () {
		return {
			require: 'ngModel',
			scope: {
				validateMatch: '='
			},
			link: function (scope, element, attrs, ngModel) {
				//console.log(element);
				scope.$watch('validateMatch', function () {
					ngModel.$validate(); // validate again when match value changes
				});

				ngModel.$validators.match = function (modelValue) {
					if (modelValue === scope.validateMatch) {
						return true;
					} else {
						return false;
					}
					//return modelValue === scope.validateMatch;
				};
			}
		};
	})
	.directive('miLoading', function () {
		return {
			restrict: 'E',
			scope: {
				promise: '='
			},

			link: function ($scope, $element, $attrs) {

				$scope.IsLoading = true;

				$scope.$watch('promise', function (prom) {
					if (!prom) {
						$scope.IsLoading = false;
						return;
					}
					prom.success(function () {
						$scope.IsLoading = false;
					});
				});
			},
			template: '<div ng-show="IsLoading" class="spinner" style="height:300px"></div>'
		};
	})
	.factory('Utils', function ($q) {
		return {
			isImage: function (src) {

				var deferred = $q.defer();

				var image = new Image();
				image.onerror = function () {
					deferred.resolve(false);
				};
				image.onload = function () {
					deferred.resolve(true);
				};
				image.src = src;

				return deferred.promise;
			}
		};
	})
	.directive('focusMe', function ($timeout, $parse) {
		return {
			link: function (scope, element, attrs) {
				var model = $parse(attrs.focusMe);
				scope.$watch(model, function (value) {
					if (value === true) {
						$timeout(function () {
							element[0].focus();
						});
					}
				});
				element.bind('blur', function () {
					scope.$apply(model.assign(scope, false));
				})
			}
		};
	}).filter('toArray', function () {
		return function (obj) {
			var result = [];
			angular.forEach(obj, function (val) {
				result.push(val);
			});
			return result;
		}
	}).filter('spaceless', function () {
		return function (input) {
			if (input && !input.match(/[^\w\s]/gi)) {
				return input.replace(/\s+/g, '_');
			} else {
				return '_';
			}
		}
	})
	.filter('to_trusted', ['$sce', function ($sce) {
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}])
	.filter('linebreak', function () {
		return function (text) {
			return text.replace(/\n/g, '<br>');
		}
	})
	.filter('startFrom', function () {
		return function (input, start) {
			if (input) {
				start = +start; //parse to int
				return input.slice(start);
			}
			return [];
		}
	})
	.filter('orderByKey', ['$filter', function ($filter) {
		return function (items, field, reverse) {
			var keys = $filter('orderBy')(Object.keys(items), field, reverse),
				obj = {};
			keys.forEach(function (key) {
				obj[key] = items[key];
			});
			return obj;
		};
	}])
	.filter('moment', function () {
		return function (input) {
			var convertedDate = moment(input, "X").fromNow();
			return convertedDate;
		};
	}).config(['slickCarouselConfig', function (slickCarouselConfig) {
		slickCarouselConfig.dots = true;
		slickCarouselConfig.autoplay = true;
		slickCarouselConfig.infinite = true;
		slickCarouselConfig.speed = 300;
		slickCarouselConfig.slidesToShow = 4;
		slickCarouselConfig.slidesToScroll = 4;
		//slickCarouselConfig.enabled = true;

	}]).factory('MyCache', function ($cacheFactory) {
		return $cacheFactory('myCache');
	})
	.service('SessionService', function ($window) {
		var service = this;
		var sessionStorage = $window.sessionStorage;

		service.get = function (key) {
			return sessionStorage.getItem(key);
		};

		service.set = function (key, value) {
			sessionStorage.setItem(key, value);
		};

		service.unset = function (key) {
			sessionStorage.removeItem(key);
		};
	})
	.controller('UpcomingController', function ($scope, $timeout, $rootScope, SessionService, $parse, $http, MyCache, $location, $anchorScroll) {

		$scope.nextTopicLoaded = false;
		$scope.nextTopicLoading = false;
		var categoryLimit = 5;
		var categoryOffset = 0;
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

		function loadContent() {
			$('.slickrow').hide();
			if (!$scope.loadConNextFunc) {
				$scope.slickConfig1Loading = true;
			}
			$scope.slidesNumber = Math.floor((window.innerWidth - 30) / 200);
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
			var firstCategory;
			Object.size = function (obj) {
				var size = 0,
					key;
				for (key in obj) {
					console.log(key);
					if (obj.hasOwnProperty(key)) size++;
				}
				for (key in obj) {
					console.log(key);
					if (obj.hasOwnProperty(key)) firstCategory = key;
					break;
				}
				return size;
			};
			console.log(firstCategory);
			var fullurl = 'http://59.163.47.61/service/sirf/pages?categoryLimit=' + categoryLimit + '&categoryOffset=' + categoryOffset + '&sortType=NEW&limit=' + limit + '&offset=' + offset;
			$http.get(fullurl).success(function (data) {
				console.log(data.categoriesGroupMap);
				if (data.statusCode == 1) {
					$scope.slickConfig = {};
					//arrayText.push(data);
					var size = Object.size(data.categoriesGroupMap);
					console.log(size);
					if (size < categoryLimit) {
						$scope.nextTopicLoaded = true;
					}
					arrayText.push(data.categoriesGroupMap);
					var objectText = {};
					var objectText2 = '';
					for (var i = 0; i < arrayText.length; i++) {
						if (i === 0) {
							objectTextString = JSON.stringify(arrayText[i]);
							objectText1 = objectTextString.slice(0, -1);
						} else {
							objectTextString = JSON.stringify(arrayText[i]);
							objectText2 += ', ' + objectTextString.slice(1, -1);
						}
					}
					objectText3 = objectText1 + objectText2 + '}';
					$scope.topics = JSON.parse(objectText3);

					categoryOffset = categoryLimit + categoryOffset;
					/*console.log(data);
					SessionService.set('topics', data);
					console.log(data);*/

					/*				angular.forEach(data, function(obj, key){

										   console.log(key);
										   $scope.topics.push({'topic':key,'posts':obj});

										});
									//$scope.topics[0] += data;
									
									//$scope.topics.push(data);
									console.log($scope.topics);
									
						$.each([data], function (i, topicdata) {
							$.each(topicdata, function (i, topic) {
									SessionService.set(i, JSON.stringify($scope.topics));
							});
						});*/
					//console.log($scope.topics);
					/*SessionService.set('topics', JSON.stringify($scope.topics));
					$scope.firstTopics= topics.substr(0, topics.indexOf(','));*/
					//if($scope.loadConNextFunc){
					$timeout(function () {
						$scope.slickConfig = {
							dots: true,
							enabled: true,
							infinite: false,
							initialSlide: false,
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
					//}
					$timeout(function () {
						$('.slick-prev').addClass('slick-disabled');
						$('.col-md-12.row-block.content').find('.slick-slide').hoverIntent(config);
						$scope.slickConfig1Loading = false;
						if ($scope.loadConNextFunc) {
							$scope.nextTopicLoading = false;
						};
						$scope.gotoAnchor('#' + firstCategory);
					}, 2000);
					/*MyCache.put(topics, data);*/
				}
			});




			//});
		};


		$rootScope.allData = {};
		//$scope.number1 = [], $scope.number2 = [], $scope.number3 = [], $scope.number4 = [], $scope.number5 = [];
		$scope.loadConNextFunc = false;

		function loadCon() {
			loadContent();
		}
		loadCon();

		function loadConNext(topics, offset) {
			$scope.nextTopicLoading = true;
			$scope.nextTopicLoaded = false;
			$scope.loadConNextFunc = true;
			loadContent();
		}



		$scope.getPerm = function (permlink) {
			var permalink = permlink.split('/');
			return permalink[permalink.length - 2];
		}
		//loadCon();
		var oldWidth, oldHeight;

		function openCart() {
			$(this).addClass("open");
			oldWidth = $(this).closest('.slick-slide').width();
			oldHeight = $(this).closest('.slick-slide').height();
			$(this).closest('.slick-slide').addClass('mousehover');
			$(this).closest('.slick-slide').find('img').css({
				'height': '180px'
			});
			$(this).closest('.slick-slide').find('.home-views-pan').css({
				'display': 'block'
			});
			$(this).closest('.slick-slide').find('.ellipsis').css({
				'width': '100%'
			});
			$(this).closest('.slick-track').css({
				'width': $(this).closest('.slick-track').outerWidth() + 800,
				'margin-left': '-30px'
			});
			$(this).closest('.slick-slider').css({
				'position': 'relative',
				'z-index': '3'
			});
		}

		//hide cart slide on exit
		function closeCart() {
			$(this).closest('.slick-track').css({
				'width': $(this).closest('.slick-track').outerWidth() - 800,
				'margin-left': '0px'
			});
			$(this).closest('.slick-slide').find('.home-views-pan').css('display', 'none');
			$(this).closest('.slick-slide').removeClass('mousehover');
			$(this).closest('.slick-slide').find('.ellipsis').css({
				'width': '200px'
			});
			$(this).removeClass("open");
			$(this).closest('.slick-slider').css({
				'position': 'relative',
				'z-index': 'inherit'
			});
		}

		var config = {
			over: openCart, // function = onMouseOver callback (REQUIRED)    
			timeout: 250, // number = milliseconds delay before onMouseOut    
			out: closeCart // function = onMouseOut callback (REQUIRED)    
		};
		$timeout(function () {
			$('.col-md-12.row-block.content').find('.slick-slide').hoverIntent(config)
		}, 2000);


		$scope.sortByNewest = function () {

		}


	})
	.controller('modalController', function ($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, $filter) {
		$http({
			method: 'GET',
			url: 'views/register/register.view.html'
		}).then(function success(response) {
			$scope.signupinContent = response.data;
			$scope.statusval = response.status;
			$scope.statustext = response.statusText;
			$scope.headers = response.headers();
		}, function error(response) {});
	});
config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider'];

function config($routeProvider, $locationProvider, $httpProvider) {
	// Register interceptors service
	$httpProvider.interceptors.push('interceptors');
	$routeProvider
		.when('/', {
			templateUrl: 'views/home/home.view.html',
			controller: 'HomeController',
			controllerAs: 'vm'
		})
		.when('/register', {
			templateUrl: 'views/register/register.view.html',
			controller: 'RegisterController',
			controllerAs: 'vm'
		})
		.when('/logout', {
			templateUrl: 'views/login/logout.view.html',
			controller: 'LogoutController',
			controllerAs: 'vm'
		})
		.when('/myprofile', {
			templateUrl: 'views/myprofile/myprofile.view.html',
			controller: 'MyProfileController',
			controllerAs: 'vm'
		})
		.when('/preference', {
			templateUrl: 'views/myprofile/preference.view.html',
			controller: 'MyPreferenceController',
			controllerAs: 'vm'
		})
		.when('/profile/:userId', {
			templateUrl: 'views/profile/profile.view.html',
			controller: 'ProfileController',
			controllerAs: 'vm'
		})
		.when('/upcoming', {
			templateUrl: 'views/home/home.view.html',
			controller: 'UpcomingController',
			controllerAs: 'vm'
		})
		.when('/subscribe/:userId', {
			templateUrl: 'views/subscribe/list/subscribelist.view.html',
			controller: 'SubscribeListController',
			controllerAs: 'vm'
		})
		.when('/favorites/:userId', {
			templateUrl: 'views/favorites/list/favoriteslist.view.html',
			controller: 'FavoritesListController',
			controllerAs: 'vm'
		})
		.when('/mypost/:userId', {
			templateUrl: 'views/mypost/list/mypostlist.view.html',
			controller: 'MyPostListController',
			controllerAs: 'vm'
		})
		.when('/favorites/:favName', {
			templateUrl: 'views/favorites/favorites.view.html',
			controller: 'FavoritesController',
			controllerAs: 'vm'
		})
		.when('/favorites/:userId/:favName', {
			templateUrl: 'views/favorites/favorites.view.html',
			controller: 'FavoritesController',
			controllerAs: 'vm'
		})
		.when('/post/create', {
			templateUrl: 'views/post/post.view.html',
			controller: 'PostController',
			controllerAs: 'cp'
		})
		.when('/details/:topicName/:pageId/:permalink/:postType/:userID/:favouriteName/:offset/:sortType', {
			templateUrl: 'views/details/details.view.html',
			controller: 'DetailsContoller',
			controllerAs: 'vm'
		})
		.when('/topic/:topicId/:topicName/:sortType', {
			templateUrl: 'views/topic/list/topiclist.view.html',
			controller: 'TopicListController',
			controllerAs: 'vm'
		})
		.when('/ridethewave', {
			templateUrl: 'views/ridethewave/ridethewave.view.html',
			controller: 'RidethewaveContoller',
			controllerAs: 'vm'
		})
		.when('/betadesc', {
			templateUrl: 'views/beta/beta_desc.html',
			controller: 'BetaDescController',
			controllerAs: 'vm'
		})
		.when('/ridethewave/details/:topicName/:pageId/:permalink/:postType/:userID/:favouriteName/:offset/:sortType', {
			templateUrl: 'views/ridethewave/details/ridethewavedetails.view.html',
			controller: 'DetailsContoller',
			controllerAs: 'vm'
		})
		.otherwise({
			redirectTo: '/'
		});
}

run.$inject = ['$rootScope', '$location', '$cookies', '$http'];

function run($rootScope, $location, $cookies, $http, $scope) {
	// keep user logged in after page refresh
	$rootScope.globals = $cookies.getObject('globals') || {};
	$rootScope.userDetails = $cookies.getObject('userDetails') || {};
	if ($rootScope.globals.currentUser) {
		$http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
	}
	var isHitToUserService = false;
	$rootScope.$on('$locationChangeStart', function (event, next, current, $scope) {
		$(function () {
			$rootScope.scrollHeight = window.innerHeight;
			$rootScope.headerHeight = $('header > nav').outerHeight();
			$rootScope.footerHeight = $('footer > div:visible').outerHeight();

			$rootScope.middleContainer = ($rootScope.scrollHeight - ($rootScope.headerHeight + $rootScope.footerHeight));
		});

		$rootScope.flash = {};
		console.log('$locationChangeStart');
		$rootScope.getboardCalled = false;
		// redirect to login page if not logged in and trying to access a restricted page
		var restrictedPage;
		var locationPath = $location.path();
		console.log(locationPath);
		var details = /^\/details/;
		var register = /^\/register/;
		var topic = /^\/topic/;
		var betadesc = /^\/betadesc/;
		var root = /^\/$/; // for exact match added '$'
		if (betadesc.test(locationPath) || topic.test(locationPath) || details.test(locationPath) || register.test(locationPath) || (root).test(locationPath) || $.trim(locationPath) == '' || $.trim(locationPath) == '/') {
			restrictedPage = false;
			if (isHitToUserService == false && !details.test(locationPath)) {
				isHitToUserService = true;
				$http({
					method: 'Get',
					url: 'http://59.163.47.61/service/sirfUser/searchUsers?userInfo=doejohn&limit=1&offset=0'
				}).success(function () {
					isHitToUserService = false;
				});
			}
		} else {
			restrictedPage = true;
		}
		var loggedIn = $rootScope.globals.currentUser;
		$rootScope.loginDetails = {};
		if (loggedIn) {
			//console.log('loggedIn');
			$rootScope.loginDetails.isLoggedIn = true;
			$rootScope.loginDetails.isLoggedInClass = 'isLoggedInTrue';
			$rootScope.loginDetails.isLoggedInProfileClass = 'isLoggedInProfileClassTrue';
		} else {
			//console.log('loggedOut');
			$rootScope.loginDetails.isLoggedIn = false;
			$rootScope.loginDetails.isLoggedInClass = 'isLoggedInFalse';
			$rootScope.loginDetails.isLoggedInProfileClass = 'isLoggedInProfileClassFalse';
		}
		console.log(restrictedPage + '&&' + loggedIn);
		if (restrictedPage && !loggedIn) {
			$location.path('/');
		}
	});
}

var compareTo = function () {
	return {
		require: "ngModel",
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function (scope, element, attributes, ngModel) {

			ngModel.$validators.compareTo = function (modelValue) {
				return modelValue == scope.otherModelValue;
			};

			scope.$watch("otherModelValue", function () {
				ngModel.$validate();
			});
		}
	};
};