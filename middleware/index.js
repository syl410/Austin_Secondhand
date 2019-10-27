var Comment = require('../models/comment');
var Offer = require('../models/offer');
var User = require('../models/user');
var Usedstuff = require('../models/usedstuff');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!'); // 'error' is not printed in web
      res.redirect('/login');
  },
  isCurrentuserAccessProfile: function(req, res, next){
      if(req.params.userid == req.user._id){
          return next();
      }
      req.flash('error', 'You have not permission to access that!');
      res.redirect('back');
  },
  checkUserNumber: function(req, res, next) {
    User.find({}, function(err, allUsers){
         if(err){
             console.log(err);
         } else {
           if(allUsers.length < 500) {
              return next();
           } else {
              req.flash('error', 'Current user number is more than limit, 500. We will increase size of our database. See you soon!');
              res.redirect('back');
           }
         }
    });
  },
  checkPostNumber: function(req, res, next) {
    Usedstuff.find({}, function(err, allUsedstuffs){
         if(err){
             console.log(err);
         } else {
           if(allUsedstuffs.length < 1000) {
              return next();
           } else {
              req.flash('error', 'Current post number is more than limit, 1000. We will increase size of our database. See you soon!');
              res.redirect('back');
           }
         }
    });
  },
  // check if current usedstuff exist or not
  checkUsedstuffExist: function(req, res, next){
    Usedstuff.findById(req.params.id, function(err, foundUsedstuff){
      if(err || !foundUsedstuff){
          console.log(err);
          req.flash('error', 'Sorry, that stuff does not exist!');
          res.redirect('/');
      } else {
          req.usedstuff = foundUsedstuff;
          next();
      } 
    });
  },
  // check if current user is NOT the poster of current usedstuff
  checkNotUserUsedstuff: function(req, res, next){
    Usedstuff.findById(req.params.id, function(err, foundUsedstuff){
      if(err || !foundUsedstuff){
          console.log(err);
          req.flash('error', 'Sorry, that stuff does not exist!');
          res.redirect('/');
      } else if(foundUsedstuff.author.id.equals(req.user._id)){
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/' + req.params.id);
      } else {
          req.usedstuff = foundUsedstuff;
          next();
      }
    });
  },
  // check if current user is the poster of current usedstuff
  checkUserUsedstuff: function(req, res, next){
    Usedstuff.findById(req.params.id, function(err, foundUsedstuff){
      if(err || !foundUsedstuff){
          console.log(err);
          req.flash('error', 'Sorry, that stuff does not exist!');
          res.redirect('/');
      } else if(foundUsedstuff.author.id.equals(req.user._id) || req.user.isAdmin){
          req.usedstuff = foundUsedstuff;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/' + req.params.id);
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/' + req.params.id);
       }
    });
  },
  checkUserOffer: function(req, res, next){
    Offer.findById(req.params.offerId, function(err, foundOffer){
       if(err || !foundOffer){
           console.log(err);
           req.flash('error', 'Sorry, that offer does not exist!');
           res.redirect('/');
       } else if(foundOffer.author.id.equals(req.user._id) || req.user.isAdmin){
            req.offer = foundOffer;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/' + req.params.id);
       }
    });
  },
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  },
  isTooBig: function(req, res, next) {
    if(req.body.image) {
      next();
    }else {
      req.flash('error', 'Your photo is too big. Please upload a photo less 3MB');
      res.redirect('back');
    }
  }
}
