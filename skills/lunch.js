const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI
const serviced = []

module.exports = function (controller) {

  controller.hears('^\s*lunch', 'direct_message,direct_mention', async function (bot, message) {
    console.log(message)
    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]

      subscribed = subscribed ? subscribed.subscribed : []
      bot.reply(message, 'lunch : '+subscribed.map(user => '<@' + user + '>').join(','))
      client.close()
    } catch (err) {
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      bot.replyInThread(message, 'I experienced an error showing subscriptions :' + err)
    }
  })

  controller.hears('^\s*add', 'direct_message,direct_mention', async function (bot, message) {
    let regx = /<@\w+>/g
    let add = (message.text.match(regx) || []).map(user => user.slice(2, -1))
    add = add.length ? add : [message.user]
    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
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
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      bot.replyInThread(message, 'I experienced an error adding :' + err)
    }
  })

  controller.hears('^\s*remove', 'direct_message,direct_mention', async function (bot, message) {
    let regx = /<@\w+>/g
    let remove = (message.text.match(regx) || []).map(user => user.slice(2, -1))
    remove = remove.length ? remove : [message.user]
    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let col = await db.collection('lunch')
      let subscribed = (await col.find({ _id: 'lunch' }).toArray())[0]
      let scheduled = (await col.find({_id: 'scheduled'}).toArray())[0]
      subscribed = subscribed ? subscribed.subscribed : []
      scheduled = scheduled ? scheduled.scheduled : []

      remove.forEach(user => {
        if (subscribed.includes(user)) {
          subscribed.splice(subscribed.indexOf(user), 1)
        }
        while(scheduled.includes(user)) {
          scheduled.splice(scheduled.indexOf(user), 1)
        }
      })
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      col.updateOne({ _id: 'scheduled' },
        { $set: { _id: 'scheduled', scheduled: scheduled } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      bot.replyInThread(message, 'I experienced an error removing :' + err)
    }
  })

  controller.hears('^\s*who', 'direct_message,direct_mention', async function (bot, message) {
    let moment = require('moment')
    let today = moment().startOf('day').format('DD MM YYYY')

    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let presence = await db.collection('presence')
      let lunch = await db.collection('lunch')

      let subscribed = (await lunch.find({ _id: 'lunch' }).toArray())[0]
      let scheduled = (await lunch.find({_id: 'scheduled'}).toArray())[0]
      let present = (await presence.find({_id: today}).toArray())[0]
      subscribed = subscribed ? subscribed.subscribed : []
      scheduled = scheduled ? scheduled.scheduled : []
      let lunchDuty = present.lunchDuty
      present = present.presence ? present.presence : []
      if (!lunchDuty) {
        lunchDuty = scheduled.filter(user => subscribed.includes(user) && present.includes(user))[0]
        if (!lunchDuty) {
          scheduled = [...scheduled, ...subscribed]
          lunchDuty = scheduled.filter(user => subscribed.includes(user) && present.includes(user))[0]
        }
        scheduled.splice(scheduled.indexOf(lunchDuty), 1)
        lunch.updateOne({ _id: 'scheduled' },
          { $set: { _id: 'scheduled', scheduled: scheduled } },
          { upsert: true }
        )
        presence.updateOne({ _id: today },
          { $set: { _id: today, lunchDuty: lunchDuty } },
          { upsert: true }
        )
      }
      client.close()

      bot.reply(message, 'lunchDuty: <@' + lunchDuty + '>\n\n'
      + 'scheduled:'+ scheduled.map(user => '<@' + user + '>'))
    } catch (err) {
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      bot.whisper(message, 'can\'t find somone to do lunch duty "ask @user" to ask @user to do lunch duty')

      console.log(err)
    }
  })

  controller.hears('^\s*ask <@\\w+>', 'direct_mention', async function (bot, message) {
    let moment = require('moment')
    let today = moment().startOf('day').format('DD MM YYYY')
    let regx = /<@\w+>/g

    try {
      let asked = message.text.match(regx)[0].slice(2, -1)
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let presence = await db.collection('presence')
      let lunch = await db.collection('lunch')

      let subscribed = (await lunch.find({ _id: 'lunch' }).toArray())[0]
      let scheduled = (await lunch.find({_id: 'scheduled'}).toArray())[0]
      let present = (await presence.find({_id: today}).toArray())[0]
      subscribed = subscribed ? subscribed.subscribed : []
      scheduled = scheduled ? scheduled.scheduled : []
      let lunchDuty = present.lunchDuty

      if (lunchDuty && subscribed.includes(lunchDuty)) {
        scheduled = scheduled.reverse()
        scheduled.push(lunchDuty)
        scheduled = scheduled.reverse()
      }
      if (scheduled.includes(asked)) {
        scheduled.splice(scheduled.indexOf(asked), 1)
      }
      lunch.updateOne({ _id: 'scheduled' },
        { $set: { _id: 'scheduled', scheduled: scheduled } },
        { upsert: true }
      )
      presence.updateOne({ _id: today },
        { $set: { _id: today, lunchDuty: asked } },
        { upsert: true }
      )
      client.close()

      bot.reply(message, 'lunchDuty: <@' + asked + '>\n\n'
      + 'scheduled:'+ scheduled.map(user => '<@' + user + '>'))
    } catch (err) {
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      console.log(err)
    }
  })

}
