(function () {
	'use strict';

	angular
		.module('SirfApp')
		.controller('CategoryController', CategoryController);

	CategoryController.$inject = ['UserService', '$rootScope', 'FlashService', '$location', '$ocModal', '$scope', '$http', '$compile', '$timeout', 'toasty'];

	function CategoryController(UserService, $rootScope, FlashService, $location, $ocModal, $scope, $http, $compile, $timeout, toasty) {
		var cc = this;
		$rootScope.isloading = false;
		cc.formCreateCategory = formCreateCategory;
		$(function () {
			$('#favouriteName').focus();
			$scope.isCoverImageEmpty = true;

			function CropAvatarCover($element, $imageView, $avatarFormSrc) {
				this.$container = $element;

				this.$avatarFormSrc = $avatarFormSrc;

				this.$avatarView = this.$container.find($imageView);
				this.$avatar = this.$avatarView.find('img.coverPhoto');
				this.$avatarModal = this.$container.find('#avatar-modal-cover');
				this.$loading = this.$container.find('.loading');

				this.$avatarForm = this.$avatarModal.find('.avatar-form');
				this.$avatarUpload = this.$avatarForm.find('.avatar-upload-cover');
				this.$avatarSrc = this.$avatarForm.find('.avatar-src');
				this.$avatarData = this.$avatarForm.find('.avatar-data');
				this.$avatarInput = this.$avatarForm.find('.avatar-input');
				this.$avatarSave = this.$avatarForm.find('.avatar-save');
				this.$avatarBtns = this.$avatarForm.find('.avatar-btns');

				this.$avatarWrapper = this.$avatarModal.find('.avatar-wrapper-cover');
				this.$avatarPreview = this.$avatarModal.find('.avatar-preview-cover');

				this.init();
			}

			CropAvatarCover.prototype = {
				constructor: CropAvatarCover,

				support: {
					fileList: !!$('<input type="file">').prop('files'),
					blobURLs: !!window.URL && URL.createObjectURL,
					formData: !!window.FormData
				},

				init: function () {
					//console.log('init');
					this.support.datauri = this.support.fileList && this.support.blobURLs;

					if (!this.support.formData) {
						this.initIframe();
					}

					this.initTooltip();
					this.initModal();
					this.addListener();
				},

				addListener: function () {
					//console.log('addListener');
					//console.log(this);
					//console.log(this.$avatarInput);
					this.$avatarView.on('click', $.proxy(this.click, this));
					this.$avatarInput.on('change', $.proxy(this.change, this));
					this.$avatarForm.on('submit', $.proxy(this.submit, this));
					this.$avatarBtns.on('click', $.proxy(this.rotate, this));
				},

				initTooltip: function () {
					this.$avatarView.tooltip({
						placement: 'bottom'
					});
				},

				initModal: function () {
					this.$avatarModal.modal({
						show: false
					});
					$(this.$avatarModal).on('hidden.bs.modal', function () {
						$(this).removeClass('show');
					})
				},

				initPreview: function () {
					var url = this.$avatar.attr('src');

					this.$avatarPreview.html('<img src="' + url + '">');
				},

				initIframe: function () {
					var target = 'upload-iframe-' + (new Date()).getTime();
					var $iframe = $('<iframe>').attr({
						name: target,
						src: ''
					});
					var _this = this;

					// Ready ifrmae
					$iframe.one('load', function () {

						// respond response
						$iframe.on('load', function () {
							var data;

							try {
								data = $(this).contents().find('body').text();
							} catch (e) {
								console.log(e.message);
							}

							if (data) {
								try {
									data = $.parseJSON(data);
								} catch (e) {
									console.log(e.message);
								}

								_this.submitDone(data);
							} else {
								_this.submitFail('Image upload failed!');
							}

							_this.submitEnd();

						});
					});

					this.$iframe = $iframe;
					this.$avatarForm.attr('target', target).after($iframe.hide());
				},

				click: function () {
					$(this.$avatarModal).addClass('modal');
					this.$avatarModal.modal('show');
					$(this.$avatarModal).addClass('show');
					this.initPreview();
					this.alert('close');
					$rootScope.isNotValidUpload = true;
					$rootScope.$apply();
				},

				change: function () {
					var files;
					var file;
					if (this.support.datauri) {
						files = this.$avatarInput.prop('files');

						if (files.length > 0) {
							file = files[0];

							if (this.isImageFile(file)) {
								$rootScope.isNotValidUpload = false;
								if (this.url) {
									URL.revokeObjectURL(this.url); // Revoke the old one
								}

								this.url = URL.createObjectURL(file);
								this.startCropper();
								this.alert('close');
							} else {
								this.alert('Please select a valid file');
								$rootScope.isNotValidUpload = true;
							}
						}
					} else {
						file = this.$avatarInput.val();

						if (this.isImageFile(file)) {
							$rootScope.isNotValidUpload = false;
							this.syncUpload();
						}
					}
					$rootScope.$apply();
				},

				submit: function () {
					if (!this.$avatarSrc.val() && !this.$avatarInput.val()) {
						return false;
					}
					if (this.support.formData) {
						$rootScope.isloading = true;
						//this.$avatarModal.modal('hide');
						//$(this.$avatarModal).removeClass('show');
						this.ajaxUpload(this.$avatarFormSrc);
						return false;
					}
				},

				rotate: function (e) {
					var data;

					if (this.active) {
						data = $(e.target).data();

						if (data.method) {
							this.$img.cropper(data.method, data.option);
						}
					}
				},

				isImageFile: function (file) {
					if (file.type) {
						return /^image\/\w+$/.test(file.type);
					} else {
						return /\.(jpg|jpeg|png|gif)$/.test(file);
					}
				},

				startCropper: function () {
					var _this = this;

					if (this.active) {
						this.$img.cropper('replace', this.url);
					} else {
						this.$img = $('<img src="' + this.url + '">');
						this.$avatarWrapper.empty().html(this.$img);
						this.$img.cropper({
							aspectRatio: parseInt($('.avatar-cover-view').innerWidth()) / parseInt($('.avatar-cover-view').innerHeight()),
							preview: this.$avatarPreview[0],
							crop: function (e) {
								$('.avatar-form-category .fileName').val($('.avatar-form-category .avatar-input').val());
								$('.avatar-form-category .xCoordinate').val(parseInt(e.x));
								$('.avatar-form-category .yCoordinate').val(parseInt(e.y));
								$('.avatar-form-category .height').val(parseInt(e.height));
								$('.avatar-form-category .width').val(parseInt(e.width));
							}
						});
						this.active = true;
					}

					this.$avatarModal.one('hidden.bs.modal', function () {
						_this.$avatarPreview.empty();
						_this.stopCropper();
					});
				},

				stopCropper: function () {
					if (this.active) {
						this.$img.cropper('destroy');
						this.$img.remove();
						this.active = false;
					}
				},

				ajaxUpload: function ($avatarFormSrc) {
					var url = $avatarFormSrc;
					var data = new FormData(this.$avatarForm[0]);
					var _this = this;
					console.log(_this.$avatarData.val());
					$http({
						method: 'POST',
						url: url,
						data: data,
						dataType: 'json',
						processData: false,
						headers: {
							'Content-Type': undefined
						},
						beforeSend: function () {
							console.log('beforeSend');
							_this.submitStart();
						},

						success: function (data) {
							console.log('success');
							_this.submitDone(data);
							_this.$avatarInput.val("");
						},

						error: function (XMLHttpRequest, textStatus, errorThrown) {
							console.log(errorThrown);
							_this.submitFail(textStatus || errorThrown);
							_this.$avatarInput.val("");
						},

						complete: function (data) {
							_this.submitDone(data);
							_this.$avatarInput.val("");
						}
					});
				},

				syncUpload: function () {
					this.$avatarSave.click();
				},

				submitStart: function () {
					this.$loading.fadeIn();
				},

				submitDone: function (data) {
					console.log(data);
					if ($.isPlainObject(data.data) && data.status === 200) {
						if (data.data.statusCode == 1) {
							$rootScope.isloading = false;
							this.$avatarModal.modal('hide');
							$(this.$avatarModal).removeClass('show');
							this.url = data.data.urlPath;

							if (this.support.datauri || this.uploaded) {
								this.uploaded = false;
								this.cropDone();
							} else {
								this.uploaded = true;
								this.$avatarSrc.val(this.url);
								this.startCropper();
							}

							this.$avatarInput.val('');
						} else if (data.data.statusMessage) {
							this.alert(data.data.statusMessage);
							$rootScope.isNotValidUpload = true;
						}
					} else {
						this.alert('Failed to response');
					}
				},

				submitFail: function (msg) {
					this.alert(msg);
				},

				submitEnd: function () {},

				cropDone: function () {
					this.$avatarForm.get(0).reset();
					this.$avatar.attr('src', this.url);
					cc.favourites.imageLocation = this.url;
					$scope.isCoverImageEmpty = false;
					//$scope.$apply();
					this.stopCropper();
					this.$avatarModal.modal('hide');
					$(this.$avatarModal).removeClass('show');
				},

				alert: function (msg) {
					if (msg == "close") {
						$('.alert-danger').remove();
					} else {
						this.stopCropper();
						var $alert = [
							'<div class="alert alert-danger avatar-alert alert-dismissable">',
							'<button type="button" class="close" data-dismiss="alert">&times;</button>',
							msg,
							'</div>'
						].join('');

						this.$avatarUpload.after($alert);
					}
				}
			};

			return new CropAvatarCover($('#crop-cover-image'), '.avatar-cover-view', 'http://59.163.47.61/service/sirfUser/upload');

		});
		$scope.scopeuserDetails = {};
		cc.favourites = {
			imageLocation: ''
		};

		function formCreateCategory() {
			//console.log(cc.favourites);
			cc.dataLoading = true;
			cc.favourites.currentUserId = $rootScope.userDetails.user_Id;
			var fullurl = 'http://59.163.47.61/service/sirfUser/addUserFavourite';
			$http.post(fullurl, cc.favourites).then(function (data) {
				//console.log(data);
				cc.dataLoading = false;
				//$rootScope.loadUserPage();
				if (data.data.success) {
					if ($('.myProfileTab').length > 0 || $('.profileTab').length > 0) {
						$scope.i = cc.favourites;
						//console.log($scope.i);
						var compiledContainer = $compile(angular.element('<div class="favoritesngrepeat"><div ng-include="\'favoritestpl.html\'"></div><div class="loadingdataoverlay" ng-show="isloadingremoveFavourite"><div class="loadingdata"></div></div></div>'))($scope);
						var compiledSlider = $rootScope.slickConfigfavorites.method.slickAdd(compiledContainer, true);
					} else {
						$rootScope.getAllFavouriteList();
					}
					$scope.closeModal();
					$('.slick-prev').addClass('slick-disabled');
					$rootScope.isFavouriteEmpty = false;
					toasty.info({
						title: 'Added favorite',
						msg: 'You have successfully added ' + cc.favourites.favouriteName + '!'
					});
				} else {
					toasty.error({
						title: data.data.statusMessage
					});
				}
			});
		}
	}

})();