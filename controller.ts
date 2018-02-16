import Db from './db'
import { Request, Response } from 'express'
import { Authorizer, Permission } from './authorizer'

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
        if (req.params.q !== undefined) this.db.getAttributesWithNameLike(req.params.q).then((attributes) => this.sendResponse(res, attributes))
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
            .then((type) => { res.redirect('/attribute/' + req.params.id) })
            .catch((e) => this.sendError(res, 'Error updating attribute', 500, e))
    }

    /// Type Operations

    // TODO: modify so some people can see unavailable equipment types?
    getTypes = (req: Request, res: Response) => {
        if (req.params.q !== undefined) this.db.getTypesWithNameLike(req.params.q).then((types) => this.sendResponse(res, types))
        else this.db.getAvailableTypes().then((types) => this.sendResponse(res, types))
    }

    getType = (req: Request, res: Response) =>
        this.db.getTypeById(req.params.id).then((type) => {
            this.sendResponse(res, type)
        })

    postType = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeAdd, req)) this.sendUnauthorized(res)
        else this.db.insertType(req.body)
            .then((type) => { res.redirect('/type/' + type.id) })
            .catch((e) => this.sendError(res, 'Error creating type', 500, e))
    }

    updateType = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeEdit, req)) this.sendUnauthorized(res)
        else this.db.updateType(req.params.id, req.body)
            .then((type) => { res.redirect('/type/' + req.params.id) })
            .catch((e) => this.sendError(res, 'Error updating type', 500, e))
    }


    /// Equipment/Item Operations

    getItems = (req: Request, res: Response) => {
        this.db.getAllItems().then((items) => this.sendResponse(res, items))
    }

    getItem = (req: Request, res: Response) =>
        this.db.getItemById(req.params.id).then((item) => this.sendResponse(res, item))

    postItem = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.ItemAdd, req)) this.sendUnauthorized(res)
        else this.db.insertItem(req.body)
            .then((item) => { res.redirect('/item/' + item.id) })
            .catch((e) => this.sendError(res, 'Error creating item', 500, e))
    }

    updateItem = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.ItemEdit, req)) this.sendUnauthorized(res)
        else this.db.updateItem(req.params.id, req.body)
            .then((item) => { res.redirect('/item/' + req.params.id) })
            .catch((e) => this.sendError(res, 'Error updating item', 500, e))
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
}