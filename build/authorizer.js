"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Permission;
(function (Permission) {
    Permission[Permission["AttributeAdd"] = 0] = "AttributeAdd";
    Permission[Permission["AttributeEdit"] = 1] = "AttributeEdit";
    Permission[Permission["AttributeDelete"] = 2] = "AttributeDelete";
    Permission[Permission["TypeAdd"] = 3] = "TypeAdd";
    Permission[Permission["TypeEdit"] = 4] = "TypeEdit";
    Permission[Permission["TypeDelete"] = 5] = "TypeDelete";
    Permission[Permission["ItemAdd"] = 6] = "ItemAdd";
    Permission[Permission["ItemEdit"] = 7] = "ItemEdit";
    Permission[Permission["ItemDelete"] = 8] = "ItemDelete";
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