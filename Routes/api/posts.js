const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema')
const Post=require('../../ModelSchema/PostSchema')
const Notification=require('../../ModelSchema/NotificationSchema')
//no need app.use(views engine pug webViews) but do need app.use.parserurlencoded
router.use(express.urlencoded({extended:false})); //POST

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

    //home.js: home page n=only shows the posts from people we are following
    if(searchObj.followingOnly!=undefined){
        //current user's following incl searchObj.postedBy
        //if(searchObj.followingOnly) 
        // {followingOnly:'true'} or {followingOnly:true} {followingOnly:'false'} or {followingOnly:false} @frontend home.js
        //ABOVE here shows partial & search {following: 'xx'}; 
        //if(searchObj.followingOnly==true) 
        //{followingOnly:'true'} or {followingOnly:true} {followingOnly:'false'} or {followingOnly:false} @frontend home.js
        //ABOVE here shows all & search {following: 'xx'}
        //if(searchObj.followingOnly=='true')
        //{followingOnly:'true'} or {followingOnly:true}@home.js shows partial here & search {following: 'xx'}
        //{followingOnly:'false'} or {followingOnly:false} @frontend home.js shwos all here &search {following: 'xx'}

        //REMOVE FOLLOWINGONLY OPTION FIELD -> shows all & searchObj empty obj {}

        if(searchObj.followingOnly=='true'){ //NOT ==true or empty (no equal/comparison)
            //var followingIds=req.session.user.following;
            //followingIds.push(req.session.user._id) 
            //keep adding req.session.user._id to req.session.user.following array every time reflesh the home page
            var followingIds=[]; //so every time empty the array first
            if(!req.session.user.following){ //this property does not exist; user may not have such following array
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

    //for searchPage -> search post content
    if(searchObj.search!=undefined){ //or remove var searchObj=req.query @top above (or just var searchObj) & $regex:req.query.search below
        searchObj.content={$regex:searchObj.search,$options:'i'}
        delete searchObj.search
    }
    
    //if no searchTerm i.e. searchObj={} or req.query={} => Posts.find({}) => findAll posts




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
    console.log(typeof thisPost,"comments ",thisPost.comments) //ok shows here //arrayobj; [] emptyarray if no comments
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
        console.log("newPost",newPost.id,typeof newPost.id,newPost._id,typeof newPost._id) 
        //newPost is mongodbDocObj; string obj //its like newPost being populated    


        //add notification!
        if(newPost.commentedPost!==undefined){ //if having newPost.commentedPost field
            //at the mo, newPost.commentedPost.postedBy not populated yet, newPost.commentedPost is just ObjId
            console.log('newPostcommentedPost b4 populated',newPost.commentedPost,newPost.commentedPost._id,newPost.commentedPost.id) 
            console.log(typeof newPost.commentedPost,typeof newPost.commentedPost._id,typeof newPost.commentedPost.id)
            //objId, objId, <Buffer>obj //obj obj obj
            newPost=await Post.populate(newPost,{path:'commentedPost'}) 
            //newPost.commentedPost is now an obj that has postedBy field (type of ObjId) //newPost being populated
            console.log('newPostcommentedPost after populated',newPost.commentedPost._id,newPost.commentedPost.id) //objId strId
            console.log(typeof newPost.commentedPost,typeof newPost.commentedPost._id,typeof newPost.commentedPost.id)//obj obj string
            
            console.log('comment on a post',newPost.commentedPost.postedBy,postedData.commentedPost.postedBy) //objId undefined
            console.log('newpost commentA',newPost.commentedPost.postedBy._id,typeof newPost.commentedPost.postedBy._id) //objId Obj
            console.log('newpost commentB',newPost.commentedPost.postedBy.id,typeof newPost.commentedPost.postedBy.id) //<Buffer id> Obj
        console.log('sessionUser',typeof req.session.user,req.session.user._id, typeof req.session.user._id, req.session.user.id,typeof req.session.user.id)
        //obj 66fb string undefined undefined
            await Notification.insertNotification(newPost.commentedPost.postedBy._id,req.session.user._id,"comment",newPost)//await?
            //postedData.commentedPost.postedBy undefined; 
            //could use newPost.commentedPost.postedBy or newPost.commentedPost.postedBy._id(both ok & shown as objId(obj) in newNote) 
            //populate commentedPost not populate commentedPost.postedBy
            //req.session.user/._id (both ok & shown as objId(obj) in newNote); 
            //below in follow/retweet/like
            //req.session.user/._id/.id - obj/objId(obj)/string; as req.session.user is (after await find queryobj) returned mongodbDoc Obj
            //- newNote @Notification.insertNotification shown entireObj (obj)/ObjId (obj)/ObjId (obj)
            //objId(obj type but a series of numbers/letters) for all request; 

            //newPost (not o/p as populated although returned mongodbDocObj; but MOngoObjId type in notificationSchema but other arguments mongoObjIdType) 
            //& newPost._id & newPost.id all in newNote o/p as objId
        }

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

//now add Notification when going to like or unlike
console.log('updatedPost.postedBy type',typeof updatedPost.postedBy,typeof updatedPost.postedBy._id,typeof updatedPost.postedBy.id) //all obj
console.log('updatedPost.postedBy',updatedPost.postedBy,updatedPost.postedBy._id,updatedPost.postedBy.id) 
//objId objId <BUffer Obj>
if(!isLiked){ //updatedPost.postedBy,userId/req.session._id,updatedPost.postedBy._d,req.session.user,req.session.user.id
    await Notification.insertNotification(updatedPost.postedBy,req.session.user.id,"like",updatedPost)//await?
    //lots of alternatives & combinations see below retweet
    //updatedPost.postedBy not populated so show as (unpopulated) ObjId in newNote@NotificationSchema insertNotification
    // updatedPost.postedBy (obj;not populated) or updatedPost.postedBy._id (ObjId); //both ok
    //not updatedPost.postedBy.id <Buffer >obj; updatedPost.postedBy.otherfields are undefined
    //req.session.user considered as populated mongoDBDOc obj - o/p entire obj in newNote; {a:'b',c:[d,e],createdAt:'t'}
    //could also use req.session.user._id or req.session.user.id/userId - obj or string both ok both shown as obj in newNote
    //updatedPost._id/.id o/p in newNote as objId; updatedPost also o/p as objId in newNote (as cast to entityId of mongoObjId type?but other arguments also typeMongoId also o/p entireObj)

    //(can await (insertNotification is async fn in NotificationSchema) or no await - both ok)
    //can just return create or return await create (createdmongoDocObj) in NotificationSchema - both ok
    //but difference?
}

    res.status(200).send(updatedPost) //send data to front end press like button in common.js
})

router.post('/:postid/retweet',async(req,res,next)=>{ 
    const id=req.params.postid; //or id=`${req.params.postid}` both ok
    const userId=req.session.user._id; //or userId=`${req.session.user._id}` both ok
    console.log('start retweet spi',id,typeof id, userId,typeof userId)
    
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
//string obj //its like updatedPost being populated as a field of something/obj

//now Notification
console.log('updatedPost.postedBy type',typeof updatedPost.postedBy,typeof updatedPost.postedBy._id,typeof updatedPost.postedBy.id)//obj *3
console.log('updatedPost.postedBy',updatedPost.postedBy,updatedPost.postedBy._id,updatedPost.postedBy.id) 
//updatedPost.postedBy not populated: x obj; x obj; <Buffer >obj
if(!untweetPost){
    await Notification.insertNotification(updatedPost.postedBy,req.session.user,"retweet",updatedPost)//await?
//Notification.insertNotification(a,b ,"x",d) both ok 
//a:updatedPost.postedBy / updatedPost.postedBy._id both ok but NOT updatedPost.postedBy.id  <Buffer >obj as unpopulated updatedPost.postedBy
//a:updatedPost.postedBy / updatedPost.postedBy._id both show unpopulated (i.e.ObjId) as updatedPost.postedBy not populated here above
//b:req.session.user(newNote in Notification.insertNotification shows populated entire obj) {a:'e',b:[c,d],_id:f,updatedAt:u}
//b: could also be req.session.user._id (/req.session.user.id as req.session.user is mongodbDoc Obj -considered as populated (so .id is ObjId,not bufferObj)) 
//b: but req.session.user._id (Obj type; ObjId) /or req.session.user.id (string type)  - in newNote both show as just id of obj type 
//b:or just userId
//d: updatedPost or updatedPost._id or updatedPost.id [&always show objId in newNote (as defined as objId (not obj{}) in NotificationSchema? but other arguments also typeMongoObj also o/p entireObj)]
//d: NOT post/post._id/post.id 
//updatedPost is retweetedPost; not post._id as post is the prev child retweetPost to be deleted or new child retweetPost to be posted 
//(can await (insertNotification is async fn in NotificationSchema) or no await - both ok)
    //can just return create or return await create (createdmongoDocObj) in NotificationSchema - both ok
    //but difference?
}


  res.status(200).send(updatedPost) //send unpopulated data to front end press re-tweet button in common.js
    //retweetData & retweetData.postedBy populated by '/posts' get (above in posts.js) when rendering
 //and it is retweetPost - childPost (not updatedPost - parentPost) that needs populating
 //so when retweet, new retweet post is not shown or append straight away as retweetPost is not res.send or populated 
 //new retweet post is not like POST '/' above (returning/populating newPost & then append html element in frontend during runtime)
 //and untweet wont make the post disappear straight away
})

//findById&Update: update DB; also need to update loggedinUser i.e. req.session.user

router.delete('/:postid',async(req,res,next)=>{ 
    await Post.findByIdAndDelete(req.params.postid) 
    .then((deletedPost)=>res.sendStatus(202))
    .catch(error=>{
        console.log(error);
        res.sendStatus(400)
    })
    //or Post.findOneAndDelete({_id:`${req.params.postid}`}) or Post.findOneAndDelete({_id:req.params.postid})
})



//for pinning a post or edit an/any exiting post thats postedBy self; edit properties of self's posts 
//a bit like /like & /retweet - pin/like/rewteet are all properties of one single post
//but thats for the posts thats not postedBy - related to other users' posts
//cannot modif others' posts properties - like/retweet these posts recorded (also user.findupdated) in user schema; marked the relation
//user's pinned post is one of user's posts; but user's liked/retweet posts may not be in user's posts
//so no need to User.findById&Update User schema does not have the posts (thats postedBy userself) related fields/properties
//so no need to update req.session.user -> nonapiRoutes userloggedin(Js) payload or middleware res.locals
router.put('/:postid',async(req,res,next)=>{ 
    //unpin all posts of this user
    if(req.body.pinned!==undefined){ //unpin the currently pinned post; below repin another new unpinned post; as only one pinned post at a time 
        await Post.updateMany({postedBy:req.session.user._id},{pinned:false}) //or postedBy:req.session.user._id
            .catch(error=>{
                console.log(error);
                res.sendStatus(400)
            })
    }
    await Post.findByIdAndUpdate(req.params.postid,req.body) //req.body incl pinned property; 
    //actually better to extract req.body's properties and just update these properties
    .then(()=>res.sendStatus(204)) //no return updated/pinned post here; no new true
    .catch(error=>{
        console.log(error);
        res.sendStatus(400)
    })
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