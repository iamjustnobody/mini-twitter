/*
////const userLoggedInJs=JSON.parse(document.querySelector("mainSectionContainer").dataset.currentUser)
const userLoggedInJs=JSON.parse(document.querySelector(".homeContent").dataset.currentuser)
console.log("home.js - ", userLoggedInJs,userLoggedInJs._id,typeof userLoggedInJs)
//const userLoggedInJs=xx defined in home.js so better to have script homeJS before commonJs in main-layouts.pug
 */
/* ////below a couple of lines for scripts in main-layouts.pug or in branch.pugs
//console.log("userLoggedIn@home.js: ",userLoggedIn,typeof userLoggedIn)
console.log("userLoggedInJs@home.js: ",userLoggedInJs,typeof userLoggedInJs) //app.js get'/' -> main-layouts -> common.js
*/
/*//.testLoginUser@main-layouts data-currentUser
const userLoggedInJs=JSON.parse(document.querySelector(".testLoginUser").dataset.currentuser)
console.log("home.js - ",userLoggedInJs,userLoggedInJs._id,typeof userLoggedInJs,typeof userLoggedInJs._id,typeof userLoggedInJs.id)
//obj string undefined
*/
/*
//.testLoginUserHome@homePug data-currentUser
const userLoggedInJs=JSON.parse(document.querySelector(".testLoginUserHome").dataset.currentuser)
console.log("home.js - ",userLoggedInJs,userLoggedInJs._id,typeof userLoggedInJs,typeof userLoggedInJs._id,typeof userLoggedInJs.id)
//obj string undefined //string undefined undefined if no JSON.parse
*/

/*
$(document).ready(()=>{
    $.get('/api/posts',(getPosts)=>{ 
        //getTours getATour is directly doing from viewsRoutes & viewsController (frontend '/' & viewscontroller Tour.find directly called - not call ajax like we are doing here) with toursoverview & tourdetails pugs
        //    console.log(getData) //populated data sent back by posts.js get '/' 
        //getPosts=previously return data from posts.js now return results
            outputPosts(getPosts,$('.postsContainer'))
        }) //F5 reflesh
}) */
//updated to only show the posts from people your following -> below & api routes posts.js
$(document).ready(()=>{
    $.get('/api/posts',{followingOnly:'true'},(getPosts)=>{ //{followingOnly:'true'} or {followingOnly:true}
            outputPosts(getPosts,$('.postsContainer'))
        }) 
})



/*
function outputPosts(getData,container){
    container.html("")
    getData.forEach(post=>{
        var html=createPostHtml(post)//from fn from common.js
        container.append(html)
    })

    if(getData.length==0){container.append("<span class='noResults'> Nothing to show </span>")}
}*/ //move to commonJs & used in other pages including home page, e.g. modal, profile page
