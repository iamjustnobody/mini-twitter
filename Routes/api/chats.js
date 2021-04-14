const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Chat=require('../../ModelSchema/ChatSchema') //Routes/api->Routes  directory->root directory
//if none, error req.body undefined
// add router.use(express.json()) => req.body is {} & Users param not sent with request
router.use(express.urlencoded({extended:false})); //POST/put/patch

const middleware=require('../../middleware')
router.use(middleware.requireLogin)

router.post('/',async(req,res,next)=>{ //console.log("req.body chats",req.body) //called by clicking createChat Button @newMessageJs after searching & selecting otherUsers forChat
    if(!req.body.users){ //{users:JSON.stringify(selectedUsers)} from ajax call
        console.log("Users param not sent with request")
        return res.sendStatus(400)
    }
    var users=JSON.parse(req.body.users) //convert string form sent from ajax call/request to obj (works on array & class etc)
    //console.log('users chats',users)
    if(users.length==0){  //users already exist in the request after checking if(!req.body.users)
        console.log("Users array is empty")
        return res.sendStatus(400)
    }

    //now valid array with items/elments in it
    //first push self to the array //self being part of the chat
    users.push(req.session.user) //obj`
    //selectedUsers.push(newMessageJs userData from getUsersData/searchRes (returned mongodbObj) from get("/api/users"))

    var chatData={
        users,
        isGroupChat:true
    }
    Chat.create(chatData)
    .then(newChat=> res.status(200).send(newChat)) //opt return
    .catch(error=>{console.log(error);res.sendStatus(400)})
})


router.get('/',async(req,res,next)=>{ 
    Chat.find({users:{$elemMatch:{$eq:req.session.user._id}}}) //element -> item in the array
    .populate("users")
    .sort({updatedAt:-1}) // 'asc' "desc"
    .then(chats=>res.status(200).send(chats)) //return opt
    .catch(error=>{console.log(error);res.sendStatus(400)})
})



router.put('/:chatid',async(req,res,next)=>{ //called by $('#chatNameButton').click in chatPage.js
    Chat.findByIdAndUpdate(req.params.chatid,{chatName:req.body.chatname}) //or req.query //no new true 
    .then(updatedChat=>res.sendStatus(204)) //return opt //no return .send(newlyUpdated.populate(run-time-outputdisplay))
    //but window.reload @$('#chatNameButton').click in chatPage.js; so updats will be presented at chatPage when page reload
    //inboxPage.js/pug (/api/chats get'/') already use updated chatName fromDB automatically when go to (=reflesh) inbox page (ajax call getAllChats on documentReady); 
    //use chat.chatName (enough as it'd use updated value once reload/reflesh/redirect etc) in inboxPageJs after calling get("/api/chats")
    //(sync to createChat from profilePage (find&Update toDB (get('/:chatid) from messagesRoutesJs)) or newMessagePug (POST '/API/CHATS' TO DB), changeChatName toDB here this fn); 
    //just like homePage & postPage & profilePage: like/pin/reply/retweet/delete; just like profilePage & f&FPage follow/unfollow
    .catch(error=>{console.log(error);res.sendStatus(400)})
}) 
//but even if new true & res.send(newlyUpdatedChat) & no windowReload@chatPageJs, chat.chatName used in frontendJs that calls this api put('/chatid); no need windowReload 
//unlike commonJs submit a new normal post (POST '/api/posts), frontendJs (commonJs) has htmlEl in it (html not only in pug) so run-time: createhtml & output
//so remain no new true no res.send(newlyUpdatedChat) remain windowReload @chatPageJs

//chat.chatName can be used in frontendPug chatPagePug bcoz of get('/:chatid') rendering chatPagePug from messagesRoutes payload; but also need default chatName in case of no chatName field in db
//how to also present default chatName in chatPage.pug when chatName's undefined in db (no such field/property)? -section215 - so ajax call @chatPageJs on documentReload (related to clicking chatNameBtn wondowReload after changing chatName)

/*
router.put('/:chatid',async(req,res,next)=>{ //called by $('#chatNameButton').click in chatPage.js
    Chat.findByIdAndUpdate(req.params.chatid,{chatName:req.body.chatname},{new:true}) //or req.query  
    .populate("users")
    .then(updatedChat=>res.status(200).send(updatedChat)) //return opt
     .catch(error=>{console.log(error);res.sendStatus(400)})
})
//$('#chatNameButton').click from chatPageJs, when success, either reload (no need) or using $("#chatName").text(updatedData.chatName?) instead
//reload-> documentRead has two ways see chatPageJs or noteBook
//ok as only has one input chatname field/bar on the chatPage.pug so with unique id
*/


//similar to router.get('/:chatid') from messagesRoutesJs w different purposes (base/foundation; html el; does all the checkings) ->pug ->js
//base page onload script chatPageJs (the below fn initiated by setting default chatname )
//applies same logic of setting default chatname from inboxJs to chatPageJs; could use same method in get('/:chatid') from messagesRoutes &payload.defaultchatname (may not need get('/:chatid') here in chatsJs)
//or use same solution in here chatsJs get(/:chatid) (not in messageRoutesJs which remains as it is now)
router.get('/:chatid',async(req,res,next)=>{ //find return array (even there's only one el) 
    Chat.findOne({_id:req.params.chatid,users:{$elemMatch:{$eq:req.session.user._id}}}) 
    //_id or id //req.params.chatid or Object.assign or mongoose.types.objId or `${req.params.chatid}`
    .populate("users")
    .then(chat=>res.status(200).send(chat)) //return opt
    /*.then(chat=>{ //chat is mongodbDocObj
        const plainJsObj1={
            chat,
            chat_name: chat.chatName?chat.chatName:getOtherChatUsersNamesString(chat.users,req.session.user) 
            //mongodocObj(._id->obj;.id->stirng) obj (._id-> string;.id->obj)
        } //ok; $("#chatName").text(chatData.chat_name) from chatPageJs on document.ready
        
        res.status(200).send(plainJsObj1) 


        //const plainJsObj2=chat
        //plainJsObj2.chatName=chat.chatName?chat.chatName:getOtherChatUsersNamesString(chat.users,req.session.user)
        //plainJsObj2.chatName=plainJsObj2.chatName?plainJsObj2.chatName:getOtherChatUsersNamesString(plainJsObj2.users,req.session.user)
        // $("#chatName").text(chatData.chatName) from chatPageJs on document.ready; above two ok
        //res.status(200).send(plainJsObj2) or res.status(200).send(chat) both ok
        //////plainJsObj2.chat_name=chat.chatName?chat.chatName:getOtherChatUsersNamesString(chat.users,req.session.user)
        //////console.log("plainJsObj2.chat_name",plainJsObj2.chat_name,'chat.chat_name',chat.chat_name)
        //////both console.log shows but both get lost when send back to chatPageJs on docuemntReady
        //////plainJsObj2.chat_name=plainJsObj2.chatName?plainJsObj2.chatName:getOtherChatUsersNamesString(plainJsObj2.users,req.session.user)
        //////console.log("plainJsObj2.chat_name",plainJsObj2.chat_name,'chat.chat_name',chat.chat_name)
        //////both console.log shows but both get lost when send back to chatPageJs on docuemntReady

        //return res.status(200).send(plainJsObj2)
        //res.status(200).send(plainJsObj2) or res.status(200).send(chat)
    }) */
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
        //or return user.id!==self._id or user.id!=self._id //all ok
        //frontendJs string bothsides so can use user._id!==self._id
        //req.session.user._id; //stirng //userLoggedInJs._id //these fn copied from chatPage.js
    })
}
module.exports=router