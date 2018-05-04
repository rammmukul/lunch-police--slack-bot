
module.exports = function (controller) {

  controller.hears('subscribe', ['direct_message', 'direct_mention'], function (bot, message) {

    controller.storage.channels.get(message.channel, function (err, channel) {

      if (!channel.subscribed) {
        channel.subscribed = []
      }

      channel.subscribed.push(message.user)

      controller.storage.channels.save(message.channel, function (err, saved) {

        if (err) {
          bot.reply(message, 'I experienced an error adding you :' + err);
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
}
