const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI
let moment =requir('moment')

module.exports = function (controller) {

  controller.hears('.*', 'ambient', async function (bot, message) {
    console.log('message: ' + message.user)
    console.log(':::::::: ' + JSON.stringify(message, null, 2))
    console.log(moment.startOf('day').format('YYYY MM DD'))
  })

}
