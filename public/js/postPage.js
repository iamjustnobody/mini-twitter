/* //below a couple of lines for scripts in main-layouts.pug or in branch.pugs
//console.log("userLoggedIn@postPage.js: ",userLoggedIn,typeof userLoggedIn)
console.log("userLoggedInJs@postPage.js: ",userLoggedInJs,typeof userLoggedInJs) //app.js get'/' -> main-layouts -> common.js
//console.log("userLoggedInJs_post@postPage.js: ",userLoggedInJs_post,typeof userLoggedInJs_post) //app.js get'/' -> main-layouts -> common.js
*/
/*
//.testLoginUserPost@postPug data-currentUser
const userLoggedInJs=JSON.parse(document.querySelector(".testLoginUserPost").dataset.currentuser)
console.log("postPage.js - ",userLoggedInJs,userLoggedInJs._id,typeof userLoggedInJs,typeof userLoggedInJs._id,typeof userLoggedInJs.id)
//obj string undefined //string undefined undefined if no JSON.parse
*/
console.log("postID",postID,typeof postID) //script from postPage.pug
/*
const postID=document.querySelector(".testLoginUserPost").dataset.postid
console.log("postID",postID,typeof postID)
*/

$(document).ready(()=>{
    console.log("postID",postID,typeof postID) //string from postPage.pug from postRoutes//JSON.parse(postID) error
    //'/api/posts/'+ JSON.parse(postID) //wrong 
    //'/api/posts/'+postID //ok
    // `/api/posts/${postID}` //ok
    // $.get(`/api/posts/JSON.parse(postID)` //or `/api/posts/${JSON.parse(postID)}` //error
    //var idParse=JSON.parse(postID); console.log("idParse",idParse,typeof idParse); //wrong//syntax error unexpected token JSON
    $.get(`/api/posts/${postID}`,(getPost)=>{ console.log(getPost); //console.log("getPost.comments ",getPost.comments)
        //get'/:postID'@postRoutes->postPage.pug->postPage.js->get'/api/posts/:id'@api/posts.js
        //    outputPosts(getPost,$('.postsContainer')) //'.postsContainer' in both home pug & postPage pug
        outputPostsWithReplies(getPost,$('.postsContainer')) //returned thisPost from api/posts.js
    }) //F5 reflesh
        ////get'/'@app.js (generalRoutes)->home.pug->home.js->get'/api/posts'@api/posts.js
})
//'chain' children posts that have replyTo/commentedPost to current parent Post; 
//but populate once grandparent's post that current parent post replied to
