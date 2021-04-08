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
/*
const selectRps=document.querySelector(".postsContainer").dataset.selectrps
console.log("profile-data-selectrps",selectRps,typeof selectRps) //string
//if no json parse above here
//data-selectRps=`${selectReplies}` undefined string true string; 
//data-selectRps=selectReplies no data-selectrps or just data-selectRps in div //undefined undefined //empty string
//data-selectRps=`${JSON.stringify(selectReplies)}` then still no JsonParse -> "true" "undefined" or true str undefined str
//data-selectRps=JSON.stringify(selectReplies) then still no jsonParse-> true str undefined undefined

//data-selectRps=`${JSON.stringify(selectReplies)}` then JsonParse -> true boolean "true" & "undefined" error
//data-selectRps=JSON.stringify(selectReplies) then JsonParse -> true boolean "true" & error
*/

const profid=document.querySelector(".postsContainer").dataset.profid
console.log("profile-data-id",profid,typeof profid) //string
const profUsr=JSON.parse(document.querySelector(".postsContainer").dataset.profusr)
console.log("profile-data-profUsr",profUsr,typeof profUsr) 
const usr=JSON.parse(document.querySelector(".postsContainer").dataset.usr)
console.log("profile-data-usr",usr,typeof usr) 
// no json parse 
//data-profid=profileUser._id data-profUsr=profileUser or JSON.stringify (lefttwo) or `${JSON.stringify(lefttwo)}`
//above one: all strings var xx="yy" or "{"xx":"yy",zz:["id1","id2"]}"
//data-profid=`${profileUser._id}` data-profUsr=`${profileUser}`
//all stirngs var xx="yyy" or xx="{xx:'yy',zz:[non-str-id1,non-str-id2],oo:non-str-id3}" @'/profile/xx' (mongoDoc); xx="[obj obj]" => [obj obj] str type@'/profile' (req.session)
//data-usr=userLoggedInJs_profile => string var "{"zz":"zz","aa":"aa"}" ; data-usr=`${userLoggedInJs_profile}` => string var xx="{"xx":"yy",zz:["id1","id2"]}"
//data-usr=`${userLoggedIn_profile}` var xx="[obj obj]" => [obj obj] str type
// data-usr=userLoggedIn_profile string var xx="{"xx":"yy",zz:["id1","id2"]}"
//if Jsonparse
//data-usr=`${userLoggedInJs_profile}` or data-usr=userLoggedInJs_profile or data-usr=userLoggedIn_profile all obj var xx="{"xx":"yy",zz:["id1","id2"]}" 
//data-profid=JSON.stringify(profileUser._id) data-profUsr=JSON.stringify(profileUser) or `${JSON.stringify(profileUser._id)}` `${JSON.stringify(profileUser)}`
//string obj string obj after parse
//data-profUsr=profileUser obj after parse //data-profUsr=`${profileUser}` error after parse
//data-profid=profileUser._id or `${profileUser._id}` cannot be parsed without being JSONstringified first



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
        //isReply:selectRps=='' explicitey for data-selectRps=selectReplies
        // isReply although boolean but presented as '' or 'true' or 'false' at backend posts.js
        //    console.log(getData) //populated data sent back by posts.js get '/' 
        outputPosts(getPosts,$('.postsContainer'))
        }) //F5 reflesh
}