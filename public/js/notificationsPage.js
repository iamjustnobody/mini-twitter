$(document).ready(()=>{
    $.get('/api/notifications',(notifications)=>{
        console.log(notifications) //arrayObj of obj
        outputNotificationList(notifications,$(".resultsContainer"))
    })
})

function outputNotificationList(notifications,container){
    notifications.forEach(notification=>{
        var html=createNotificationHtml(notification)
        container.append(html)
    })
    if(notifications.length==0){
        container.append("<span class='noResults'>Nothing to show</span>") //append html string
        //or backtick (def backticks if there's ${} in <> or between <></>)
    }
}
function createNotificationHtml(notification){ //resultsImageContainer from inboxPageJs
    //userFrom populated in notificationsJs
    var text=getNotificationText(notification) //stirng of html
    var url=getNotificationUrl(notification)
    var classname=notification.opened?"":'active';
    console.log('createNotificationHtml',typeof notification); //obj
    console.log(notification._id,typeof notification._id,notification.id,typeof notification.id)///string; undefined undefined

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
    //as entityId defined as mongoTypeObjId in notificationSchema & neever populated ?
}



//regconise the notifications on click & mark as opened/
//these elements on notificationPage are dynamic - not there when page is loaded so click need to attached to document
$(document).on('click','.notification.active',(e)=>{
    var container=$(e.target)
    var notificationId=container.data().id //need notification id; get it from data attribute
    var href=container.attr("href")
    e.preventDefault()
    var cb=()=>window.location=href
    markNotificationAsOpened(notificationId,cb) //in commonJs; run markNotificationAsOpened then execute cb above going to a href
}) //click one of unread/unopened notifications see above createNotificationHtml
$("#markNotificationsAsRead").click(()=> markNotificationAsOpened()) //click to markALl notifications as read/opened