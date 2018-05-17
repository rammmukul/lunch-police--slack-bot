module.exports = function (controller) {

  controller.hears('^\s*help', 'direct_mention', async function (bot, message) {

    bot.reply(message, `"add" : subscribe yourself to lunch\n
"remove" : unsubscribe yourself from lunch\n
"add <user mentions>" : subscribe multiple users to lunch\n
"remove <user mentions>" : unsubscribe multiple users from lunch\n
"who" : show the person having lunch duty\n
"lunch" : show people subscribed to lunch\n
"monitor presence" : start monitoring this channel for presence daily\n
"presence" : show presence of users date wise\n
"help" : show this message`)

  })
}
