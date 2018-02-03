import { Request } from 'express'

export enum Permission {
    AttributeAdd,
    AttributeEdit,
    TypeAdd,
    TypeEdit,
    ItemAdd,
    ItemEdit
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