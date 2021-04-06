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
    console.log("profileUser getAll1",typeof req.session.user,typeof `${req.session.user}`,typeof req.session.user.username,typeof `${req.session.user.username}`)
    //obj string string string
    console.log("profileUser getAll2",typeof payload.profileUser,typeof payload.pageTitle) //obj string
    console.log("profileUser getAll3",typeof payload.userLoggedInJs_profile,typeof payload.userLoggedIn_profile)//string obj
    console.log(payload.profileUser.id,payload.profileUser._id,typeof payload.profileUser.id,typeof payload.profileUser._id)
    //undefined string undefined string as req.session.user (obj) only has ._id string
    res.status(200).render('profilePage',payload) //webViews folder 'profilePage.pug' for this GET /:userID or/:userid
}) // '/me' user self page

router.get('/:username',middleware.requireLogin,async (req,res,next)=>{  //have middleware MW here or in app.js
    var payload=await getPayload(`${req.params.username}`,req.session.user)
//var payload=await getPayload(req.params.username,req.session.user) //ok
console.log('get/one',typeof req.session.user,typeof `${req.session.user}`, typeof req.params.username,typeof `${req.params.username}`)
  //obj string string string
  console.log(payload.profileUser.id,payload.profileUser._id,typeof payload.profileUser.id,typeof payload.profileUser._id) //string obj
//stirng obj string obj as mongodb doc (obj) has both .id string & ._id obj
    //payload.selectedTab="" //opt
   // payload.selectReplies=false //opt
  res.status(200).render('profilePage',payload) //webViews folder 'profilePage.pug' for this GET /:userID or/:userid
})

router.get('/:username/replies',middleware.requireLogin,async (req,res,next)=>{  //have middleware MW here or in app.js
    var payload=await getPayload(`${req.params.username}`,req.session.user)
//var payload=await getPayload(req.params.username,req.session.user) //ok
console.log('get/one',typeof req.session.user,typeof `${req.session.user}`, typeof req.params.username,typeof `${req.params.username}`)
  //obj string string string
  console.log(payload.profileUser.id,payload.profileUser._id,typeof payload.profileUser.id,typeof payload.profileUser._id) //string obj
//stirng obj string obj as mongodb doc (obj) has both .id string & ._id obj
    payload.selectedTab='replies'
    payload.selectReplies=true
  res.status(200).render('profilePage',payload) //webViews folder 'profilePage.pug' for this GET /:userID or/:userid
})


async function getPayload(username,userLoggedIn_profile){
    console.log("getOne userloggedin",typeof username,typeof userLoggedIn_profile) //username passedin always string //`${req.session.user}` string req.session.user obj
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
    console.log("profileUser getOne",typeof user) //obj
    
    return {
        pageTitle:`${user.username}`, //`${user.username}` or user.username
        userLoggedIn_profile,  
        userLoggedInJs_profile:JSON.stringify(userLoggedIn_profile),
        profileUser:user
    }
}


module.exports=router;