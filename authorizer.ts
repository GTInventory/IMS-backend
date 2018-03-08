import { Request } from 'express'

export enum Permission {
    AttributeAdd,
    AttributeEdit,
    AttributeDelete,
    TypeAdd,
    TypeEdit,
    TypeDelete,
    ItemAdd,
    ItemEdit,
    ItemDelete
}

export class Authorizer {
    /**
     * Does `req` have `permission`?
     * 
     * Stubbed out for now.
     */
    has(permission: Permission, req: Request) {
        return true
    }
}