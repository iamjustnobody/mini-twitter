const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') 
const Post=require('../../ModelSchema/PostSchema') 
const Notification=require('../../ModelSchema/NotificationSchema')

const mongoose=require('mongoose')

router.put('/:userid/follow',async(req,res,next)=>{  //req.session.user follows profileUserId
    const userId=req.params.userid; 
    const user=await User.findById({_id:userId})
    if(user==null) return res.sendStatus(404)

    const isFollowing=user.followers && user.followers.includes(req.session.user._id)
    
    const option=isFollowing?"$pull":"$addToSet"
    req.session.user=await User.findByIdAndUpdate(mongoose.Types.ObjectId(req.session.user._id),{[option]:{following:userId}},{new:true}).catch(error=>{res.sendStatus(400);})

await User.findByIdAndUpdate(userId,{[option]:{followers:`${mongoose.Types.ObjectId(`${req.session.user._id}`)}`}}).catch(error=>{res.sendStatus(400);})

    //now add Notification when following (not unfollowing)
    if(!isFollowing){
        await Notification.insertNotification(userId,req.session.user,"follow",`${mongoose.Types.ObjectId(`${req.session.user._id}`)}`)
    }
    
    res.status(200).send(req.session.user); //updatedUser
})


router.get('/:userid/following',async(req,res,next)=>{  
    User.findById(req.params.userid) 
    .populate("following")
    .then(following=>{
        res.status(200).send(following) 
    })
    .catch(error=>{
        //console.log(error)
        res.sendStatus(400)
    })
})
router.get('/:userid/followers',async(req,res,next)=>{  
    User.findById(req.params.userid) 
    .populate("followers")
    .then(followers=>{
        res.status(200).send(followers) 
    })
    .catch(error=>{
        //console.log(error)
        res.sendStatus(400)
    })
})



const multer=require('multer');
const upload=multer({dest:"uploads/"}) //add/store images to uploads folder
const path=require("path")
const fs=require('fs')

router.post('/profilePicture',upload.single('croppedImage'), async (req,res,next)=>{
    if(!req.file){ //req.file needs multer/upload MW
        //console.log("No file uploaded with Ajax request")
        return res.sendStatus(400)
    }
    
    var filePath=`/uploads/images/${req.file.filename}.png` //filename lowercase property of file obj from multer
    var tempPath=req.file.path;
    
    var targetPath=path.join(__dirname,`../../${filePath}`) //Routes/api->Routes  directory->root directory//app.js use path.join
    fs.rename(tempPath,targetPath,async error=>{
        if(error!=null){
            //console.log(error)
            return res.sendStatus(400)
        } 

        //update user table 
        req.session.user=await User.findByIdAndUpdate(req.session.user._id,{profilePic:filePath},{new:true}) 
        res.sendStatus(204)
    }) 
})

router.post('/coverPhoto',upload.single('croppedCoverPhoto'), async (req,res,next)=>{
    if(!req.file){ 
       // console.log("No file uploaded with Ajax request")
        return res.sendStatus(400)
    }

    var filePath=`/uploads/coverPhotos/${req.file.filename}.png` //filename lowercase property of file obj from multer
    var tempPath=req.file.path;
   
    var targetPath=path.join(__dirname,`../../${filePath}`) //Routes/api->Routes  directory->root directory//app.js use path.join
    fs.rename(tempPath,targetPath,async error=>{
        if(error!=null){
            //console.log(error)
            return res.sendStatus(400)
        } //rename error so need to manually create images folder (as indicated by filePath) first if not exists

        //update user table 
        req.session.user=await User.findByIdAndUpdate(req.session.user._id,{coverPhoto:filePath},{new:true}) //fielPath not targetPath
        res.sendStatus(204)
    }) 

})



//for searching users on searchPage
router.get('/',async (req,res,next)=>{
    var searchObj=req.query 
    if(searchObj.search!=undefined){
        searchObj={
            $or:[
                {fName:{$regex:searchObj.search,$options:'i'}}, //partial match & lower case
                {lName:{$regex:searchObj.search,$options:'i'}},
                {username:{$regex:searchObj.search,$options:'i'}}
            ]
        }
    }
    
    User.find(searchObj)
    .then(results=>{
        res.status(200).send(results)
    })
    .catch(error=>{
        //console.log(error)
        res.sendStatus(400)
    })
})



module.exports=router
