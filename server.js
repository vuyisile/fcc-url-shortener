'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, { 'useNewUrlParser': true });
mongoose.set('useCreateIndex', true);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

var urlSchema = new mongoose.Schema({
    short_url : Number,
    original_url : String,
  });
  var URL = mongoose.model('URL',urlSchema);

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  

// your first API endpoint...  
function callback(resp){
  console.log('result',resp)
};

function saveURL(urlObj,cb) {
  console.log('running',urlObj)
  const url = new URL(urlObj);
  url.save((err, data) => err ? cb(err) : cb(data));
};

function listAll(){
  var data = URL.find();
  return data;
};

function checkIfExists(url){
  var data = URL.findOne({original_url:url})
  return data;
};

function getUrlForShort(reference){
  var data = URL.findOne({ short_url:Number(reference)});
  return data;
};


app.post('/api/shorturl/new', async function (req, res) {
  var list = await listAll();
  var counter = list.length + 1;
  var check = await checkIfExists(req.body['url']);
  var url ={};
  if(check === null){
    url = {original_url:req.body['url'],short_url:counter};
    await saveURL(url,callback)    
  }else{
    url = {original_url:check.original_url,short_url:check.short_url};
  }
  res.json(url);
});

app.get('/api/shorturl/:short', async function(req, res){
  var getUrl = await getUrlForShort(req.params['short']);
  res.redirect(getUrl.original_url)
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});