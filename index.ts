import * as express from 'express'
import * as morgan from 'morgan'
import * as bodyParser from 'body-parser'
import Db from './db'
import Controller from './controller'

const app = express()
if (!process.env.DATABASE_URL)
    throw new Error('No DATABASE_URL configured.')
const db = new Db(process.env.DATABASE_URL || '')
const controller = new Controller(db)

app.use(morgan('combined')) // Apache log handler
app.use(bodyParser.json())

app.get('/attribute', controller.getAttributes)
app.post('/attribute', controller.postAttribute)

app.get('/type', controller.getTypes)
app.get('/type/:id', controller.getType)
app.post('/type', controller.postType)

app.listen(process.env.PORT || 8080,
    () => console.log('Listening on port ' + (process.env.PORT || 8080)))