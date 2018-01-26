"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var db_1 = require("./db");
var controller_1 = require("./controller");
var app = express();
if (!process.env.DATABASE_URL)
    throw new Error('No DATABASE_URL configured.');
var db = new db_1.default(process.env.DATABASE_URL || '');
var controller = new controller_1.default(db);
app.use(morgan('combined')); // Apache log handler
app.use(bodyParser.json());
app.get('/attribute', controller.getAttributes);
app.get('/attribute/:id(\d+)', controller.getAttribute);
app.post('/attribute', controller.postAttribute);
app.get('/type', controller.getTypes);
app.get('/type/:id(\d+)', controller.getType);
app.post('/type', controller.postType);
app.listen(process.env.PORT || 8080, function () { return console.log('Listening on port ' + (process.env.PORT || 8080)); });
