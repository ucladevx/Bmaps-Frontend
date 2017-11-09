var express = require("express");
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var xoauth2 = require('xoauth2');
// var path = require("path");
var fs = require('fs')
var logger = require("morgan");
var mg = require('nodemailer-mailgun-transport');
var bodyParser = require('body-parser');
var nconf = require('nconf');
// var auth =  require('./config.json');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var hbs = require('hbs');

// include client-side assets and use the bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// log requests to stdout and also
// log HTTP requests to a file in combined format
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
app.use(logger('dev'));
app.use(logger('combined', { stream: accessLogStream }));

app.set('port', (process.env.PORT || 5000));

app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
    res.render('index');
});

router.get("/mission",function(req,res){
    res.render('mission');
});

router.get("/team",function(req,res){
    res.render('team');
});

router.get("/families",function(req,res){
    res.render('families');
});

router.get("/contact",function(req,res){
    res.render('contact');
});

// http POST /contact
router.post("/contact", function (req, res) {
  var name = req.body.inputname;
  var email = req.body.inputemail;
  var comment = req.body.inputcomment;
  var isError = false;

  console.log('\nCONTACT FORM DATA: '+ name + ' '+email + ' '+ comment+'\n');

  // create transporter object capable of sending email using the default SMTP transport
  var transporter = nodemailer.createTransport(mg(auth));

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: name +  " <" + email + ">", // sender address
    to: 'tnkhan8042@gmail.com', // list of receivers
    subject: 'Message from Website Contact page', // Subject line
    text: comment,
    err: isError

  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('\nERROR: ' + error+'\n');
      //   res.json({ yo: 'error' });
    } else {
         console.log('\nRESPONSE SENT: ' + info.response+'\n');
      //   res.json({ yo: info.response });
    }
  });
});

router.get("/calendar",function(req,res){
    res.render('calendar');
});
router.get("/gallery",function(req,res){
    res.render('gallery');
});

router.get("/projects",function(req,res){
  res.render('projects');
});

router.get("/applytosponsor",function(req,res){
  res.render('applytosponsor');
});

router.get("/sponsors",function(req,res){
  res.render('sponsors');
});

// router.get("/memes",function(req,res){
//   res.render('memes');
// });

// router.get("/haha",function(req,res){
//   res.render('haha');
// });

// router.get("/handle",function(req,res){
//   res.render('handle');
// });


app.use("/",router);

app.use(express.static("public"));

app.use("*",function(req,res){
    res.render('404');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
