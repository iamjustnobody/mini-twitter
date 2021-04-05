const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')

router.get('/:postID',middleware.requireLogin,(req,res,next)=>{  //better to have middleware MW checking user session valid?
    var payload={
        pageTitle:'View post',
        userLoggedIn_post:req.session.user,  //similar to GET '/' rendering home pagein app.js (getAllPostsData in home.js on page loading using postsAPI)
        userLoggedInJs_post:JSON.stringify(req.session.user), ////similar to GET '/' rendering home pagein app.js; same as above
        postID:`${req.params.postID}` //just req.params.postID direcly (as below two console o/p same type & value)
        //to postPage.pug->postPage.js getting data on page loading using postsAPI
    }
    console.log('params',req.params.postID,typeof req.params.postID) //string
    console.log("postID",payload.postID,typeof payload.postID) //string same as above
    res.status(200).render('postPage',payload) //webViews folder 'postPage.pug' for this GET /:postID
})

module.exports=router;