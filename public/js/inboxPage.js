
$(document).ready(()=>{
    $.get("/api/chats",(chatsData,status,xhr)=>{
        if(xhr.status==400){
            alert("Could not get chat list")
            return
        }
        outputChatList(chatsData,$(".resultsContainer")) //populated data/chats from get('/api/chats')
    })
})

function outputChatList(chatList,container){
    if(chatList.length==0){
        container.append("<span class='noResults'>Nothing to show</span>") //append html
        //or backtick (def backticks if there's ${} in <> or between <></>)
    }
    chatList.forEach(chat=>{
        var html=createChatHtml(chat);
        container.append(html)
        console.log('isGroupChat',chat.isGroupChat)
    })
}

function createChatHtml(chatData){
    var chatname=chatData.chatName?chatData.chatName:getOtherChatUsersNamesString(chatData.users); //also copied to chatPageJs
    var images=getChatImageElments(chatData)
    var latestMsg=getLatestMsg(chatData.latestMessage)

    //added for marking chat as opened after clicking this chat and marking all messages inside this chat as read/seen
    /*console.log("chatlamsg",chatData.latestMessage,typeof chatData.latestMessage) //obj{populatedSender} or undefined undefined
    if(chatData.latestMessage){
        console.log("chatlamsgSeen ",chatData.latestMessage.seenBy,typeof chatData.latestMessage.seenBy) //[] obj or ["6088ac45"] arrayobj of stringObj
        console.log("chatlamsgSeen0 ",chatData.latestMessage.seenBy[0],typeof chatData.latestMessage.seenBy[0])//undefined undefined or string
        if(chatData.latestMessage.seenBy[0]){
            console.log("chat_id ",chatData.latestMessage.seenBy[0]._id,typeof chatData.latestMessage.seenBy[0]._id) //undefined undefined
            console.log("chatid ",chatData.latestMessage.seenBy[0].id,typeof chatData.latestMessage.seenBy[0].id) //undfined undefined
        }
    }
    console.log(userLoggedInJs,typeof userLoggedInJs) //currently "object" {no populated fields}
    console.log(userLoggedInJs._id,typeof userLoggedInJs._id,userLoggedInJs.id,typeof userLoggedInJs.id)//60ac4 string undefined undefined
    */
    //var activeClass=chatData.latestMessage.seenBy.includes(userLoggedInJs._id)?"":"" //from inboxPage.pug userLoggedInJs_inbox messageRoutes inbox payload
    var activeClass=!chatData.latestMessage||chatData.latestMessage.seenBy.includes(userLoggedInJs._id)?"":"active"


    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${images}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatname}</span>
                    <span class='subText ellipsis'>${latestMsg}</span>
                </div>
            </a>`; //return html ///messagesRoutes url path
}


function getLatestMsg(latestMsg){ //populate chatData.latestMessage
    if(latestMsg!=null){
        var sender=latestMsg.sender
        //return `${latestMsg.msgContent}` //undefined if not populate chat.latestMessage at chatsJs get'/api/chats'
        return `${sender.fName} ${sender.lName}: ${latestMsg.msgContent}` 
        //also need to populate chatData.latestMessage.sender chatsJs get'/api/chats'
    } //latestMessage from POST request @messagesJs api route
    return 'New chat' //just create a new chat have not sent any messages in this new chat yet
}



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
//above two fn copied to chatPage.js; or move above to commonJs
function getChatImageElments(chatData){
    var otherChatUsers=getOtherChatUsers(chatData.users);
    var chatImages=getChatUserImageElement(otherChatUsers[0])
    chatImages=otherChatUsers.length>1?
                chatImages+getChatUserImageElement(otherChatUsers[1])
                :chatImages
    var groupChatClass=otherChatUsers.length>1?"groupChatImagesContainer":""
    return `<div class='resultsImagesContainer ${groupChatClass}'>${chatImages}</div>`
}
function getChatUserImageElement(chatUser){
    if(!chatUser||!chatUser.profilePic) return alert("User passed into functino is invalid")
    return `<img src='${chatUser.profilePic}' alt=''>`
}