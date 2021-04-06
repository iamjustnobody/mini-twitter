/*
 //below a couple of lines for scripts in main-layouts.pug or in branch.pugs
//console.log("userLoggedIn@profilePage: ",userLoggedIn,typeof userLoggedIn)
console.log("userLoggedInJs@profilePage: ",userLoggedInJs,typeof userLoggedInJs) //app.js get'/' -> main-layouts -> common.js
//console.log("userLoggedInJs_profile@profilePage: ",userLoggedInJs_profile,typeof userLoggedInJs_profile) //app.js get'/' -> main-layouts -> common.js
*/
/*
//.testLoginUser@main-layouts data-currentUser
const userLoggedInJs=JSON.parse(document.querySelector(".testLoginUser").dataset.currentuser)
console.log("profile.js - ",userLoggedInJs,userLoggedInJs._id,typeof userLoggedInJs,typeof userLoggedInJs._id,typeof userLoggedInJs.id)
//obj string undefined //string undefined undefined if no JSON.parse
*/
/*
//.testLoginUserProfile@profilePug data-currentUser
const userLoggedInJs=JSON.parse(document.querySelector(".testLoginUserProfile").dataset.currentuser)
console.log("profilePage.js - ",userLoggedInJs,userLoggedInJs._id,typeof userLoggedInJs,typeof userLoggedInJs._id,typeof userLoggedInJs.id)
//obj string undefined //string undefined undefined if no JSON.parse
*/
/* //test data
const testuser=document.querySelector(".postsContainer").dataset.testuser
console.log("testuser profilePage.js - ",testuser,typeof testuser,typeof testuser._id,typeof testuser.id)
//const testuser2=document.querySelector(".postsContainer").dataset.profileusr
//console.log("profileuser profilePage.js - ",testuser2,typeof testuser2,typeof testuser2._id,typeof testuser2.id)
//above two: when testuser(2) is obj ._id string & .id undefined; if string (no parse) then undefined undefined
*/

console.log("profile-id",profileID,typeof profileID) //string
console.log("profile-select",selectRps,typeof selectRps) //string (or boolean)
//const selectRps=document.querySelector(".postsContainer").dataset.selectrps
//console.log("profile-id-selectrps",selectRps,typeof selectRps) //string
//data-selectRps=`${selectReplies}` undefined string true string; 
//data-selectRps=selectReplies no data-selectrps or just data-selectRps in div //undefined undefined //string

const profid=document.querySelector(".postsContainer").dataset.profid
console.log("profile-data-id",profid,typeof profid) //string


$(document).ready(()=>{
    loadPosts() ////from home.js
})
function loadPosts(){ 
    $.get('/api/posts',{postedBy:profileID, isReply:selectRps},(getPosts)=>{ //implicily
        //or isReply:selectRps=="true"//isReply:selected==="replies" //explicitly 
        //above two for selectRps='!{selectReplies}' or selectRps='!{`${selectReplies}`}' in profilePage.pug
        //or for data-selectRps=`${selectReplies}`
        //isReply:selectRps==true explicitly for selectRps=!{selectReplies} or !{`${selectReplies}`} in profilePage.pug
        //above can be explicitly if set payload.selectReplies=false in profileRoutes.js router.get('/:username')
        //    console.log(getData) //populated data sent back by posts.js get '/' 
        outputPosts(getPosts,$('.postsContainer'))
        }) //F5 reflesh
}