import * as Sequelize from 'sequelize'
import { text } from 'body-parser';

/**
 * Magical database class. Initializes Sequelize database layer and performs database operations.
 */
export default class Db {
    private sequelize: Sequelize.Sequelize
    // model types
    private AttributeInstance: Sequelize.Model<any, any>
    private Attribute: Sequelize.Model<any, any>
    private Type: Sequelize.Model<any, any>
    private Item: Sequelize.Model<any, any>

    constructor(connString: string) {
        this.sequelize = new Sequelize(connString)
        this._initializeModels()
        this.sequelize.sync().error((reason) => {
            throw new Error('Database connection error: ' + reason)
        })
    }

    getAllItems = () =>
        this.Item.findAll({
            where: {
                deleted: false
            }
        })

    getItemById = (id: number) =>
        this.Item.findOne({
            where: {
                deleted: false,
                id
            }
        })

    insertItem = (item: any) =>
        this.Item.create(item)

    updateItem = (id: number, item: any) =>
        this.Item.findOne({
            where: {
                id,
                deleted: false
            }
        }).then((old: any) => {
            old.update(item)
        })

    getAvailableTypes = () =>
        this.Type.findAll({
            where: {
                available: true
            },
            order: [['name', 'ASC']]
        })

    getTypesWithNameLike = (name: string) =>
        this.Type.findAll({
            where: {
                name: {
                    [Sequelize.Op.regexp]: '/.*' + name + '.*/'
                }
            }
        })

    getTypeById = (id: number) =>
        this.Type.findOne({
            where: {
                id
            }
        })

    insertType = (type: any) =>
        this.Type.create(type)

    updateType = (id: number, type: any) =>
        this.Type.findOne({
            where: {
                id: id
            }
        }).then((old: any) => {
            old.update(type)
        })

    getAttributes = () =>
        this.Attribute.findAll({
            order: [['name', 'ASC']]
        })

    getAttributesWithNameLike = (name: string) =>
        this.Attribute.findAll({
            where: {
                name: {
                    [Sequelize.Op.like]: '%' + name + '%'
                }
            }
        })

    getAttributeById = (id: number) =>
        this.Attribute.findOne({
            where: {
                id
            }
        })

    insertAttribute = (attribute: any) =>
        this.Attribute.create(attribute)

    updateAttribute = (id: number, attribute: any) =>
        this.Attribute.findOne({
            where: {
                id: id
            }
        }).then((old: any) => {
            old.update(attribute)
        })

    private _initializeModels() {
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
            type: Sequelize.ENUM(
                ['Boolean', 'Currency', 'Integer', 'DateTime', 'String', 'Enum', 'Image', 'TextBox']
            ),
            regex: Sequelize.STRING,
            required: Sequelize.BOOLEAN,
            unique: Sequelize.BOOLEAN,
            public: Sequelize.BOOLEAN,
            helpText: {
                type: Sequelize.STRING,
                defaultValue: ""
            }
        })

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
        })

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
        })

        this.Attribute.belongsToMany(this.Type, { 
            through: 'equipment_m2m_attribute_type',
            as: 'types'
        })
        this.Type.belongsToMany(this.Attribute, { 
            through: 'equipment_m2m_attribute_type',
            as: 'attributes'
        })
        this.Item.hasMany(this.AttributeInstance, { as: 'attributes' })
    }
}