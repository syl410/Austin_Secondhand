var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user"); // model/user.js
var Usedstuff = require("../models/usedstuff");
var Comment = require("../models/comment");
var Offer = require("../models/offer");
var middleware = require("../middleware");
var geocoder = require('geocoder'); // location to latitue and longitude

// set image storage in Cloudinary
var multer = require('multer');
var { storage } = require('../cloudinary');
var cloudinary = require('cloudinary').v2;
var upload = multer({ storage });
var path = require('path');

var { checkPostNumber, checkUserNumber, isLoggedIn, checkUserUsedstuff, checkUsedstuffExist, checkUserComment, isAdmin, isTooBig } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
// "(phone&5" -> "\(phone\&5"
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // $& means the whole matched string, which is (, or & or ...
};

//INDEX - show all usedstuffs
router.get("/", function(req, res){
  // each time user type something in search input, it will send a request
  // req.xhr: a flag indicating whether the current request (req) appears to be an AJAX request
  if(req.query.search && req.xhr) {
      // g modifier: global. All matches
      // i modifier: case insensitive
      // "(phone&5" -> "\(phone\&5" -> "/\(phone\&5/gi"
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all matched usedstuffs from DB
      Usedstuff.find({name: regex}, function(err, allUsedstuffs){
         if(err){
            console.log(err);
         } else {
            // sends a JSON response composed of the specified data (matched stuffs)
            // header wouldn't change. index.ejs will use allUsedstuffs for display (forEach)
            // status 200 is default
            res.status(200).json(allUsedstuffs);
         }
      });
  } else {
      // Get all usedstuffs from DB
      Usedstuff.find({}, function(err, allUsedstuffs){
         if(err){
            console.log(err);
         } else {
            if(req.xhr) {
                res.json(allUsedstuffs);
            } else {
                res.render("index",{usedstuffs: allUsedstuffs.reverse(), page: '/'});
            }
         }
      });
  }
});

//About
router.get("/about", function(req, res){
   res.render("about"); 
});

// SHOW Furniture
router.get("/Furniture", function(req, res){
    var category = "Furniture"
    Usedstuff.find({'category': category}, function(err, categoryUsedStuffs){
        if(err) {
            console.log(err);
        } else {
            res.render("category", {categoryUsedStuffs, categoryUsedStuffs, category})
        }
    });
});

// SHOW Appliances
router.get("/Appliances", function(req, res){
    var category = "Appliances"
    Usedstuff.find({'category': category}, function(err, categoryUsedStuffs){
        if(err) {
            console.log(err);
        } else {
            res.render("category", {categoryUsedStuffs, categoryUsedStuffs, category})
        }
    });
});

// SHOW Automotive
router.get("/Automotive", function(req, res){
    var category = "Automotive"
    Usedstuff.find({'category': category}, function(err, categoryUsedStuffs){
        if(err) {
            console.log(err);
        } else {
            res.render("category", {categoryUsedStuffs, categoryUsedStuffs, category})
        }
    });
});

// SHOW Clothing
router.get("/Clothing", function(req, res){
    var category = "Clothing"
    Usedstuff.find({'category': category}, function(err, categoryUsedStuffs){
        if(err) {
            console.log(err);
        } else {
            res.render("category", {categoryUsedStuffs, categoryUsedStuffs, category})
        }
    });
});

// SHOW Other
router.get("/Other", function(req, res){
    var category = "Other"
    Usedstuff.find({'category': category}, function(err, categoryUsedStuffs){
        if(err) {
            console.log(err);
        } else {
            res.render("category", {categoryUsedStuffs, categoryUsedStuffs, category})
        }
    });
});

// SHOW Electronics
router.get("/Electronics", function(req, res){
    // find user by id
    var category = "Electronics"
    Usedstuff.find({'category': category}, function(err, categoryUsedStuffs){
        if(err) {
            console.log(err);
        } else {
            res.render("category", {categoryUsedStuffs, categoryUsedStuffs, category})
        }
    });
});

// CREATE - add new usedstuff to DB
// upload.single('image') will upload the image to cloudinary and update the req.file.path
router.post("/", isLoggedIn, checkPostNumber, upload.single('image'), function(req, res){
    // get data from form and add to secondhand stuff array
    var name = req.body.name;

    // newFileInfo holds the output file properties
    var finalImage = {
       url: req.file.path,
       filename: req.file.filename
    }
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var cost = req.body.cost;
    var category = req.body.category;
    geocoder.geocode(req.body.location, function (err, data) {
        // check if location is valid
        if (err || data.status === 'ZERO_RESULTS') {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        
        var location = req.body.location;
        var newUsedstuff = {   name: name, 
                                image: finalImage,
                                description: desc,
                                cost: cost,
                                author:author,
                                location: location, 
                                category: category
        };
        // Create a new usedstuff and save to DB
        Usedstuff.create(newUsedstuff, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                // add posted stuff id to user's "posts"
                User.findByIdAndUpdate(req.user._id, {$push: {"posts": newlyCreated._id}}, function(err, user){ 
                    if(err){ 
                        req.flash("error", err.message); 
                    } 
                });
                req.flash("success","You item has been posted!");
                //redirect back to usedstuffs page
                res.redirect("/");
            }
        });
    });
});

//NEW - show form to create new usedstuff
router.get("/new", isLoggedIn, function(req, res){
   res.render("new"); 
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// handle sign up logic
// currently one one email can have multiple accounts
router.post("/register", checkUserNumber, function(req, res){
    var newUser = new User({username: req.body.username, email: req.body.email});
    if(req.body.username === "admin") {
        newUser.isAdmin = true;
    }
    // register(user, password, cb) Convenience method to register a new user instance with a given password
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Signed up sccessfully! Welcome to Austin Secondhand, " + req.body.username);
            res.redirect("/");
        });
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true, // true means "Password or username are incorrect". It can be other String also
        successFlash: 'Welcome back!'
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "See you later!");
   res.redirect("/");
});


// "/:id" should be after all "/xxxx"
//  otherwise it will not jump to "/xxxx" (not include "/xxx/xxx")

// SHOW - shows more info about one usedstuff
router.get("/:id", function(req, res){
    if (req.params.id == "favicon.ico") {
        res.redirect("/");
    } else {
        //find the usedstuff with provided ID
        Usedstuff.findById(req.params.id).populate("comments offers").exec(function(err, foundUsedstuff){
            if(err || !foundUsedstuff){
                console.log(err);
                req.flash('error', 'Sorry, that stuff does not exist!');
                return res.redirect('/');
            }
            //render show template with that usedstuff
            res.render("show", {usedstuff: foundUsedstuff});
        });
    }
});

// EDIT - shows edit form for a usedstuff
router.get("/:id/edit", isLoggedIn, checkUserUsedstuff, function(req, res){
  //render edit template with that usedstuff
  res.render("edit", {usedstuff: req.usedstuff});
});

// PUT - updates usedstuff in the database
router.put("/:id", isLoggedIn, checkUserUsedstuff, function(req, res){
  var location = req.body.location;
  
  var newData = {
      name: req.body.name, 
      description: req.body.description, 
      cost: req.body.cost, 
      location: location
  }; 
  Usedstuff.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, usedstuff){ 
      if(err){ 
          req.flash("error", err.message); 
          res.redirect("back"); 
      } else { 
          req.flash("success","Successfully Updated!"); 
          res.redirect("/" + usedstuff._id);
      }
  });
});

// DELETE - removes usedstuff and its comments from the database
router.delete("/:id", isLoggedIn, checkUserUsedstuff, function(req, res) {
    // remove comments
    Comment.remove({
        _id: {
          $in: req.usedstuff.comments
        }
    }, function(err) {
        if(err) {
            req.flash('error', err.message);
            res.redirect('/');
        } else {
            // remove offers
            Offer.remove({
                _id: {
                    $in: req.usedstuff.offers
                }
            }, function(err) {
                if (err) {
                    req.flash('error', err.message);
                      res.redirect('/');
                } else {
                    // remove used stuff
                    req.usedstuff.remove(function(err) {
                        if(err) {
                            req.flash('error', err.message);
                            return res.redirect('/');
                        }
                        User.findByIdAndUpdate(req.user._id, {$pull: {"posts": req.usedstuff._id}}, function(err, user){ 
                            if(err){ 
                                req.flash("error", err.message); 
                                res.redirect("back"); 
                            } else {
                                cloudinary.uploader.destroy(req.usedstuff.image.filename);
                            }
                        });
                        
                        req.flash('error', 'You item has been deleted!');
                        res.redirect('/');
                    });
                }
            });
        }
    });
});

// PUT - updates user saveditems and savedusers of used stuff in the database
router.put("/:id/saveditems", isLoggedIn, checkUsedstuffExist, function(req, res){
    var currentUserId = req.body.currentUserId;
    var usedstuffId = req.body.usedstuffId;
    
    User.findByIdAndUpdate(currentUserId, {$push: {"saveditems": usedstuffId}}, function(err, user){ 
        if (err) { 
            req.flash("error", err.message); 
        } else {
            Usedstuff.findByIdAndUpdate(usedstuffId, {$push: {"savedUsers": currentUserId}}, function(err, user){ 
                if(err){ 
                    req.flash("error", err.message); 
                }
            });
        }
    });
});


// DELETE - delete user saveItem and savedUsers of used stuff in the database
router.delete("/:id/saveditems", isLoggedIn, checkUsedstuffExist, function(req, res){
    var currentUserId = req.body.currentUserId;
    var usedstuffId = req.body.usedstuffId;
    
    User.findByIdAndUpdate(currentUserId, {$pull: {"saveditems": usedstuffId}}, function(err, user){ 
        if(err){ 
            req.flash("error", err.message); 
            res.redirect("back"); 
        } else {
            Usedstuff.findByIdAndUpdate(usedstuffId, {$pull: {"savedUsers": currentUserId}}, function(err, user){ 
                if(err){ 
                    req.flash("error", err.message); 
                    res.redirect("back"); 
                } 
            });
        }
    });
});

module.exports = router;