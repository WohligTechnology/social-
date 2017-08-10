(function () {
    'use strict';
    angular
        .module('SirfApp')
        .controller('MyPreferenceController', MyPreferenceController);
    MyPreferenceController.$inject = ['$scope', '$cookies', '$timeout', '$routeParams', '$route', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$filter', '$sce', 'Utils', 'toasty', 'Upload', '$window'];

    function MyPreferenceController($scope, $cookies, $timeout, $routeParams, $route, $rootScope, SessionService, $parse, $http, MyCache, $filter, $sce, Utils, toasty, Upload, $window) {
        var cp = this;
    }

})();