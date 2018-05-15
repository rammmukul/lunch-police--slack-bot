const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

let client = await MongoClient.connect(url)
const db = client.db('test')