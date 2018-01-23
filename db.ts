import { Client, QueryResult } from 'pg'
import Equipment from './model/Equipment'
import EquipmentAttribute from './model/EquipmentAttribute'
import EquipmentType from './model/EquipmentType'
import EquipmentAttributeInstance from './model/EquipmentAttributeInstance'

export default class Db {
    private pg: Client;

    constructor() {
        this.pg = new Client({
            connectionString: process.env.DATABASE_URL
        })
        this.pg.connect()
    }

    private q(query: string, values: any[], callback: (err: Error, result: QueryResult) => void) {
        this.pg.query(query, values, callback)
    }
}