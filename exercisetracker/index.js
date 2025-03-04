const express = require('express')
const app = express()
let bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
})

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  description: String,
  duration: Number,
  date: Date
})

const logSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: Date
  }]
})

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);
let Log = mongoose.model("Log", logSchema);

app.post("/api/users", (req, res) => {
  let user = new User({username: req.body.username})
  user.save().then(data => {
    res.json({username: data.username, _id: data._id});
  }).catch(err => {
    res.json({error: err});
  })
})

app.get("/api/users", (req, res) => {
  User.find({}).select({username: true, _id: true}).then(data => {
    res.json(data);
  }).catch(err => { 
    res.json({error: err});
  })
})

app.post("/api/users/:_id/exercises", (req, res) => {
  let id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = new Date();
  if (req.body.date) {
    date = new Date(req.body.date);
  } 
  User.findById(id).then(user => {
    let exercise = new Exercise({username: user.username, description: description, duration: duration, date: date});
    exercise.save().then(data => {
      Log.findOne({username: user.username}).then(log => {
        if (!log) {
          let newLog = new Log({username: user.username, count: 1, log: [{description: description, duration: duration, date: date}]})
          newLog.save().catch(err => { res.json({error: err}); })
        } else {
          log.count++;
          log.log.push({description: description, duration: duration, date: date});
          log.save().catch(err => { res.json({error: err}); })
        }
      }).catch(err => {
        res.json({error: err});
      })
      res.json({username: data.username, description: data.description, duration: data.duration, _id: user._id, date: data.date.toDateString()});
    }).catch(err => { 
      res.json({error: err});
    })
  }).catch(err => {
    res.json({error: err});
  })

})
// 67c0e5c1bb6e3a052e492f8d Niklas
app.get("/api/users/:_id/logs", (req, res) => {
  let id = req.params._id;
  let query;

  User.findById(id).then(user => {
    if (req.query.from && req.query.to) {
      query = Log.findOne({username: user.username}).where('log.date').gte(req.query.from).lte(req.query.to);
    } else if (req.query.from) {
      console.log(req.query.from)
      query = Log.findOne({username: user.username}).where('log.date').gte(req.query.from);
    } else if (req.query.to) {
      query = Log.findOne({username: user.username}).where('log.date').lte(req.query.to);
    } else {
      query = Log.findOne({username: user.username});
    }

    if (req.query.limit) {
      query = query.slice('log', parseInt(req.query.limit));
    }

    query.then(log => {
      res.json({username: user.username, count: log.count, _id: log._id, log: log.log.map(entry => ({
        description: entry.description,
        duration: entry.duration,
        date: new Date(entry.date).toDateString()
      }))});
    }).catch(err => {
      res.json({error: err});
    });

  }).catch(err => {
    res.json({error: err});
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
