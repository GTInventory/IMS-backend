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
        if (req.params.q !== undefined) this.db.getEquipmentAttributesWithNameLike(req.params.q).then((attributes) => this.sendResponse(res, attributes))
        else this.db.getEquipmentAttributes().then((attributes) => this.sendResponse(res, attributes))
    }

    getAttribute = (req: Request, res: Response) =>
        this.db.getEquipmentAttributeById(req.params.id).then((attribute) => this.sendResponse(res, attribute))

    postAttribute = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.AttributeAdd, req)) this.sendUnauthorized(res)
        else this.db.insertEquipmentAttribute(req.body)
            .then((attribute) => { res.redirect('/attribute/' + attribute.id) })
            .error((e) => this.sendError(res, 'Error creating attribute.', 500, e))
    }

    /// Type Operations

    // TODO: modify so some people can see unavailable equipment types?
    getTypes = (req: Request, res: Response) => {
        if (req.params.q !== undefined) this.db.getEquipmentTypesWithNameLike(req.params.q).then((types) => this.sendResponse(res, types))
        else this.db.getAvailableEquipmentTypes().then((types) => this.sendResponse(res, types))
    }

    getType = (req: Request, res: Response) =>
        this.db.getEquipmentTypeById(req.params.id).then((type) => this.sendResponse(res, type))

    postType = (req: Request, res: Response) => {
        if (!this.auth.has(Permission.TypeAdd, req)) this.sendUnauthorized(res)
        else this.db.insertEquipmentType(req.body)
            .then((type) => { res.redirect('/type/' + type.id) })
            .error((e) => this.sendError(res, 'Error creating type', 500, e))
    }

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
        }).status(code ? code : 500)

    /**
     * JSONifies and attached a `success` attribute to an outgoing API response.
     * 
     * If `value` is falsy, it will use `sendError` to send a 404 response back.
     */
    private sendResponse = (res: Response, value: any) => {
        if (!value) this.sendError(res, 'Resource not found.', 404)
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