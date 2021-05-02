//this script & its content availabel on allpages/pugs

var connected=false;

//create socket instance but we dont have client socket io yet (installed in server)
//so need cdn here in main-layouts.pug; or download

var socket=io('http://localhost:3002')
socket.emit('setup',userLoggedInJs_base)

//socket.on("connected",()=>{connected=true}) 
//socket.on("connected",()=>{connected=true;return}) 
socket.on("connected",()=>{console.log("connected");return connected=true}) 
//socket.on("connected",()=>connected=true)
//sent back from server app.js

socket.on("message received",(newMsg)=> {console.log("msgReceived clientSocket pre")

////console.log(newMsg.newMsg,typeof newMsg.newMsg,newMsg.newMsg._d,typeof newMsg.newMsg._d,newMsg.newMsg.id,typeof newMsg.newMsg.id)
////Object{populated .chat/.sender/.chat.users/.chat.latestMessage/.chat.latestMessage.sender/.chat.latestMessage.chat/.chat.latestMessage.chat.users
////.chat.latestMessage.chat.latestMessage,.chat.latestMessage.chat.latestMessage.sender,.chat.latestMessage.chat.latestMessage.chat} endless 
////Obj "object" undefined "undefined" undefined "undefined"  

//console.log("msgReceived clientSocket pre",newMsg.sender,typeof newMsg.sender);
    messageReceived(newMsg) //1a 1b 2 //messageReceived(newMsg.newMsg) //1a2 
}) 

function messageReceived(newMessage){ //2
   // console.log("msgReceived clientSocket",newMessage.sender,typeof newMessage.sender) //obj{a:"66023df",b:["6608cf","608f0ac"]}; ;"Object"
   // console.log(newMessage.sender._id,typeof newMessage.sender._id,newMessage.sender.id,typeof newMessage.sender.id)
    //string undefined undefined
   // console.log(userLoggedInJs_base) //obj{a:"66023df",b:["6608cf","608f0ac"]};
   // console.log(newMessage.sender._id,userLoggedInJs_base._id,typeof newMessage.sender._id,typeof userLoggedInJs_base._id,newMessage.sender._id==userLoggedInJs_base._id)
   // if(newMessage.sender._id==userLoggedInJs_base._id){console.log("same");markAllMessagesAsRead();return}
    //emit from server (from frontend sender) not sending back to initiator/starter/sender

   //if($('.chatContainer').length==0){ //no this instance so not on chat page so show popup notification //non-chat pages
    //adding data-room=`${chat._id}` or chat._id in chatPage.pug
    if($(`[data-room="${newMessage.chat._id}"]`).length==0){ //now @non-chat pages or another chat page
        showMessagePopup(newMessage)
        console.log("refreshChatsBadge from messageReceived in clientSocket frontJs"); refreshChatsBadge() //opt
    }
    else{ //@chatPage own or another chatpage //now @own chatPage
        addChatMessageHtml(newMessage) //from chatPageJs but now weare already in chatPage/pug (whose Js also comes b4 clientsoketJs script in mainLayoutsPug)
        markAllMessagesAsRead()  //all msg in THIS chat markedAsRead; 
        //but if receiver in another chatPage,newMsg received in THIS chat remian unread &badge+1 but also addchatmsghtml (newMsghtml) incorrecly to another chatpage
        //markallmsgasread fn incl refreshchatsbadge already
        // also when receivers in THIS chatpage receiving msg in THIS chat& msg read straight away so badge for THIS opened chat remain unchanged; below not in here: 
        //console.log("refreshChatsBadge from messageReceived in clientSocket frontJs"); refreshChatsBadge()
        //sender dealt with in chatPage as sender never receives emit 'message received'from app server in(user._id)
    }
    //console.log("refreshChatsBadge from messageReceived in clientSocket frontJs"); refreshChatsBadge() //opt
}
/*
function messageReceived(newMessage){ //1a&1b;1a2
    console.log('msgRev@clientSocket',newMessage.chat._id,typeof newMessage.chat._id,newMessage.chat.id,typeof newMessage.chat.id)//string undef undef
    console.log(newMessage.chat.users)//arrayObj of populated obj; .chat.users populated in messagesJs (apiroutesBackendJs) POST Message.create
    console.log(newMessage.chat.users[0]._id,typeof newMessage.chat.users[0]._id,newMessage.chat.users[0].id,typeof newMessage.chat.users[0].id)
    //stirng undef undef

    //if($('.chatContainer').length==0){ //no this instance so not on chat page so show popup notification//@non-chatPages
      if($(`[data-room="${newMessage.chat._id}"]`).length==0){  //@non-chatPages & otherChatPages //so not @own-chatPage
        showMessagePopup(newMessage)
        console.log("refreshChatsBadge from messageReceived in clientSocket frontJs"); refreshChatsBadge() //opt
    } //whatis in another chatPage - still treated as in other non-chatPages needing above two features; 
    //so remove if($('.chatContainer').length==0) but own chatPage wil have these two features that are not needed
    //so replace if($('.chatContainer').length==0) with if($('.chatContainer').length==0)
    //& firstly adding data-room=`${chat._id}` or chat._id in chatPage.pug
}*/
socket.on("message received & read",(newMsg)=> {
    console.log("msgReceived&read clientSocket",newMsg.newMsg);
    messageReceivedAndRead(newMsg) //1a 1b //messageReceivedAndRead(newMsg.newMsg) //1a2
}) //@chatPage  //1a 1a2 1b
function messageReceivedAndRead(newMessage){ //1a&1b , 1a2
    addChatMessageHtml(newMessage) //from chatPageJs but now weare already in chatPage/pug (whose Js also comes b4 clientsoketJs script in mainLayoutsPug)
    markAllMessagesAsRead() //incl refreshchatsbadge already
    //refreshChatsBadge()//opt
}



//socket.on('notification received',(newNotification)=>console.log('new notification')) //or =>{console.log} //thie line as example
//initiated in frontendJs (eachpage (comment/like/retweet/follow actions in commonJs) calling emitNotification) 
//then send userId to app server then send newNotification back here
function emitNotification(userId){ console.log('clientSocket starts')
    console.log(userId,typeof userId,typeof userLoggedInJs_base) //userLoggedInJs_base is obj ; e.g. 66ac45 string obj
    console.log(userLoggedInJs_base._id,typeof userLoggedInJs_base._id,userLoggedInJs_base.id,typeof userLoggedInJs_base.id)
    //userLoggedInJs_base._id is string; .id is undefined; 66fbc stirng undefined undefined
    console.log('clientSocket ends')
    if(userId==userLoggedInJs_base._id) return
    socket.emit("notification received",userId) //actually this emit needs executing in 4 places in commonJs
}

socket.on('notification received',(newNotification)=>{
    $.get('/api/notifications/latest',(latestNoteData)=>{
        console.log('size',latestNoteData.size)
        showNotificationPopup(latestNoteData.latestNote)
        //refreshNotificationsBadge() //or outside ajax call
    })
    refreshNotificationsBadge() //or inside ajax call
})

//showNotificationPopup & showMessagePopup canbe in here or commonJs
//clicking pop-up fn can be in here or commonJs or notificationPopupHtml.js