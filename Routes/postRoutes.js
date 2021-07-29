const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')

router.get('/:postID',middleware.requireLogin,(req,res,next)=>{  
    var payload={
        pageTitle:'View post',
        userLoggedIn_post:req.session.user,  
        userLoggedInJs_post:JSON.stringify(req.session.user), 
        postID:`${req.params.postID}` //or just req.params.postID 
    }
    
    res.status(200).render('postPage',payload)
})

module.exports=router;
