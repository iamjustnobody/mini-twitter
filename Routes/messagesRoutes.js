const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')
const Chat=require('../ModelSchema/ChatSchema')
const mongoose=require('mongoose')

router.get('/',middleware.requireLogin,(req,res,next)=>{  
    var payload={
        pageTitle:'Inbox',
        userLoggedIn_inbox:req.session.user,
        userLoggedInJs_inbox:JSON.stringify(req.session.user) // wrongn if JSON.stringify(userLoggedIn_inbox)
    }
    res.status(200).render('inboxPage',payload) //pug
})

router.get('/new',middleware.requireLogin,(req,res,next)=>{  
    
    res.status(200).render('newMessage',{ //pug
        
        pageTitle:'New Message',
        userLoggedIn_newMsg:req.session.user,
        userLoggedInJs_newMsg:JSON.stringify(req.session.user) //JSON.stringify(userLoggedIn_newMsg) wrong
        
    }) 
})

router.get('/:chatid',middleware.requireLogin,async(req,res,next)=>{  
    var userID=req.session.user._id
    var chatID=req.params.chatid 
    console.log('/chatid1',typeof req.session.user,typeof userID,typeof req.session.user.id,typeof chatID) 
    //obj //string //undefined //stirng

    var payload={ 
        pageTitle:'Chat',
        userLoggedIn_chat:req.session.user,
        userLoggedInJs_chat:JSON.stringify(req.session.user) //JSON.stringify(userLoggedIn_newMsg) wrong
    }

    var isValidId=mongoose.isValidObjectId(chatID)
    if(!isValidId){
        payload.errorMessage="Chat does not exist or you dont have permission to view it"
            //incorrect params-id length
            res.status(200).render('chatPage',payload) 
    }

    var chat=await Chat.findOne({_id:chatID,users:{$elemMatch:{$eq:userID}}}).populate("users")
    if(chat!=null){console.log('/chatid2',typeof chat.id,typeof chat._id)} //string //obj

    if(chat==null){
        //check if chat id is really user id // a.profileButton(href=`/messages/${profileUser._id}`) in profilePage.pug
        var userFound=await User.findById(chatID)
        console.log('userFound',typeof userFound.id,typeof userFound._id) //string (mongoObj's id -> string) //obj (mongoObj's _id -> also obj)
        if(userFound!=null){
            //get chat using user id
            chat=await getChatByUserIdViaProfilePage(userFound._id,userID) //obj (mongoose.Types.ObjectId);//string (req.session.user (obj) 's _id -> string)
            //get mongoDocObj = await mongoQueryObj
            payload.chat=chat
            //chat.chatName=chat.chatName?chat.chatName:getOtherChatUsersNamesString(chat.users,req.session.user) 
            //mongodocObj(._id->obj;.id->stirng) obj (._id-> string;.id->obj)
            //ok no need for documentready at chatPage.js or GET '/api/chats/chatid' in chatsJs
            payload.chatJs=JSON.stringify(chat)
        }
        else{
            payload.errorMessage="Chat does not exist or you dont have permission to view it"
            //incorrect params-id with same length
        }
    }
    else{
        payload.chat=chat;
        //chat.chatName=chat.chatName?chat.chatName:getOtherChatUsersNamesString(chat.users,req.session.user) //ok
            //mongodocObj(._id->obj;.id->stirng) obj (._id-> string;.id->obj)
            //ok no need for documentready at chatPage.js or GET '/api/chats/chatid' in chatsJs
        payload.chatJs=JSON.stringify(chat)
    }

    res.status(200).render('chatPage',payload) 
})

function getChatByUserIdViaProfilePage(userLoggedInId,anotherUserId){
    console.log('getChat fn',typeof userLoggedInId,typeof anotherUserId) //obj string
    return Chat.findOneAndUpdate({
        isGroupChat:false,
        users:{
            $size:2,
            $all:[ //all condiftions met
                //{$elemMatch:{$eq:userLoggedInId}},
                //{$elemMatch:{$eq:anotherUserId}}
                //above wil have multiple private chats from otherUsr' profile page; groupChat is false
                //{$elemMatch:{$eq:userLoggedInId}}, //ok if pass in mongoObjId (mongoObj._id (Obj) ok but not .id (string)); but to be reassured, cast as below
                {$elemMatch:{$eq:mongoose.Types.ObjectId(userLoggedInId)}},
                {$elemMatch:{$eq:mongoose.Types.ObjectId(anotherUserId)}} //req.session.user is obj; obj._id stirng .id undefined
            ]
        }
    }, //filter
    {
        $setOnInsert:{
            users:[userLoggedInId,anotherUserId]
        }
    }, //update or create if not found as upsert is true
    {
        new:true,
        upsert:true
    }) //return the newly updated
    .populate("users")
    //return mongoquery (not returned mongo doc/obj)
    //dup (private; false groupChat) two-people-chats due to if mongoObjId
    //via profile: two people private chat->only one chat; always goes to this chat whenever click mail/evelop icon on anotherUser's profilePage
    //grouChat true: via newMessagePage/pug search& click createNew button (chatsJs post '/'); multiple chats even for just same two people
    //populate in findOneAndUpdate Chain (not just find or findById or findOne); 
    //still in GET request but within url RoutesJS (not apiRoutes) on documentReady pageLoading (frontendJs)
    //统一populate in chatsJs get '/'
    //will also listed on chatPage; but some pairs of same two users only one pair is private
}



function getOtherChatUsersNamesString(users,self){
    var otherChatUsers=getOtherChatUsers(users,self);
    var namesArray=otherChatUsers.map(user=>{return user.fName+" "+user.lName})
    return namesArray.join(", ")
}

function getOtherChatUsers(users,self){
    if(users.length==1) return users
    return users.filter(user=>{
        return user.id!==self._id;// backend checking using user._id!=self._id in case left ._id is obj right ._id is string 
        //or return user.id!==self._id or user.id!=self._id //all ok
        //frontendJs string bothsides so can use user._id!==self._id
        //req.session.user._id; //stirng //userLoggedInJs._id //these fn copied from chatPage.js
    })
}

module.exports=router;