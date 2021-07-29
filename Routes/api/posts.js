const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema')
const Post=require('../../ModelSchema/PostSchema')
const Notification=require('../../ModelSchema/NotificationSchema')
router.use(express.urlencoded({extended:false})); //POST

router.get('/',async (req,res,next)=>{  

    var searchObj=req.query; 
    console.log('searchb4',searchObj)
    if(searchObj.isReply!=undefined){ //searchObj.isReply (boolean type) presented as '' 'true' 'false' in searchObj (obj type)
        var isReply=searchObj.isReply=='true' //isReply is boolean
        searchObj.commentedPost={$exists:isReply} 
        delete searchObj.isReply
    }

    if(searchObj.followingOnly!=undefined){

        if(searchObj.followingOnly=='true'){ 
            var followingIds=[];
            if(!req.session.user.following){ 
                req.session.user.following=[]
            }
            req.session.user.following.forEach(user=>{
                followingIds.push(user)
            })
            followingIds.push(req.session.user._id) 

            searchObj.postedBy={$in:followingIds}
        }
        delete searchObj.followingOnly
    }

    if(searchObj.search!=undefined){ 
        searchObj.content={$regex:searchObj.search,$options:'i'}
        delete searchObj.search
    }
    
   
    var results=await getPosts(searchObj); 
    res.status(200).send(results)
}) 
router.get('/:id',async (req,res,next)=>{  
    var postId=req.params.id;
    var postData=await getPosts({_id:postId}); 
    var thisPostData=postData[0]; 
    var thisPost={thisPostData}
    if(thisPostData.commentedPost!==undefined){thisPost.commentedPost=thisPostData.commentedPost}
    thisPost.comments=await getPosts({commentedPost:postId})
    res.status(200).send(thisPost)  
}) 


router.post('/',async(req,res,next)=>{ 

    if(!req.body.textContent){ 
        console.log('Content param not sent with requests')
        return res.sendStatus(400)
    } 
    var postedData={
        content:`${req.body.textContent}`,//or req.body.textContent 
        postedBy:req.session.user
    }

    if(req.body.replyTo){postedData.commentedPost=req.body.replyTo} //for submitReplyButton @modal

    Post.create(postedData) 
    .then(async(newPost)=>{ 
        newPost=await User.populate(newPost,{path:'postedBy'})    

        //add notification!
        if(newPost.commentedPost!==undefined){ 
            newPost=await Post.populate(newPost,{path:'commentedPost'}) 
            
            await Notification.insertNotification(newPost.commentedPost.postedBy._id,req.session.user._id,"comment",newPost)
           
        }

        res.status(201).send(newPost) 
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })
})

router.put('/:postid/like',async(req,res,next)=>{ 
    const id=req.params.postid;
    const userId=req.session.user._id;
    
    const isLiked=req.session.user.likes&&req.session.user.likes.includes(id);
    
  const option=isLiked?"$pull":"$addToSet";
 
 req.session.user=await User.findByIdAndUpdate(userId,{[option]:{likes:id}},{new:true}).catch(error=>{res.sendStatus(400);})

   const updatedPost=await Post.findByIdAndUpdate(id,{[option]:{likes:userId}},{new:true}).catch(error=>{res.sendStatus(400);})//return

if(!isLiked){ 
    await Notification.insertNotification(updatedPost.postedBy,req.session.user.id,"like",updatedPost)
}

    res.status(200).send(updatedPost) //send data to front end press like button in common.js
})

router.post('/:postid/retweet',async(req,res,next)=>{ 
    const id=req.params.postid; 
    const userId=req.session.user._id; 
    
   const untweetPost=await Post.findOneAndDelete({postedBy:userId,retweetData:id}) 
   .catch(error=>{res.sendStatus(400);});
   let retweetPost;
   if(untweetPost==null){
     retweetPost=await Post.create({postedBy:userId,retweetData:id})
     .catch(error=>{res.sendStatus(400);});
   }

  const option=untweetPost!=null?"$pull":"$addToSet";
  const post=untweetPost==null?retweetPost:untweetPost  
 req.session.user=await User.findByIdAndUpdate(userId,{[option]:{retweets:post._id}},{new:true}) 
 .catch(error=>{res.sendStatus(400);}) 

const updatedPost=await Post.findByIdAndUpdate(id,{[option]:{retweetUsers:userId}},{new:true})
.catch(error=>{res.sendStatus(400);})

//now Notification
if(!untweetPost){
    await Notification.insertNotification(updatedPost.postedBy,req.session.user,"retweet",updatedPost)
}


  res.status(200).send(updatedPost) 
})


router.delete('/:postid',async(req,res,next)=>{ 
    await Post.findByIdAndDelete(req.params.postid) 
    .then((deletedPost)=>res.sendStatus(202))
    .catch(error=>{
        //console.log(error);
        res.sendStatus(400)
    })
    
})


router.put('/:postid',async(req,res,next)=>{ 
    //unpin all posts of this user
    if(req.body.pinned!==undefined){
        await Post.updateMany({postedBy:req.session.user._id},{pinned:false}) 
            .catch(error=>{
                //console.log(error);
                res.sendStatus(400)
            })
    }
    await Post.findByIdAndUpdate(req.params.postid,req.body)
    .then(()=>res.sendStatus(204)) 
    .catch(error=>{
        //console.log(error);
        res.sendStatus(400)
    })
})






async function getPosts(filter){

    var results= await Post.find(filter)
    .populate('postedBy') ////for initial/normal post form submission
    .populate('retweetData')  //for retweetBtn
    .populate('commentedPost') //for commentBtn/replyBtn
    .sort({'createdAt':-1})  //for initial/normal post form submission
    .catch(error=>console.log(error))
        
  results=await User.populate((await User.populate(results,{path:'retweetData.postedBy'})),{path:'commentedPost.postedBy'}) //ok

  return results
}

module.exports=router//exports.module=router
