


$(document).ready(()=>{
    loadPosts() ////from home.js
})
function loadPosts(){ 
   
   if(selectRps!==true&&selectRps!=='true'){ //OR if(selectRps!=true&&selectRps!='true')
        $.get('/api/posts',{postedBy:profileID, pinned:true},(getPosts)=>{ 
            outputPinnedPost(getPosts,$('.pinnedPostContainer'))
        })
   }
    $.get('/api/posts',{postedBy:profileID, isReply:selectRps},(getPosts)=>{ //pinned:false
        outputPosts(getPosts,$('.postsContainer'))
    })
}


function outputPinnedPost(getData,container){
    if(getData.length==0){
        container.hide 
        return 
    }
    container.html("")

    getData.forEach(post=>{
        var html=createPostHtml(post)//from fn from common.js
        container.append(html)
    }) //although only one pinned post

}
