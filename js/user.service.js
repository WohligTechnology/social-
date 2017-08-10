(function () {
    'use strict';

    angular
        .module('SirfApp')
        .factory('UserService', UserService);

    UserService.$inject = ['$http', '$timeout', '$filter', '$q'];

    function UserService($http, $timeout, $filter, $q) {
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetAll() {
            return $http.get('http://59.163.47.61/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function GetById(id) {
            return $http.get('http://59.163.47.61/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {
            return $http.get('http://59.163.47.61/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Create(user) {
            return $http.post('http://59.163.47.61/service/sirf/signUpUser', user).then(handleSuccess, handleError('Error creating user'));
        }

        function Update(user) {
            return $http.put('http://59.163.47.61/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('http://59.163.47.61/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            console.log(res);
            return res.data;
        }

        function handleError(error) {
            console.log(error);
            return function () {
                return {
                    success: false,
                    message: error
                };
            };
        }
    }

})();