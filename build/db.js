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
                }
            });
        };
        this.getItemById = function (id) {
            return _this.Item.findOne({
                where: {
                    deleted: false,
                    id: id
                }
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
                order: [['name', 'ASC']]
            });
        };
        this.getTypesWithNameLike = function (name) {
            return _this.Type.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.regexp] = '/.*' + name + '.*/',
                        _a)
                }
            });
            var _a;
        };
        this.getTypeById = function (id) {
            return _this.Type.findOne({
                where: {
                    id: id
                }
            });
        };
        this.insertType = function (type) {
            return _this.Type.create(type);
        };
        this.updateType = function (id, type) {
            return _this.Type.findOne({
                where: {
                    id: id
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
        this.sequelize = new Sequelize(connString);
        this._initializeModels();
        this.sequelize.sync().error(function (reason) {
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
                validate: {
                    len: [2, 32],
                    notEmpty: true
                }
            },
            type: Sequelize.ENUM(['Boolean', 'Currency', 'Integer', 'DateTime', 'String', 'Enum', 'Image', 'TextBox']),
            regex: Sequelize.STRING,
            required: Sequelize.BOOLEAN,
            unique: Sequelize.BOOLEAN,
            public: Sequelize.BOOLEAN,
            helpText: {
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
                }
            },
            value: Sequelize.STRING,
        });
        this.Type = this.sequelize.define('type', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                validate: {
                    len: [2, 32],
                    notEmpty: true
                }
            },
            nameAttribute: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.Attribute,
                    key: 'id'
                }
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
                }
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
        this.Attribute.belongsToMany(this.Type, {
            through: 'equipment_m2m_attribute_type',
            as: 'types'
        });
        this.Type.belongsToMany(this.Attribute, {
            through: 'equipment_m2m_attribute_type',
            as: 'attributes'
        });
        this.Item.hasMany(this.AttributeInstance, { as: 'attributes' });
    };
    return Db;
}());
exports.default = Db;
