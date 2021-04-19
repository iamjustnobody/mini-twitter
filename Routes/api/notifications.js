const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Chat=require('../../ModelSchema/ChatSchema') //Routes/api->Routes  directory->root directory
const Message=require('../../ModelSchema/MessageSchema') 
const Notification=require('../../ModelSchema/NotificationSchema') 


//const middleware=require('../../middleware'); router.use(middleware.requireLogin) //opt //better to have


router.get('/',async(req,res,next)=>{ 
    Notification.find({toUser:req.session.user,notificationType:{$ne:"newMessage"}}) 
    //req.session.user._id(string) ok or req.session.user(obj)
    .populate('fromUser')
    .sort({updatedAt:-1}) //{createdAt:-1}
    .then(notifications=>{return res.status(200).send(notifications)}) //return opt=>{res.status(200).send(notifications)}
    // =>{return xx} <=> =>xx; =>{yy;return} <=> =>yy ; =>{zz;} <=> =>zz 
    .catch(error=>{
        console.log(error)
        res.sendStatus(400)
        return //return opt
    })
    
})

module.exports=router