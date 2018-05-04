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

      let db = require('monk')(process.env.MONGO_URI)
      let subscribed = db.get('subscribed')
      subscribed.insert({
        channel: channel.id,
        subscribed: channel.subscribed
      })
      subscribed.find({}).then(data => console.log(data))
      db.close()

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
