const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema')
const Post=require('../../ModelSchema/PostSchema')


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

module.exports=router