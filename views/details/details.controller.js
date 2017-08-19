(function () {
	'use strict';
	angular
		.module('SirfApp')
		.controller('DetailsContoller', DetailsContoller);

	DetailsContoller.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$filter', '$sce', 'Utils', 'toasty', '$window'];

	function DetailsContoller($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, MyCache, $filter, $sce, Utils, toasty, $window) {
		$rootScope.isloading = true;
		$scope.onLoad = true;
		$scope.isURLImage = true;
		$scope.$sce = $sce;
		$scope.redirect = function (links) {
			$window.location.href = links;
		}
		$scope.postType = $routeParams.postType
		$scope.userID = $routeParams.userID;
		$scope.favouriteName = $routeParams.favouriteName;
		$scope.offset = parseInt($routeParams.offset);
		$scope.sortType = $routeParams.sortType;
		console.log("userpriv", $rootScope.userpriv);

		$scope.routeParamstopicId = $routeParams.pageId
		$scope.routeParamstopicName = $routeParams.topicName ? $routeParams.topicName : "";
		$scope.routeParamspostType = $routeParams.postType != 0 ? $routeParams.postType : "";
		$scope.routeParamsuserID = $routeParams.userID != 0 ? $routeParams.userID : "";
		$scope.routeParamsfavouriteName = $routeParams.favouriteName != 0 ? $routeParams.favouriteName : "";
		$scope.routeParamsoffset = $routeParams.offset != 0 ? $routeParams.offset : "";
		$scope.routeParamssortType = $routeParams.sortType != 0 ? $routeParams.sortType : "";

		for (var i = 0; i <= $rootScope.userpriv.length - 1; i++) {
			if ($rootScope.userpriv[i] == "TAGGING") {
				$scope.tagging = true;
			} else {
				$scope.tagging = false;
			}
			if ($rootScope.userpriv[i] == "POSTMASTERVOTES") {
				$scope.masterVotes = true;
			} else {
				$scope.masterVotes = false;
			}
		}

		var fullurl = 'http://59.163.47.61/service/sirfUser/details?&topicId=' + $scope.routeParamstopicId + '&topicName=' + $scope.routeParamstopicName + '&postType=' + $scope.routeParamspostType + '&userID=' + $scope.routeParamsuserID + '&favouriteName=' + $scope.routeParamsfavouriteName + '&offset=' + $scope.routeParamsoffset + '&sortType=' + $scope.routeParamssortType;
		$scope.renderHtml = function (html_code) {
			var decoded = angular.element('<textarea />').html(html_code).text();
			return $sce.trustAsHtml(decoded);
		};
		$scope.getDetails = function () {
			$http.get(fullurl).success(function (data) {
				console.log(data);
				if (data.statusCode == 9) {
					toasty.error({
						title: data.statusMessage,
						msg: 'Please enter valid link',
						timeout: 0,
					});
				} else {
					$scope.currentData = data;
					$scope.imageData = $scope.currentData.imageList
					var selfText = $scope.currentData.subReddit_selfTextHtml;
					console.log("selftext", $scope.currentData)
					// selfText = selfText.replace('&lt;!-- SC_OFF --&gt;', '');
					// selfText = selfText.replace('&lt;!-- SC_ON --&gt;', '');
					$scope.currentData.subReddit_selfTextHtml = $.trim(selfText);
					console.log($scope.currentData.subReddit_selfTextHtml);
					if ($scope.currentData.subReddit_selfTextHtml) {
						$('#iframeContainer')[0].remove();
						Utils.isImage($scope.currentData.subReddit_url).then(function (result) {
							console.log(result);
							if (result) {
								$scope.isURLImage = true;
								$('.spinnerContainer').hide();
							} else {
								$scope.isURLImage = false;
								var domainName = $scope.extractDomain($scope.subReddit_url);
								if (!(domainName == 'i.imgur.com' || domainName == 'imgur.com')) {
									loadIframe();
								}
								$('.spinnerContainer').hide();
							}
						});
					}
					loadOnSuccess();
					$rootScope.isloading = false;
				}
			});
		};
		$scope.getDetails();

		$scope.updateViewCount = function () {
			var fullurl = 'service/sirf/updateView';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"topicId": $routeParams.pageId
				}
			}).then(function (data) {});
		}
		$rootScope.getAllFavouriteList = function () {
			var fullurl = '/getAllUserFavourite';
			$http({
				method: 'GET',
				url: fullurl
			}).then(function (response) {
				//console.log(response);
				$rootScope.userFavouriteList = response.data.sirfUserFavList;
			});
		}
		$rootScope.addToFavourite = function (favouriteNameVal) {
			var fullurl = 'http://59.163.47.61/service/sirfUser/addUserFavouriteLineItem';
			$http({
				method: 'POST',
				url: fullurl,
				data: {
					"subscriberUserId": $rootScope.userDetails.user_Id,
					"sirfId": $routeParams.pageId,
					"favouriteName": favouriteNameVal,
					"currentUserId": $rootScope.userDetails.user_Id
				}, //{"topicId":$routeParams.pageId}
			}).then(function (data) {
				if (data.data.statusCode == 1) {
					toasty.info({
						title: 'Added into Favorite',
						msg: 'This post is successfully added into ' + favouriteNameVal + '!'
					});
				} else {
					toasty.error({
						title: 'Not added into Favorite',
						msg: data.data.statusMessage
					});
				}
			});
		}
		$scope.updateViewCount();
		$scope.scrollHeight = window.innerHeight;
		$scope.isVideo = false;
		$scope.videoSelected = function (videoId, provider) {
			if (videoId) {
				$scope.isVideo = true;
				$('#spinner').remove();
				$('.spinnerContainer').hide();
				$('#sirfContainer .selfImage').next('div').css('height', '100%');
			} else {
				$scope.isVideo = false;
				if ($scope.currentData.subReddit_url) {
					$scope.test($('.iframeContainer'));
				}
			}
		}
		$scope.extractDomain = function (url) {
			var domain;
			//find & remove protocol (http, ftp, etc.) and get domain
			if (url.indexOf("://") > -1) {
				domain = url.split('/')[2];
			} else {
				domain = url.split('/')[0];
			}

			//find & remove port number
			domain = domain.split(':')[0];

			return domain;
		}
		$scope.test = function (ele) {
			var domainName = $scope.extractDomain($scope.subReddit_url);
			var iframeContent;
			$('.spinnerContainer').append('<div id="spinner"><i class="fa fa-circle-o-notch fa-spin" style="font-size:240px"></i><div>Loading...</div></div>');
			if (domainName == 'i.reddituploads.com') {
				iframeContent = '<img src="' + $sce.trustAsHtml($scope.currentData.subReddit_url) + '" height="100%" id="myiframe" style="max-height: 100%;max-width: 100%;"/>';
				$(ele).html(iframeContent);
				loadIframe();
				$('#myiframe').bind("load", function (data) {
					$('#spinner').remove();
					$('.spinnerContainer').hide();
					$('.iframeContainer').css('display', 'block');
				});
				$('#myiframe').bind("error", function (data) {
					iframeContent = '<span>Image not found</span>';
					$(ele).html(iframeContent);
				});
			} else if (domainName == 'i.redd.it') {
				iframeContent = '<img src="' + $sce.trustAsHtml($scope.currentData.subReddit_url) + '" height="100%" id="myiframe" style="max-height: 100%;max-width: 100%;"/>';
				$(ele).html(iframeContent);
				loadIframe();
				$('#myiframe').bind("load", function (data) {
					$('#spinner').remove();
					$('.spinnerContainer').hide();
					$('.iframeContainer').css('display', 'block');
				});
				$('#myiframe').bind("error", function (data) {
					iframeContent = '<span>Image not found</span>';
					$(ele).html(iframeContent);
				});
			} else if (domainName == 'i.imgur.com') {

				var str = $scope.currentData.subReddit_url;
				var matched = str.match(/imgur.com\/(.{7})/);
				iframeContent = '<blockquote class="imgur-embed-pub" lang="en" data-id="' + matched[1] + '"></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>';
				$(ele).html(iframeContent);
				//loadIframe();
				//$('#spinner').remove(); $('.spinnerContainer').hide(); 
				$('.iframeContainer').css({
					'display': 'block',
					'height': '100%'
				});
				$('.DetailsContoller').css('overflow', 'auto');
			} else if (domainName == 'imgur.com') {

				var str = $scope.currentData.subReddit_url;
				var matched = str.match(/imgur.com\/gallery\/(.*)/);
				var dataId = matched[1];
				if (matched[1].length == 5) {
					dataId = 'a/' + matched[1];
				}
				iframeContent = '<blockquote class="imgur-embed-pub" lang="en" data-id="' + dataId + '"></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>';
				$(ele).html(iframeContent);
				//loadIframe();
				//$('#spinner').remove(); $('.spinnerContainer').hide(); 
				$('.iframeContainer').css({
					'display': 'block',
					'height': '100%'
				});
				$('.DetailsContoller').css('overflow', 'auto');
			} else {
				Utils.isImage($scope.source).then(function (result) {
					$scope.result = result;
					var iframeContent;
					if (result) {
						iframeContent = '<img src="' + $sce.trustAsHtml($scope.currentData.subReddit_url) + '" height="100%" id="myiframe" style="max-height: 100%; max-width:100%;"/>';
						$('.iframeContainer').html(iframeContent);
						var domainName = $scope.extractDomain($scope.subReddit_url);
						if (!(domainName == 'i.imgur.com' || domainName == 'imgur.com')) {
							loadIframe();
						}
						$('#myiframe').bind("load", function (data) {
							$('#spinner').remove();
							$('.spinnerContainer').hide();
							$('.iframeContainer').css('display', 'block');
						});
					} else {
						var iframeLoaded = false;
						var iframe = document.createElement('iframe');

						// ***** SWAP THE `iframe.src` VALUE BELOW FOR DIFFERENT RESULTS ***** //
						// iframe.src = "https://davidsimpson.me"; // This will work. There is no 'X-Frame-Options' header.
						//iframe.src = "https://arstechnica.com/science/2017/02/before-babies-even-babble-or-roll-theyre-primed-to-be-superhero-fans/"; // This won't work. 'X-Frame-Options' is set to 'SAMEORIGIN'.
						iframe.src = $sce.trustAsHtml($scope.currentData.subReddit_url);
						iframe.id = 'myiframe';
						iframe.width = '100%';
						iframe.height = '400';
						iframe.frameborder = '0';
						var consoleDiv = document.getElementById('console');
						var iframeOnloadEvent = function () {
							iframeLoaded = true;
							$('#myiframe').attr('sandbox', '').attr('frameborder', '0');
							$timeout(function () {
								/*console.log($("#myiframe")[0]['contentWindow']);
								$('#myiframe').height($("#myiframe")[0]['contentWindow']['top']['outerHeight']);*/
								if (iframe.contentWindow.length > 0) {
									//console.log('correct URL');
								} else {
									//console.log('failed URL');
									consoleDiv.innerHTML = '<h3 style="font-weight: normal; text-align:center; font-size: 21px;"><a href="' + iframe.src + '" target="_blank" style="color: #0088cc;">Click here</a> to Open Content in another Window.</h3>';
									$('#theFrame').hide();
								}
							}, 5000);
						}

						if (iframe.attachEvent) {
							iframe.attachEvent('onload', iframeOnloadEvent);
						} else {
							iframe.onload = iframeOnloadEvent;
						}
						document.getElementById("iframeContainer").appendChild(iframe);
						var interval = null;
						interval = setInterval(addSandbox(), 500);
						//$('#myiframe').attr('sandbox','allow-top-navigation').attr('frameborder','0');
						$timeout(function () {
							clearInterval(interval);
						}, 5000);
						$timeout(function () {
							$('#spinner').remove();
							$('.spinnerContainer').hide();
							$('.iframeContainer').css('display', 'block');
						}, 490);

						// iframe.onload event doesn't trigger in firefox if loading mixed content (http iframe in https parent) and it is blocked.
						/*setTimeout(function () {
						  if (iframeLoaded === false) {
						    consoleDiv.innerHTML = '✘ iframe failed to load within 5s: ' + iframe.src;
						    consoleDiv.style.cssText = 'color: red;'    
						  }
						}, 3000);*/

					}

				});
			}
		};
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
		$scope.gotoAnchor();
		$scope.focusOnInput = function () {
			if ($('.postContentContainer').hasClass('col-md-8')) {} else {
				$scope.postContentCollapse($('.postContentExpander'));
			}
			if ($scope.isCommentFormOpen) {
				$scope.shouldBeOpen = true;
			}
		}

		if (SessionService.get('topics') == "[object Object]") {
			$scope.allDataServDetail = '';
		} else {
			$scope.allDataServDetail = JSON.parse(SessionService.get('topics'));
		}

		function loadOnSuccess() {
			$scope.getPerm = function (permlink) {
				var permalink = permlink.split('/');
				return permalink[permalink.length - 3] + '/' + permalink[permalink.length - 2];
			}
			$rootScope.getAllFavouriteList();
			$scope.cat = $routeParams.topicName;
			$scope.title = $scope.currentData.subReddit_Title;
			$scope.currentID = $scope.currentData.subReddit_ID;
			$scope.setUpVote = function () {
				var fullurl = 'http://59.163.47.61/service/sirfUser/postVote';
				$http({
					method: 'POST',
					url: fullurl,
					data: {
						"voteType": "UP_VOTE",
						"topicId": $scope.currentID
					}, //'Action=UP_VOTE&topicId='+$scope.currentID
				}).then(function (data) {
					if (data.data.statusCode == 1) {
						$scope.numOfUpvotes = data.data.numOfUpvotes;
						$scope.numOfDownvotes = data.data.numOfDownvotes;
						if ($('.setUpVote').hasClass('upvoted')) {
							$('.setUpVote').removeClass('upvoted');
						} else {
							$('.setUpVote').addClass('upvoted');
						}
						$('.setDownVote').removeClass('downvoted');
					} else {
						toasty.error({
							title: 'Not voted!',
							msg: data.data.statusMessage
						});
					}
				});
			};
			$scope.setDownVote = function () {
				var fullurl = 'http://59.163.47.61/service/sirfUser/postVote';
				$http({
					method: 'POST',
					url: fullurl,
					data: {
						"voteType": "DOWN_VOTE",
						"topicId": $scope.currentID
					}, //'Action=DOWN_VOTE&topicId='+$scope.currentID
				}).then(function (data) {
					if (data.data.statusCode == 1) {
						$scope.numOfUpvotes = data.data.numOfUpvotes;
						$scope.numOfDownvotes = data.data.numOfDownvotes;
						if ($('.setDownVote').hasClass('downvoted')) {
							$('.setDownVote').removeClass('downvoted');
						} else {
							$('.setDownVote').addClass('downvoted');
						}
						$('.setUpVote').removeClass('upvoted');
					} else {
						toasty.error({
							title: 'Not voted!',
							msg: data.data.statusMessage
						});
					}
				});
			};
			var prevhtml = $('<div/>').html($scope.currentData.html).text();
			var htmlString = prevhtml;
			//var htmlString = '<div id="&lt;lol&gt;"><span title="&lt;&gt;&lt; &lt;&gt;&lt; &lt;&gt;&lt; fish">hover for fishies</span></div>';
			while (htmlString.match(/="([^"]*)\&[gl]t;([^"]*)"/g)) {
				htmlString = htmlString.replace(/="([^"]*)\&gt;([^"]*)"/g, '="$1>$2"')
					.replace(/="([^"]*)\&lt;([^"]*)"/g, '="$1<$2"');
			}
			//var prevhtml1 = prevhtml.replace('&lt;','<').replace('&gt;', '>');

			$scope.html = htmlString.replace('<!-- SC_OFF -->', '');
			$scope.html = $scope.html.replace('<!-- SC_ON -->', '');
			$('.contentHTML').html($scope.html);
			$scope.subReddit_url = decodeURIComponent($scope.currentData.subReddit_url);
			$scope.author = $scope.currentData.author;
			$scope.score = $scope.currentData.score;
			$scope.created = $scope.currentData.created;
			$scope.num_comments = $scope.currentData.num_comments;
			$scope.nextPostURL = $scope.currentData.nextPostURL;
			$scope.currentPostComments = [];
			$scope.currentPostLoaded = false;
			$scope.isCommentPosted = false;
			$scope.isCommentPostedSuccess = false;
			$scope.nextUrl = function () {
				return $scope.getPerm($scope.currentData.nextSirfUrl);
			}
			$scope.prevUrl = function () {
				return $scope.getPerm($scope.currentData.prevSirfUrl);
			}
			//var model = $parse('currentPostComments');
			//$http.get("http://www.reddit.com/r/" + $scope.cat + "/comments/" + $routeParams.pageId + ".json?").success(function (data){



			var fullurl = 'http://59.163.47.61/service/sirfUser/details?&topicId=' + $scope.routeParamstopicId + '&topicName=' + $scope.routeParamstopicName + '&postType=' + $scope.routeParamspostType + '&userID=' + $scope.routeParamsuserID + '&favouriteName=' + $scope.routeParamsfavouriteName + '&offset=' + $scope.routeParamsoffset + '&sortType=' + $scope.routeParamssortType;
			$scope.getComments = function () {
				if (!$scope.onLoad) {
					$http.get(fullurl).success(function (data) {
						$scope.numOfUpvotes = data.upVotes;
						$scope.downVote_By_User = data.downVote_By_User;
						$scope.upVote_By_User = data.upVote_By_User;
						$scope.viewsCount = data.viewsCount;
						$scope.numOfDownvotes = data.downVotes;
						$scope.commentsCount = data.commentsCount;
						$scope.comments = data.comments;
						$scope.currentPostLoaded = true;
						$scope.expandReply = function ($event) {
							var targetElement = $($event.currentTarget).closest('.replyLinkRow').parent().find('> .replyRow');
							if (targetElement.is(':visible')) {
								targetElement.css('display', 'none');
								$($event.currentTarget).find('.hideText').css('display', 'none');
							} else {
								targetElement.css('display', 'block');
								$($event.currentTarget).find('.hideText').css('display', 'inline-block');
							}
						};
						$scope.shouldBeReply = false;
						$scope.focusOnReplyInput = function () {
							if (!$scope.shouldBeReply) {
								$scope.shouldBeReplyOpen = true;
								$scope.shouldBeReply = true;
							} else {
								$scope.shouldBeReplyOpen = false;
								$scope.shouldBeReply = false;
							}
						}
					});
				} else {
					var data = $scope.currentData;
					$scope.onLoad = false;
					$scope.numOfUpvotes = data.upVotes;
					$scope.downVote_By_User = data.downVote_By_User;
					$scope.upVote_By_User = data.upVote_By_User;
					$scope.viewsCount = data.viewsCount;
					$scope.numOfDownvotes = data.downVotes;
					$scope.commentsCount = data.commentsCount;
					$scope.comments = data.comments;
					$scope.currentPostLoaded = true;
					$scope.expandReply = function ($event) {
						var targetElement = $($event.currentTarget).closest('.replyLinkRow').parent().find('> .replyRow');
						if (targetElement.is(':visible')) {
							targetElement.css('display', 'none');
							$($event.currentTarget).find('.hideText').css('display', 'none');
						} else {
							targetElement.css('display', 'block');
							$($event.currentTarget).find('.hideText').css('display', 'inline-block');
						}
					};
					$scope.shouldBeReply = false;
					$scope.focusOnReplyInput = function () {
						if (!$scope.shouldBeReply) {
							$scope.shouldBeReplyOpen = true;
							$scope.shouldBeReply = true;
						} else {
							$scope.shouldBeReplyOpen = false;
							$scope.shouldBeReply = false;
						}
					}
				}
			}
			$scope.getComments();
			$('#comment').flexible();
			$scope.comment = {};
			$scope.comment.user = $scope.currentData.subReddit_author;
			$scope.isReplyFormOpen = false;
			$scope.isCommentFormOpen = true;
			$scope.isCommentPosted = false;
			$scope.isReplyPosted = true;
			$scope.commentPost = function (commentsBody, $event) {
				$scope.isCommentPosted = false;
				$scope.isCommentPostedSuccess = false;
				var parentcommentID = $($event.currentTarget).closest('.commenttextBoxContent').find('.parentcommentID')[0].value;
				parentcommentID = parentcommentID ? parentcommentID : '';
				var action = action ? action : 'ADD';
				var fullurl = 'service/sirf/postComment';
				$http({
					method: 'POST',
					url: fullurl,
					data: {
						"commentsBody": commentsBody,
						"topicId": $scope.currentID,
						"action": action,
						"parentcommentID": parentcommentID
					}, //'commentsBody='+commentsBody+'&topicId='+$scope.currentID+'&action='+action+parentcommentID
				}).then(function (data) {
					$scope.getComments();
					$scope.isReplyOnCommentFormOpen = true;
					$scope.isCommentFormOpen = true;
					$scope.isCommentPostedSuccess = true;
					$scope.isCommentPosted = false;
					$scope.commentsBody = null;
					$timeout(function () {
						$scope.isCommentPostedSuccess = false;
						$scope.isReplyFormOpen = false;
						$scope.isCommentFormOpen = true;
					}, 3000);
				});
			}
			$rootScope.notDisabledleftrightarrow = true;
			$("body").unbind('keydown.leftrightarrow');
			$("body").bind('keydown.leftrightarrow', function (e) {
				if (!$(e.target).hasClass('commenttextBox') && $rootScope.notDisabledleftrightarrow) {
					if (e.keyCode == 37) { // left
						$('.prevLink, .prevRidetheWaveLink:visible').trigger('click');
					} else if (e.keyCode == 39) { // right
						$('.nextLink, .nextRidetheWaveLink:visible').trigger('click');
					}
				}
			});
			console.log('$scope.currentData');
			console.log($scope.currentData);
			if (!$.trim($scope.currentData.subReddit_selfTextHtml)) {
				//$('.DetailsContoller').css('overflow', 'hidden');
				var domainName = $scope.extractDomain($scope.subReddit_url);
				if (!(domainName == 'i.imgur.com' || domainName == 'imgur.com')) {
					loadIframe();
				}
			} else {
				$('.middleContainer').addClass('selfPost');
				$('.DetailsContoller').css('overflow', 'auto');
				if (!$scope.isURLImage) {
					var domainName = $scope.extractDomain($scope.subReddit_url);
					if (!(domainName == 'i.imgur.com' || domainName == 'imgur.com')) {
						loadIframe();
					}
				}
			}
		};

		function loadIframe() {
			$(document).ready(function () {
				$('.iframeContainer').each(function () {
					$('.spinnerContainer').css('display', 'table');
					$scope.source = $scope.currentData.subReddit_url;
					$timeout(function () {
						setIframeHeight(13)
					}, 800);
				});
			});
		}

		function addSandbox() {
			$('#myiframe').attr('sandbox', '').attr('frameborder', '0');
			loadIframe();
			/*$($("#myiframe").contents()[0]['scrollingElement']).css('background','red');
			console.log($("#myiframe").contents()[0]['scrollingElement']['scrollWidth']);*/
		}

		function setIframeHeight(addtionalspace) {
			$('.mainContent').each(function () {
				var element = $(this);
				var headerHeight = $('header > nav').outerHeight(true);
				var footerHeight = 0; //$('footer > div:visible').outerHeight(true);
				var postTitleHeight = $('.postTitle').outerHeight(true);
				var authorScorePanHeight = $('.authorScorePan').outerHeight(true);
				var nextPrevurlPanHeight = 0; //$('.nexturlpan:visible').outerHeight();
				var selfTextPanHeight = 0;
				if ($('.selfText').is(':visible')) {
					selfTextPanHeight = $('.selfText:visible').outerHeight(true) + 38;
				}

				var iFrameHeight = 0;
				iFrameHeight = ($scope.scrollHeight - (headerHeight + footerHeight + postTitleHeight + authorScorePanHeight));
				var iFrameWidth = '100%';
				element.css('width', iFrameWidth);
				if (iFrameHeight > 0) {
					element.css('height', iFrameHeight + 'px');
					$('.postCommentContainer').css('height', iFrameHeight + 'px');
					$('.spinnerContainer').css('height', iFrameHeight - 13 + 'px');
					$('.postContentExpander').show();
					$('.postContentExpander').css({
						'top': ((iFrameHeight / 2) - $('.postContentExpander').height()) + 'px',
						'left': ($('.mainContent').outerWidth()) + 'px'
					});
				}
				$('.iframeContainer').css('height', iFrameHeight + 'px');
			});
		}
		$scope.postContentExpand = function (ele) {
			$('.postContentContainer').addClass('col-md-12');
			$('.postContentContainer .mainContent').addClass('expanded');
			$('.postContentContainer').removeClass('col-md-8');
			$(ele).find('.fa').addClass('fa-angle-double-left');
			$(ele).find('.fa').removeClass('fa-angle-double-right');
			$('.postCommentContainer').hide();
			/*	$('.nexturlpan').parent().hide(); */
			$('footer > div').hide();
			$('.postContentExpander').hide();
			$timeout(function () {
				setIframeHeight(7)
			}, 800);
			$('.postContentExpander').css('margin-left', '-50px');
		}
		$scope.postContentCollapse = function (ele) {
			$('.postContentContainer').addClass('col-md-8');
			$('.postContentContainer').removeClass('col-md-12');
			$('.postContentContainer .mainContent').removeClass('expanded');
			$(ele).find('.fa').addClass('fa-angle-double-right');
			$(ele).find('.fa').removeClass('fa-angle-double-left');
			$('.postCommentContainer').show();
			$('.nexturlpan').parent().show();
			$('footer > div').show();
			$('.postContentExpander').hide();
			$timeout(function () {
				setIframeHeight(13)
			}, 800);
			$('.postContentExpander').css('margin-left', 'inherit');
		}
		$('.postContentExpander').bind('click', function () {
			if ($('.postContentContainer').hasClass('col-md-8')) {
				$scope.postContentExpand(this);
			} else {
				$scope.postContentCollapse(this);
			}
		});
	}

})();