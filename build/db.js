"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
/**
 * Magical database class. Initializes Sequelize database layer and performs database operations.
 */
var Db = (function () {
    function Db(connString) {
        var _this = this;
        this.getAvailableEquipmentTypes = function () {
            return _this.EquipmentType.findAll({
                where: {
                    available: true
                },
                order: [['name', 'ASC']]
            });
        };
        this.getEquipmentTypesWithNameLike = function (name) {
            return _this.EquipmentType.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.regexp] = '/.*' + name + '.*/',
                        _a)
                }
            });
            var _a;
        };
        this.getEquipmentTypeById = function (id) {
            return _this.EquipmentType.findOne({
                where: {
                    id: id
                }
            });
        };
        this.insertEquipmentType = function (equipmentType) {
            return _this.EquipmentType.create(equipmentType);
        };
        this.getEquipmentAttributes = function () {
            return _this.EquipmentAttribute.findAll({
                order: [['name', 'ASC']]
            });
        };
        this.getEquipmentAttributesWithNameLike = function (name) {
            return _this.EquipmentAttribute.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.regexp] = '/.*' + name + '.*/',
                        _a)
                }
            });
            var _a;
        };
        this.getEquipmentAttributeById = function (id) {
            return _this.EquipmentAttribute.findOne({
                where: {
                    id: id
                }
            });
        };
        this.insertEquipmentAttribute = function (equipmentAttribute) {
            return _this.EquipmentAttribute.create(equipmentAttribute);
        };
        this.updateEquipmentAttribute = function (id, equipmentAttribute) {
            return _this.EquipmentAttribute.findOne({
                where: {
                    id: id
                }
            }).then(function (old) {
                old.update(equipmentAttribute);
            });
        };
        this.sequelize = new Sequelize(connString);
        this._initializeModels();
        this.sequelize.sync().error(function (reason) {
            throw new Error('Database connection error: ' + reason);
        });
    }
    Db.prototype._initializeModels = function () {
        this.EquipmentAttribute = this.sequelize.define('equipment_attribute', {
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
            regex: Sequelize.STRING,
            required: Sequelize.BOOLEAN,
            unique: Sequelize.BOOLEAN,
            public: Sequelize.BOOLEAN,
            helpText: {
                type: Sequelize.STRING,
                defaultValue: ""
            }
        });
        this.EquipmentAttributeInstance = this.sequelize.define('equipment_attribute_instance', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            attribute: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.EquipmentAttribute,
                    key: 'id'
                }
            },
            value: Sequelize.STRING,
        });
        this.EquipmentType = this.sequelize.define('equipment_type', {
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
                    model: this.EquipmentAttribute,
                    key: 'id'
                }
            },
            available: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            }
        });
        this.Equipment = this.sequelize.define('equipment', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            type: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.EquipmentType,
                    key: 'id'
                }
            }
        });
        this.EquipmentAttribute.belongsToMany(this.EquipmentType, { through: 'equipment_m2m_attribute_type' });
        this.Equipment.hasMany(this.EquipmentAttributeInstance, { as: 'attributes' });
    };
    return Db;
}());
exports.default = Db;
