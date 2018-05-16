const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

module.exports = function (controller) {

  controller.hears('.*', 'ambient', async function (bot, message) {
    console.log('message: ' + message.user)
    console.log(':::::::: ' + JSON.stringify(message, null, 2))

    let moment = require('moment')
    let today = moment().startOf('day').format('DD MM YYYY')

    try {
        let client = await MongoClient.connect(url)
        const db = client.db('test')
        let col = await db.collection('presence')
        let monitor = (await col.find({ _id: 'group' }).toArray())[0].monitor
        if (message.channel !== monitor) return

        let presence = (await col.find({ _id: today }).toArray())[0]
        presence = presence ? presence.presence : []
        if (!presence.includes(message.user)) {
          presence.push(message.user)
        }
        col.updateOne({ _id: today },
          { $set: { _id: today, presence: presence } },
          { upsert: true }
        )
        client.close()
  
        bot.api.reactions.add({
          name: 'heavy_check_mark',
          channel: message.channel,
          timestamp: message.ts
        })
  
      } catch (err) {
        console.log(err)
      }
  })

  controller.hears('^\s*monitor presence', 'direct_mention', async function(bot, message) {
    try {
        let client = await MongoClient.connect(url)
        const db = client.db('test')
        let col = await db.collection('presence')
        
        col.updateOne({ _id: 'group' },
          { $set: { _id: 'group', monitor: message.channel } },
          { upsert: true }
        )
        client.close()
  
        bot.api.reactions.add({
          name: 'thumbsup',
          channel: message.channel,
          timestamp: message.ts
        })
  
      } catch (err) {
        bot.reply(message, 'I experienced an error saving configuration :' + err)
      }
  })

  controller.hears('^\s*show presence', 'direct_mention', async function (bot, message) {
    try {
        let client = await MongoClient.connect(url)
        const db = client.db('test')
        let col = await db.collection('presence')
        let monitor = (await col.find({ _id: 'group' }).toArray())[0].monitor
        if (message.channel !== monitor) return

        let presence = (await col.find({}).toArray())
        client.close()

        bot.reply(message, "presence" + JSON.stringify(presence, null, 2))
      } catch (err) {
        console.log(err)
      }
  })
}
