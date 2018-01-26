import * as Sequelize from 'sequelize'

/**
 * Magical database class. Initializes Sequelize database layer and performs database operations.
 */
export default class Db {
    private sequelize: Sequelize.Sequelize
    // model types
    private EquipmentAttributeInstance: Sequelize.Model<any, any>
    private EquipmentAttribute: Sequelize.Model<any, any>
    private EquipmentType: Sequelize.Model<any, any>
    private Equipment: Sequelize.Model<any, any>

    constructor(connString: string) {
        this.sequelize = new Sequelize(connString)
        this._initializeModels()
        this.sequelize.sync().error((reason) => {
            throw new Error('Database connection error: ' + reason)
        })
    }

    getAvailableEquipmentTypes = () =>
        this.EquipmentType.findAll({
            where: {
                available: true
            },
            order: [['name', 'ASC']]
        })

    getEquipmentTypesWithNameLike = (name: string) =>
        this.EquipmentType.findAll({
            where: {
                name: {
                    [Sequelize.Op.regexp]: '/.*' + name + '.*/'
                }
            }
        })

    getEquipmentTypeById = (id: number) =>
        this.EquipmentType.findOne({
            where: {
                id
            }
        })

    insertEquipmentType = (equipmentType: any) =>
        this.EquipmentType.create(equipmentType)

    getEquipmentAttributes = () =>
        this.EquipmentAttribute.findAll({
            order: [['name', 'ASC']]
        })

    getEquipmentAttributesWithNameLike = (name: string) =>
        this.EquipmentAttribute.findAll({
            where: {
                name: {
                    [Sequelize.Op.regexp]: '/.*' + name + '.*/'
                }
            }
        })

    getEquipmentAttributeById = (id: number) =>
        this.EquipmentAttribute.findOne({
            where: {
                id
            }
        })

    insertEquipmentAttribute = (equipmentAttribute: any) =>
        this.EquipmentAttribute.create(equipmentAttribute)

    updateEquipmentAttribute = (id: number, equipmentAttribute: any) =>
        this.EquipmentAttribute.findOne({
            where: {
                id: id
            }
        }).then((old: any) => {
            old.update(equipmentAttribute)
        })

    private _initializeModels() {
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
        })

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
        })

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
        })

        this.EquipmentAttribute.belongsToMany(this.EquipmentType, { through: 'equipment_m2m_attribute_type' })
        this.Equipment.hasMany(this.EquipmentAttributeInstance, { as: 'attributes' })
    }
}