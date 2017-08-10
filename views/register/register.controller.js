(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['UserService', '$rootScope', 'FlashService', '$location','$ocModal','$scope'];
    function RegisterController(UserService, $rootScope, FlashService, $location,$ocModal,$scope) {
    	$rootScope.flash = {};
        var rc = this;

        rc.register = register;
        $scope.remove = function(item) { 
        	var prop = "password_c";
        	delete rc.user[prop];   
        	}
        $scope.resetForm = function(form) {
            //Even when you use form = {} it does not work
            angular.copy({},form);
            $scope.formSignup.$setPristine();
            $scope.formSignup.$setUntouched();
          }
        function register() {
            rc.dataLoading = true;
            $scope.remove(['password_c']);
            $scope.formSignup.$setPristine();
            $scope.formSignup.$setUntouched();
            UserService.Create(rc.user)
                .then(function (response) {
                	console.log(response);
                    if (response.success) {
                        FlashService.Success('Registration successful', true);
                        rc.dataLoading = false;
                        $scope.resetForm(rc.user);
                    } else {
                        FlashService.Error(response.statusMessage);
                        rc.dataLoading = false;
                        $scope.formSignup.$setPristine();
                        $scope.formSignup.$setUntouched();
                    }
                });
        }
    }

})();
