const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

MongoClient.connect(url, function(err, client) {
  // Use the admin database for the operation
  const adminDb = client.db('test')

  // List all the available databases
  adminDb.collection('local',null,function(err, dbs) {
    console.log(dbs)
    client.close()
  })
})

module.exports = function (controller) {

  controller.hears('subscribe', 'direct_mention', function (bot, message) {

    controller.storage.channels.get(message.channel, function (err, channel) {
      if (!channel || !channel.subscribed) {
        channel = {}
        channel.id = message.channel
        channel.subscribed = []
      }
      if (!channel.subscribed.includes(message.user)) {
        channel.subscribed.push(message.user)
      }

      controller.storage.channels.save(channel, function (err, saved) {

        if (err) {
          bot.reply(message, 'I experienced an error adding you :' + err)
        } else {
          bot.api.reactions.add({
            name: 'thumbsup',
            channel: message.channel,
            timestamp: message.ts
          })
        }

      })
    })

  })


  controller.hears('show', 'direct_mention', function (bot, message) {

    controller.storage.channels.get(message.channel, function (err, channel) {

      bot.reply(message, channel.subscribed.map(user => '<@'+user+'>').join(','))
    })

  })
}
