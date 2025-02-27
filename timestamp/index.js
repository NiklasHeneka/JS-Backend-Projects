var express = require('express');
var app = express();

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/api/:date?", (req, res) => {
  let dateString = req.params.date;
  if (!dateString) res.send({ unix: new Date().getTime(), utc: new Date().toUTCString() });
  else {
    let date = new Date(dateString);
    if (isNaN(date)) {
      date = parseInt(dateString);
      date = new Date(date);
    }
    if (isNaN(date)) res.json({error: "Invalid Date"});
    else {
      res.json({unix: date.getTime(), utc: date.toUTCString()});
    }
  }
})

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
