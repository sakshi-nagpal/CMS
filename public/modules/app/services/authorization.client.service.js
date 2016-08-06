'use strict';

define([], function () {
    return ['Authorization', ['Authentication', '$rootScope', function (Authentication, $rootScope) {
        var _this = this;
        _this.capabilities = window.capabilities;
        return {
            canAccess: function (capability) {
                var permittedRoles = $rootScope.$eval(capability, $rootScope.capabilities);

                var canAccess = false;
                for (var i = 0; i < permittedRoles.length; i++) {
                    var userRoles = Authentication.user.roles;

                    if (userRoles.filter(function (n) {
                            return permittedRoles[i].indexOf(n) !== -1;
                        }).length) {
                        canAccess = true;
                        break;
                    }
                }
                return canAccess;
            },
            capabilities: _this.capabilities
        };
    }]];
});
