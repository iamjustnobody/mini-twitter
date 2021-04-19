/*
console.log(chatID1,typeof chatID1) //string
console.log(chatID2,typeof chatID2) //string
console.log(chatID3,typeof chatID3) //string
console.log(chatID4,typeof chatID4) //string
//console.log(chatID5,typeof chatID5)
//console.log(chatID6,typeof chatID6)
//console.log(chatID7,typeof chatID7)
//console.log(chatID8,typeof chatID8)
console.log(document.querySelector('.test').dataset.id1,typeof document.querySelector('.test').dataset.id1)//string
console.log(document.querySelector('.test').dataset.id2,typeof document.querySelector('.test').dataset.id2)//string
console.log(document.querySelector('.test').dataset.id3,typeof document.querySelector('.test').dataset.id3)//string
console.log(document.querySelector('.test').dataset.id4,typeof document.querySelector('.test').dataset.id4)//string
*/


$("document").ready(()=>{

    socket.emit("join room",chatID) //emit an event to the server
    socket.on("typing",()=>$('.typingDots').show()) //server app.js emit typing event
    socket.on("stop typing",()=>{$('.typingDots').hide();console.log('is typing')}) //server app.js emit typing event
    
    $.get(`/api/chats/${chatID}`,(chatData)=>{ console.log(chatData)
        $("#chatName").text(chatData.chatName?chatData.chatName:getOtherChatUsersNamesString(chatData.users))
        //copied from inboxPage.Js
        //above helperfunctions in here chatPageJs (retuned data/argument from apiRoute chatsJs)
        //below:moving helper functions to apiRoute chatsJs '/api/chats/chatid'
        //$("#chatName").text(chatData.chat_name) // ok when get('/:chatid') from chatsJs return plainJsObj1     
        //$("#chatName").text(chatData.chatName) // ok when get('/:chatid') from chatsJs return plainJsObj2 or chat
        //$("#chatName").text(chatData.chat_name) //not ok newly created field on mongodbObj only works in backend;this field getting lost in frontendJs
    }) //ok
    
    //$("#chatName").text(chatJs.chatName?chatJs.chatName:getOtherChatUsersNamesString(chatJs.users)) //ok too no need to make ajax call 
    //just pass stringified chatObj from messagesRoutes GET '/messages/chatid' payload to chatPage.pug
    //helperfunctio in chatPageJs; no need for apiRoute chatsJs; data/argument from non-apiRoute messagesRouteJs




    //OUTPUT ALL CHAT_CONTETN/CHAT_MESSAGES IN THIS CHAT
    $.get(`/api/chats/${chatID}/messages`,(chatMsg)=>{ 
        console.log('all messages for this chat',chatMsg,typeof chatMsg) //arrayObj - could be length of 0 if new chat
        //$("#chatName").text(chatMsg[0].chat.chatName?chatMsg[0].chat.chatName:getOtherChatUsersNamesString(chatMsg[0].chat.users)) //OK
        //populate users in router.get('/:chatid/messages') at chats.js so above $.get(`/api/chats/${chatID}` can be removed

        var messages=[]
        var lastSenderId=""

        chatMsg.forEach((message,index)=>{
            console.log(chatMsg[index+1],typeof chatMsg[index+1]) //"object";undefined;"undefined"

        //    var html=createMessageHtml(message) //stirng (not jqueryObj)
            //var html=createAdvancedMessageHtml(message,chatMsg[index+1],lastSenderId) //ok//what if index==chatMsg.length-1? chatMsg[index+1] is null?
            var html=createAdvancedMessageHtml(message,chatMsg[index+1],lastSenderId) //or index<chatMsg.length-1?chatMsg[index+1]:'undefined'
            //chatMsg[index+1]:"undefined" or chatMsg[index+1]:undefined or chatMsg[index+1]:null //see notebook            
            //if(index<chatMsg.length-1){console.log(typeof chatMsg[index+1].sender._id)}//string

            messages.push(html) //1
            //$('.chatMessages').append(html) //normal version //2a
            //addMessagesHtmlToPage(html,false) //advanced version //2b

            lastSenderId=message.sender._id //sender is populated
        })
        var messagesHtml=messages.join('') //one big string //1

        //$('.chatMessages').append(messagesHtml) //normal version //1a
        addMessagesHtmlToPage(messagesHtml,false) //advanced version //1b
        //replacing messages.push with either one of the above two (aim to append) and thus remove messages.join? ok solution 1& 2
    
        $(".loadingSpinnerContainer").remove()
        $('.chatContainer').css("visibility",'visible') //can also be applied to other pages
    }) //populate users in router.get('/:chatid/messages') at chats.js so above $.get(`/api/chats/${chatID}` can be removed



}) //IF NO OUTPUT ALL CHATMESSAGES, 
//then documentReady above $.get(`/api/chats/${chatID}` can be replaced by defining default name or chat name in messagesRoute '/messages/chatid'(with helper functions in messagesRoutesJs)


function addMessagesHtmlToPage(html,animated){
    $('.chatMessages').append(html)

    //scroll to buttom
    scrollToButtom(animated)
}
function createAdvancedMessageHtml(message,nextMessage,lastSenderId){

    //console.log('lastSenderId',typeof lastSenderId) //string
    var currentSender=message.sender; 
    var curSenderName=currentSender.fName+" "+currentSender.lName //'sender' is populated
    var curSenderId=currentSender._id //'sender' is populated
    //console.log('currentSenderId',typeof curSenderId) //string

    console.log('nextMessage',nextMessage,typeof nextMessage) 
    //getallmessagesofthissinglechat (GET on document Ready):object;or undefined undefined when index==chatMsg.length-1
    //POST send a new message: null obj if middle argument passed in is null, or undefined undefined
    var nextSenderId=nextMessage!=undefined?nextMessage.sender._id:"" //!=null or !=undefined or !='undefined' see notebook
    //'sender' is populated
    console.log('nextSenderId',nextSenderId,typeof nextSenderId) //string; if nextMessage undefined if index==chatMsg.length-1, nextSenderId empty string
    

    var isFirst=lastSenderId!=curSenderId
    var isLast=curSenderId!=nextSenderId //true if index+1==chatMsg.length (last)

    var isMine=message.sender._id==userLoggedInJs._id 
    var liClassName=isMine?"mine":"theirs"

    var nameElement=""
    if(isFirst){
        liClassName+=' first'
        if(!isMine){
            nameElement=`<span class='senderName'>${curSenderName}</span>`
        }
    }

    var profileImage=''
    if(isLast){ //can be both first & last if only one
        liClassName+=" last"
        profileImage=`<img src='${currentSender.profilePic}'>`
    }
    //if nor first or last, then inthe middle

     var imageContainer=""
     if(!isMine){
        imageContainer=`<div class='imageContainer'>
                            ${profileImage}
                        </div>`
     } //as only as its not my msg, even if its not the last msg we'll keep imageContainer space

    
    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.msgContent}
                    </span>
                </div>
            </li>`
}






$('#chatNameButton').click(()=>{
    var name=$('#chatNameTextbox').val().trim();
    //console.log(name)
    $.ajax({
        url:'/api/chats/'+ chatID, 
        type:'PUT',
        data:{
            chatname:name
        },
        success:(updatedData,status,xhr)=>{ //returned updatedChat from PUT /api/chats/chatid PUT from chatsJs
            if(xhr.status!=204){
                //return alert('could not update')
            }
            location.reload();
            //$("#chatName").text(updatedData.chatName?updatedData.chatName:getOtherChatUsersNamesString(updatedData.users))
            //above needs returned updatedChat (populated) from api route PUT '/api/chats/chatid" from chatsJs; also need to hide modal
            //ok as only has one input chatname field/bar on the chatPage.pug so with unique id (not using css class queryselector)
            //(so above html/text change wont apply to other with same classname like pin/unpin in commonJs) - list of post items
            //could solve by queryselector[index] (or specifying/adding another extra css class - but cannot do so for list of items which has same class but now diff classes just like ids)
        }
    })
})

//below two copied from inboxPage.js; or remove dup codes from both Js & move to commonJs instead
function getOtherChatUsersNamesString(users){
    var otherChatUsers=getOtherChatUsers(users);
    var namesArray=otherChatUsers.map(user=>{return user.fName+" "+user.lName})
    return namesArray.join(", ")
}

function getOtherChatUsers(users){
    if(users.length==1) return users
    return users.filter(user=>{
        return user._id!==userLoggedInJs._id
    })
}



//send Messages
$('.sendMessageButton').click(()=>{
    messageSubmitted()
})
$('.inputTextbox').keydown((event)=>{

    updateTyping();

    if(event.which===13 && !event.shiftKey){
        messageSubmitted() //enter key for submission
        return false //prevent entering new line
    }
})
var typing=false;
var lastTypingTime;
function updateTyping(){
    if(!connected){return}
    //below for keydown - going to type
    if(!typing){
        typing=true;
        socket.emit('typing',chatID) //to server app.js
    }
    
    //below is like alread typed & done typing; keyUp when/if(typing===true)
    lastTypingTime=new Date().getTime()
    var timeLength=3000
    setTimeout(()=>{
        var timeDiff=new Date().getTime()-lastTypingTime
        if(timeDiff>=timeLength && typing){
            //for serial chars typing in, prev cb maynot execute as newTime (later's Data.now()) makes timeDiff<timeLength; 
            //later cb's typing may be false as prev's typing is set to false in prev's cb fn; so later's cb may not need to execute
            socket.emit('stop typing',chatID) //to server appjs
            typing=false
        }
    },timeLength)
}

function messageSubmitted(){
    var content=$('.inputTextbox').val().trim();
    if(content!=""){
        sendMessage(content)
        $('.inputTextbox').val("")
        socket.emit('stop typing',chatID) //to server appjs
        typing=false
    }

}
function sendMessage(content){
    $.post("/api/messages",{content,chatId:chatID},(newMsg,status,xhr)=>{
        if(xhr.status!=201){
            alert('Could not send your message')
            $('.inputTextbox').val(content)
            return;
        }
        console.log("newMsg",newMsg) //still shows seenBy empty array as its just sent noOne read yet
        //POST@messagesJs-apiRoutes: when create, seenBy not specified as newMessage field/value
        //but will output seenBy ARRAY field in frontend console & show in mongodb
        //but when create a new chat mongodb does not show the fields thatare not defined or specified in chatData when create/POST @chatsJs apiRoutes
        
        //populated sender & chat from messagesJs apiRoute; consistent with ouputChatMessages populated by GET('/api/chats/:chatid/messages')from chats.js
        addChatMessageHtml(newMsg) //for self seeing my own newMsg thats just sent
        /*
        console.log('new message sent back to backend server appJs', newMsg.chat,newMsg.chat.users) 
        // if chat.users not populated//{users:["x","y"],_id:"z",lastMessage:"u",updatedAt:"time"} //["x","y"]
        //if chat.users populated: obj {_id:"x",isgroup:true,updatedAt:"time",users:[{obj see below}]}
        //if chat.users populated: ArrayObj [{_id:"x",createdAt:"time",likes:["id1","id2"]},{see left}]
        console.log(typeof newMsg.chat,typeof newMsg.chat.users) //obj; arrayObj of string b4 populated //obj;arrayObj of oBj after populated
        console.log('chatid',newMsg.chat._id,typeof newMsg.chat._id,newMsg.chat.id,typeof newMsg.chat.id) //z string undefined undefined
        console.log('userobj',newMsg.chat.users[0],typeof newMsg.chat.users[0]) //x or y string b4 populated
        //{_id:"x",createdAt:"time",likes:["id1","id2"]} obj after chat.users being populated
        console.log('userid',newMsg.chat.users[0]._id,typeof newMsg.chat.users[0]._id,newMsg.chat.users[0].id,typeof newMsg.chat.users[0].id) //all4undefined
        ////z string undefined undefined after chat.users populated
        console.log('senderobj',newMsg.sender,typeof newMsg.sender) //{_id:"x",createdAt:"time",likes:["id1","id2"]} obj //sender's being populated
        console.log('senderid',newMsg.sender._id,typeof newMsg.sender._id,newMsg.sender.id,typeof newMsg.sender.id)//z string undefined undefined 
        //see difference in consol o/p of newMsg in messagesJs chatPageJs appJs
        */
        if(connected) socket.emit('new message',newMsg) //for others seeing my newMsg thats just sent
    })
}

function addChatMessageHtml(message){
    if(!message||!message._id){ //if message is not populated;however it's def populated as its return as whole obj not just IDObj
        alert("Message is not valid")
        return
    }
    ///var messageDiv=createMessageHtml(message) //normal version
    var messageDiv=createAdvancedMessageHtml(message,null,'') //advanced version //see notebook: null (null Obj) or undefined (undefined undefined) or "undefined" (undefined string)
    //$('.chatMessages').append(messageDiv) //normal version
    addMessagesHtmlToPage(messageDiv,true) //advanced version
}

function createMessageHtml(message){

    var isMine=message.sender._id==userLoggedInJs._id //message.sender is just string so need to be populated@messages.js
    var liClassName=isMine?"mine":"theirs"
    //<li class='message ${liClassName}'> //<li class=${liClassName}> //<li class=${isMine?"mine":"theirs"}>
    ////populated sender & chat from messagesJs apiRoute //consistent w ouputChatMessages populated by GET('/api/chats/:chatid/messages')from chats.js
    return `<li class='message ${isMine?"mine":"theirs"}'>
                <div class='messageContainer'>
                    <span class='messageBody'>
                        ${message.msgContent}
                    </span>
                </div>
            </li>`
}


function scrollToButtom(animated){
    var container=$('.chatMessages')
    var scrollHeight=container[0].scrollHeight //JS obj.Js property
    if(animated){
        container.animate({scrollTop:scrollHeight},'slow') //could specify milisec
    }
    else{
        container.scrollTop(scrollHeight)
    }
}