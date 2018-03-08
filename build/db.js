"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
/**
 * Magical database class. Initializes Sequelize database layer and performs database operations.
 */
var Db = /** @class */ (function () {
    function Db(connString) {
        var _this = this;
        this.getAllItems = function () {
            return _this.Item.findAll({
                where: {
                    deleted: false
                },
                include: [
                    { model: _this.AttributeInstance, as: 'attributes' }
                ]
            });
        };
        this.getItemById = function (id) {
            return _this.Item.findOne({
                where: {
                    deleted: false,
                    id: id
                },
                include: [
                    { model: _this.AttributeInstance, as: 'attributes' }
                ]
            });
        };
        this.insertItem = function (item) {
            return _this.Item.create(item);
        };
        this.updateItem = function (id, item) {
            return _this.Item.findOne({
                where: {
                    id: id,
                    deleted: false
                }
            }).then(function (old) {
                old.update(item);
            });
        };
        this.getAvailableTypes = function () {
            return _this.Type.findAll({
                where: {
                    available: true
                },
                order: [['name', 'ASC']],
                include: [
                    { model: _this.Attribute, as: 'attributes' }
                ]
            });
        };
        this.getTypesWithNameLike = function (name) {
            return _this.Type.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.regexp] = '/.*' + name + '.*/',
                        _a),
                    available: true
                },
                order: [['name', 'ASC']],
                include: [
                    { model: _this.Attribute, as: 'attributes' }
                ]
            });
            var _a;
        };
        this.getTypeById = function (id) {
            return _this.Type.findOne({
                where: {
                    id: id,
                    available: true
                },
                include: [
                    { model: _this.Attribute, as: 'attributes' }
                ]
            });
        };
        this.insertType = function (type) {
            return _this.Type.create(type);
        };
        this.updateType = function (id, type) {
            return _this.Type.findOne({
                where: {
                    id: id,
                    available: true
                }
            }).then(function (old) {
                old.update(type);
            });
        };
        this.getAttributes = function () {
            return _this.Attribute.findAll({
                order: [['name', 'ASC']]
            });
        };
        this.getAttributesWithNameLike = function (name) {
            return _this.Attribute.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.like] = '%' + name + '%',
                        _a)
                }
            });
            var _a;
        };
        this.validateAttributeIds = function (ids) {
            return _this.Attribute.count({
                where: {
                    id: (_a = {},
                        _a[Sequelize.Op.or] = ids,
                        _a)
                }
            }).then(function (count) {
                if (count != ids.length)
                    throw Error();
            });
            var _a;
        };
        this.getAttributeById = function (id) {
            return _this.Attribute.findOne({
                where: {
                    id: id
                }
            });
        };
        this.insertAttribute = function (attribute) {
            return _this.Attribute.create(attribute);
        };
        this.updateAttribute = function (id, attribute) {
            return _this.Attribute.findOne({
                where: {
                    id: id
                }
            }).then(function (old) {
                old.update(attribute);
            });
        };
        this.insertAttributeInstance = function (attributeInstance) {
            return _this.AttributeInstance.create(attributeInstance);
        };
        this.checkAttributesForUniqueness = function (attributes) {
            return _this.AttributeInstance.findOne({
                where: (_a = {},
                    _a[Sequelize.Op.or] = attributes.map(function (attr) {
                        return {
                            attribute: attr.attributeId,
                            value: attr.value
                        };
                    }),
                    _a)
            }).thenReturn(function (attr) { return !attr; });
            var _a;
        };
        this.sequelize = new Sequelize(connString);
        this._initializeModels();
        this.sequelize.sync().then(function (_) {
            //this.sequelize.sync({force: true})
        }).error(function (reason) {
            throw new Error('Database connection error: ' + reason);
        });
    }
    Db.prototype._initializeModels = function () {
        this.Attribute = this.sequelize.define('attribute', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM(['Boolean', 'Currency', 'Integer', 'DateTime', 'String', 'Enum', 'Image', 'TextBox']),
                defaultValue: 'String'
            },
            regex: {
                type: Sequelize.STRING,
                defaultValue: "/^.*$/"
            },
            choices: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: []
            },
            public: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            uniqueGlobally: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            helpText: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
            defaultValue: {
                type: Sequelize.STRING,
                defaultValue: ""
            }
        });
        this.AttributeInstance = this.sequelize.define('attributeInstance', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            attribute: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.Attribute,
                    key: 'id'
                },
                allowNull: false,
            },
            value: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
        });
        this.Type = this.sequelize.define('type', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            nameAttribute: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.Attribute,
                    key: 'id'
                },
                allowNull: false,
            },
            available: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            }
        });
        this.Item = this.sequelize.define('item', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            type: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.Type,
                    key: 'id'
                },
                allowNull: false
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
        this.AttributeType = this.sequelize.define('attributeType', {
            typeId: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.Type,
                    key: 'id'
                },
                allowNull: false
            },
            attributeId: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.Attribute,
                    key: 'id'
                },
                allowNull: false
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            required: {
                type: Sequelize.ENUM(['Required', 'Suggested', 'Optional']),
                defaultValue: 'Optional'
            },
            uniqueForType: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
        this.Attribute.belongsToMany(this.Type, {
            through: this.AttributeType
        });
        this.Type.belongsToMany(this.Attribute, {
            through: this.AttributeType
        });
        this.Item.hasMany(this.AttributeInstance, { as: 'attributes' });
        this.AttributeInstance.belongsTo(this.Item, { as: 'item' });
    };
    return Db;
}());
exports.default = Db;
//# sourceMappingURL=db.js.map