const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

module.exports = function (controller) {

  controller.hears('.*', 'ambient', async function (bot, message) {
    console.log('message: ' + message.user)
    console.log(':::::::: ' + JSON.stringify(message, null, 2))

    let moment = require('moment')
    console.log(moment.startOf('day').format('YYYY MM DD'))
  })

}
