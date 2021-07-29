const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') 
const Chat=require('../../ModelSchema/ChatSchema') 
const Message=require('../../ModelSchema/MessageSchema') 
const Notification=require('../../ModelSchema/NotificationSchema') 
router.use(express.urlencoded({extended:false})); //POST/put/patch


router.post('/',async(req,res,next)=>{ //console.log("req.body MSGs",req.body) //[Object: null prototype] {content:'x',chatId:'y'}
    if(!req.body.content||!req.body.chatId){
        //console.log("Invalid data passed into request") //router.use(express.json()) -> req.body is {}
        return res.sendStatus(400)
    }
    var newMessage={
        sender:req.session.user._id,
        msgContent:req.body.content,
        chat:req.body.chatId
    }
    Message.create(newMessage)
    .then(async(newMsg)=>{
        newMsg=await newMsg.populate('sender').populate('chat').execPopulate() //ok //cannot pop nested 'chat.user' (i.e. .populate('chat.users'))

        newMsg=await User.populate(newMsg,{path:"chat.users"}) //pop for socket io newMsg in app.js
    

       // console.log('newMsg in messagesJs',newMsg._id,newMsg.id,typeof newMsg._id,typeof newMsg.id) //obj(objId);string
        var chat=await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:newMsg},{new:true}) 
            .catch(err=>{return;})//.catch(err=>{})//.catch(err=>console.log(err))
        insertNotifications(chat,newMsg)
        //output latestMessage in inboxPage.js
        res.status(201).send(newMsg)
    })
    .catch(error=>{//console.log(error);
                   return res.sendStatus(400)}) //return opt
})

const mongoose=require('mongoose')

function insertNotifications(chat,message){
    chat.users.forEach(userId=>{ 
        if(userId==message.sender._id.toString()) return 
        Notification.insertNotification(userId,message.sender,"newMessage",chat) 
    })
}

module.exports=router
