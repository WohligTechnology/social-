﻿(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('MyProfileController', MyProfileController);

    MyProfileController.$inject = ['$scope', '$timeout', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$location', '$anchorScroll','toasty','$cookies','$compile'];
    function MyProfileController($scope, $timeout, $rootScope, SessionService, $parse, $http, MyCache, $location, $anchorScroll, toasty, $cookies, $compile) {
    	var vm = this;
    	$rootScope.isFavouriteEmpty = true;
    	$rootScope.isPostEmpty = true;
    	$rootScope.isSubscriberEmpty = false;
    	$scope.isCoverPhotoEmpty = true;
    	$scope.isProfilePhotoEmpty = true;
    	$rootScope.isloading = true;
    	$rootScope.isNotValidUpload = true;
    	var console = window.console || { log: function () {} };
    	/*console.log(($(window).width() * 250) / 1024);
$('.avatar-view').css('height',($(window).width() * 250) / 1024);*/
    	  $(function () {
    		  function CropAvatarCover($element, $imageView, $avatarFormSrc) {
  	      	    this.$container = $element;
  	      	    
  	      	    this.$avatarFormSrc = $avatarFormSrc;
  	      	    
  	      	    this.$avatarView = this.$container.find($imageView);
  	      	    this.$avatar = this.$avatarView.find('img.coverPhoto');
  	      	    this.$avatarModal = this.$container.find('#avatar-modal');
  	      	    this.$loading = this.$container.find('.loading');

  	      	    this.$avatarForm = this.$avatarModal.find('.avatar-form');
  	      	    this.$avatarUpload = this.$avatarForm.find('.avatar-upload');
  	      	    this.$avatarSrc = this.$avatarForm.find('.avatar-src');
  	      	    this.$avatarData = this.$avatarForm.find('.avatar-data');
  	      	    this.$avatarInput = this.$avatarForm.find('.avatar-input');
  	      	    this.$avatarSave = this.$avatarForm.find('.avatar-save');
  	      	    this.$avatarBtns = this.$avatarForm.find('.avatar-btns');

  	      	    this.$avatarWrapper = this.$avatarModal.find('.avatar-wrapper');
  	      	    this.$avatarPreview = this.$avatarModal.find('.avatar-preview');

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
  	      this.support.datauri = this.support.fileList && this.support.blobURLs;

  	      if (!this.support.formData) {
  	        this.initIframe();
  	      }

  	      this.initTooltip();
  	      this.initModal();
  	      this.addListener();
  	    },

  	    addListener: function () {
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
  	          aspectRatio: parseInt($('.avatar-view').innerWidth())/parseInt($('.avatar-view').innerHeight()),
  	          preview: this.$avatarPreview[0],
  	          crop: function (e) {
  			  console.log('start crop');
  			$('.avatar-form .fileName').val($('.avatar-form .avatar-input').val());
  			$('.avatar-form .xCoordinate').val(parseInt(e.x));
  			$('.avatar-form .yCoordinate').val(parseInt(e.y));
  			$('.avatar-form .height').val(parseInt(e.height));
  			$('.avatar-form .width').val(parseInt(e.width));
  	            /*var json = [
  	                  '{"xCoordinate":' + e.x,
  	                  '"yCoordinate":' + e.y,
  	                '"imageType": "background"',
  	                '"fileName": '+ this.url,
  	                  '"imageWidth":"1024"',
  	                  '"imageHeight":"250"',
  	                  '"height":' + e.height,
  	                  '"width":' + e.width,
  	                  '"rotate":' + e.rotate + '}'
  	                ].join();

  	            _this.$avatarData.val(json);
  	          console.log(json);
  	            console.log(_this.$avatarData.val());*/
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
        headers: {'Content-Type': undefined},
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
	        	_this.$avatarInput.val("");
	          _this.submitFail(textStatus || errorThrown);
	        },

	        complete: function (data) {
	        	_this.$avatarInput.val("");
	        	_this.submitDone(data);
	        }
  	});
  	//console.log($rootScope.userDetails);
  	      /*$.ajax(url, {
  	        type: 'post',
  	        data: data,
  	        dataType: 'json',
  	        processData: false,
  	        contentType: false,

  	        beforeSend: function (xhr) {
  	        	xhr.setRequestHeader ("Authorization", "Basic " + $rootScope.userDetails.token.authToken);
  	          _this.submitStart();
  	        },

  	        success: function (data) {
  	          _this.submitDone(data);
  	        },

  	        error: function (XMLHttpRequest, textStatus, errorThrown) {
  	          _this.submitFail(textStatus || errorThrown);
  	        },

  	        complete: function () {
  	          _this.submitEnd();
  	        }
  	      });*/
  	    },

  	    syncUpload: function () {
  	      this.$avatarSave.click();
  	    },

  	    submitStart: function () {
  	      this.$loading.fadeIn();
  	    },

  	    submitDone: function (data) {
  	      console.log(data);
  	    $rootScope.isloading = false;
  	      if ($.isPlainObject(data.data) && data.status === 200) {
  	        if (data.data.statusCode==1) {
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

  	    submitEnd: function () {
  	      
  	    },

  	    cropDone: function () {
  	      this.$avatarForm.get(0).reset();
  	      this.$avatar.attr('src', this.url);
    	  $scope.isCoverPhotoEmpty = false;
    	  $scope.$apply();
  	      this.stopCropper();
  	      this.$avatarModal.modal('hide');
  	      $(this.$avatarModal).removeClass('show');
  	    },

  	    alert: function (msg) {
  	    	if(msg=="close"){
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
    		  
    	    return new CropAvatarCover($('#crop-avatar'), '.avatar-view','service/sirfUser/upload');
    	  });
    	  $(function () {
    		  
    		  function CropAvatarProfile($element, $imageView, $avatarFormSrc) {
    	      	    this.$container = $element;
    	      	    
    	      	    this.$avatarFormSrc = $avatarFormSrc;
    	      	    
    	      	    this.$avatarView = this.$container.find($imageView);
    	      	    this.$avatar = this.$avatarView.find('img.profilePhoto');
    	      	    this.$avatarModal = this.$container.find('#avatar-modal-profile');
    	      	    this.$loading = this.$container.find('.loading');

    	      	    this.$avatarForm = this.$avatarModal.find('.avatar-form-profile');
    	      	    this.$avatarUpload = this.$avatarForm.find('.avatar-upload-profile');
    	      	    this.$avatarSrc = this.$avatarForm.find('.avatar-src');
    	      	    this.$avatarData = this.$avatarForm.find('.avatar-data');
    	      	    this.$avatarInput = this.$avatarForm.find('.avatar-input');
    	      	    this.$avatarSave = this.$avatarForm.find('.avatar-save');
    	      	    this.$avatarBtns = this.$avatarForm.find('.avatar-btns');

    	      	    this.$avatarWrapper = this.$avatarModal.find('.avatar-wrapper-profile');
    	      	    this.$avatarPreview = this.$avatarModal.find('.avatar-preview-profile');

    	      	    this.init();
    	      	  }

    		  CropAvatarProfile.prototype = {
    	    constructor: CropAvatarProfile,

    	    support: {
    	      fileList: !!$('<input type="file">').prop('files'),
    	      blobURLs: !!window.URL && URL.createObjectURL,
    	      formData: !!window.FormData
    	    },

    	    init: function () {
    	      this.support.datauri = this.support.fileList && this.support.blobURLs;

    	      if (!this.support.formData) {
    	        this.initIframe();
    	      }

    	      this.initTooltip();
    	      this.initModal();
    	      this.addListener();
    	    },

    	    addListener: function () {
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
    	          aspectRatio: 1,
    	          preview: this.$avatarPreview[0],
    	          crop: function (e) {
    			  //console.log(e);
    	        	  $('.avatar-form-profile .fileName').val($('.avatar-form-profile .avatar-input').val());
    	    			$('.avatar-form-profile .xCoordinate').val(parseInt(e.x));
    	    			$('.avatar-form-profile .yCoordinate').val(parseInt(e.y));
    	    			$('.avatar-form-profile .height').val(parseInt(e.height));
    	    			$('.avatar-form-profile .width').val(parseInt(e.width));
    	            /*var json = [
    	                  '{"x":' + e.x,
    	                  '"y":' + e.y,
    	                  '"imageWidth":"180"',
      	                  '"imageHeight":"180"',
    	                  '"height":' + e.height,
    	                  '"width":' + e.width,
    	                  '"rotate":' + e.rotate + '}'
    	                ].join();

    	            _this.$avatarData.val(json);*/
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
            headers: {'Content-Type': undefined},
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
    	  	    $rootScope.isloading = false;
    	    	      if ($.isPlainObject(data.data) && data.status === 200) {
    	    	        if (data.data.statusCode==1) {
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

    	    submitEnd: function () {
    	      this.$loading.fadeOut();
    	    },

    	    cropDone: function () {
    	      this.$avatarForm.get(0).reset();
    	      this.$avatar.attr('src', this.url);
    	      $scope.isProfilePhotoEmpty = false;
  	    	  $scope.$apply();
    	      this.stopCropper();
    	      this.$avatarModal.modal('hide');
    	      $(this.$avatarModal).removeClass('show');
    	    },

    	    alert: function (msg) {
      	    	if(msg=="close"){
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
    	  
      	  return new CropAvatarProfile($('#crop-avatar-profile'), '.avatar-profile-view','service/sirfUser/upload');
      	  });
    	
    	
    	
    	
    	
    	$scope.nextTopicLoaded = false;
    	$scope.nextTopicLoading = false;
    	$scope.expandCat = function(){
    		$scope.nextTopicLoaded = false;
    		loadConNext();
    	};

    	    //====================================
    	    // Slick 3
    	    //====================================
    	$scope.gotoAnchor = function(x) {
    		var elm = $(x);
    		var elmTop;
    		if(elm){
    			elmTop = elm.offset().top;
    		} else {
    			elmTop = 1;
    		}
    		$("body").animate({scrollTop:parseInt(elmTop-83)}, "slow");
    	  };
    		$rootScope.loadUserPage = function(){
    			$scope.topicsmypost = [];
        		$scope.topicsfavorites = [];
        		$scope.topicssubscribed = [];
        		$scope.slickConfig1Loading = false;
        		$rootScope.slickConfigmypost = {};
        		$rootScope.slickConfigfavorites = {};
        		$rootScope.slickConfigsubscribed = {};
    			$scope.slidesNumber = Math.floor((window.innerWidth-30)/200);
    			var limit;
    			switch($scope.slidesNumber){ 
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
    			//console.log($rootScope.userDetails);
    			var fullurl = 'http://59.163.47.61/service/sirfUser/getuserPage?userID='+$rootScope.userDetails.user_Id+'&limit=25&offset=0&currentUser='+$rootScope.userDetails.user_Id;
				$http.get(fullurl).then(function (response){
					$rootScope.isloading = false;
					var data = response.data;
					//console.log(data);
					$scope.userPageDataMyProfile = null;
					$scope.userPageDataMyProfile = data.userPageData;
					$rootScope.userPageData = null;
					$rootScope.userPageData = data.userPageData;
					$cookies.putObject('userPageData', $rootScope.userPageData);
					if($scope.userPageDataMyProfile['User Info'].backgroundImage){
						$scope.isCoverPhotoEmpty = false;
					} else {
						$scope.isCoverPhotoEmpty = true;
					}
					if($scope.userPageDataMyProfile['User Info'].profileImage){
						$scope.isProfilePhotoEmpty = false;
					} else {
						$scope.isProfilePhotoEmpty = true;
					}
					//console.log('$rootScope');
					//console.log($rootScope);
					$timeout(function(){
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
								  responsive: [
									  {
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
								  responsive: [
									  {
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
									  responsive: [
										  {
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
									  responsive: [
										  {
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
					$timeout(function(){$('.slick-prev').addClass('slick-disabled'); /*$('.col-md-12.row-block.content').find('.slick-slide').hoverIntent(config);*/ $scope.slickConfig1Loading = false;}, 2000);
					//console.log($scope.userPageData);
					//console.log('Favourite');
					//console.log($scope.userPageData['Favourite']);
					if($scope.userPageData['Favourite'].length > 0){
						$rootScope.isFavouriteEmpty = false;
					}
					if($scope.userPageData['My Post'].length > 0){
						$rootScope.isPostEmpty = false;
					}
				}, function (data, status){
					
				});
				
    		}
    		$rootScope.loadUserPage();
    		$scope.getPerm = function(permlink){
    			var permalink = permlink.split('/');
    			return permalink[permalink.length-2];
    		}
    		
    		$(document).on("click", '.removefaviconclick', function($event) {
    			$event.stopPropagation();
    				$rootScope.removeFavourite($(this).attr('favname'), $event);
    		});
    		$scope.isloadingremoveFavourite = false;
    		var removefaviconclicked = false;
    		$rootScope.removeFavourite = function(favouriteName, $event){
    			if(removefaviconclicked==false){
    				removefaviconclicked = true;
	    			console.log('triggered removeFavourite');
	    			var currentIndex = $($event.currentTarget).closest('.favoritesngrepeat').index('.favoritesngrepeat');
	    			var fullurl = 'http://59.163.47.61/service/sirfUser/deleteUserFavourite';
	    			$($event.currentTarget).closest('.favoritesngrepeat').find('.loadingdataoverlay').removeClass('ng-hide');
	  			  $http({
	  					method: 'POST',
	  					url: fullurl,
	  					data: {"currentUserId":$rootScope.userDetails.user_Id, "favouriteName":favouriteName},//'Action=UP_VOTE&topicId='+$scope.currentID
	  				}).then(function (data){
	  					//console.log(data.data);
	  					if(data.data.success == true){
	  						$rootScope.slickConfigfavorites.method.slickRemove(currentIndex);
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
	  					$scope.isloadingremoveFavourite = false;
	  					removefaviconclicked = false;
	  				});
    			}
    		}
    		
    		$scope.unsubscribeuser = function(user, $event){
    			var currentIndex = $($event.currentTarget).closest('.subscribengrepeat').index('.subscribengrepeat');
    			$($event.currentTarget).closest('.subscribengrepeat').find('.loadingdataoverlay').removeClass('ng-hide');
    			var fullurl = 'http://59.163.47.61/service/sirfUser/subscriberPage';
    			  $http({
    					method: 'POST',
    					url: fullurl,
    					data: {"subscriberUserId":user, "action":"DELETE"},//'Action=UP_VOTE&topicId='+$scope.currentID
    				}).then(function (data){
    					//console.log(data.data);
    					if(data.data.success == true){
    						$rootScope.slickConfigsubscribed.method.slickRemove(currentIndex);
	  	  					toasty.info({
	  	  						title: 'Successfully Unsubscribe',
	  	  						msg: 'You have successfully unsubscribe '+user+' !'
	  	  					});
    					} else {
    						toasty.error({
	  	  						title: 'Not Unsubscribe',
	  	  						msg: 'Some technical issues are occured, not Unsubscribe!'
	  	  					});
    					}
    				});
    		}
    		$scope.isloadingremovePost = false;
    		$scope.removePost = function(postId, $event){
    			var currentIndex = $($event.currentTarget).closest('.postngrepeat').index('.postngrepeat');
    			$($event.currentTarget).closest('.postngrepeat').find('.loadingdataoverlay').removeClass('ng-hide');
    			var fullurl = 'http://59.163.47.61/service/sirfUser/deletePost';
    			  $http({
    					method: 'POST',
    					url: fullurl,
    					data: {"sirfId":postId},//'Action=UP_VOTE&topicId='+$scope.currentID
    				}).then(function (data){
    					//console.log(data.data);
    					if(data.data.success == true){
    						$rootScope.slickConfigmypost.method.slickRemove(currentIndex);
    						if($('.mypost .slick-track .slick-slide').length == 0){
	  							$rootScope.isPostEmpty = true;
	  						}
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
