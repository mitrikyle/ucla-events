var express = require('express')
var router = express.Router()
const db = require('../db')
var Event = db.models.Event
var Tag = db.models.Tag
var User = db.models.User
const moment = require('moment')


/* GET events. */
router.get('/events', function (req, res, next) {
  Event.find({'date': {'$gte': moment().startOf('day').toDate(), '$lt': moment().add(7, 'd').startOf('day').toDate()}}, null, {sort: {date: 1}}, function (err, events) {
    if (!err) {
      res.status(200).json(events)
    }else {
      console.log(err)
      res.status(500).json([])
    }
  })
})

/* POST events. */
router.post('/events', function (req, res, next) {
  // var title = req.body.title
  // var host = req.body.host
  // var location = req.body.location
  // var details = req.body.details
  // var facebook_link = req.body.facebook_link

  var event = new Event()
  event.title = 'Test Event'
  event.host = 'Jackie Chan'
  event.date = new Date()
  event.location = 'Top of Boelter Hall'
  event.details = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  event.url = 'http://www.facebook.com'
  event.save(function (err, newEvent) {
    res.status(200).json({message: 'Successfully created event'})
  })
})

/* routes for a particular event id */
router.route('/events/:eventId')

  // get the event with that id
  .get(function (req, res) {
    Event.findById(req.params.eventId, function (err, event) {
      if (!err) {
        res.status(200).json(event)
      } else {
        res.status(500).json(err)
      }
    })
  })

  // update the event with this id
  // TODO
  .put(function (req, res) {
    Event.findOneAndUpdate({_id: req.params.eventId}, {$set: {}}, function (err, event) {
      if (!err) {
        console.log('success')
      } else {
        console.log(err)
      }
    })
  })

  .delete(function (req, res) {
    Event.findByIdAndRemove(req.params.eventId, function (err) {
      if (!err) {
        console.log('sucess')
      } else {
        console.error(err)
      }
    })
  })

/* routes for a particular tag */
router.route('/tag/:tagName')

  .get(function (req, res) {
    Tag.findOne({name: req.params.tagName})
      .populate('events')
      .exec(function (err, tag) {
        if (tag) {
          res.status(200).json(tag.events)
        } else {
          res.status(500).json([])
        }
      })
  })

// routes for a particular user


router.post('/user/:fbId/:eventId', function (req, res) {
    User.findOrCreate({fbId: req.params.fbId}, function (err, user) {
      if (user) {
        console.log('got here')
        if (req.params.eventId) {
          user.events.push(req.params.eventId)
          user.save(function (err, updatedUser) {
            if (!err) {
              res.status(200).json({'success': true})
            } else {
              res.status(500).json({'success': false})
            }
          })
        } else {
          res.status(500).json({'success': false})
        }
      } else {
        res.status(500).json({'success': false})
      }
    })
  })

router.get('/user/:fbId', function (req, res) {
    User.findOne({fbId: req.params.fbId})
      .populate('events')
      .exec(function (err, user) {
        if (user) {
          console.log(user)
          res.status(200).json(user.events)
        } else {
          res.status(500).json([])
        }
      })
  })

router.get('/search/:query', (req, res, next) => {
  let keyWords = req.params.query.split(' ')
  console.log(keyWords);
  Event.find({'date': {'$gte': moment().startOf('day').toDate()}, tags: { $in: keyWords}}, null, {sort: {date: 1}}, (err, docs) => {
    if (err) {
      console.log('err')
      res.status(500).json([])
    } else {
      res.status(200).json(docs)
    }
  })
})

module.exports = router
