(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('SignInUpController', SignInUpController);

    SignInUpController.$inject = ['UserService', '$rootScope', 'FlashService', '$location','$ocModal'];
    function SignInUpController(UserService, $rootScope, FlashService, $location,$ocModal) {
    	//console.log('SignInUpController');
        var vm = this;

    }

})();
