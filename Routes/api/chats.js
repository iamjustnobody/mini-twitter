const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Chat=require('../../ModelSchema/ChatSchema') 
router.use(express.urlencoded({extended:false})); //POST/put/patch

const mongoose=require('mongoose')

router.post('/',async(req,res,next)=>{ 
    if(!req.body.users){ 
        //console.log("Users param not sent with request")
        return res.sendStatus(400)
    }
    var users=JSON.parse(req.body.users) 
    if(users.length==0){  
        //console.log("Users array is empty")
        return res.sendStatus(400)
    }

    users.push(req.session.user) 
    var chatData={
        users,
        isGroupChat:true
    }
    Chat.create(chatData)
    .then(newChat=> res.status(200).send(newChat)) 
    .catch(error=>{//console.log(error);
                   res.sendStatus(400)})
})


router.get('/',async(req,res,next)=>{ 
    Chat.find({users:{$elemMatch:{$eq:req.session.user._id}}}) 
    .populate("users")
    .populate('latestMessage')
    .sort({updatedAt:-1}) // 'asc' "desc"
    .then(async chats=>{
        //adding below to count the unread/unseen chat badges
        if(req.query.unreadOnly!=undefined && req.query.unreadOnly=='true'){ //not req.body
            //console.log(req.query)
            chats=chats.filter(chat=> chat.latestMessage&&!chat.latestMessage.seenBy.includes(mongoose.Types.ObjectId(req.session.user._id))) 
        }

        chats=await User.populate(chats,{path:'latestMessage.sender'})
        res.status(200).send(chats) 
    }) 
    .catch(error=>{//console.log(error);
                   res.sendStatus(400)})
})


router.put('/:chatid',async(req,res,next)=>{ 
    Chat.findByIdAndUpdate(req.params.chatid,{chatName:req.body.chatname}) 
    .then(updatedChat=>res.sendStatus(204))
    .catch(error=>{//console.log(error);
                   res.sendStatus(400)})
}) 

router.get('/:chatid',async(req,res,next)=>{ 
    Chat.findOne({_id:req.params.chatid,users:{$elemMatch:{$eq:req.session.user}}}) 
    .populate("users")
    .then(chat=>res.status(200).send(chat)) 
    .catch(error=>{console.log(error);res.sendStatus(400)})
})


const Message=require('../../ModelSchema/MessageSchema')
router.get('/:chatid/messages',async(req,res,next)=>{ //find return array (even there's only one el) 
    Message.find({chat:req.params.chatid})
        .populate('sender')
        .populate("chat")
        .then(async chatMessages=>{
            var chatMsgArrayObj=await Promise.all(chatMessages.map(async eachChatMsg=>{
                 return await User.populate(eachChatMsg,{path:'chat.users'})
                }))
            res.status(200).send(chatMsgArrayObj) 
        })
        .catch(error=>{//console.log(error);
                       res.sendStatus(400)}) 
}) 


//markAsRead/seenBy in messageSchema
router.put('/:chatid/messages/markAsRead',async(req,res,next)=>{ 
    Message.updateMany({chat:req.params.chatid},{$addToSet:{seenBy:req.session.user}}) //no dup
    //seendBy:req.session.user._id or mongoose.Types.ObjectId(req.session.user._id) SHOULD be ok
    .then (()=>res.sendStatus(204))
    .catch(error=>{console.log(error);res.sendStatus(400)})
})




function getOtherChatUsersNamesString(users,self){
    var otherChatUsers=getOtherChatUsers(users,self);
    var namesArray=otherChatUsers.map(user=>{return user.fName+" "+user.lName})
    return namesArray.join(", ")
}

function getOtherChatUsers(users,self){
    if(users.length==1) return users
    return users.filter(user=>{
        return user.id!==self._id;// backend checking using user._id!=self._id in case left ._id is obj right ._id is string 
    })
}
module.exports=router
