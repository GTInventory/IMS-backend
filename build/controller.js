"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var authorizer_1 = require("./authorizer");
var bluebird_1 = require("bluebird");
var DEFAULT_LIMIT = 50; // Default # of items to return
var MAX_LIMIT = 1000; // Maximum permissible limit
/**
 * Fulfills incoming router requests.
 */
var Controller = /** @class */ (function () {
    function Controller(db) {
        var _this = this;
        /// Attribute Operations
        this.getAttributes = function (req, res) {
            if (req.query.q !== undefined)
                _this.db.getAttributesWithNameLike(req.query.q, req.query.start, req.query.limit)
                    .then(function (attributes) { return _this.sendResponse(res, attributes); });
            else
                _this.db.getAttributes(req.query.start, req.query.limit).then(function (attributes) { return _this.sendResponse(res, attributes); });
        };
        this.getAttribute = function (req, res) {
            return _this.db.getAttributeById(req.params.id).then(function (attribute) { return _this.sendResponse(res, attribute); });
        };
        this.postAttribute = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.AttributeAdd, req))
                _this.sendUnauthorized(res);
            else
                _this.db.insertAttribute(req.body)
                    .then(function (attribute) { return _this.sendResponse(res, { id: attribute.id }); });
        };
        this.updateAttribute = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.AttributeEdit, req))
                _this.sendUnauthorized(res);
            else
                _this.db.updateAttribute(req.params.id, req.body)
                    .then(function (attribute) { return _this.sendResponse(res, { id: req.params.id }); });
        };
        this.deleteAttribute = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.AttributeDelete, req))
                _this.sendUnauthorized(res);
            else
                _this.db.updateAttribute(req.params.id, { deleted: true })
                    .then(function (attribute) { _this.sendResponse(res, { deleted: true }); });
        };
        /// Type Operations
        // TODO: modify so some people can see unavailable equipment types?
        this.getTypes = function (req, res) {
            if (req.query.q !== undefined)
                _this.db.getTypesWithNameLike(req.query.q, req.query.start, req.query.limit)
                    .then(function (types) { return _this.sendResponse(res, types); });
            else
                _this.db.getAvailableTypes(req.query.start, req.query.limit).then(function (types) { return _this.sendResponse(res, types); });
        };
        this.getType = function (req, res) {
            return _this.db.getTypeById(req.params.id).then(function (type) {
                _this.sendResponse(res, type);
            });
        };
        this.postType = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.TypeAdd, req))
                _this.sendUnauthorized(res);
            else if (!req.body.attributes || !req.body.attributes.find(function (x) { return x.id == req.body.nameAttribute; })) {
                _this.sendError(res, 'nameAttribute must exist in attributes');
                return;
            }
            _this.db.validateAttributeIds(req.body.attributes.map(function (x) { return x.id; })).then(function (valid) {
                _this.db.insertType(req.body)
                    .then(function (type) {
                    try {
                        for (var _i = 0, _a = req.body.attributes; _i < _a.length; _i++) {
                            var attribute = _a[_i];
                            attribute.attributeId = attribute.id;
                            type.addAttribute(attribute.id, { through: attribute });
                        }
                        _this.sendResponse(res, { id: type.id });
                    }
                    catch (e) {
                        if (_this.isKeyError(e))
                            _this.sendError(res, '');
                    }
                });
            })
                .catch(function (e) { return _this.sendError(res, 'The referenced attributes are not valid'); });
        };
        this.postTypeAttribute = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.TypeEdit, req))
                _this.sendUnauthorized(res);
            else
                _this.db.getTypeById(req.params.id).then(function (type) {
                    if (!type)
                        _this.sendNotFound(res);
                    else
                        type.getAttributes().then(function (attributes) {
                            if (attributes.find(function (a) { return a.id == req.body.attribute.id; }))
                                _this.sendError(res, 'Attribute already exists on type');
                            else {
                                req.body.attribute.attributeId = req.body.attribute.id;
                                type.addAttribute(req.body.attribute.id, { through: req.body.attribute }).then(function (x) {
                                    _this.sendResponse(res, { id: type.id });
                                }).catch(function (e) {
                                    if (_this.isKeyError(e))
                                        _this.sendError(res, 'Referenced attribute does not exist');
                                    else
                                        _this.sendError(res, 'Error adding attribute', 500, e);
                                });
                            }
                        });
                });
        };
        this.updateType = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.TypeEdit, req))
                _this.sendUnauthorized(res);
            else
                _this.db.updateType(req.params.id, req.body)
                    .then(function (type) { _this.sendResponse(res, { id: req.params.id }); });
        };
        this.deleteType = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.TypeDelete, req))
                _this.sendUnauthorized(res);
            else
                _this.db.updateType(req.params.id, { deleted: true })
                    .then(function (type) { _this.sendResponse(res, { deleted: true }); });
        };
        /// Equipment/Item Operations
        this.getItems = function (req, res) {
            if (req.query.q) {
                _this.db.searchItemsByAttributes(req.query.q, req.query.start, req.query.limit).then(function (items) {
                    _this.sendResponse(res, items);
                });
            }
            else {
                _this.db.getAllItems(req.query.start, req.query.limit).then(function (items) { return _this.sendResponse(res, items); });
            }
        };
        this.getItem = function (req, res) {
            return _this.db.getItemById(req.params.id).then(function (item) { return _this.sendResponse(res, item); });
        };
        this.postItem = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.ItemAdd, req))
                _this.sendUnauthorized(res);
            else
                _this.validateItemBody(undefined, req.body).then(function (errors) {
                    if (errors.length)
                        return _this.sendError(res, errors.join(', '));
                    _this.db.insertItem(req.body)
                        .then(function (item) {
                        _this.createAttributeInstances(item, req.body.attributes).then(function (x) {
                            return _this.sendResponse(res, { id: item.id });
                        });
                    });
                });
        };
        this.postItems = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.ItemAdd, req))
                _this.sendUnauthorized(res);
            else {
                bluebird_1.Promise.all(req.body.map(function (item) { return _this.validateItemBody(undefined, item); })).then(function (errors) {
                    if (errors.reduce(function (prev, cur, i) { return cur; }) > 0) {
                        _this.sendError(res, errors.map(function (errorSet) { return errorSet.join(', '); }).join('; '));
                    }
                    else {
                        var inserted_1 = [];
                        req.body.forEach(function (item) {
                            _this.db.insertItem(item).then(function (createdItem) {
                                _this.createAttributeInstances(createdItem, item.attributes).then(function (x) {
                                    inserted_1.push(createdItem.id);
                                    if (inserted_1.length == req.body.length) {
                                        _this.sendResponse(res, { ids: inserted_1 });
                                    }
                                });
                            });
                        });
                    }
                });
            }
        };
        this.updateItem = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.ItemEdit, req))
                _this.sendUnauthorized(res);
            else
                _this.db.getItemById(req.params.id).then(function (item) {
                    if (!item)
                        _this.sendNotFound(res);
                    else
                        _this.validateItemBody(item, req.body).then(function (errors) {
                            if (errors.length)
                                return _this.sendError(res, errors.join(', '));
                            _this.db.updateItem(item.id, req.body)
                                .then(function (tem) {
                                _this.createAttributeInstances(item, req.body.attributes).then(function (x) {
                                    return _this.sendResponse(res, { id: item.id });
                                });
                            });
                        });
                });
        };
        this.deleteItem = function (req, res) {
            if (!_this.auth.has(authorizer_1.Permission.ItemDelete, req))
                _this.sendUnauthorized(res);
            else
                _this.db.updateItem(req.params.id, { deleted: true })
                    .then(function (item) { _this.sendResponse(res, { deleted: true }); });
        };
        this.createAttributeInstances = function (item, attributes) {
            return bluebird_1.Promise.all(attributes.map(function (attribute) { return _this.db.insertAttributeInstance({
                attributeId: attribute.attributeId,
                value: attribute.value
            }); })).then(function (instances) { return item.addAttributes(instances); });
        };
        this.validateItemBody = function (item, body) {
            var errors = [];
            return _this.db.getTypeById(body.typeId).then(function (type) {
                if (!type)
                    errors.push('Non-existent type specified');
                else {
                    for (var _i = 0, _a = type.attributes; _i < _a.length; _i++) {
                        var attributeSpec = _a[_i];
                        var attribute = body.attributes.find(function (a) { return a.attributeId == attributeSpec.id; });
                        if ((!attribute || !attribute.value) && attributeSpec.attributeType.required == 'Required' && !item) {
                            errors.push("\"" + attributeSpec.name + "\" requires a value");
                        }
                        else if (attribute && attribute.value) {
                            var value = attribute.value;
                            switch (attributeSpec.type) {
                                case 'Boolean':
                                    if (value != '1' && value != '0')
                                        errors.push("\"" + attributeSpec.name + "\" must be either \"1\" or \"0\"");
                                    break;
                                case 'Currency':
                                    if (!/^(\d)+(\.(\d){2})$/.test(value))
                                        errors.push("\"" + attributeSpec.name + "\" must be a currency value");
                                    break;
                                case 'Integer':
                                    if (!/^(\d)+$/.test(value))
                                        errors.push("\"" + attributeSpec.name + "\" must be an integer");
                                    break;
                                case 'DateTime':
                                    // TODO: postgres is pretty tolerant of this input
                                    break;
                                case 'String':
                                case 'TextBox':
                                    // Using RegExes to break up RegExes is silly, but there's no way to create a RegEx from the type
                                    // of string generated by RegExp.toString() in JavaScript.
                                    var extractor = /\/(.*)\/([gimuy])/g.exec(attributeSpec.regex);
                                    var re = RegExp(extractor[1], extractor[2]);
                                    if (!re.test(value))
                                        errors.push("\"" + attributeSpec.name + "\" must match the regex \"" + attributeSpec.regex + "\"");
                                    break;
                                case 'Enum':
                                    if (!attributeSpec.choices.find(function (x) { return x == value; }))
                                        errors.push("\"" + attributeSpec.name + "\" must be one of \"" + attributeSpec.choices.join('", "') + "\"");
                                    break;
                                default:
                            }
                        }
                    }
                    for (var _b = 0, _c = body.attributes; _b < _c.length; _b++) {
                        var attribute = _c[_b];
                        if (!type.attributes.find(function (x) { return x.id == attribute.attributeId; })) {
                            errors.push("Attribute with ID " + attribute.attributeId + " could not be found on type \"" + type.name + "\"");
                        }
                    }
                }
                return errors;
            });
        };
        this.sendNotFound = function (res) {
            return _this.sendError(res, 'Resource not found', 404);
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
            }).status(code ? code : 500).end();
        };
        /**
         * JSONifies and attached a `success` attribute to an outgoing API response.
         *
         * If `value` is falsy, it will use `sendError` to send a 404 response back.
         */
        this.sendResponse = function (res, value) {
            if (!value)
                _this.sendNotFound(res);
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
        /**
         * Check if an error from the DB is a foreign key error or some other kind.
         */
        this.isKeyError = function (e) {
            return e && e.name && e.name == "SequelizeForeignKeyConstraintError";
        };
        this.paginationMiddleware = function (req, res, next) {
            if (!req.query.start || req.query.start < 0)
                req.query.start = 0;
            if (!req.query.limit || req.query.limit < 0)
                req.query.limit = DEFAULT_LIMIT;
            else if (req.query.limit > MAX_LIMIT)
                req.query.limit = MAX_LIMIT;
            next();
        };
        this.db = db;
        this.auth = new authorizer_1.Authorizer();
    }
    return Controller;
}());
exports.default = Controller;
//# sourceMappingURL=controller.js.map