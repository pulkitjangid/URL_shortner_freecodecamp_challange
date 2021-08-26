require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
var bodyParser = require("body-parser");
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

mongoose.connect('mongodb+srv://pulkit:mumbaiaws@cluster0.no2pb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

const urlModel = mongoose.model('urlModel', urlSchema);

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
function isValidURL(string) {
  if(string[4] == 's'){
    var res = string.match(/(https?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
  }
  else{
    return false;
  }
};
function generate(number) {
  let val = Math.random() * 1000;
  val = Math.floor(val)
  return val;
}
// Your first API endpoint
app.post('/api/shorturl', async function (req, res) {
  const url = req.body.url
  let check = isValidURL(url)
  if (check == true) {
    let value = generate();
    const check = await urlModel.find({ number: value }).exec()
    if (check == true) {
      value = generate()
    }
    var new_url = new urlModel({
      original_url: url,
      short_url: value
    })
    new_url.save(function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(result)
      }
    });
    res.json({ "original_url": url, "short_url": value });
  }
  else {
    res.send({ error: 'invalid url' })
  }

});

app.get('/api/shorturl/:short_url', function (req, res) {
  urlModel.findOne({ short_url: req.params.short_url}, function (err, doc){
    res.redirect(doc.original_url)
  });
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
