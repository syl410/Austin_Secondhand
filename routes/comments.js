const express = require("express");
const router  = express.Router({mergeParams: true});
const Usedstuff = require("../models/usedstuff");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn, checkUserComment, checkUserUsedstuff, checkUsedstuffExist, isAdmin } = middleware;

// the url is /<%= usedstuff._id %>/comments/

//Comments New
router.get("/new", isLoggedIn, checkUsedstuffExist, function(req, res){
    // find usedstuff by id
    Usedstuff.findById(req.params.id, function(err, usedstuff){
        if(err){
            console.log(err);
        } else {
            if(usedstuff.comments.length < 100) {
                res.render("comments/new", {usedstuff: usedstuff});
            } else {
                req.flash('error', 'The comment number limit reached. Sorry there is no more comments');
                res.redirect("back");
            }
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, checkUsedstuffExist, function(req, res){
   //lookup usedstuff using ID
    Usedstuff.findById(req.params.id, function(err, usedstuff){
       if(err){
            console.log(err);
            res.redirect("/");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    // raw comment
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    console.log("2 comment.author is " + comment.author);
                    //save comment
                    comment.save();
                    usedstuff.comments.push(comment);
                    usedstuff.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect('/' + usedstuff._id);
                }
            });
        }
    });
});

router.get("/:commentId/edit", isLoggedIn, checkUsedstuffExist, checkUserComment, function(req, res){
  res.render("comments/edit", {usedstuff_id: req.params.id, comment: req.comment});
});

router.put("/:commentId", isLoggedIn, checkUsedstuffExist, checkUserComment, function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId", isLoggedIn, checkUsedstuffExist, checkUserComment, function(req, res){
  // find usedstuff, remove comment from comments array, delete comment in db
  Usedstuff.findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, function(err) {
    if(err){ 
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/');
    } else {
        req.comment.remove(function(err) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('error', 'Comment deleted!');
          res.redirect("/" + req.params.id);
        });
    }
  });
});

module.exports = router;