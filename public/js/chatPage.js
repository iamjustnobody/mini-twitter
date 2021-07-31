

$("document").ready(()=>{

    socket.emit("join room",chatID) 
    socket.on("typing",()=>$('.typingDots').show()) 
    socket.on("stop typing",()=>{$('.typingDots').hide()}) 
    
    $.get(`/api/chats/${chatID}`,(chatData)=>{ 
        $("#chatName").text(chatData.chatName?chatData.chatName:getOtherChatUsersNamesString(chatData.users))
        
    }) 



    //OUTPUT ALL CHAT_CONTETN/CHAT_MESSAGES IN THIS CHAT
    $.get(`/api/chats/${chatID}/messages`,(chatMsg)=>{ 

        var messages=[]
        var lastSenderId=""

        chatMsg.forEach((message,index)=>{

            var html=createAdvancedMessageHtml(message,chatMsg[index+1],lastSenderId) 

            messages.push(html) //1
            //$('.chatMessages').append(html) //normal version //2a
            //addMessagesHtmlToPage(html,false) //advanced version //2b

            lastSenderId=message.sender._id //sender is populated
        })
        var messagesHtml=messages.join('') //1

        //$('.chatMessages').append(messagesHtml) //normal version //1a
        addMessagesHtmlToPage(messagesHtml,false) //advanced version //1b
        //replacing messages.push with either one of the above two (aim to append) and thus remove messages.join? ok solution 1& 2
    
        $(".loadingSpinnerContainer").remove()
        $('.chatContainer').css("visibility",'visible') 
    }) 

    markAllMessagesAsRead() 

}) //IF NO OUTPUT ALL CHATMESSAGES, 
//then documentReady above $.get(`/api/chats/${chatID}` can be replaced by defining default name or chat name in messagesRoute '/messages/chatid'(with helper functions in messagesRoutesJs)


function addMessagesHtmlToPage(html,animated){
    $('.chatMessages').append(html)

    //scroll to buttom
    scrollToButtom(animated)
}
function createAdvancedMessageHtml(message,nextMessage,lastSenderId){

    var currentSender=message.sender; 
    var curSenderName=currentSender.fName+" "+currentSender.lName 
    var curSenderId=currentSender._id 

    var nextSenderId=nextMessage!=undefined?nextMessage.sender._id:""  

    var isFirst=lastSenderId!=curSenderId
    var isLast=curSenderId!=nextSenderId 
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
    if(isLast){ 
        liClassName+=" last"
        profileImage=`<img src='${currentSender.profilePic}'>`
    }

     var imageContainer=""
     if(!isMine){
        imageContainer=`<div class='imageContainer'>
                            ${profileImage}
                        </div>`
     }

    
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

    $.ajax({
        url:'/api/chats/'+ chatID, 
        type:'PUT',
        data:{
            chatname:name
        },
        success:(updatedData,status,xhr)=>{ 
            if(xhr.status!=204){
                //return alert('could not update')
            }
            location.reload();
       }
    })
})


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
        messageSubmitted() 
        return false 
    }
})
var typing=false;
var lastTypingTime;
function updateTyping(){
    if(!connected){return}
    if(!typing){
        typing=true;
        socket.emit('typing',chatID) 
    }
    
    
    lastTypingTime=new Date().getTime()
    var timeLength=3000
    setTimeout(()=>{
        var timeDiff=new Date().getTime()-lastTypingTime
        if(timeDiff>=timeLength && typing){
            socket.emit('stop typing',chatID) 
            typing=false
        }
    },timeLength)
}

function messageSubmitted(){
    var content=$('.inputTextbox').val().trim();
    if(content!=""){
        sendMessage(content) 
        $('.inputTextbox').val("")
        socket.emit('stop typing',chatID) 
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

        addChatMessageHtml(newMsg) 
        if(connected) socket.emit('new message',newMsg) //1b&2 //for others seeing my newMsg thats just sent //1b,2
       //const chatMsg={newMsg,chatID};if(connected) socket.emit('new message',chatMsg) //1a, 1a2
        //markAllMessagesAsRead() //or placed in click sendMessageButton or messageSubmitted fn or addchatmsghtml fn below
         //refreshChatsBadge() //or placed in clickSendMsgbtn/msgSubmitted/addchatmsghtml
    })
}

function addChatMessageHtml(message){
    if(!message||!message._id){ 
        alert("Message is not valid")
        return
    }
    ///var messageDiv=createMessageHtml(message) //normal version
    var messageDiv=createAdvancedMessageHtml(message,null,'') //advanced version //see notebook: 
    //$('.chatMessages').append(messageDiv) //normal version
    addMessagesHtmlToPage(messageDiv,true) //advanced version

    console.log("refreshChatsBadge from sendMessage in chatPage frontJs addhtml"); //refreshChatsBadge()
    markAllMessagesAsRead() 
}

function createMessageHtml(message){

    var isMine=message.sender._id==userLoggedInJs._id 
    var liClassName=isMine?"mine":"theirs"
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
    var scrollHeight=container[0].scrollHeight 
    if(animated){
        container.animate({scrollTop:scrollHeight},'slow') 
    }
    else{
        container.scrollTop(scrollHeight)
    }
}


//mark all messages in this chat as Read/Seen as the user clickOpen the chat to read/see the latest messageS
function markAllMessagesAsRead(){
    $.ajax({
        url:`/api/chats/${chatID}/messages/markAsRead`, //chatID from chatPage pug from chatRoutes backend non-api Routes
        type:"PUT",
        success:()=>refreshChatsBadge()
    })
}
