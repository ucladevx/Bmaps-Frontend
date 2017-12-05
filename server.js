var express = require("express");
var cors = require('cors');
var xoauth2 = require('xoauth2');
var fs = require('fs')
var logger = require("morgan");
var bodyParser = require('body-parser');
var nconf = require('nconf');
// var auth =  require('./config.json');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var hbs = require('hbs');

// include client-side assets and use the bodyParser
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// log requests to stdout and also
// log HTTP requests to a file in combined format
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
app.use(logger('dev'));
app.use(logger('combined', { stream: accessLogStream }));

app.set('port', (process.env.PORT || 8000));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
    res.render('index');
});

app.use("/",router);


app.use("*",function(req,res){
    res.render('404');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
