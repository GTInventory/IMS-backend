"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authorizer_1 = require("./authorizer");
/**
 * Fulfills incoming router requests.
 */
var Controller = (function () {
    function Controller(db) {
        var _this = this;
        /// Attribute Operations
        this.getAttributes = function (req, res) {
            if (req.params.q !== undefined)
                _this.db.getEquipmentAttributesWithNameLike(req.params.q).then(function (attributes) { return _this.sendResponse(res, attributes); });
            else
                _this.db.getEquipmentAttributes().then(function (attributes) { return _this.sendResponse(res, attributes); });
        };
        this.getAttribute = function (req, res) {
            return _this.db.getEquipmentAttributeById(req.params.id).then(function (attribute) { return _this.sendResponse(res, attribute); });
        };
        this.postAttribute = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.AttributeAdd, req))
                _this.sendUnauthorized(res);
            else
                _this.db.insertEquipmentAttribute(req.body)
                    .then(function (attribute) { res.redirect('/attribute/' + attribute.id); })
                    .error(function (e) { return _this.sendError(res, 'Error creating attribute.', 500, e); });
        };
        /// Type Operations
        // TODO: modify so some people can see unavailable equipment types?
        this.getTypes = function (req, res) {
            if (req.params.q !== undefined)
                _this.db.getEquipmentTypesWithNameLike(req.params.q).then(function (types) { return _this.sendResponse(res, types); });
            else
                _this.db.getAvailableEquipmentTypes().then(function (types) { return _this.sendResponse(res, types); });
        };
        this.getType = function (req, res) {
            return _this.db.getEquipmentTypeById(req.params.id).then(function (type) { return _this.sendResponse(res, type); });
        };
        this.postType = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.TypeAdd, req))
                _this.sendUnauthorized(res);
            else
                _this.db.insertEquipmentType(req.body)
                    .then(function (type) { res.redirect('/type/' + type.id); })
                    .error(function (e) { return _this.sendError(res, 'Error creating type', 500, e); });
        };
        /**
         * JSONifies and sends an error response.
         *
         * `code` is the HTTP status code sent back. Default: 500
         * `debug` is optional debugging content that will be sent back if environment var `DEBUG` is set.
         */
        this.sendError = function (res, err, code, debug) {
            return res.json({
                'success': false,
                'error': err,
                'debug': (process.env.DEBUG ? debug : undefined)
            }).status(code ? code : 500);
        };
        /**
         * JSONifies and attached a `success` attribute to an outgoing API response.
         *
         * If `value` is falsy, it will use `sendError` to send a 404 response back.
         */
        this.sendResponse = function (res, value) {
            if (!value)
                _this.sendError(res, 'Resource not found.', 404);
            else
                res.json({
                    'success': true,
                    'result': value
                }).end();
        };
        /**
         * Sends an unauthorized message. Used primarily when `Authorizer.has` fails.
         */
        this.sendUnauthorized = function (res) {
            return _this.sendError(res, "Access level insufficient for this resource.", 403);
        };
        this.db = db;
        this.auth = new authorizer_1.Authorizer();
    }
    return Controller;
}());
exports.default = Controller;
