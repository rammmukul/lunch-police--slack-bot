const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

module.exports = function (controller) {

  controller.hears('^\s*subscribe lunch', 'direct_mention', async function (bot, message) {

    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]
      subscribed = subscribed ? subscribed.subscribed : []
      if (!subscribed.includes(message.user)) {
        subscribed.push(message.user)
      }
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.reply(message, 'I experienced an error adding you :' + err)
    }

  })

  controller.hears('^\s*unsubscribe lunch', 'direct_mention', async function (bot, message) {

    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]

      subscribed = subscribed ? subscribed.subscribed : []
      if (subscribed.includes(message.user)) {
        subscribed.splice(subscribed.indexOf(message.user), 1)
      }
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.reply(message, 'I experienced an error removing you :' + err)
    }
  })

  controller.hears('^\s*show lunch', 'direct_mention', async function (bot, message) {
    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]

      subscribed = subscribed ? subscribed.subscribed : []
      bot.reply(message, 'lunch : '+subscribed.map(user => '<@' + user + '>').join(','))
      client.close()
    } catch (err) {
      bot.reply(message, 'I experienced an error showing subscriptions :' + err)
    }
  })

  controller.hears('^\s*add to lunch <@.*>', 'direct_mention', async function (bot, message) {
    let regx = /<@(?:\d|\w)*>/g
    let add = message.text.match(regx).map(user => user.slice(2, -1))
    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]

      subscribed = subscribed ? subscribed.subscribed : []
      add.forEach(user => {
        if (!subscribed.includes(user)) {
          subscribed.push(user)
        }        
      })
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.reply(message, 'I experienced an error adding :' + err)
    }
  })

  controller.hears('^\s*remove from lunch <@.*>', 'direct_mention', async function (bot, message) {
    let regx = /<@(?:\d|\w)*>/g
    let remove = message.text.match(regx).map(user => user.slice(2, -1))
    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]

      subscribed = subscribed ? subscribed.subscribed : []
      remove.forEach(user => {
        if (subscribed.includes(user)) {
          subscribed.splice(subscribed.indexOf(user), 1)
        }        
      })
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.reply(message, 'I experienced an error removing :' + err)
    }
  })


  controller.hears('^\s*ask lunch', 'direct_mention', async function (bot, message) {
    let moment = require('moment')
    let today = moment().startOf('day').format('DD MM YYYY')

    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let presence = await db.collection('presence')
      let lunch = await db.collection('lunch')

      let subscribed = (await lunch.find({ _id: 'lunch' }).toArray())[0]
      let scheduled = (await lunch.find({_id: 'scheduled'}).toArray())[0]
      let present = (await presence.find({_id: today}).toArray())[0]
      subscribed = subscribed ? subscribed.subscribed : []
      scheduled = scheduled ? scheduled.scheduled : []
      present = present.presence ? present.presence : []
      let lunchDuty
      if (present.lunchDuty) {
        lunchDuty = present.lunchDuty
      } else {
        lunchDuty = scheduled.filter(user => subscribed.includes(user) && present.includes(user))[0]
        if (!lunchDuty) {
          scheduled = [...scheduled, ...subscribed]
          lunchDuty = scheduled.filter(user => subscribed.includes(user) && present.includes(user))[0]
        }
        scheduled.splice(scheduled.indexOf(lunchDuty), 1)
        lunch.updateOne({ _id: 'scheduled' },
          { $set: { _id: 'scheduled', lunchDuty: lunchDuty } },
          { upsert: true }
        )
        presence.updateOne({ _id: today },
          { $set: { _id: today, scheduled: scheduled } },
          { upsert: true }
        )
      }
      client.close()

      bot.reply(message, 'presence:' + JSON.stringify(present) 
        +'\n\n\nsubscribed:'+ subscribed.map(user => '<@' + user + '>')
        +'\n\n\nscheduled:'+ scheduled.map(user => '<@' + user + '>')
        +'\n\n\nlunchDuty: <@' + lunchDuty + '>')
    } catch (err) {
      console.log(err)
    }
  })
}
