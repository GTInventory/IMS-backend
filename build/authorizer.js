"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Permission;
(function (Permission) {
    Permission[Permission["AttributeAdd"] = 0] = "AttributeAdd";
    Permission[Permission["AttributeEdit"] = 1] = "AttributeEdit";
    Permission[Permission["TypeAdd"] = 2] = "TypeAdd";
    Permission[Permission["TypeEdit"] = 3] = "TypeEdit";
    Permission[Permission["ItemAdd"] = 4] = "ItemAdd";
    Permission[Permission["ItemEdit"] = 5] = "ItemEdit";
})(Permission = exports.Permission || (exports.Permission = {}));
var Authorizer = /** @class */ (function () {
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
//# sourceMappingURL=authorizer.js.map