const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')
const Chat=require('../ModelSchema/ChatSchema')
const mongoose=require('mongoose')

router.get('/',middleware.requireLogin,(req,res,next)=>{  
    
    var payload={
        pageTitle:'Notification',
        userLoggedIn_notification:req.session.user,
        userLoggedInJs_notification:JSON.stringify(req.session.user) 
    }
    res.status(200).render('notificationsPage',payload)
})



module.exports=router;
