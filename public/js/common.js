


$("#postTextArea,#replyTextArea").keyup(event=>{
    var textbox=$(event.target);
    var value=textbox.val().trim();

    var isModal=textbox.parents(".modal").length==1; 
    var submitBtn=isModal?$('#submitReplyButton'):$('#submitPostButton'); 
    if(submitBtn.length==0){return alert('no submit button found');}
    if(value===''){
        submitBtn.prop('disabled',true);
        return;
    }
    submitBtn.prop('disabled',false);
})

$('#submitPostButton,#submitReplyButton').click(event=>{
    var btn=$(event.target);

    var isModal=btn.parents(".modal").length==1;
    var textbox=isModal?$("#replyTextArea"):$("#postTextArea");

    var data={
        textContent:textbox.val()  
    }

    if(isModal){
        var id=btn.data().id; console.log("id",id,typeof id);//string
        if(id==null) return alert("Button id is null")
        data.replyTo=id;
    }

    $.post('/api/posts',data,(postData,status,xhr)=>{
 
  if(postData.commentedPost){
      emitNotification(postData.commentedPost.postedBy) 
      location.reload()
    } 
        var htmlEl=createPostHtml(postData)
        $('.postsContainer').prepend(htmlEl)
        textbox.val('')
        btn.prop('disabled',true)
    })
})

$(document).on('click','.likeButton',(event)=>{
    var btn=$(event.target);
    var postId=getPostIdFromElment(btn) 
    
    if(postId===undefined) return;
    $.ajax({
    url:`/api/posts/${postId}/like`,
        type:"PUT",
        success:(updatedPostData)=>{ 
            btn.find('span').text(updatedPostData.likes.length||'');

            if(updatedPostData.likes.includes(userLoggedInJs._id)){
                btn.addClass("active");
                emitNotification(updatedPostData.postedBy)
            }else{
                btn.removeClass("active")
            }
        }
    })

})

$(document).on('click','.retweetButton',(event)=>{
    var btn=$(event.target);
    var postId=getPostIdFromElment(btn) 
    
    if(postId===undefined) return;
    $.ajax({
    url:`/api/posts/${postId}/retweet`,
        type:"POST",
        success:(retweetedPost)=>{ 
            btn.find('span').text(retweetedPost.retweetUsers.length||'');
            if(retweetedPost.retweetUsers.includes(userLoggedInJs._id)){
                btn.addClass("active");
                emitNotification(retweetedPost.postedBy)
            }else{
                btn.removeClass("active")
            }
        }
    }) 

})

$("#replyModal").on("show.bs.modal",(event)=>{
    var btn=$(event.relatedTarget); 
    var postId=getPostIdFromElment(btn)

    $("#submitReplyButton").data("id",postId) 

    $.get(`/api/posts/${postId}`,(getPost)=>{ 
            outputPosts(getPost.thisPostData,$('#originalPostContainer')) 
        })
})
$("#replyModal").on("hidden.bs.modal",() => $('#originalPostContainer').html(''))



$("#deletePostModal").on("show.bs.modal",(event)=>{
    var btn=$(event.relatedTarget); 
    var postId=getPostIdFromElment(btn)

    $("#deletePostButton").data("id",postId)  //data-id="${postData._id}" @createHTMLelement btn
   // console.log($("#deletePostButton").data().id,typeof $("#deletePostButton").data().id)
})
$("#deletePostButton").on('click',(event)=>{ 
    var Id=$(event.target).data('id') 
    
    $.ajax({
        url:`/api/posts/${Id}`,
            type:"DELETE",
            success:(deletedPost,status,xhr)=>{ 
                if(xhr.status!=202){alert("could not delete the post");return;}
                location.reload()
            }
        })
})  

$(document).on('click','.post',(event)=>{
    var element=$(event.target);
    var postId=getPostIdFromElment(element) 
    
    if(postId===undefined) return;
    if(postId!=undefined&&!element.is('button')) window.location.href='/post/'+postId
})


$(document).on('click','.followButton',(event)=>{ 
    var button=$(event.target);
    var profileUserId=button.data().userid;

    $.ajax({
        url:`/api/users/${profileUserId}/follow`, 
            type:"PUT",
            success:(updatedUserData,status,xhr)=>{ 
                if(xhr.status==404) return alert("user not found")

                var diff=1;
                if(updatedUserData.following && updatedUserData.following.includes(profileUserId)){
                    
                    button.addClass("following")
                    button.text("Following")
                    emitNotification(profileUserId)
                }else{
                    button.removeClass("following")
                    button.text("Follow")
                    diff=-1;
                }
                var followersLabel=$("#followersValue") 
                if(followersLabel.length!=0){ 
                    var followersText=followersLabel.text() 
                    followersText=parseInt(followersText);
                    followersLabel.text(followersText+diff); 
                }
            }
        })
})




//upload user profile photo/pic /user images
var cropper

$("#filePhoto").change(function(){

    if(this.files && this.files[0]){

        var reader=new FileReader();
        reader.onload=(e)=>{
            
            var image=document.getElementById("imagePreview")
            image.src=e.target.result
            //$('#imagePreview').attr("src",e.target.result) //ok

            if(cropper!==undefined) cropper.destroy()
            cropper=new Cropper(image,{
                aspectRatio:1/1, //square
                background:false //no grid bg
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})
$('#imageUploadButton').click(()=>{
    var canvas=cropper.getCroppedCanvas(); //select the area chosen
    if(canvas==null) {
        alert('Could not upload image. Make sure it is an image file.');
        return
    }

    canvas.toBlob((blob)=>{ 
        var formData=new FormData()
        formData.append('croppedImage',blob) 
        //fire ajax call
        $.ajax({
            url:"/api/users/profilePicture",
            type:"POST",
            data: formData,
            processData:false, 
            contentType:false, 
            success: (data,status,xhr)=>location.reload()

        }) 

    })
    
})

$("#coverPhoto").change(function(){

    if(this.files && this.files[0]){

        var reader=new FileReader();
        reader.onload=(e)=>{
            
            var image=document.getElementById("coverPhotoPreview")
            image.src=e.target.result
            //$('#imagePreview').attr("src",e.target.result) //ok
            console.log('coverPhoto loaded')
            if(cropper!==undefined) cropper.destroy()
            cropper=new Cropper(image,{
                aspectRatio:16/9, //square
                background:false //no grid bg
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})
$('#coverPhotoUploadButton').click(()=>{
    var canvas=cropper.getCroppedCanvas(); //select the area chosen
    if(canvas==null) {
        alert('Could not upload image. Make sure it is an image file.');
        return
    }
//convert canvas to blob binary large obj; store image & video & transfer between 
    canvas.toBlob((blob)=>{ //done converting into blob then call cb (pass in the results blob)
        var formData=new FormData()
        formData.append('croppedCoverPhoto',blob) //keyval
        console.log(formData)
        //fire ajax call
        $.ajax({
            url:"/api/users/coverPhoto",
            type:"POST",
            data: formData,
            processData:false, //form Jquery NOT to convert formData to string
            contentType:false, //forms subbmitting files //need boundary/delimiter (separating data sent to server) in the request
            success: (data,status,xhr)=>location.reload()

        }) 

    })
    
})



//pin button @modal just like delete btn: attach data-id & click handler to the button
$("#confirmPinModal").on("show.bs.modal",(event)=>{
    var btn=$(event.relatedTarget); 
    var postId=getPostIdFromElment(btn)
    $("#pinPostButton").data("id",postId) //add postId to the pin btn once modal open //data-id="${postData._id}"
    console.log($("#pinPostButton").data().id, typeof $("#pinPostButton").data().id)
})
$("#unpinModal").on("show.bs.modal",(event)=>{
    var btn=$(event.relatedTarget); 
    var postId=getPostIdFromElment(btn)
    $("#unpinPostButton").data("id",postId) //add postId to the pin btn once modal open //data-id="${postData._id}"
    console.log($("#unpinPostButton").data().id, typeof $("#unpinPostButton").data().id)
})
$("#pinPostButton").on('click',(event)=>{ 
    var Id=$(event.target).data('id') //data-id="${postData._id}" in createHTMLelement button
    console.log('pinPostId',Id,typeof Id)  //string
    $.ajax({
            url:`/api/posts/${Id}`,
            type:"PUT",
            data:{pinned:true},
            success:(pinnedPost,status,xhr)=>{ //status is status msg; statusCode is in xhr
                if(xhr.status!=204){alert("could not pin the post");return;}
                location.reload()

                }
        })
}) 
$("#unpinPostButton").on('click',(event)=>{ 
    var Id=$(event.target).data('id') //data-id="${postData._id}" in createHTMLelement button
    console.log('unpinPostId',Id,typeof Id)  //string
    $.ajax({
            url:`/api/posts/${Id}`,
            type:"PUT",
            data:{pinned:false},
            success:(pinnedPost,status,xhr)=>{ //status is status msg; statusCode is in xhr
                if(xhr.status!=204){alert("could not pin the post");return;}
                location.reload()

            }
        })
}) 






function getPostIdFromElment(element){
    var isRoot=element.hasClass('post')
    var rootElment= isRoot===true? element: element.closest(".post");
    var postId=rootElment.data().id; //keyval data() contains id 

    if(postId===undefined)return alert('Post id undefined')
    return postId
}

function createPostHtml(postData,largeFont=false){
    if(postData==null) return alert("post object is null")

    var isRetweet=postData.retweetData!=undefined;
    var retweetedBy=isRetweet?postData.postedBy.username:null
    postData=isRetweet?postData.retweetData:postData 

    var displayName=postData.postedBy.fName+' '+postData.postedBy.lName
    var timestamp=timeDifference(new Date(),new Date(postData.postedBy.createdAt)) //postData.postedBy.createdAt
    var likeBtnActiveClass=postData.likes.includes(userLoggedInJs._id)?"active":""
    var retweetBtnActiveClass=postData.retweetUsers.includes(userLoggedInJs._id)?"active":""

    //retweetText is childText
    var retweetText=isRetweet?
    `<span> Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a></span>`:''

    if(postData._id=='6071d280d69e9012686a84b9'){console.log("why")}
    var replyFlag=""

    if(postData.commentedPost && postData.commentedPost._id){ 
     if(!postData.commentedPost._id){ 
            return alert("replyTo/commentedPost is not populated")
        } 
     if(postData.commentedPost.postedBy){ 
            if(!postData.commentedPost.postedBy._id){ 
                return alert("postedBy field is not populated")
            }
            var replyToUsername=postData.commentedPost.postedBy.username
            replyFlag=`<div class='replyFlag'> Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername} </a> </div>`
        }
    }

    var largeFontClass= largeFont?"largeFont":""

    var buttons="";
    var pinnedPostText="" 
    if(postData.postedBy._id===userLoggedInJs._id){ 

        var dataTarget="#confirmPinModal"
        var pinnedClass=""
        if(postData.pinned===true){
            pinnedClass="active"
            pinnedPostText="<i class='fas fa-thumbtack'></i> <span> Pinned post </span>"
            dataTarget="#unpinModal"
        }
        

        buttons=`<button class='pinnedButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target=${dataTarget}>
                    <i class="fas fa-thumbtack"></i>
                </button>
                <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
                    <i class="fas fa-times"></i>
                </button>`

    } 
    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postData.postedBy.profilePic}'>
                    </div>

                    <div class='postContentContainer'>

                        <div class='pinnedPostText'>${pinnedPostText}</div>

                        <div class='postHeader'>
                            <a href='/profile/${postData.postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postData.postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postBtnContainer'>
                                <button type="button" data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postBtnContainer green'>
                                <button class='retweetButton ${retweetBtnActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ''}</span>
                                </button>
                            </div>
                            <div class='postBtnContainer red'>
                                <button class='likeButton ${likeBtnActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}



function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000<30) return "Just now"
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}



function outputPosts(getData,container){
    container.html("")

    if(!Array.isArray(getData)){
        getData=[getData]
    } //single post for modal

    getData.forEach(post=>{
        var html=createPostHtml(post)//from fn from common.js
        container.append(html)
    })

    if(getData.length==0){container.append("<span class='noResults'> Nothing to show </span>")}
}


//below click single post redirect to postPage; fn below used in postPage shows repliedTo posts & comments on loaidng
function outputPostsWithReplies(getData,container){
    container.html("")

    if(getData.commentedPost!==undefined && getData.commentedPost!==null && getData.commentedPost._id!==undefined){ 

        var html=createPostHtml(getData.commentedPost)//from fn from common.js
        container.append(html)
    }
    var mainPostHtml=createPostHtml(getData.thisPostData,true)
        container.append(mainPostHtml) 

    getData.comments.forEach(post=>{
        var html=createPostHtml(post)//from fn from common.js
        container.append(html)
    })

}




function markNotificationAsOpened(notificationId=null,cb=null){
    if(cb==null)  cb = ()=>location.reload()

    var url=notificationId!=null?`/api/notifications/${notificationId}/markAsOpened`
                                :`/api/notifications/markAsOpened` //allNotificationsOpened

    $.ajax({
        url,
        type:'PUT',
        success:()=>cb() 
    })
} 

$('document').ready(()=>refreshChatsBadge())
$('document').ready(()=>refreshNotificationsBadge())
function refreshChatsBadge(){
    $.get("/api/chats",{unreadOnly:true},chatsData=>{
        console.log(chatsData.length)
        var unreadChatsLength=chatsData.length
        if(unreadChatsLength>0) $("#messagesBadge").text(unreadChatsLength).addClass('active')
        else $("#messagesBadge").text("").removeClass('active')
    })
}//called on any page so commonJs onLoading
function refreshNotificationsBadge(){
    $.get("/api/notifications",{unreadOnly:true},notificationsData=>{
        console.log(notificationsData.length)
        var unreadNotificationsLength=notificationsData.length
        if(unreadNotificationsLength>0) $("#notificationsBadge").text(unreadNotificationsLength).addClass('active')
        else $("#notificationsBadge").text("").removeClass('active')
    })
} 


function showNotificationPopup(notification){
    var html=createNotificationHtml(notification) //returned string html
    var element=$(html) //HTML Obj; jquery version of the above html
    element.prependTo('#notificationList')
    setTimeout(()=>element.fadeOut(400),5000) 

}
function showMessagePopup(newMessage){
    if(!newMessage.chat.latestMessage||!newMessage.chat.latestMessage._id){//.chat populated in POST messages.js but .chat.latestMessage not populated
        newMessage.chat.latestMessage=newMessage 
    } 
    var html=createChatHtml(newMessage.chat) //returned string html
    var element=$(html) //HTML Obj; jquery version of the above html
    element.prependTo('#notificationList')
    setTimeout(()=>element.fadeOut(400),5000) 

}
