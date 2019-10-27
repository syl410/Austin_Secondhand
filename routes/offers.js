const express = require("express");
const router  = express.Router({mergeParams: true});
const Usedstuff = require("../models/usedstuff");
const Offer = require("../models/offer");
const User = require("../models/user");
const middleware = require("../middleware");
const { isLoggedIn, checkUserOffer, checkUserUsedstuff, checkUsedstuffExist, checkNotUserUsedstuff, isAdmin } = middleware;

// the url is /<%= usedstuff._id %>/offers/

//Offers New
router.get("/new", isLoggedIn, checkUsedstuffExist, checkNotUserUsedstuff, function(req, res){
    // find usedstuff by id
    Usedstuff.findById(req.params.id).populate("offers").exec(function(err, usedstuff){
        if(err || !usedstuff){
            console.log(err);
            req.flash('error', 'Sorry, that stuff does not exist!');
            res.redirect('/');
        } else {
            // check if current user made an offer or not
            // if yes, the user cannot make more offer.
            var hasOffer = false;
            usedstuff.offers.forEach(function(offer){
                if (offer.author.username == req.user.username) {
                    console.log("equal!");
                    hasOffer = true;
                } else {
                    console.log("*** not equal");
                }
            });
            if(hasOffer) {
                req.flash('error', 'Sorry, you have already made one offer. You may just update your existing offer');
                res.redirect('back');
            } else {
                res.render("offers/new", {usedstuff: usedstuff});
            }
        }
    });
});

//Offers Create
router.post("/", isLoggedIn, checkUsedstuffExist, checkNotUserUsedstuff, function(req, res){
   //lookup usedstuff using ID
    Usedstuff.findById(req.params.id, function(err, usedstuff){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            Offer.create(req.body.offer, function(err, offer){
                if(err){
                    console.log(err);
                } else {
                    // raw offer
                    //add username and id to offer
                    offer.author.id = req.user._id;
                    offer.author.username = req.user.username;
                    offer.author.email = req.user.email;
                    //save offer
                    offer.save();
                    usedstuff.offers.push(offer);
                    usedstuff.save();
                    // add offer user made to offers list
                    User.findByIdAndUpdate(req.user._id, {$push: {"offers": usedstuff._id}}, function(err, user){ 
                        if(err){ 
                            req.flash("error", err.message); 
                        } 
                    });
                    req.flash('success', 'Maked a offer!');
                    res.redirect('/' + usedstuff._id);
                }
            });
        }
    });
});

router.get("/:offerId/edit", isLoggedIn, checkUsedstuffExist, checkUserOffer, function(req, res){
  res.render("offers/edit", {usedstuff_id: req.params.id, offer: req.offer});
});

router.put("/:offerId", isLoggedIn, checkUsedstuffExist, checkUserOffer, function(req, res){
   Offer.findByIdAndUpdate(req.params.offerId, req.body.offer, function(err, offer){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/" + req.params.id);
       }
   }); 
});

router.delete("/:offerId", isLoggedIn, checkUsedstuffExist, checkUserOffer, function(req, res){
  // find usedstuff, remove offer from offers array, delete offer in db
  Usedstuff.findByIdAndUpdate(req.params.id, {
    $pull: {
      offers: req.offer.id
    }
  }, function(err) {
    if(err){ 
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/');
    } else {
        req.offer.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            // remove this offer from user's offer list
            User.findByIdAndUpdate(req.user._id, {$pull: {"offers": req.params.id}}, function(err, user){ 
                if(err){ 
                    req.flash("error", err.message); 
                    res.redirect("back"); 
                }
            });
            req.flash('error', 'Offer deleted!');
            res.redirect("/" + req.params.id);
        });
    }
  });
});

module.exports = router;