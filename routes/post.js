const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Post = mongoose.model("Post");


router.get('/allpost',auth,(req,res)=>{
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", " _id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(error=>{
        console.log(error)
    })
})

router.get('/getallpost',auth,(req,res)=>{
  Post.find({postedBy:{$in:req.user.following}})
  .populate("postedBy", "_id name")
  .populate("comments.postedBy", " _id name")
  .sort('-createdAt')
  .then(posts=>{
      res.json({posts})
  })
  .catch(error=>{
      console.log(error)
  })
})


router.post('/createpost', auth, (req,res)=>{
    const{title,body,pic} = req.body
    if(!title || !body || !pic){
        return res.status(422).json({error:"Please add all the fields"})
    }
   req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(error=>{
        console.log(error)
    })
})


router.get('/myposts', auth, (req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(myposts=>{
        res.json({myposts})
    })
    .catch(error=>{
        console.log(error)
    })
})


router.put('/like', auth, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
      $push: { likes: req.user._id }
    }, {
      new: true
    })
      .exec()
      .then(result => {
        //console.log(result)
        res.json(result);
      })
      .catch(err => {
        res.status(422).json({ error: err });
      });
  });


  router.put('/unlike', auth, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
      $pull: { likes: req.user._id }
    }, {
      new: true
    })
      .exec()
      .then(result => {
        //console.log(result)
        res.json(result);
      })
      .catch(err => {
        res.status(422).json({ error: err });
      });
  });


router.put('/comment',auth,(req,res) =>{

    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
        Post.findByIdAndUpdate(req.body.postId,{
         $push:{comments:comment}
        },{
            new:true 
        })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .exec()
        .then(result => {
            //console.log(result)
            res.json(result);
          })
          .catch(err => {
            res.status(422).json({ error: err });
          })
  })
    

router.delete('/deletepost/:postId', auth, (req, res) => {
       Post.findOne({_id: req.params.postId})
          .populate("postedBy", "_id")
          .exec()
          .then(post => {
            if (!post) {
              return res.status(422).json({error: "Post not found"});
            }
             if(post.postedBy._id.toString() === req.user._id.toString()) {
              return post.deleteOne();
            } else {
              throw new Error("Unauthorized");
            }
          })
          .then(result => {
            res.json(result);
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({error: "An error occurred"});
          });
  });



module.exports = router  