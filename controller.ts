import Db from './db'

export default class Controller {
    private db: Db

    constructor(db: Db) {
        this.db = db
    }

    getAvailableEquipmentTypes() {
        return this.db.getAvailableEquipmentTypes()
    }
}