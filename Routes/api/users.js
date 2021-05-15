const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Notification=require('../../ModelSchema/NotificationSchema')

const mongoose=require('mongoose')

router.put('/:userid/follow',async(req,res,next)=>{  //req.session.user follows profileUserId
    const userId=req.params.userid; //profileUserId
    console.log("put userid follow",userId, typeof userId,typeof `${userId}`) //66ac45 string string
    const user=await User.findById({_id:userId}) //ok //better //returned mongodbDoc Obj {c:[x,y],_id:u,t:time,txt:"msg"}
    //const user=await User.findById({_id:`${userId}`}) //ok
    //const user=await User.findById({id:userId}) //wrong
    //const user=await User.findById({id:`${userId}`}) //wrong
    //const user=await User.findById(userId) //ok //better
    //const user=await User.findById(`${userId}`) //ok
    if(user==null) return res.sendStatus(404)
    console.log('b4Follow0',req.session.user.id,req.session.user._id,mongoose.Types.ObjectId(req.session.user.id),mongoose.Types.ObjectId(req.session.user._id))
    //undefined(grey) 66fbc 66ff969 66fbc
    console.log('b4Follow0b',typeof req.session.user, typeof `${req.session.user}`) //obj string
    console.log('b4Follow1',req.session.user.id,`${req.session.user.id}`) //type:undefined string; val: undefined(grey) undefined(white)
    console.log('b4Follow2',req.session.user._id,`${req.session.user._id}`) //string string 66fbc 66fbc
    console.log('b4Follow3',mongoose.Types.ObjectId(req.session.user.id),`${mongoose.Types.ObjectId(req.session.user.id)}`) //obj string 66ff970 66ff971
    console.log('b4Follow4',mongoose.Types.ObjectId(req.session.user._id),`${mongoose.Types.ObjectId(req.session.user._id)}`) //obj string 66fbc 66fbc
    //no mongoose.Types.ObjectId(`${req.session.user}`) nor mongoose.Types.ObjectId(`${req.session.user.id}`) nor mongoose.Types.ObjectId(req.session.user)
    console.log('b4Follow5b',mongoose.Types.ObjectId(`${req.session.user._id}`),typeof mongoose.Types.ObjectId(`${req.session.user._id}`)) //66fbc obj
    console.log(`${mongoose.Types.ObjectId(`${req.session.user._id}`)}`,typeof `${mongoose.Types.ObjectId(`${req.session.user._id}`)}`)//66fbc string

    const isFollowing=user.followers && user.followers.includes(req.session.user._id)
    if(user.followers){ console.log(typeof user.followers) //obj
        console.log('has followers',user.followers[1],typeof user.followers[1]);//undef undef //69fb obj (user.followers not populated)
        if(user.followers[1])console.log(user.followers[1]._id,typeof user.followers[1]._id,user.followers[1].id,typeof user.followers[1].id);
        //69fb obj <Buffer 69 fb> obj
    }
    const option=isFollowing?"$pull":"$addToSet"
    req.session.user=await User.findByIdAndUpdate(mongoose.Types.ObjectId(req.session.user._id),{[option]:{following:userId}},{new:true}).catch(error=>{console.log(error);res.sendStatus(400);})
////could backticks but no req.session.user.id //(req.session.user._id or `${req.session.user._id}`,{[option]:{following:`${userId}`}},{new:true})//ok
//`${mongoose.Types.ObjectId(req.session.user._id)}` ok mongoose.Types.ObjectId(req.session.user._id) ok `${mongoose.Types.ObjectId(`${req.session.user._id}`)}`ok
//not mongoose.Types.ObjectId(req.session.user.id) nor `${mongoose.Types.ObjectId(req.session.user.id)}` - make below null obj 
console.log(req.session.user,typeof req.session.user) //returned mongoDBDOcObj {c:[x,y],_id:u,t:time,txt:"msg"} if not null //req.session is also an obj
console.log('afterFollow0',req.session.user.id,req.session.user._id,mongoose.Types.ObjectId(req.session.user.id),mongoose.Types.ObjectId(req.session.user._id)) //all 66fbc
console.log('afterFollow1',req.session.user.id,`${req.session.user.id}`) //string string both 66fbc
console.log('afterFollow2',req.session.user._id,`${req.session.user._id}`) //obj string both 66fbc
console.log('afterFollow3',mongoose.Types.ObjectId(req.session.user.id),`${mongoose.Types.ObjectId(req.session.user.id)}`) //obj string both 66fbc
console.log('afterFollow4',mongoose.Types.ObjectId(req.session.user._id),`${mongoose.Types.ObjectId(req.session.user._id)}`)//obj string both 66fbc
console.log('afterFollow5a',mongoose.Types.ObjectId(`${req.session.user.id}`),typeof mongoose.Types.ObjectId(`${req.session.user.id}`)) //66fbc obj
console.log('afterFollow5b',mongoose.Types.ObjectId(`${req.session.user._id}`),typeof mongoose.Types.ObjectId(`${req.session.user._id}`)) //66fbc obj
//console.log('afterFollow5b',mongoose.Types.ObjectId(`${req.session.user}`))
//console.log('afterFollow5b',mongoose.Types.ObjectId(req.session.user))
console.log(`${mongoose.Types.ObjectId(`${req.session.user.id}`)}`,`${mongoose.Types.ObjectId(`${req.session.user._id}`)}`)//both 66fbc
console.log(typeof `${mongoose.Types.ObjectId(`${req.session.user.id}`)}`, typeof `${mongoose.Types.ObjectId(`${req.session.user._id}`)}`) //both of string type

//const zz=
await User.findByIdAndUpdate(userId,{[option]:{followers:`${mongoose.Types.ObjectId(`${req.session.user._id}`)}`}}).catch(error=>{console.log(error);res.sendStatus(400);})
//or  req.session.user ok; req.session.user._id ok; or.id ok; (or backticks) 
//(`${userId}`,{[option]:{followers:`${req.session.user.id}` or `${req.session.user._id}`}})
//mongoose.Types.ObjectId(req.session.user._id) ok mongoose.Types.ObjectId(req.session.user.id) ok
//mongoose.Types.ObjectId(`${req.session.user.id}`) ok mongoose.Types.ObjectId(`${req.session.user._id}`) ok 
//`${mongoose.Types.ObjectId(req.session.user._id)}` ok //`${mongoose.Types.ObjectId(req.session.user.id)}` ok
//`${mongoose.Types.ObjectId(`${req.session.user.id}`)}` ok  `${mongoose.Types.ObjectId(`${req.session.user._id}`)}` ok
    //the above all can be applied to x below; o/p same objId in newNote

    //now add Notification when following (not unfollowing)
    if(!isFollowing){
        await Notification.insertNotification(userId,req.session.user,"follow",`${mongoose.Types.ObjectId(`${req.session.user._id}`)}`)//await?
        //Notification.insertNotification(userId,y,"",x) both ok //userId shown as objId in newNote o/p
        //z:userId; if above await User.findByIdAndUpdate(userId,xx) assigned to a left const zz (zz then becomes mongodbDocObj), 
        //then z:zz.id/zz._id/zz all alright 
        //& zz will be shown as {a:'e',b:[c,d],_id:f,updatedAt:u} obj in newNote in Notification.insertNotification; whilst zz._id & z.id show ObjId
        //y:req.session.user show populated entireObj in newNote in Notification.insertNotification {a:'e',b:[c,d],_id:f,updatedAt:u} entire obj
        //y: or req.session.user._id (obj) ;or now req.session.user is mongodbDocObj so req.session.user.id (string) //all ok; just show objId in newNote
        //x:req.session.user/req.session.user._id/req.session.user.id all alright; all o/p as objId in newNote
        //(can await (insertNotification is async fn in NotificationSchema) or no await - both ok)
        //can just return create or return await create (createdmongoDocObj) in NotificationSchema - both ok
        //but difference?
    }
    
    res.status(200).send(req.session.user); //updatedUser
})


router.get('/:userid/following',async(req,res,next)=>{  
    User.findById(req.params.userid) //const xx=await & try catch (move .then outside chain)
    .populate("following")
    .then(following=>{
        res.status(200).send(following) //return opt //send back the whole obj of this profile user to F&F.js
    })
    .catch(error=>{
        console.log(error)
        res.sendStatus(400)
    })
})
router.get('/:userid/followers',async(req,res,next)=>{  
    User.findById(req.params.userid) //const xx=await & try catch (move .then outside chain)
    .populate("followers")
    .then(followers=>{
        res.status(200).send(followers) //return opt ////send back the whole obj of this profile user toF&F.js
    })
    .catch(error=>{
        console.log(error)
        res.sendStatus(400)
    })
})



const multer=require('multer');
const upload=multer({dest:"uploads/"}) //add/store images to uploads folder
const path=require("path")
const fs=require('fs')

router.post('/profilePicture',upload.single('croppedImage'), async (req,res,next)=>{
    //croppedImage is formdata property in common.js formData.append('croppedImage',blob) 
    //.single is the func on multer obj; processing single file; multiple files .array
    //get the image & add it to the location
    if(!req.file){ //req.file needs multer/upload MW
        console.log("No file uploaded with Ajax request")
        return res.sendStatus(400)
    }
    //the above steps will auto create uploads folder if not exists & then successfully store/add image inside uploads folder
    //now move images to designated location by fs
    var filePath=`/uploads/images/${req.file.filename}.png` //filename lowercase property of file obj from multer
    var tempPath=req.file.path;
    console.log('tempPath ',tempPath) //tempPath  uploads\2d9851ccf4316a3a58b03c7c65273d4a
    var targetPath=path.join(__dirname,`../../${filePath}`) //Routes/api->Routes  directory->root directory//app.js use path.join
    fs.rename(tempPath,targetPath,async error=>{
        if(error!=null){
            console.log(error)
            return res.sendStatus(400)
        } //rename error so need to manually create images folder (as indicated by filePath) first if not exists

        //update user table 
        req.session.user=await User.findByIdAndUpdate(req.session.user._id,{profilePic:filePath},{new:true}) //filePath not targetPath
        //b4 assignment: findByIdAndUpdate argument could be ._id or .id but req.session.user only has._id
        //after assignment, req.session.user is returned mongoDB Doc so has both ._id & .id
        //return obj b4 update; {new:true}-> gives obj after update
        //now req.session.user updated; session var/data to reflect updated user w newUpdated profile pic anywhere on the server if user goes to other pages 
        //PUT/PATCH request here
        //findById&Update: update DB; also need to update loggedinUser i.e. req.session.user; 
        //just like Tour proj: res.locals.user (updated user from authJs) vs twwitter proj (each non-apiRoutes payloads - updat user from req.session)
        //POST to fs; put/patch to Users mongoDB
        res.sendStatus(204)
    }) //error cb fn executed after moving file; async
    //res.send(204) //executing straight away

}) //uploaded in filesystem & mongodb but not on webpage as no such route so need to create new non-api-routes (GET)

router.post('/coverPhoto',upload.single('croppedCoverPhoto'), async (req,res,next)=>{
    //croppedImage is formdata property in common.js formData.append('croppedImage',blob) 
    //.single is the func on multer obj; processing single file; multiple files .array
    //get the image & add it to the location
    if(!req.file){ //req.file needs multer/upload MW
        console.log("No file uploaded with Ajax request")
        return res.sendStatus(400)
    }
    //the above steps will auto create uploads folder if not exists & then successfully store/add image inside uploads folder
    //now move images to designated location by fs
    var filePath=`/uploads/coverPhotos/${req.file.filename}.png` //filename lowercase property of file obj from multer
    var tempPath=req.file.path;
    console.log('tempPath ',tempPath) //tempPath  uploads\2d9851ccf4316a3a58b03c7c65273d4a
    var targetPath=path.join(__dirname,`../../${filePath}`) //Routes/api->Routes  directory->root directory//app.js use path.join
    fs.rename(tempPath,targetPath,async error=>{
        if(error!=null){
            console.log(error)
            return res.sendStatus(400)
        } //rename error so need to manually create images folder (as indicated by filePath) first if not exists

        //update user table 
        req.session.user=await User.findByIdAndUpdate(req.session.user._id,{coverPhoto:filePath},{new:true}) //fielPath not targetPath
        //b4 assignment: findByIdAndUpdate argument could be ._id or .id but req.session.user only has._id
        //after assignment, req.session.user is returned mongoDB Doc so has both ._id & .id
        //return obj b4 update; {new:true}-> gives obj after update
        //now req.session.user updated; session var/data to reflect updated user w newUpdated profile pic anywhere on the server if user goes to other pages 
        //PUT/PATCH request here
        //add coverphotofield to userSchema w/o default pic
        res.sendStatus(204)
    }) //error cb fn executed after moving file; async
    //res.send(204) //executing straight away

})



//for searching users on searchPage
router.get('/',async (req,res,next)=>{
    //const searchTerm=req.query.search //if this is not undefined
    var searchObj=req.query //or remove this line (or just var searchObj) & $regex:req.query.search below
    //{search:searchTerm} from search.js; req.query.search is a trimmed value
    console.log('user searchObj b4 search ',searchObj) //frontend search.js ensures this api route will only be called if no empty string after trimmed
    //so ensures req.query is not empty string adn has length
    if(searchObj.search!=undefined){
        searchObj={
            $or:[
                {fName:{$regex:searchObj.search,$options:'i'}}, //partial match & lower case
                {lName:{$regex:searchObj.search,$options:'i'}},
                {username:{$regex:searchObj.search,$options:'i'}}
            ]
        }
    }
    //const usrs=await User.find(searchObj)
    //res.status(200).send(usrs)
    User.find(searchObj)
    .then(results=>{
        res.status(200).send(results)
    })
    .catch(error=>{
        console.log(error)
        res.sendStatus(400)
    })
})



module.exports=router