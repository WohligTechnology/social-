(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('AllcategoriesController', AllcategoriesController);

    AllcategoriesController.$inject = ['UserService', '$rootScope', 'FlashService', '$location','$ocModal','$scope', '$http','$compile','$timeout'];
    function AllcategoriesController(UserService, $rootScope, FlashService, $location,$ocModal,$scope,$http,$compile,$timeout) {
    	var ac = this;
        $(function () {
        	
        });
        
        
    }

})();
