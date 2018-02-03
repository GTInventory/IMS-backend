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
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*') // TODO: lock this down when we know where frontend will live
    next()
})

app.get('/attribute', controller.getAttributes)
app.get('/attribute/:id(\\d+)', controller.getAttribute)
app.post('/attribute', controller.postAttribute)
app.post('/attribute/:id(\\d+)', controller.updateAttribute)

app.get('/type', controller.getTypes)
app.get('/type/:id(\\d+)', controller.getType)
app.post('/type', controller.postType)
app.post('/type/:id(\\d+)', controller.updateType)

app.get('/item', controller.getItems)
app.get('/item/:id(\\d+)', controller.getItem)
app.post('/item', controller.postItem)
app.post('/item/:id(\\d+)', controller.updateItem)

app.listen(process.env.PORT || 8080,
    () => console.log('Listening on port ' + (process.env.PORT || 8080)))