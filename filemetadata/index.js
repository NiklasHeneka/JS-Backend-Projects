var express = require('express');
const multer  = require('multer')
require('dotenv').config()
var app = express();

const upload = multer({ dest: 'uploads/' })

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/fileanalyse", upload.single('upfile'), (req, res) => {                                         
  res.json({
    name: req.file.originalname, 
    type: req.file.mimetype,
    size: req.file.size
  })
})

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
