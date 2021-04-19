const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Chat=require('../../ModelSchema/ChatSchema') //Routes/api->Routes  directory->root directory
const Message=require('../../ModelSchema/MessageSchema') 
const Notification=require('../../ModelSchema/NotificationSchema') 
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
        newMsg=await newMsg.populate('sender').populate('chat').execPopulate() //ok //cannot pop nested 'chat.user' (i.e. .populate('chat.users'))

        //User.populate & Chat.populate?ok (see below &getPosts @postsJs); 
        //newMsg=await Chat.populate(await User.populate(newMsg,{path:'sender'}),{path:'chat'}) //ok
        //or chain Message.populate?
        //newMsg=await (await Message.populate('sender')).populate('chat') //incorrect
        //above -> TypeError: utils.populate: invalid path. Expected string. Got typeof `undefined`
        //newMsg=await Message.populate('sender').populate('chat') //incorrect ;need to use Message.find().populate()
        /*
        console.log('new message tobe sent to frontend chatPageJs', newMsg.chat,newMsg.chat.users) //{users:[x,y],_id:z,lastMessage:'u',updatedAt:A} b4 chat.users populated 
        console.log(typeof newMsg.chat,typeof newMsg.chat.users) //obj; arrayObj of obj ["x","y"] b4 chat.users populated
        console.log('chatid',newMsg.chat._id,typeof newMsg.chat._id,newMsg.chat.id,typeof newMsg.chat.id) //z obj z string
        console.log('userobj',newMsg.chat.users[0],typeof newMsg.chat.users[0]) //x or y obj b4chat.users populated
        console.log('userid',newMsg.chat.users[0]._id,typeof newMsg.chat.users[0]._id,newMsg.chat.users[0].id,typeof newMsg.chat.users[0].id)
        //"users" not being populated but still arrayObj of obj & has ._id (&.id) fields (obj types too) //x or y obj ; <Buffer> obj
        console.log('senderobj',newMsg.sender,typeof newMsg.sender) //{a:'x',_id:y,b:[z1,z2],_id:d,updatedAt:t} obj
        console.log('senderid',newMsg.sender._id,typeof newMsg.sender._id,newMsg.sender.id,typeof newMsg.sender.id)//y obj y string
        //see difference in consol o/p of newMsg in messagesJs chatPageJs appJs
        */
        newMsg=await User.populate(newMsg,{path:"chat.users"}) //pop for socket io newMsg in app.js
       /* console.log('user',newMsg.chat.users,typeof newMsg.chat.users) //[{"a":"x","b":["1b","2b"],"_id":"6fb","updatedAt":"t"},{see left}] arrayObj of obj
        console.log('userobj',newMsg.chat.users[0],typeof newMsg.chat.users[0]) //{a:'x',_id:'y',b:[z,zz],updatedAt:t} obj
        console.log('userid',newMsg.chat.users[0]._id,typeof newMsg.chat.users[0]._id,newMsg.chat.users[0].id,typeof newMsg.chat.users[0].id)
        //y obj y string
        console.log("messagesJs about to send to chatPageJs",newMsg.chat,typeof newMsg.chat)
        //{_id:jj,updatedAt:time,isgroup:true,a:'',users:[{a:'x',b:[],c:[Array],_id:zz,updatedAt:tt},{}]} obj
        */

        console.log('newMsg in messagesJs',newMsg._id,newMsg.id,typeof newMsg._id,typeof newMsg.id) //obj(objId);string
        var chat=await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:newMsg._id}) //await opt
             // or already populate latestMessage -> No still shows mongoObjId in mongodb; same as using newMsg._id or newMsg.id
             // or (newMsg._id or newMsg.id).populate??
            .catch(err=>console.log(err))
        console.log('chat last messages',chat.latestMessage, typeof chat.latestMessage) //obj(objId)
        console.log('chatlastmessagesid',chat.latestMessage._id, typeof chat.latestMessage._id,chat.latestMessage.id, typeof chat.latestMessage.id)
        //objId(obj);<Buffer>obj
        //so latestMessage still not populated, even after findById&Update using {latestMessage:newMsg}; same as {latestMessage:newMsg._id} or {latestMessage:newMsg.id} allok
        //add Notification now
        insertNotifications(chat,newMsg)


            //output latestMessage in inboxPage.js
        res.status(201).send(newMsg)
    })//example: getPosts fn & POST '/api/posts' from postsJs
    .catch(error=>{console.log(error);return res.sendStatus(400)}) //return opt
})

const mongoose=require('mongoose')

function insertNotifications(chat,message){
    console.log('sender in helper fn in messagesJs',message.sender,typeof message.sender)
    console.log(message.sender._id,typeof message.sender._id,message.sender.id,typeof message.sender.id)
    //{a:'x',b:[c,d],_id:x,date:date} obj //objId(obj);string - .sender is populated
    chat.users.forEach(userId=>{ //chat.users not populated
        console.log("userId in helper fn in messagesJs",userId,typeof userId)    //objId(obj)
        if(userId==message.sender._id.toString()) return //ok
        //if(userId==message.sender.id) return //ok
        //if(mongoose.Types.ObjectId(userId)==message.sender._id.toString()) return //ok
        Notification.insertNotification(userId,message.sender,"newMessage",chat._id) //opt await
        //userId: objId(obj) shown in newNote@Notification.insertNotification @NotificationSchema.js; 
        //message.sender:{a:'x',b:[c,d],_id:x,date:date} obj shown in newNote
        //message.sender._id/.id both ok & shown as objId/obj in newNote
    })
}

module.exports=router