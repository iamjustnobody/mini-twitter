//this script & its content availabel on allpages/pugs

var connected=false;


var socket=io('http://localhost:3002')
socket.emit('setup',userLoggedInJs_base)
 
socket.on("connected",()=>{return connected=true}) 


socket.on("message received",(newMsg)=> {
    messageReceived(newMsg) //1a 1b 2 //messageReceived(newMsg.newMsg) //1a2 
}) 

function messageReceived(newMessage){ //2

    if(!$(`[data-room="${newMessage.chat._id}"]`)||$(`[data-room="${newMessage.chat._id}"]`).length==0){ 
        showMessagePopup(newMessage)
        refreshChatsBadge() //opt
    }
    else{ //@chatPage own or another chatpage //now @own chatPage
        addChatMessageHtml(newMessage) 
        markAllMessagesAsRead()  //all msg in THIS chat markedAsRead; 
        //but if receiver in another chatPage,newMsg received in THIS chat remian unread &badge+1 but also addchatmsghtml (newMsghtml) incorrecly to another chatpage
        //markallmsgasread fn incl refreshchatsbadge already
    }
    // refreshChatsBadge() //opt
}

socket.on("message received & read",(newMsg)=> {
    console.log("msgReceived&read clientSocket",newMsg.newMsg);
    messageReceivedAndRead(newMsg) //1a 1b //messageReceivedAndRead(newMsg.newMsg) //1a2
}) //@chatPage  //1a 1a2 1b
function messageReceivedAndRead(newMessage){ //1a&1b , 1a2
    addChatMessageHtml(newMessage) 
    markAllMessagesAsRead() //incl refreshchatsbadge already
    //refreshChatsBadge()//opt
}


function emitNotification(userId){
    if(userId==userLoggedInJs_base._id) return
    socket.emit("notification received",userId) 
}

socket.on('notification received',(newNotification)=>{
    $.get('/api/notifications/latest',(latestNoteData)=>{
        console.log('size',latestNoteData.size)
        showNotificationPopup(latestNoteData.latestNote)
        //refreshNotificationsBadge() //or outside ajax call
    })
    refreshNotificationsBadge() //or inside ajax call
})

//showNotificationPopup & showMessagePopup canbe in thisJs or commonJs
//clicking pop-up fn can be in thisJs or commonJs or notificationPopupHtml.js
