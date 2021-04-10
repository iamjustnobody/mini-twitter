const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory


router.put('/:userid/follow',async(req,res,next)=>{  //req.session.user follows profileUserId
    const userId=req.params.userid;
    console.log("put userid follow",typeof userId,typeof `${userId}`) //string string
    const user=await User.findById({_id:userId}) //ok //better
    //const user=await User.findById({_id:`${userId}`}) //ok
    //const user=await User.findById({id:userId}) //wrong
    //const user=await User.findById({id:`${userId}`}) //wrong
    //const user=await User.findById(userId) //ok //better
    //const user=await User.findById(`${userId}`) //ok
    if(user==null) return res.sendStatus(404)
    console.log('b4Follow1',typeof req.session.user.id,typeof `${req.session.user.id}`) //undefined string
    console.log('b4Follow2',typeof req.session.user._id,typeof `${req.session.user._id}`) //string string

    const isFollowing=user.followers && user.followers.includes(req.session.user._id)
    const option=isFollowing?"$pull":"$addToSet"
    req.session.user=await User.findByIdAndUpdate(req.session.user._id,{[option]:{following:userId}},{new:true}).catch(error=>{console.log(error);res.sendStatus(400);})
////could backticks but no req.session.user.id //(`${req.session.user._id}`,{[option]:{following:`${userId}`}},{new:true})
    console.log('afterFollow1',typeof req.session.user.id,typeof `${req.session.user.id}`) //string string
console.log('afterFollow2',typeof req.session.user._id,typeof `${req.session.user._id}`) //obj string

await User.findByIdAndUpdate(userId,{[option]:{followers:req.session.user._id}}).catch(error=>{console.log(error);res.sendStatus(400);})
//or  to req.session.user.id or._id (or backticks) //(`${userId}`,{[option]:{followers:`${req.session.user.id}`}})
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
        //findById&Update: update DB; also need to update loggedinUser i.e. req.session.user

        res.sendStatus(204)
    }) //error cb fn executed after moving file; async
    //res.send(204) //executing straight away

}) //uploaded in filesystem & mongodb but not on webpage as no such route so need to create new non-api-routes (GET)

router.post('/coverPhoto',upload.single('croppedImage'), async (req,res,next)=>{
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
module.exports=router