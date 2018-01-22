"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var morgan = require("morgan");
var app = express();
app.use(morgan('combined')); // Apache log handler
function sendError(res, err, code, debug) {
    res.json({
        'success': false,
        'error': err,
        'debug': (process.env.DEBUG ? debug : undefined)
    }).status(code ? code : 500);
}
function sendResponse(res, value) {
    res.json({
        'success': true,
        'result': value
    }).end();
}
app.listen(process.env.PORT || 8080, function () { return console.log('Listening on port ' + (process.env.PORT || 8080)); });
