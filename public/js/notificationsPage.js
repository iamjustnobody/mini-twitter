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
    return `<a href='#' class="resultListItem"> 
                <div class="resultsImageContainer">
                    <img src='notification.fromUser.profilePic'>
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