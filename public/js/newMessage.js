//codes copied from search.js & modified
var timer; 

$('#userSearchTextbox').keydown((event)=>{ 
    clearTimeout(timer);//reset previous timer
    var textbox=$(event.target)
    var value=textbox.val()

    if(value==""&&(event.which==8||event.keyCode==8)){
        //remove user from selection 
        selectedUsers.pop() 
        updateSelectedUsersHtml() //ok 1
        //deleteSelectedUserHtmlOneByOne(); //ok too 2
        //also remove all searchItems displayed on the output list
        $(".resultsContainer").html('')
        //createChat btn disabled when no user selected in the input box/search field i.e. no one in the selectedUsers array
        if(selectedUsers.length==0) $("#createChatButton").prop("disabled",true)
        return
    }

    timer=setTimeout(() => {
        value=textbox.val().trim();
        if(value==''){
            $(".resultsContainer").html('')
        }
        else{
            console.log(value)
            searchUsers4Chats(value)
            
        }
    }, 1000);
})



function searchUsers4Chats(searchTerm){  
    $.get("/api/users",{search:searchTerm},(searchRes)=>{ 

        outputSelectableUsers4Chats(searchRes,$('.resultsContainer'))
    })
}


var selectedUsers=[]

function outputSelectableUsers4Chats(getUsersData,container){
    container.html("")

    getUsersData.forEach(userData=>{ 
        if(userData._id==userLoggedInJs._id || selectedUsers.some(sltedUsr=>{return sltedUsr._id==userData._id})){ 

            return
        } 
        var htmlEl=createUserHtml(userData,true) 
        
        var element=$(htmlEl) //create jquery Obj

        //container.append(htmlEl)
        container.append(element) //each element displayed on the output list for click/selection

        element.click(()=> userSelected(userData)) //add click handler

    })

    if(getUsersData.length==0){ //no such users matched the selecting/typing criteria @backend users.js GET
        container.append("<span class='noResults'>No results found</span>")
    }

}



function userSelected(user){
    //add selected user from teh display/output list to the selectedUsers array of returned mongoDB doc Obj
    selectedUsers.push(user)
    //add all selected users to the inputbox/search field
     updateSelectedUsersHtml() //ok 1
    // addSelectedUserHtmlOneByOne(user) //ok too 2
    //clear the input search box (required/searched userA; maybe partial typing userA's name; all need clearing after clicking/selecting/adding) after selecting & adding the matched userA; 
    //will start typing next person's name (once start typing /keydown, searchRes list shown again on o/p)
    //after selecting one user from the output list
    $('#userSearchTextbox').val("").focus()
    //clear display/output list of search results (after already selecting needed user) 
    //so can search for next person's name when typing new searchee name
    $(".resultsContainer").html('')  
    //enable (undisable) the createChatbtn as there's def already at least one user selected
    $("#createChatButton").prop("disabled",false)
//keep typing for next user in inbox search field/box; show (partial) matched users on next o/p list; select one repeat above
//or delete last selected user
}

function updateSelectedUsersHtml(){ //create userElement  to be added to the input search field/box
    var elements=[] //array of all selectedUser's html/jqueryObj
    selectedUsers.forEach(user=>{ //adding all selectedUsers from the mongoDBObj array (selectedUsers) to the jqueryObj array (elements)
        var name =user.fName+" "+user.lName //or using backtick injection
        var userElement=$(`<span class='selectedUser'>${name}</span>`)
        elements.push(userElement)
    })
    //now need ot add the elements to teh inputbox/searchField (req.query backend)
    //firstly removing exisitng ones/elements userElements (with above created class 'selectedUser')
    $(".selectedUser").remove() 
    //adn then add above elements to/b4 #selectedUsers
    $("#selectedUsers").prepend(elements)
}
//var lastUserHtmlStrEl=""
function addSelectedUserHtmlOneByOne(user){
        var name =user.fName+" "+user.lName //or using backtick injection
        var curUserHtmlStrEl=`<span class='selectedUser'>${name}</span>`
        var userElement=$(curUserHtmlStrEl)
        $("#selectedUsers>:last").before(curUserHtmlStrEl)// $("#selectedUsers>:last").before(userElement) //bothok

}
//var lastUserElement=$(lastUserHtmlStrEl)
function deleteSelectedUserHtmlOneByOne(){
    $("#selectedUsers").children().last().prev().remove() 

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
}



//could be in commonJs too; wherever selelctedUsers is first declared, the script comes first
$('#createChatButton').click(()=>{
    console.log('selectedUsers',selectedUsers)
    var data=JSON.stringify(selectedUsers) //ajax cannot send array to server in array form -> need convert to string
    //server side convert string back to array
    console.log("data",data)
    $.post('/api/chats',{users:data},newChat=>{//chatSchema has users property //returned this newly createdChat mongoDB Doc obj
        if(!newChat||!newChat._id) return alert("Invalid response from server!")
        window.location.href=`/messages/${newChat._id}` //messagesRoutes url path
    }) 
})
