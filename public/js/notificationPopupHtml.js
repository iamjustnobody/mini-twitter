

function createNotificationHtml(notification){ //resultsImageContainer from inboxPageJs
    //userFrom populated in notificationsJs
    var text=getNotificationText(notification) //stirng of html
    var url=getNotificationUrl(notification)
    var classname=notification.opened?"":'active';

    return `<a href='${url}' class="resultListItem notification ${classname}" data-id="${notification._id}"> 
                <div class="resultsImagesContainer">
                    <img src='${notification.fromUser.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'> ${text} </span>
                </div>
            </a>`;
}

function getNotificationText(notification){
    const {fromUser,notificationType}=notification
    if(!fromUser.fName ||!fromUser.lName){
        return alert("User from data not populated")
    }
    var fromUserName=`${fromUser.fName} ${fromUser.lName}`;
    var text;
    if(notificationType=="retweet"){
        text=`${fromUserName} retweeted one of your posts`
    }
    else if(notificationType=="like"){
        text=`${fromUserName} liked one of your posts`
    }
    else if(notificationType=="comment"){
        text=`${fromUserName} replied to one of your posts`
    }
    else if(notificationType=="follow"){
        text=`${fromUserName} followed you`
    }
    return `<span class='ellipsis'>${text}</span>`
}

function getNotificationUrl(notification){
    var url="#"
    const notificationType=notification.notificationType
    if(notificationType=="retweet"||notificationType=="like"||notificationType=="comment"){
        url=`/post/${notification.entityId}`
    }
    else if(notificationType=="follow"){
        url=`/profile/${notification.entityId}`
    }
    return url //backend entityId always o/p as objId in newNote 
    //(see apiRoutes insernotifications in postsJs for retweet like comment; usersJs for follow)
    //as entityId defined as mongoTypeObjId in notificationSchema
}



// copied from inboxPageJs 
//such that createHtml fn can be called in commonJs for showPOPup then called in clientSocketJs on any page
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
//copied to chatPage.js; or move above to commonJs
function getOtherChatUsers(users){
    if(users.length==1) return users
    return users.filter(user=>{
        return user._id!==userLoggedInJs._id
    })
}
//copied to chatPage.js; or move above to commonJs



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




//copied from notificationPage.js - clicking one of pop-up notifications
$(document).on('click','.notification.active',(e)=>{
    var container=$(e.target)
    var notificationId=container.data().id //need notification id; get it from data attribute
    var href=container.attr("href")
    e.preventDefault()
    var cb=()=>window.location=href
    markNotificationAsOpened(notificationId,cb) //in commonJs; run markNotificationAsOpened then execute cb -href
}) 
