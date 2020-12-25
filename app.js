// this is a server file and it will start a server
// It will 1, setup server, 2, connect DB, 3, routes

// require takes the name of a package as a string argument and returns a package
var express     = require("express");

// Calls the express function "express()" and 
// puts new Express application inside the app var (to start a new Express application). 
var app         = express();

// body-parser extract the entire body portion of an incoming request stream and exposes it on req.body
var bodyParser  = require("body-parser");

// Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. 
var mongoose    = require("mongoose");

// The flash is a special area of the session used for storing messages. 
// Messages are written to the flash and cleared after being displayed to the user. 
// The flash is typically used in combination with redirects, 
// ensuring that the message is available to the next page that is to be rendered.
var flash        = require("connect-flash");

var passport    = require("passport");
var cookieParser = require("cookie-parser");
var LocalStrategy = require("passport-local");

// models
var Usedstuff  = require("./models/usedstuff");
var Comment     = require("./models/comment");
var Offer     = require("./models/offer");
var User        = require("./models/user");

// HTTP is stateless. 
// To associate a request to any other request, we need a way to store user data between HTTP requests. 
// We assign the client an ID and it makes all further requests using that ID. 
// Information associated with the client is stored on the server linked to this ID.
var session = require("express-session");
var methodOverride = require("method-override");

// middleware for handling multipart/form-data, which is used for uploading files
var multer = require('multer');
// configure dotenv
require('dotenv').load();

//requiring routes
var commentRoutes    = require("./routes/comments"),
    offerRoutes      = require("./routes/offers"),
    indexRoutes      = require("./routes/index"),
    userRoutes       = require("./routes/user")
    
// assign mongoose promise library and connect to database
// If we want to use mongoose in different position inside the codes it must be viewed as global mode
mongoose.Promise = global.Promise;

const databaseUri = 'mongodb+srv://syl410:syl5689@cluster0-6c1ey.mongodb.net/Austin_Secondhand?retryWrites=true&w=majority';

mongoose.connect(databaseUri, { useMongoClient: true })
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));

// use is a method to configure the middleware used by the routes of the Express HTTP server object.
app.use(bodyParser.urlencoded({extended: true}));

// EJS simply stands for Embedded Javascript.
// It is a simple templating language/engine that lets its user generate HTML with plain javascript
app.set("view engine", "ejs");

// __dirname is directory path of currently executing js
app.use(express.static(__dirname + "/public"));

// PUT and DELETE are supported by HTML, which need method-override
// https://dev.to/moz5691/method-override-for-put-and-delete-in-html-3fp2
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

// require moment
// Moment.js: use the native JavaScript Date object directly. 
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(session({
    secret: "It is a secret!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

app.use("/", indexRoutes);
app.use("/:id/comments", commentRoutes);
app.use("/:id/offers", offerRoutes);
app.use("/user", userRoutes);

// port of cloud9 environment: process.env.PORT
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Austin Secondhand Server Has Started!");
});
