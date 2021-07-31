
$(document).ready(()=>{
    $.get('/api/posts',{followingOnly:'false'},(getPosts)=>{ //{followingOnly:'true'} or {followingOnly:true} 
        //{followingOnly:'false'} or {followingOnly:false} or removing whole {followingOnly:}
            outputPosts(getPosts,$('.postsContainer'))
        }) 
})



