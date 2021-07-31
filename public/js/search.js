
var timer; 

$('#searchBox').keydown((event)=>{ 
    clearTimeout(timer);//reset previous timer
    var textbox=$(event.target)
    var value=textbox.val()
    var searchType=textbox.data().search //data-search in searchPage.pug//selectedTab from searchRoutes
    console.log('searchbox:',value,searchType)

    timer=setTimeout(() => {
        value=textbox.val().trim();
        if(value==''){
            $(".resultsContainer").html('')
        }
        else{
            console.log(value)
            search(value,searchType)
            
        }
    }, 1000);
})


function search(searchTerm,searchType){
    var url=searchType=="users"?"/api/users":"/api/posts"  
    $.get(url,{search:searchTerm},(searchRes)=>{ 

        if(searchType=='users'){
            outputUsers(searchRes,$(".resultsContainer"))
        }else{
            outputPosts(searchRes,$('.resultsContainer'))
        }
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

    var text = isFollowing?"Following":"Follow"
    var buttonClass = isFollowing?"followButton following":"followButton"

    var followButton=""
    if(showFollowButton && userLoggedInJs._id != userData._id){
        followButton = `<div class='followBtnContainer'> 
                            <button class='${buttonClass}' data-userid='${userData._id}'>${text}</button>
                        </div>`
                        
    }


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


}
