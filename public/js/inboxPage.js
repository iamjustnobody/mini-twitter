
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
    })
}

function createChatHtml(chatData){
    var chatname=chatData.chatName?chatData.chatName:getOtherChatUsersNamesString(chatData.users); //also copied to chatPageJs
    var images=getChatImageElments(chatData)
    var latestMsg="this is latest Msg"

    return `<a href='/messages/${chatData._id}' class='resultListItem'>
                ${images}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatname}</span>
                    <span class='subText ellipsis'>${latestMsg}</span>
                </div>
            </a>`; //return html ///messagesRoutes url path
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