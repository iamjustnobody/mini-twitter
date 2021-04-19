
var timer; //global scope so previous timer can be accessed
//console.log("timer",timer)

$('#searchBox').keydown((event)=>{ //$(searchBox).keydown((event)=>{
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

//the entire codes in search.js can copied to newMessage.Js which can define same (or diff) name/variable var timer
//if no newMessage.JS, and newMessage.pug just use commonJs script (no extra block script)
// and commonJs b4 searchJs, then the above var timer can be removed, as var timer already defined in commonJs (must be in commonJs)
//but if searchJs b4 commonJS & VAR TIMER (must be) defined in searchJs, no need to define var timer in commonJs

function search(searchTerm,searchType){
    var url=searchType=="users"?"/api/users":"/api/posts"  //NOT 'api/posts' but '/api/posts'!
    //selectedTab from searchRoutes: 'search/:selectedTab' so if '/search/bacon' directly goes to Posts tab with '/search/bacon' url
    //since selectedTab!='users' in searchPage.pug & router.get('/') in searchRoutes.js
    //but no such api call GET '/api/bacon' so not `api/${}` to avoid fire non-existing api call /api/bacon
    $.get(url,{search:searchTerm},(searchRes)=>{ //req.query.search in api routes // '/?&'
        console.log('search results ',searchRes) //populated (as defined in getPosts in posts.js) searchRes

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
//just like userLoggedIn_profile.following && userLoggedIn_profile.following.includes(profileUsrid) in profilePage.pug
//userLoggedInJs@JS here is JSON.parse(JSON.stringify(userLoggedIn_profile@pug))

    var text = isFollowing?"Following":"Follow"
    var buttonClass = isFollowing?"followButton following":"followButton"

    var followButton=""
    if(showFollowButton && userLoggedInJs._id != userData._id){
        followButton = `<div class='followBtnContainer'> 
                            <button class='${buttonClass}' data-userid='${userData._id}'>${text}</button>
                        </div>`
                        
    }
//data-user='${userData._id}' or data-user=userData._id //ok //class='${buttonClass}' or class=buttonClass //createdUserHtml added to f&F.pug .resultsContainer
//just like createFollowButon in mixin.pug which is used in profilePage.pug 
//click follow/unfollow button even handler is in commonJs so need f&f.pug & profillePage.pug use same name for dataset (data-userid)

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