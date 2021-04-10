
//similar to profilePage.js
$(document).ready(()=>{
    loadFollowers() 
})
function loadFollowers(){ 
    $.get(`/api/users/${profileID}/${selectFlws?'followers':'following'}`,(getUser)=>{ //this profile user with profileID
        selectFlws?outputUsers(getUser.followers,$('.resultsContainer'))
        :outputUsers(getUser.following,$('.resultsContainer'))
        
    })
}

function outputUsers(getUsersData,container){
    container.html("")

    getUsersData.forEach(userData=>{
        var htmlEl=createUserHtml(userData,true)
        container.append(htmlEl)
    })

    if(getUsersData.length==0){ //no following or followers
        container.append("<span class='noResults'>No results found</span>")
    }

}

function createUserHtml(userData,showFollowButton){ //no show followBtn for group chat

    var name=userData.fName+" "+userData.lName
    var isFollowing= userLoggedInJs.following && userLoggedInJs.following.includes(userData._id)
//just like userLoggedIn_profile.following && userLoggedIn_profile.following.includes(profileUsrid) in profilePage.pug
    var text = isFollowing?"Following":"Follow"
    var buttonClass = isFollowing?"followButton following":"followButton"

    var followButton=""
    if(showFollowButton && userLoggedInJs._id != userData._id){
        followButton = `<div class='followBtnContainer'> 
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`
                        
    }
//data-user='${userData._id}' or data-user=userData._id //ok //class='${buttonClass}' or class=buttonClass
//just like createFollowButon in mixin.pug

    return `<div class="user">
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class="header">
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`

    //`<img src=${userData.profilePic}>` or `<img src="${userData.profilePic}">` <img src='${userData.profilePic}'>
    //all ok
    /*
    return 
    <div class="user">
        <div class='userImageContainer'>
            <img src=`${userData.profilePic}`/>
        </div>
    </div>
    */
}