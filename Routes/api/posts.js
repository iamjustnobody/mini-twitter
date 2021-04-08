const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema')
const Post=require('../../ModelSchema/PostSchema')
//no need app.use(views engine pug webViews) but do need app.use.parserurlencoded

/*
router.get('/',(req,res,next)=>{  
    Post.find()
    .populate('postedBy')
    .populate('retweetData')
    .sort({'createdAt':-1})
    .then(async (data)=>{ //all posts data send populated data to home.js onload
        data=await User.populate(data,{path:'retweetData.postedBy'})
        res.status(200).send(data)
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    }) 
})*/ //ok but refactored by getPosts function so can be used for different endpoint api
//f5 reflesh
router.get('/',async (req,res,next)=>{  

    var searchObj=req.query; //profilePage onloading posts for one single user
    console.log('searchb4',searchObj)
    if(searchObj.isReply!=undefined){ //searchObj.isReply (boolean type) presented as '' 'true' 'false' in searchObj (obj type)
        var isReply=searchObj.isReply=='true' //isReply is real boolean
        searchObj.commentedPost={$exists:isReply} //isReply is real boolean
        delete searchObj.isReply
    }
    console.log('searchAfter',searchObj)

    var results=await getPosts(searchObj); //add searchObj for profilePage onloading posts just for thie partitular profileUser
    //var results=await getPosts({}); //need to await here as getPosts is async
    res.status(200).send(results)
}) //return results (or previously data) to frontend home.js getPosts for home page/pug
/*
router.get('/:id',async (req,res,next)=>{  //for showing the clicked&going2Bcommented Post on the modal
    var postId=req.params.id;
    var results=await getPosts({_id:postId}); //need to await here as getPosts is async
    //find return array; findOne just find one
    var result=results[0]
    res.status(200).send(result)
}) */ //ok but now need to 'chain' children posts that comment/reply to current parent/root post in postPage.pug 
//or populate commentedPost (grandparent's post) one level up in postPage pug
// api get('/:id') to be called in postPage.js on loading postPage.pug
router.get('/:id',async (req,res,next)=>{  
    var postId=req.params.id;
    var postData=await getPosts({_id:postId}); 
    var thisPostData=postData[0]; //may ot may not have defined commentedPost/replyTo field
    console.log("get postId",postId,typeof postId) //string
    console.log("get thisPostData.id",thisPostData.id,typeof thisPostData.id) //string
    console.log("get thisPostData._id",thisPostData._id,typeof thisPostData._id) //obj

//    thisPostData.comments=await getPosts({commentedPost:postId}) //not chain populate; just one level down populate 
    //(or one level up trace who current post replied to)

 //   var test=await getPosts({commentedPost:postId}) //return array
//    console.log(typeof thisPostData,"comments ",thisPostData.comments,"test ",test) //type obj; return arrays 
    //res.status(200).send(await thisPostData) //res.status(200).send(thisPostData)
 //   res.status(200).json({status:'success',data:{thisPostData}})
 //test or thisPostData returns mongoDoc obj NOT plain js obj 
 //so .comments field can be printed here in backend console but get lost in frontend console @postPage.js
  
 /*// 1)  
    thisPostData.set("comments",await getPosts({commentedPost:postId}),{strict:false})
    console.log(typeof thisPostData,"comments ",thisPostData.comments) //here backend shows undefined?!
    res.status(200).send(thisPostData) //due to strict false thisPostData.comments shows arrays in front end postPage.js
*/
 // 2)
    /* res.status(200).json({
        status:'success',
        data:{
        "comments":(await getPosts({commentedPost:postId})),
        ...thisPostData
        }
    })*/ //2a ok front end postPage shows commens
 //   res.status(200).send({"comments":(await getPosts({commentedPost:postId})),...thisPostData}) //2b ok front end postPage shows commens
/*    
    thisPostData={"comments":(await getPosts({commentedPost:postId})),...thisPostData}
    console.log(typeof thisPostData,"comments ",thisPostData.comments)
    //res.status(200).json({status:'success',data:{thisPostData}}) //2c1 ok both backend posts.js here console shows; postPage.js shows too
    res.status(200).send(thisPostData) //2c2 success as 2c1 above
*/
//3)
  /*   res.status(200).json({
        status:'success',
        data: Object.assign(
        {"comments":(await getPosts({commentedPost:postId}))},
        thisPostData
        )
    }) *///3a ok
  //  res.status(200).send(Object.assign({"comments":(await getPosts({commentedPost:postId}))},thisPostData)) //3b ok
 /*  thisPostData=Object.assign({"comments":(await getPosts({commentedPost:postId}))},thisPostData)
   console.log(typeof thisPostData,"comments ",thisPostData.comments)
   // res.status(200).json({status:'success',data:{thisPostData}}) //3c1 ok
   res.status(200).send(thisPostData) //3c2 ok
    */

   //2b 3b 2c2 3c2: ._doc,.comments; 2a 3a: .data.comments,.data._doc; 2c1 3c1: .data.thisPostData._id/.comments

/* //  var thisPost =Object.assign({"comments":(await getPosts({commentedPost:postId}))},thisPostData)//ok
   var thisPost = {"comments":(await getPosts({commentedPost:postId})),...thisPostData}//ok
   console.log(typeof thisPost,"comments ",thisPost.comments) //ok shown here backend postsJs
    res.status(200).json({status:'success',data:{thisPost}}) //.data.thisPost._doc/.comments //ok
   // res.status(200).send(thisPost) //.comments/._doc //ok
*/
//or find.lean
//or lastexample -> plain Js obj incl mongoDoc as field value
    var thisPost={thisPostData}
    if(thisPostData.commentedPost!==undefined){thisPost.commentedPost=thisPostData.commentedPost}
    thisPost.comments=await getPosts({commentedPost:postId})
    console.log(typeof thisPost,"comments ",thisPost.comments) //ok shows here //obj
    res.status(200).send(thisPost)  //thisPost:{thisPostData,commentedPost,comments} received in front end postPageJs
  //  res.status(200).json({status:'success',data:{thisPost}}) //.data.thisPost.{thisPostData,commentedPost,comments} reveived in postPage


}) //called in home/overall page/pug with home.js&common.js, particularly model show in common.js; 
//all fields (apartfrom commentedPost) in thisPostData passed onto modal shown fn in common .js
//._doc or .data._doc or .data.thisPostData._doc or .data.thisPost._doc in #replyModal show in common.js (outputPost fn)
//previously just return thisPostData to ModalSHow (&its outputPosts fn) in commonJs -> which now needs changing
//called by postPage.js for single postPage.pug on loading single post page; 
//all fields in thisPostData passed onto postPage.js
//.comments or .data.comments or .data.thisPostData.comments or .data.thisPost.comments in postPage.js onload (outputPostWreplies fn)
//but postPage.js use postID from postPage.pug from postRoutes.js get 'post/:postID'

//or lastexample: return thisPost or json -> .thisPostData/.commentedPost/.comments or .data..thisPostData/.commentedPost/.comments


router.post('/',async(req,res,next)=>{  ////called in home/overall page/pug on loading with home.js
/*    if(req.body.replyTo){
        console.log('req.body.replyTo',req.body.replyTo,typeof req.body.replyTo);//string
        return res.sendStatus(400)
    }*/ //testing...//for commenting on the post //submitReplyButton


    if(!req.body.textContent){ //match the sata passed in from frontend submitPostButton onclick from common.js
        console.log('Content param not sent with requests')
        return res.sendStatus(400)
    } 
    var postedData={
        content:`${req.body.textContent}`,//or just req.body.textContent both ok
        postedBy:req.session.user
    }

    if(req.body.replyTo){postedData.commentedPost=req.body.replyTo} //for submitReplyButton @modal

    Post.create(postedData) //or await Post.create
    .then(async(newPost)=>{ //newPost is the postedData
        newPost=await User.populate(newPost,{path:'postedBy'}) //!!
        console.log("newPost",newPost.id,typeof newPost.id,newPost._id,typeof newPost._id) //string obj
        res.status(201).send(newPost) //return (for next dot) opt 
        //send populated newPost to common.js for submitPostBtn
        //send populated new commentPost to common.js for submitReplyBtn
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);//return opt
    })
})

router.put('/:postid/like',async(req,res,next)=>{ 
    const id=req.params.postid;
    const userId=req.session.user._id;
    console.log('params-id',id,typeof id) //string
    console.log("user-session-_id",req.session.user._id,typeof req.session.user._id,"user-session-id",req.session.user.id,typeof req.session.user.id)
 //above: string //undefined undefined so not use req.session.user.id
    //   const user=await User.findById({_id:userId});
 //   const isLiked=user.likes&&user.likes.includes(id);
    const isLiked=req.session.user.likes&&req.session.user.likes.includes(id);
    //insert user like
  //  User.findByIdAndUpdate(userId,{$addToSet:{likes:id}})
  const option=isLiked?"$pull":"$addToSet";
 // await User.findByIdAndUpdate(userId,{[option]:{likes:id}}) //however unlike is not working 
  ////as isLiked depends on req.session.user.likes bt db's likes updated with new id//so update req.user.session 
 //  req.session.user.likes.push(id);
 //combine above two & make findbid&update returns new (NOT previous) user & add catch error
 req.session.user=await User.findByIdAndUpdate(userId,{[option]:{likes:id}},{new:true}).catch(error=>{console.log(error);res.sendStatus(400);})
console.log('afterLike',req.session.user.id,typeof req.session.user.id,req.session.user._id,typeof req.session.user._id)
//string obj 
//insert post like
   const updatedPost=await Post.findByIdAndUpdate(id,{[option]:{likes:userId}},{new:true}).catch(error=>{console.log(error);res.sendStatus(400);})
   console.log('afterLike',updatedPost.id,typeof updatedPost.id,updatedPost._id,typeof updatedPost._id)
//string obj
    res.status(200).send(updatedPost) //send data to front end press like button in common.js
})

router.post('/:postid/retweet',async(req,res,next)=>{ 
    const id=req.params.postid; //or id=`${req.params.postid}` both ok
    const userId=req.session.user._id; //or userId=`${req.session.user._id}` both ok
    console.log(id,userId)
    
   const untweetPost=await Post.findOneAndDelete({postedBy:userId,retweetData:id}) //or {postedBy:`${userId}`,retweetData:`${id}`} both ok
   .catch(error=>{console.log(error);res.sendStatus(400);});
   //return the post thats untweeted
 //  console.log('untweetPost',untweetPost)
   let retweetPost;
   if(untweetPost==null){
     retweetPost=await Post.create({postedBy:userId,retweetData:id}) //or {postedBy:`${userId}`,retweetData:`${id}`} both ok
     .catch(error=>{console.log(error);res.sendStatus(400);});
   }
//   console.log('retweetPost',retweetPost)
  const option=untweetPost!=null?"$pull":"$addToSet";
  const post=untweetPost==null?retweetPost:untweetPost  //treated as retweetPost
/*
  console.log("post._id",post._id,typeof post._id,(`${post._id}`),typeof (`${post._id}`)) //obj string
  console.log("id",id,typeof id,(`${id}`),typeof (`${id}`)) //string string
  console.log("userId",userId,typeof userId,(`${userId}`),typeof (`${userId}`)) //string string
*/
 req.session.user=await User.findByIdAndUpdate(userId,{[option]:{retweets:post._id}},{new:true}) //not retweets:retweetPost._id as retweetPost could be null
 .catch(error=>{console.log(error);res.sendStatus(400);}) //add retweetPost's id itself to user db
 //or findByIdAndUpdate(`${userId}`,{[option]:{retweets:`${post._id}`}},{new:true}) //both ok
 console.log('afterRetweet',req.session.user.id,typeof req.session.user.id,req.session.user._id,typeof req.session.user._id)
//string obj
const updatedPost=await Post.findByIdAndUpdate(id,{[option]:{retweetUsers:userId}},{new:true})
.catch(error=>{console.log(error);res.sendStatus(400);})
//return retweeted Post =findbid(id) - which is updatedPost (not retweetPost as its separate new child post)
  //or findByIdAndUpdate(`${id}`,{[option]:{retweetUsers:`${userId}`}},{new:true}) //both ok
console.log('afterRetweet',updatedPost.id,typeof updatedPost.id,updatedPost._id,typeof updatedPost._id)
//string obj

  res.status(200).send(updatedPost) //send unpopulated data to front end press re-tweet button in common.js
    //retweetData & retweetData.postedBy populated by '/posts' get (above in posts.js) when rendering
 //and it is retweetPost - childPost (not updatedPost - parentPost) that needs populating
 //so when retweet, new retweet post is not shown or append straight away as retweetPost is not res.send or populated 
 //new retweet post is not like POST '/' above (returning/populating newPost & then append html element in frontend during runtime)
 //and untweet wont make the post disappear straight away
})



router.delete('/:postid',async(req,res,next)=>{ 
    await Post.findByIdAndDelete(req.params.postid) 
    .then((deletedPost)=>res.sendStatus(202))
    .catch(error=>{
        console.log(error);
        res.sendStatus(400)
    })
    //or Post.findOneAndDelete({_id:`${req.params.postid}`}) or Post.findOneAndDelete({_id:req.params.postid})
})

async function getPosts(filter){
/*    var results= await Post.find()
    .populate('postedBy')
    .populate('retweetData')
    .sort({'createdAt':-1})
    .catch(error=>{
        console.log(error);
    //    res.sendStatus(400); //no res argument in this func & dont wanna send
    })
    .then(async (data)=>{ //all posts data send populated data to home.js onload
        data=await User.populate(data,{path:'retweetData.postedBy'})
        res.status(200).send(data) //do wanna return data
    })*///rewrittent to below
    var results= await Post.find(filter)
    .populate('postedBy') ////for initial/normal post form submission
    .populate('retweetData')  //for retweetBtn
    .populate('commentedPost') //for commentBtn/replyBtn
    .sort({'createdAt':-1})  //for initial/normal post form submission
    .catch(error=>console.log(error))
        
//    results=await User.populate(results,{path:'retweetData.postedBy'}) ////for retweetBtn //ok
  //  results=await User.populate(results,{path:'commentedPost.postedBy'}) //for commentBtn/replyBtn //ok
  //   results=await User.populate(results,{path:'retweetData.postedBy'}).populate(results,{path:'commentedPost.postedBy'}) //not ok
  results=await User.populate((await User.populate(results,{path:'retweetData.postedBy'})),{path:'commentedPost.postedBy'}) //ok

  return results
}

module.exports=router//exports.module=router