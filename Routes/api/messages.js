const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Chat=require('../../ModelSchema/ChatSchema') //Routes/api->Routes  directory->root directory
const Message=require('../../ModelSchema/MessageSchema') 
//if none, error req.body undefined
// add router.use(express.json()) => req.body is {} & Users param not sent with request
//router.use(express.json()) req.body is {} Invalid data passed into request
router.use(express.urlencoded({extended:false})); //POST/put/patch

//const middleware=require('../../middleware'); router.use(middleware.requireLogin) //opt //better to have


router.post('/',async(req,res,next)=>{ console.log("req.body MSGs",req.body) //[Object: null prototype] {content:'x',chatId:'y'}
    if(!req.body.content||!req.body.chatId){ //$('.sendMessageButton').click from chatPage.js
        console.log("Invalid data passed into request") //router.use(express.json()) -> req.body is {}
        return res.sendStatus(400)
    }
    var newMessage={
        sender:req.session.user._id,
        msgContent:req.body.content,
        chat:req.body.chatId
    }
    Message.create(newMessage)
    .then(async(newMsg)=>{
        //newMsg=await newMsg.populate('sender').execPopulate()
        //newMsg=await newMsg.populate('chat').execPopulate()
        //above two OK
        //chain OK
        newMsg=await newMsg.populate('sender').populate('chat').execPopulate() //ok

        //User.populate & Chat.populate?ok (see below &getPosts @postsJs); 
        //newMsg=await Chat.populate(await User.populate(newMsg,{path:'sender'}),{path:'chat'}) //ok
        //or chain Message.populate?
        //newMsg=await (await Message.populate('sender')).populate('chat') //incorrect
        //above -> TypeError: utils.populate: invalid path. Expected string. Got typeof `undefined`
        //newMsg=await Message.populate('sender').populate('chat') //incorrect ;need to use Message.find().populate()
        

        Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:newMsg}) //await opt
             // or already populate latestMessage -> No still shows mongoObjId in mongodb; same as using newMsg._id or newMsg.id
             // or (newMsg._id or newMsg.id).populate??
            .catch(err=>console.log(err))
            //output latestMessage in inboxPage.js

        res.status(201).send(newMsg)
    })//example: getPosts fn & POST '/api/posts' from postsJs
    .catch(error=>{console.log(error);return res.sendStatus(400)}) //return opt
})

module.exports=router