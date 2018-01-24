"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
var Db = (function () {
    function Db() {
        this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
        this._initializeModels();
        this.sequelize.sync();
    }
    Db.prototype.getAvailableEquipmentTypes = function () {
        this.EquipmentType.findAll({
            where: {
                available: true
            },
            order: [['name', 'ASC']]
        });
    };
    Db.prototype._initializeModels = function () {
        this.EquipmentAttribute = this.sequelize.define('equipment_attribute', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                unique: true
            },
            regex: Sequelize.STRING,
            required: Sequelize.BOOLEAN,
            unique: Sequelize.BOOLEAN,
            public: Sequelize.BOOLEAN,
            helpText: Sequelize.STRING
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
            name: Sequelize.STRING,
            nameAttribute: {
                type: Sequelize.INTEGER,
                references: {
                    model: this.EquipmentAttribute,
                    key: 'id'
                }
            },
            available: Sequelize.BOOLEAN
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
        this.Equipment.hasMany(this.EquipmentAttributeInstance, { as: 'Attributes' });
    };
    return Db;
}());
exports.default = Db;
