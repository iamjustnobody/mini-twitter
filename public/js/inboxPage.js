
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


    var activeClass=!chatData.latestMessage||chatData.latestMessage.seenBy.includes(userLoggedInJs._id)?"":"active"


    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${images}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatname}</span>
                    <span class='subText ellipsis'>${latestMsg}</span>
                </div>
            </a>`; 
}


function getLatestMsg(latestMsg){ //populate chatData.latestMessage
    if(latestMsg!=null){
        var sender=latestMsg.sender
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
