"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var Db = (function () {
    function Db() {
        this.pg = new pg_1.Client({
            connectionString: process.env.DATABASE_URL
        });
        this.pg.connect();
    }
    Db.prototype.q = function (query, values, callback) {
        this.pg.query(query, values, callback);
    };
    return Db;
}());
exports.default = Db;
