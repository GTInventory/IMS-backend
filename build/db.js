"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sequelize = require("sequelize");
var bluebird_1 = require("bluebird");
/**
 * Magical database class. Initializes Sequelize database layer and performs database operations.
 */
var Db = /** @class */ (function () {
    function Db(connString) {
        var _this = this;
        this.getAllItems = function (offset, limit, typeId) {
            return _this.Item.findAll({
                where: {
                    deleted: false,
                    typeId: (typeId ? parseInt(typeId.toString()) : (_a = {}, _a[Sequelize.Op.not] = 0, _a))
                },
                offset: offset,
                limit: limit,
                order: [
                    ['typeId', 'ASC'],
                    ['id', 'ASC']
                ],
                include: _this.ITEM_SEARCH_INCLUDE
            });
            var _a;
        };
        this.getItemById = function (id) {
            return _this.Item.findOne({
                where: {
                    deleted: false,
                    id: id
                },
                include: _this.ITEM_INCLUDE
            });
        };
        this.insertItem = function (item) {
            return _this.Item.create(item);
        };
        this.insertItems = function (items) {
            return bluebird_1.Promise.all(items.map(function (item) {
                return _this.insertItem(item).then(function (itemO) {
                    return _this.insertAttributeInstances(item.attributes.map(function (attr) {
                        return {
                            attributeId: attr.attributeId,
                            value: attr.value,
                            itemId: itemO.id
                        };
                    })).thenReturn(itemO);
                });
            }));
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
        this.searchItemsByAttributes = function (q, offset, limit, typeId) {
            // First we use a raw query to find the applicable IDs.
            // Then we trust Sequelize to make an efficient query based on that
            // and pull in related data into models.
            return _this.sequelize.query('SELECT i.id '
                + 'FROM items i, "attributeInstances" ai '
                + 'RIGHT JOIN attributes AS a ON ai."attributeId" = a.id '
                + 'WHERE ai."itemId" = i.id AND ai.value ILIKE $q AND i.deleted = false '
                + (typeId ? ' AND i."typeId" = $typeid ' : '')
                + "AND (a.type = 'DateTime' OR a.type = 'String' OR a.type = 'Enum' OR a.type = 'TextBox') "
                + 'GROUP BY i.id '
                + 'ORDER BY i."typeId", i.id '
                + "LIMIT $limit OFFSET $offset;", {
                type: Sequelize.QueryTypes.SELECT,
                bind: {
                    q: '%' + q + '%',
                    limit: parseInt(limit.toString()),
                    offset: parseInt(offset.toString()),
                    typeid: (typeId ? parseInt(typeId.toString()) : undefined)
                },
            }).then(function (items) {
                return items.length == 0 ? bluebird_1.Promise.resolve([]) : _this.Item.findAll({
                    where: {
                        id: (_a = {},
                            _a[Sequelize.Op.any] = items.map(function (x) { return x.id; }),
                            _a),
                        deleted: false,
                    },
                    order: [['id', 'ASC']],
                    limit: limit,
                    offset: offset,
                    include: _this.ITEM_SEARCH_INCLUDE
                });
                var _a;
            });
        };
        this.getAvailableTypes = function (offset, limit) {
            return _this.Type.findAll({
                where: {
                    deleted: false
                },
                order: [['name', 'ASC']],
                include: _this.TYPE_INCLUDE,
                offset: offset,
                limit: limit
            });
        };
        this.getTypesWithNameLike = function (name, offset, limit) {
            return _this.Type.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.iLike] = '%' + name + '%',
                        _a),
                    deleted: false
                },
                order: [['name', 'ASC']],
                include: _this.TYPE_INCLUDE,
                offset: offset,
                limit: limit
            });
            var _a;
        };
        this.getTypeById = function (id) {
            return _this.Type.findOne({
                where: {
                    id: id,
                    deleted: false
                },
                include: _this.TYPE_INCLUDE
            });
        };
        this.insertType = function (type) {
            return _this.Type.create(type);
        };
        this.updateType = function (id, type) {
            return _this.Type.findOne({
                where: {
                    id: id,
                    deleted: false
                }
            }).then(function (old) {
                old.update(type);
            });
        };
        this.getAttributes = function (offset, limit) {
            return _this.Attribute.findAll({
                where: {
                    deleted: false
                },
                order: [['name', 'ASC']],
                offset: offset,
                limit: limit
            });
        };
        this.getAttributesWithNameLike = function (name, offset, limit) {
            return _this.Attribute.findAll({
                where: {
                    name: (_a = {},
                        _a[Sequelize.Op.iLike] = '%' + name + '%',
                        _a),
                    deleted: false,
                },
                offset: offset,
                limit: limit
            });
            var _a;
        };
        this.validateAttributeIds = function (ids) {
            return _this.Attribute.count({
                where: {
                    id: (_a = {},
                        _a[Sequelize.Op.or] = ids,
                        _a),
                    deleted: false
                },
            }).then(function (count) {
                if (count != ids.length)
                    throw Error();
            });
            var _a;
        };
        this.getAttributeById = function (id) {
            return _this.Attribute.findOne({
                where: {
                    id: id,
                    deleted: false
                }
            });
        };
        this.insertAttribute = function (attribute) {
            return _this.Attribute.create(attribute);
        };
        this.updateAttribute = function (id, attribute) {
            return _this.Attribute.findOne({
                where: {
                    id: id,
                    deleted: false
                }
            }).then(function (old) {
                old.update(attribute);
            });
        };
        this.insertAttributeInstance = function (attributeInstance) {
            return _this.AttributeInstance.create(attributeInstance);
        };
        this.insertAttributeInstances = function (attributeInstances) {
            return _this.AttributeInstance.bulkCreate(attributeInstances);
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
        this.sequelize = new Sequelize(connString, {
            pool: {
                max: 3
            }
        });
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
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }
        });
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
        }, {
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
        });
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
        }, {
            timestamps: false
        });
        this.Attribute.belongsToMany(this.Type, {
            through: this.AttributeType
        });
        this.Type.belongsToMany(this.Attribute, {
            through: this.AttributeType
        });
        this.Item.belongsTo(this.Type);
        this.Item.hasMany(this.AttributeInstance, { as: 'attributes' });
        this.AttributeInstance.belongsTo(this.Item);
        this.AttributeInstance.belongsTo(this.Attribute);
        // Definition of standard relations to include with requests.
        this.ITEM_SEARCH_INCLUDE = [
            { model: this.Type, as: 'type', attributes: ['id', 'name', 'nameAttribute'] },
            { model: this.AttributeInstance, as: 'attributes', attributes: ['value', 'attributeId'] }
        ];
        this.ITEM_INCLUDE = [
            { model: this.AttributeInstance, as: 'attributes', attributes: ['value', 'attributeId'] },
            { model: this.Type, as: 'type', include: [
                    { model: this.Attribute, as: 'attributes', attributes: ['id', 'name', 'type'] },
                ], attributes: ['id', 'name', 'nameAttribute', 'deleted'] }
        ];
        this.TYPE_INCLUDE = [
            { model: this.Attribute, as: 'attributes' }
        ];
    };
    return Db;
}());
exports.default = Db;
//# sourceMappingURL=db.js.map