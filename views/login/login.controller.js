(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService', '$rootScope', '$scope', '$templateCache', '$sce', '$http', '$ocModal', '$cookies', '$window'];

    function LoginController($location, AuthenticationService, FlashService, $rootScope, $scope, $templateCache, $sce, $http, $ocModal, $cookies, $window) {

        //console.log('LoginController 1');
        var lc = this;
        $scope.abc = 'ABC';
        (function initController() {
            // reset login status
            //AuthenticationService.ClearCredentials();


        })();

        function login() {
            //console.log('login');

            lc.dataLoading = true;
            AuthenticationService.Login(lc.userId, lc.password, function (response) {
                console.log(response.sirfLoggedInUser.user_Privileges);
                if (response.success) {
                    $cookies.putObject('expiresIn', response.authToken.expiresIn);
                    $cookies.putObject('issuedAt', response.authToken.issuedAt);
                    $rootScope.loginDetails.isLoggedIn = true;
                    $rootScope.userpriv = response.sirfLoggedInUser.user_Privileges;
                    $rootScope.loginDetails.isLoggedInClass = 'isLoggedInTrue';
                    $rootScope.loginDetails.isLoggedInProfileClass = 'isLoggedInProfileClassTrue';
                    lc.dataLoading = false;
                    //AuthenticationService.SetCredentials(lc.userId, lc.password);
                    AuthenticationService.SetAuthdata(response.sirfLoggedInUser.user_Id, response.authToken.authToken);
                    AuthenticationService.SetCurrentUser(response.sirfLoggedInUser);
                    $scope.closeModal();
                    lc = [];
                    $scope.formSignin.userId.$dirty = true;
                    $scope.formSignin.userId.$error = true;
                    $scope.formSignin.password.$dirty = true;
                    $scope.formSignin.password.$error = true;
                    //window.location.reload();
                    /*var fullurl = 'service/sirfUser/getuserPage?userID='+$rootScope.userDetails.user_Id+'&limit=25&offset=0&currentUser='+$rootScope.userDetails.user_Id;
				$http.get(fullurl).then(function (response){
					var data = response.data;
					$rootScope.userPageData = data.userPageData;
					$cookies.putObject('userPageData', $rootScope.userPageData);
					window.location.reload();
				});*/
                } else {
                    $rootScope.loginDetails.isLoggedIn = false;
                    $rootScope.loginDetails.isLoggedInClass = 'isLoggedInFalse';
                    $rootScope.loginDetails.isLoggedInProfileClass = 'isLoggedInProfileClassFalse';
                    FlashService.Error(response.statusMessage);
                    lc.dataLoading = false;
                }
                //console.log($rootScope.loginDetails);
            });
        };
        lc.login = login;
    }
})();