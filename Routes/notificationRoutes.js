const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')
const Chat=require('../ModelSchema/ChatSchema')
const mongoose=require('mongoose')

router.get('/',middleware.requireLogin,(req,res,next)=>{  
    console.log('notification req.session.user',req.session.user,typeof req.session.user)//{a:'z',b:['e','f'],_id:'d',time:'t'}Obj
    console.log('notification req.session.userid',req.session.user._id,typeof req.session.user._id,req.session.user.id,typeof req.session.user.id)
    //string; undefined undefined
    var payload={
        pageTitle:'Notification',
        userLoggedIn_notification:req.session.user,
        userLoggedInJs_notification:JSON.stringify(req.session.user) 
        //not use (JSOn.stringify) userLoggedIn_notification straight away here as its undefined 
    }
    res.status(200).render('notificationsPage',payload) //pug
})



module.exports=router;