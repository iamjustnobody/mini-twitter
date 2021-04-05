const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')

//similar to postRoutes.js
router.get('/',middleware.requireLogin,(req,res,next)=>{  //have middleware MW here or in app.js
    var payload={
        pageTitle:`${req.session.user.username}`, //or req.session.user.username both ok
        userLoggedIn_profile:req.session.user,  
        userLoggedInJs_profile:JSON.stringify(req.session.user), 
        profileUser:req.session.user
    }

    res.status(200).render('profilePage',payload) //webViews folder 'profilePage.pug' for this GET /:userID or/:userid
}) // '/me' user self page

router.get('/:username',middleware.requireLogin,async (req,res,next)=>{  //have middleware MW here or in app.js
    var payload=await getPayload(`${req.params.username}`,`${req.session.user}`)
//var payload=await getPayload(req.params.username,req.session.user) //ok
    res.status(200).render('profilePage',payload) //webViews folder 'profilePage.pug' for this GET /:userID or/:userid
})

async function getPayload(username,userLoggedIn_profile){
    var user=await User.findOne({username:`${username}`}) //{username} or {username:`${username}`} or {username:username}
    if(user==null){
        user=await User.findById(username) //or findById(`${username}`)
        if(user==null){
            return { //this is what payload equals to; return payload
                pageTitle:"User not found",
                userLoggedIn_profile,  
                userLoggedInJs_profile:JSON.stringify(userLoggedIn_profile)
            }
        }
    }
    return {
        pageTitle:`${user.username}`, //`${user.username}` or user.username
        userLoggedIn_profile,  
        userLoggedInJs_profile:JSON.stringify(userLoggedIn_profile),
        profileUser:user
    }
}


module.exports=router;