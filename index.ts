import * as express from 'express'
import * as morgan from 'morgan'
import * as bodyParser from 'body-parser'

const app = express()

app.use(morgan('combined')) // Apache log handler
app.use(bodyParser.json())

function sendError(res: express.Response, err: string, code?: number, debug?: any) {
    res.json({
        'success': false,
        'error': err,
        'debug': (process.env.DEBUG ? debug : undefined)
    }).status(code ? code : 500)
}

function sendResponse(res: express.Response, value: any) {
    res.json({
        'success': true,
        'result': value
    }).end()
}

app.listen(process.env.PORT || 8080,
    () => console.log('Listening on port ' + (process.env.PORT || 8080)))