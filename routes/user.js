const express = require("express");
const router  = express.Router({mergeParams: true});
const Usedstuff = require("../models/usedstuff");
const Offer = require("../models/offer");
const User = require("../models/user");
const middleware = require("../middleware");
const { isCurrentuserAccessProfile, isLoggedIn, checkUserOffer, isAdmin } = middleware;


// user's posts 
router.get("/:userid/posts", isLoggedIn, isCurrentuserAccessProfile, function(req, res){
    // find user by id
    var userpostoffersave = "My posts";
    User.findById(req.params.userid, function(err, user){ // req.params.<id_name>: <id_name> is the :xxxid from url.
        if(err){
            console.log(err);
        } else {
            Usedstuff.find({'_id': user.posts}, function(err, userUsedStuffs){
                if(err) {
                    console.log(err);
                } else {
                    res.render("user/userpostoffersave", {userUsedStuffs, userUsedStuffs, userpostoffersave})
                }
            });
        }
    })
});


// user's saved itmes
router.get("/:userid/saveditems", isLoggedIn, isCurrentuserAccessProfile, function(req, res){
    // find user by id
    var userpostoffersave = "My saved items";
    User.findById(req.params.userid, function(err, user){ // req.params.<id_name>: <id_name> is the :xxxid from url.
        if(err){
            console.log(err);
        } else {
            Usedstuff.find({'_id': user.saveditems}, function(err, userUsedStuffs){
                if(err) {
                    console.log(err);
                } else {
                    res.render("user/userpostoffersave", {userUsedStuffs, userUsedStuffs, userpostoffersave})
                }
            });
        }
    })
});

// offers made by user's 
router.get("/:userid/offers", isLoggedIn, isCurrentuserAccessProfile, function(req, res){
    // find user by id
    var userpostoffersave = "Offers I made";
    User.findById(req.params.userid, function(err, user){ 
        if(err){
            console.log(err);
        } else {
            Usedstuff.find({'_id': user.offers}, function(err, userUsedStuffs){
                if(err) {
                    console.log(err);
                } else {
                    res.render("user/userpostoffersave", {userUsedStuffs, userUsedStuffs, userpostoffersave})
                }
            });
        }
    })
});

module.exports = router;