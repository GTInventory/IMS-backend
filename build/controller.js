"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Controller = (function () {
    function Controller(db) {
        this.db = db;
    }
    Controller.prototype.getAvailableEquipmentTypes = function () {
        return this.db.getAvailableEquipmentTypes();
    };
    return Controller;
}());
exports.default = Controller;
