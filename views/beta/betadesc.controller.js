(function () {
    'use strict';

    angular
        .module('SirfApp')
        .controller('BetaDescController', BetaDescController);

    BetaDescController.$inject = ['$scope', '$timeout', '$routeParams', '$rootScope', 'SessionService', '$parse', '$http', 'MyCache', '$filter', '$sce', 'Utils','toasty','$window'];
    function BetaDescController($scope, $timeout, $routeParams, $rootScope, SessionService, $parse, $http, MyCache, $filter, $sce, Utils, toasty, $window) {}

})();
