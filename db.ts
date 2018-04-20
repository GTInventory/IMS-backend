import * as Sequelize from 'sequelize'
import { text } from 'body-parser'
import { Promise } from 'bluebird';

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
    private ITEM_INCLUDE : any
    private TYPE_INCLUDE : any

    constructor(connString: string) {
        this.sequelize = new Sequelize(connString)
        this._initializeModels()
        this.sequelize.sync().then((_) => {
            //this.sequelize.sync({force: true})
        }).error((reason) => {
            throw new Error('Database connection error: ' + reason)
        })
    }

    getAllItems = (offset: number, limit: number) =>
        this.Item.findAll({
            where: {
                deleted: false
            },
            offset,
            limit,
            order: [['id', 'ASC']],
            include: this.ITEM_INCLUDE
        })

    getItemById = (id: number) =>
        this.Item.findOne({
            where: {
                deleted: false,
                id
            },
            include: this.ITEM_INCLUDE
        })

    insertItem = (item: any) =>
        this.Item.create(item)

    insertItems = (items: any[]) =>
        Promise.all(
            items.map(item => 
                this.insertItem(item).then(itemO => 
                    this.insertAttributeInstances(
                        item.attributes.map(attr => {
                            return {
                                attributeId: attr.attributeId,
                                value: attr.value,
                                itemId: itemO.id
                            }
                        })
                    ).thenReturn(itemO)
                )
            )
        )

    updateItem = (id: number, item: any) => // TODO: figure out if this is actually useful
        this.Item.findOne({
            where: {
                id,
                deleted: false
            }
        }).then((old: any) => {
            old.update(item)
        })
        
    searchItemsByAttributes = (q: string, offset: number, limit: number) =>
        // First we use a raw query to find the applicable IDs.
        // Then we trust Sequelize to make an efficient query based on that
        // and pull in related data into models.
        this.sequelize.query('SELECT i.id '
            + 'FROM items i, "attributeInstances" ai '
            + 'RIGHT JOIN attributes AS a ON ai."attributeId" = a.id '
            + 'WHERE ai."itemId" = i.id AND ai.value ILIKE $q AND i.deleted = false '
            + "AND (a.type = 'DateTime' OR a.type = 'String' OR a.type = 'Enum' OR a.type = 'TextBox') "
            + 'GROUP BY i.id '
            + 'ORDER BY i.id '
            + "LIMIT $limit OFFSET $offset;", { 
                type: Sequelize.QueryTypes.SELECT,
                bind: {
                    q: '%' + q + '%',
                    limit: parseInt(limit.toString()),
                    offset: parseInt(offset.toString())
                },
            }).then((items) => items.length == 0? Promise.resolve([]) : this.Item.findAll({
                where: {
                    id: {
                        [Sequelize.Op.any]: items.map(x => x.id)
                    },
                    deleted: false,
                },
                order: [['id', 'ASC']],
                limit,
                offset,
                include: this.ITEM_INCLUDE
            }))

    getAvailableTypes = (offset: number, limit: number) =>
        this.Type.findAll({
            where: {
                deleted: false
            },
            order: [['name', 'ASC']],
            include: this.TYPE_INCLUDE,
            offset,
            limit
        })

    getTypesWithNameLike = (name: string, offset: number, limit: number) =>
        this.Type.findAll({
            where: {
                name: {
                    [Sequelize.Op.iLike]: '%' + name + '%'
                },
                deleted: false
            },
            order: [['name', 'ASC']],
            include: this.TYPE_INCLUDE,
            offset,
            limit
        })

    getTypeById = (id: number) =>
        this.Type.findOne({
            where: {
                id,
                deleted: false
            },
            include: this.TYPE_INCLUDE
        })
 
    insertType = (type: any) =>
        this.Type.create(type)

    updateType = (id: number, type: any) =>
        this.Type.findOne({
            where: {
                id: id,
                deleted: false
            }
        }).then((old: any) => {
            old.update(type)
        })

    getAttributes = (offset: number, limit: number) =>
        this.Attribute.findAll({
            where: {
                deleted: false
            },
            order: [['name', 'ASC']],
            offset,
            limit
        })

    getAttributesWithNameLike = (name: string, offset: number, limit: number) =>
        this.Attribute.findAll({
            where: {
                name: {
                    [Sequelize.Op.iLike]: '%' + name + '%'
                },
                deleted: false,
            },
            offset,
            limit
        })

    validateAttributeIds = (ids: number[]) =>
        this.Attribute.count({
            where: {
                id: {
                    [Sequelize.Op.or]: ids
                },
                deleted: false
            },
        }).then(count => {
            if (count != ids.length) throw Error()
        })

    getAttributeById = (id: number) =>
        this.Attribute.findOne({
            where: {
                id,
                deleted: false
            }
        })

    insertAttribute = (attribute: any) =>
        this.Attribute.create(attribute)

    updateAttribute = (id: number, attribute: any) =>
        this.Attribute.findOne({
            where: {
                id: id,
                deleted: false
            }
        }).then((old: any) => {
            old.update(attribute)
        })

    insertAttributeInstance = (attributeInstance: any) =>
        this.AttributeInstance.create(attributeInstance)

    insertAttributeInstances = (attributeInstances: any[]) =>
        this.AttributeInstance.bulkCreate(attributeInstances)

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
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        })

        this.AttributeInstance = this.sequelize.define('attributeInstance', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            value: {
                type: Sequelize.STRING,
                defaultValue: ""
            },
        },
        {
            timestamps: false
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
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        })

        this.Item = this.sequelize.define('item', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
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
        }, {
            timestamps: false
        })

        this.Attribute.belongsToMany(this.Type, { 
            through: this.AttributeType
        })
        this.Type.belongsToMany(this.Attribute, { 
            through: this.AttributeType
        })
        this.Item.belongsTo(this.Type)
        this.Item.hasMany(this.AttributeInstance, { as: 'attributes' })
        this.AttributeInstance.belongsTo(this.Item)
        this.AttributeInstance.belongsTo(this.Attribute)

            // Definition of standard relations to include with requests.
        this.ITEM_INCLUDE = [
            {model: this.AttributeInstance, as: 'attributes', attributes: ['value', 'attributeId']},
            {model: this.Type, as: 'type', include: [
                {model: this.Attribute, as: 'attributes', attributes: ['id', 'name', 'type']},
            ], attributes: ['id', 'name', 'nameAttribute', 'deleted']}
        ]
        this.TYPE_INCLUDE = [
            {model: this.Attribute, as: 'attributes'}
        ]
    }
}