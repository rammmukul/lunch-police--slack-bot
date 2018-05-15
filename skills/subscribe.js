const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

module.exports = function (controller) {

  controller.hears('^\s*subscribe', 'direct_mention', async function (bot, message) {

    controller.storage.channels.get(message.channel, async function (err, channel) {
      if (!channel || !channel.subscribed) {
        channel = {}
        channel.id = message.channel
        channel.subscribed = []
      }
      if (!channel.subscribed.includes(message.user)) {
        channel.subscribed.push(message.user)
      }

      let client = await MongoClient.connect(url)
      const db = client.db('test')

      let col = await db.collection('local')
      col.updateOne({ _id: channel.id },
        { $set: { _id: channel.id, subscribed: channel.subscribed } },
        { upsert: true }
      )
      col.find({}).toArray((e, items) => console.log(items))
      client.close()

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


  controller.hears('^\s*unsubscribe', 'direct_mention', function (bot, message) {

    controller.storage.channels.get(message.channel, function (err, channel) {
      if (!channel || !channel.subscribed) {
        channel = {}
        channel.id = message.channel
        channel.subscribed = []
      }
      if (channel.subscribed.includes(message.user)) {
        channel.subscribed.splice(channel.subscribed.indexOf(message.user), 1)
      }

      MongoClient.connect(url, (err, client) => {
        const db = client.db('test')

        db.collection('local', null, (err, col) => {
          col.updateOne({ _id: channel.id },
            { $set: { _id: channel.id, subscribed: channel.subscribed } },
            { upsert: true }
          )
          col.find({}).toArray((e, items) => console.log(items))
          client.close()
        })
      })

      controller.storage.channels.save(channel, function (err, saved) {

        if (err) {
          bot.reply(message, 'I experienced an error removing you :' + err)
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
      bot.reply(message, channel.subscribed.map(user => '<@' + user + '>').join(','))
    })

  })
}
