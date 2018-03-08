import * as Sequelize from 'sequelize'
import { text } from 'body-parser'

/**
 * Magical database class. Initializes Sequelize database layer and performs database operations.
 */
export default class Db {
    private sequelize: Sequelize.Sequelize
    // model types
    private AttributeInstance: Sequelize.Model<any, any>
    private AttributeType: Sequelize.Model<any, any>
    private Attribute: Sequelize.Model<any, any>
    private Type: Sequelize.Model<any, any>
    private Item: Sequelize.Model<any, any>

    constructor(connString: string) {
        this.sequelize = new Sequelize(connString)
        this._initializeModels()
        this.sequelize.sync().then((_) => {
            //this.sequelize.sync({force: true})
        }).error((reason) => {
            throw new Error('Database connection error: ' + reason)
        })
    }

    getAllItems = () =>
        this.Item.findAll({
            where: {
                deleted: false
            },
            include: [
                {model: this.AttributeInstance, as: 'attributes'}
            ]
        })

    getItemById = (id: number) =>
        this.Item.findOne({
            where: {
                deleted: false,
                id
            },
            include: [
                {model: this.AttributeInstance, as: 'attributes'}
            ]
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
            order: [['name', 'ASC']],
            include: [
                {model: this.Attribute, as: 'attributes'}
            ]
        })

    getTypesWithNameLike = (name: string) =>
        this.Type.findAll({
            where: {
                name: {
                    [Sequelize.Op.like]: '%' + name + '%'
                },
                available: true
            },
            order: [['name', 'ASC']],
            include: [
                {model: this.Attribute, as: 'attributes'}
            ]
        })

    getTypeById = (id: number) =>
        this.Type.findOne({
            where: {
                id,
                available: true
            },
            include: [
                {model: this.Attribute, as: 'attributes'}
            ]
        })
 
    insertType = (type: any) =>
        this.Type.create(type)

    updateType = (id: number, type: any) =>
        this.Type.findOne({
            where: {
                id: id,
                available: true
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

    validateAttributeIds = (ids: number[]) =>
        this.Attribute.count({
            where: {
                id: {
                    [Sequelize.Op.or]: ids
                }
            }
        }).then(count => {
            if (count != ids.length) throw Error()
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

    insertAttributeInstance = (attributeInstance: any) =>
        this.AttributeInstance.create(attributeInstance)

    checkAttributesForUniqueness = (attributes: any[]) =>
        this.AttributeInstance.findOne({
            where: {
                [Sequelize.Op.or]: attributes.map<any>((attr) => { return {
                    attribute: attr.attributeId,
                    value: attr.value
                }})
            }
        }).thenReturn((attr) => !attr)

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
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM(
                    ['Boolean', 'Currency', 'Integer', 'DateTime', 'String', 'Enum', 'Image', 'TextBox'],
                ),
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
                },
                allowNull: false
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        })

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
                type: Sequelize.ENUM(
                    ['Required', 'Suggested', 'Optional']
                ),
                defaultValue: 'Optional'
            },
            uniqueForType: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        })

        this.Attribute.belongsToMany(this.Type, { 
            through: this.AttributeType
        })
        this.Type.belongsToMany(this.Attribute, { 
            through: this.AttributeType
        })
        this.Item.hasMany(this.AttributeInstance, { as: 'attributes' })
        this.AttributeInstance.belongsTo(this.Item, { as: 'item' })
    }
}