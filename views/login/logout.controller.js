(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$location', 'AuthenticationService', 'FlashService'];
    function LogoutController($location, AuthenticationService, FlashService) {
        	AuthenticationService.ClearCredentials();

    }

})();
