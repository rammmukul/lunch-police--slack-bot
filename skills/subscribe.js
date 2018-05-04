
module.exports = function (controller) {

  controller.hears('subscribe', 'direct_mention', function (bot, message) {

    controller.storage.channels.get(message.channel, function (err, channel) {

      if (!channel) {
        channel = {}
        channel.id = message.channel
        channel.subscribed = []
      }

      channel.subscribed.push(message.user)

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

      bot.reply(message, channel.subscribed.join(','))
    })

  })
}
