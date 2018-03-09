import Db from './db'
import { Request, Response } from 'express'
import { Authorizer, Permission } from './authorizer'
import { Promise } from 'sequelize/node_modules/bluebird';

/**
 * Fulfills incoming router requests.
 */
export default class Controller {
    private db: Db
    private auth: Authorizer

    constructor(db: Db) {
        this.db = db
        this.auth = new Authorizer()
    }

    /// Attribute Operations

    getAttributes = (req: Request, res: Response) => {
        if (req.query.q !== undefined) this.db.getAttributesWithNameLike(req.query.q).then((attributes) => this.sendResponse(res, attributes))
        else this.db.getAttributes().then((attributes) => this.sendResponse(res, attributes))
    }

    getAttribute = (req: Request, res: Response) =>
        this.db.getAttributeById(req.params.id).then((attribute) => this.sendResponse(res, attribute))

    postAttribute = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.AttributeAdd, req)) this.sendUnauthorized(res)
        else this.db.insertAttribute(req.body)
            .then((attribute) => { res.redirect('/attribute/' + attribute.id) })
            .catch((e) => this.sendError(res, 'Error creating attribute.', 500, e))
    }

    updateAttribute = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.AttributeEdit, req)) this.sendUnauthorized(res)
        else this.db.updateAttribute(req.params.id, req.body)
            .then((attribute) => { res.redirect('/attribute/' + req.params.id) })
            .catch((e) => this.sendError(res, 'Error updating attribute', 500, e))
    }

    deleteAttribute = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.AttributeDelete, req)) this.sendUnauthorized(res)
        else this.db.updateAttribute(req.params.id, { deleted: true })
            .then((attribute) => { this.sendResponse(res, { deleted: true }) })
            .catch((e) => this.sendError(res, 'Error deleting attribute', 500, e))
    }

    /// Type Operations

    // TODO: modify so some people can see unavailable equipment types?
    getTypes = (req: Request, res: Response) => {
        if (req.query.q !== undefined) this.db.getTypesWithNameLike(req.query.q).then((types) => this.sendResponse(res, types))
        else this.db.getAvailableTypes().then((types) => this.sendResponse(res, types))
    }

    getType = (req: Request, res: Response) =>
        this.db.getTypeById(req.params.id).then((type) => {
            this.sendResponse(res, type)
        })

    postType = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeAdd, req)) this.sendUnauthorized(res)
        else 
            if (!req.body.attributes || !req.body.attributes.find(x => x.id == req.body.nameAttribute)) {
                this.sendError(res, 'nameAttribute must exist in attributes')
                return
            }
            this.db.validateAttributeIds(req.body.attributes.map(x => x.id)).then((valid) => {
                this.db.insertType(req.body)
                .then((type) => { 
                    try {
                        for (let attribute of req.body.attributes) {
                            attribute.attributeId = attribute.id
                            type.addAttribute(attribute.id, { through: attribute })
                        }
                        res.redirect('/type/' + type.id) 
                    } catch (e) {
                        if (this.isKeyError(e)) this.sendError(res, '')
                    }
                })
                .catch((e) => this.sendError(res, 'Error creating type', 500, e))
            })
            .catch((e) => this.sendError(res, 'The referenced attributes are not valid'))
        }

    postTypeAttribute = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeEdit, req)) this.sendUnauthorized(res)
        else this.db.getTypeById(req.params.id).then((type) => {
            if (!type) this.sendNotFound(res)
            else 
                type.getAttributes().then((attributes) => {
                    if (attributes.find((a) => a.id == req.body.attribute.id))
                        this.sendError(res, 'Attribute already exists on type')
                    else {
                        req.body.attribute.attributeId = req.body.attribute.id
                        type.addAttribute(req.body.attribute.id, { through: req.body.attribute }).then((x) => {
                            res.redirect('/type/' + req.params.id)
                        }).catch((e) => {
                            if (this.isKeyError(e)) this.sendError(res, 'Referenced attribute does not exist')
                            else this.sendError(res, 'Error adding attribute', 500, e)
                        })
                    }
                })
        })

    }

    updateType = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeEdit, req)) this.sendUnauthorized(res)
        else this.db.updateType(req.params.id, req.body)
            .then((type) => { res.redirect('/type/' + req.params.id) })
            .catch((e) => this.sendError(res, 'Error updating type', 500, e))
    }

    deleteType = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeDelete, req)) this.sendUnauthorized(res)
        else this.db.updateType(req.params.id, { deleted: true })
            .then((type) => { this.sendResponse(res, { deleted: true }) })
            .catch((e) => this.sendError(res, 'Error deleting type', 500, e))
    }

    /// Equipment/Item Operations

    getItems = (req: Request, res: Response) => {
        if (req.query.q) {
            this.db.searchItemsByAttributes(req.query.q).then((items) => {
                this.sendResponse(res, items);
            }).catch((e) => this.sendError(res, 'Error while searching', 500, e))
        } else {
            this.db.getAllItems().then((items) => this.sendResponse(res, items))
        }
    }

    getItem = (req: Request, res: Response) =>
        this.db.getItemById(req.params.id).then((item) => this.sendResponse(res, item))

    postItem = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.ItemAdd, req)) this.sendUnauthorized(res)
        else this.validateItemBody(undefined, req.body).then((errors) => {
            if (errors.length) 
                return this.sendError(res, errors.join(', '))
            this.db.insertItem(req.body)
            .then((item) => { 
                this.createAttributeInstances(item, req.body.attributes).then((x) =>
                    res.redirect('/item/' + item.id))
            })
            .catch((e) => this.sendError(res, 'Error creating item', 500, e))
        })
    }

    updateItem = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.ItemEdit, req)) this.sendUnauthorized(res)
        else this.db.getItemById(req.params.id).then((item) => {
                if (!item) this.sendNotFound(res)
                else this.validateItemBody(item, req.body).then((errors) => {
                    if (errors.length) 
                        return this.sendError(res, errors.join(', '))
                    this.db.updateItem(item.id, req.body)
                    .then((tem) => { 
                        this.createAttributeInstances(item, req.body.attributes).then((x) =>
                            res.redirect('/item/' + item.id))
                    })
                    .catch((e) => this.sendError(res, 'Error creating item', 500, e))
            })
        })
    }

    deleteItem = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.ItemDelete, req)) this.sendUnauthorized(res)
        else this.db.updateItem(req.params.id, { deleted: true })
            .then((item) => { this.sendResponse(res, { deleted: true }) })
            .catch((e) => this.sendError(res, 'Error deleting item', 500, e))
    }

    createAttributeInstances = (item: any, attributes: any[]) =>
        Promise.all(attributes.map((attribute) => this.db.insertAttributeInstance({
            attribute: attribute.attributeId,
            value: attribute.value
        }))).then((instances) => item.addAttributes(instances))

    validateItemBody = (item: any, body: any) => {
        var errors = []
        return this.db.getTypeById(body.typeId).then((type) => {
            if (!type) errors.push('Non-existent type specified')
            else {
                for (var attributeSpec of type.attributes) {
                    var attribute = body.attributes.find(
                        (a) => a.attributeId == attributeSpec.id)
                    if ((!attribute || !attribute.value) && attributeSpec.required  == 'Required' && !item) {
                        errors.push(`"${attributeSpec.name}" requires a value`)
                    } else if (attribute && attribute.value) {
                        var value = attribute.value;
                        switch (attributeSpec.type) {
                            case 'Boolean':
                            if (value != '1' && value != '0')
                                errors.push(`"${attributeSpec.name}" must be either "1" or "0"`)
                            break;
                            case 'Currency':
                            if (!/^(\d)+(\.(\d){2})$/.test(value))
                                errors.push(`"${attributeSpec.name}" must be a currency value`)
                            break;
                            case 'Integer':
                            if (!/^(\d)+$/.test(value))
                                errors.push(`"${attributeSpec.name}" must be an integer`)
                            break;
                            case 'DateTime':
                                // TODO: postgres is pretty tolerant of this input
                            break;
                            case 'String':
                            case 'TextBox':
                            // Using RegExes to break up RegExes is silly, but there's no way to create a RegEx from the type
                            // of string generated by RegExp.toString() in JavaScript.
                            var extractor = /\/(.*)\/([gimuy])/g.exec(attributeSpec.regex)
                            var re = RegExp(extractor[1], extractor[2])
                            if (!re.test(value))
                                errors.push(`"${attributeSpec.name}" must match the regex "${attributeSpec.regex}"`)
                            break;
                            case 'Enum':
                            if (!attributeSpec.choices.find(x => x == value))
                                errors.push(`"${attributeSpec.name}" must be one of "${attributeSpec.choices.join('", "')}"`)
                            break;
                            default:
                        }
                    }
                }
                for (var attribute of body.attributes) {
                    if (!type.attributes.find(x => x.id == attribute.attributeId)) {
                        errors.push(`Attribute with ID ${attribute.attributeId} could not be found on type "${type.name}"`)
                    }
                }
            }
            return errors;
        })
    }

    sendNotFound = (res: Response) =>
        this.sendError(res, 'Resource not found', 404)

    /**
     * JSONifies and sends an error response.
     * 
     * `code` is the HTTP status code sent back. Default: 500
     * `debug` is optional debugging content that will be sent back if environment var `DEBUG` is set.
     */
    private sendError = (res: Response, err: string, code?: number, debug?: any) =>
        res.json({
            'success': false,
            'error': err,
            'debug': (process.env.DEBUG ? debug : undefined)
        }).status(code ? code : 500).end()

    /**
     * JSONifies and attached a `success` attribute to an outgoing API response.
     * 
     * If `value` is falsy, it will use `sendError` to send a 404 response back.
     */
    private sendResponse = (res: Response, value: any) => {
        if (!value) this.sendNotFound(res)
        else res.json({
            'success': true,
            'result': value
        }).end()
    }

    /**
     * Sends an unauthorized message. Used primarily when `Authorizer.has` fails.
     */
    private sendUnauthorized = (res: Response) =>
        this.sendError(res, "Access level insufficient for this resource.", 403)

    /**
     * Check if an error from the DB is a foreign key error or some other kind.
     */
    private isKeyError = (e: any) =>
        e && e.name && e.name == "SequelizeForeignKeyConstraintError"
}