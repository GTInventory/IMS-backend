"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Permission;
(function (Permission) {
    Permission[Permission["AttributeAdd"] = 0] = "AttributeAdd";
    Permission[Permission["TypeAdd"] = 1] = "TypeAdd";
})(Permission = exports.Permission || (exports.Permission = {}));
var Authorizer = (function () {
    function Authorizer() {
    }
    /**
     * Does `req` have `permission`?
     *
     * Stubbed out for now.
     */
    Authorizer.prototype.has = function (permission, req) {
        return true;
    };
    return Authorizer;
}());
exports.Authorizer = Authorizer;
