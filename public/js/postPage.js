


$(document).ready(()=>{
   
    $.get(`/api/posts/${postID}`,(getPost)=>{ 
        //get'/:postID'@postRoutes->postPage.pug->postPage.js->get'/api/posts/:id'@api/posts.js
        //    outputPosts(getPost,$('.postsContainer')) //'.postsContainer' in both home pug & postPage pug
        outputPostsWithReplies(getPost,$('.postsContainer')) //returned thisPost from api/posts.js
    }) //F5 reflesh
  
})
//'chain' children posts that have replyTo/commentedPost to current parent Post; 
//but populate once grandparent's post that current parent post replied to
