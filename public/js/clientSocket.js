//this script & its content availabel on allpages/pugs

var connected=false;

//create socket instance but we dont have client socket io yet (installed in server)
//so need cdn here in main-layouts.pug; or download

var socket=io('http://localhost:3002')
socket.emit('setup',userLoggedInJs_base)

socket.on("connected",()=>{connected=true}) 
//socket.on("connected",()=>{connected=true;return}) 
//socket.on("connected",()=>{return connected=true}) 
//socket.on("connected",()=>connected=true)
//sent back from server app.js

socket.on("message received",(newMsg)=> messageReceived(newMsg)) 

function messageReceived(newMessage){
    if($('.chatContainer').length==0){ //no this instance so not on chat page so show popup notification

    }
    else{
        addChatMessageHtml(newMessage) //from chatPageJs but now weare already in chatPage/pug
    }
}