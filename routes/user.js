const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get('/user/:id', auth, (req, res) => {
    User.findOne({ _id: req.params.id })
      .select("-password")
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
  
        Post.find({ postedBy: req.params.id })
          .populate("postedBy", "_id name")
          .exec()
          .then(posts => {
            res.json({ user, posts });
          })
          .catch(err => {
            return res.status(422).json({ error: err });
          });
      })
      .catch(err => {
        return res.status(404).json({ error: "User not found" });
      });
  });
  

  router.put('/follow', auth, (req, res) => {
    User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.user._id } },
      { new: true }
    )
      .exec()
      .then(result => {
        if (!result) {
          return res.status(422).json({ error: "User not found" });
        }
  
        return User.findByIdAndUpdate(
          req.user._id,
          { $push: { following: req.body.followId } },
          { new: true }
        ).select("-password");
      })
      .then(updatedUser => {
        if (!updatedUser) {
          return res.status(500).json({ error: "An error occurred while updating user" });
        }
  
        res.json(updatedUser);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: "An error occurred" });
      });
  });
  

  router.put('/unfollow', auth, (req, res) => {
    User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.user._id } },
      { new: true }
    )
      .exec()
      .then(result => {
        if (!result) {
          return res.status(422).json({ error: "User not found" });
        }
  
        return User.findByIdAndUpdate(
          req.user._id,
          { $pull: { following: req.body.unfollowId } },
          { new: true }
        ).select("-password");
      })
      .then(updatedUser => {
        if (!updatedUser) {
          return res.status(500).json({ error: "An error occurred while updating user" });
        }
  
        res.json(updatedUser);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: "An error occurred" });
      });
  });
  
  router.put('/updatepic', auth, (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      { $set: { pic: req.body.pic } },
      { new: true }
    )
      .exec()
      .then(result => {
        if (!result) {
          return res.status(422).json({ error: "User not found" });
        }
  
        res.json(result);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: "An error occurred" });
      });
  });
  
  router.post('/search', (req,res) => {
    let userPattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
    .select(" _id name")
    .then(user => {
      res.json({user})
    }).catch(err=>{
      console.log(err)
    })
  })

module.exports = router