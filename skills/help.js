module.exports = function (controller) {

  controller.hears('^\s*help', 'direct_mention', async function (bot, message) {

    bot.reply(message, `"subscribe" : add yorself to lunch subscription\n
"unsubscribe" : remove yorself from lunch subscription\n
"show lunch" : show people subscribed to lunch\n
"ask lunch" : show the person having lunch duty\n
"add to lunch <user mentions>" : subscribe multiple users to lunch\n
"remove from lunch <user mentions>" : unsubscribe multiple users from lunch\n
"monitor presence" : start monitoring this channel for presence daily\n
"show presence" : show presence of users date wise\n
"help" : show this message`)

  })
}
