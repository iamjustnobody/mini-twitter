const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') 
const Chat=require('../../ModelSchema/ChatSchema') 
const Message=require('../../ModelSchema/MessageSchema') 
const Notification=require('../../ModelSchema/NotificationSchema') 

router.get('/',async(req,res,next)=>{ 
    var selectObj={toUser:req.session.user,notificationType:{$ne:"newMessage"}} 
    if(req.query.unreadOnly!=undefined && req.query.unreadOnly=='true'){
        selectObj.opened=false; //selectObj not mongodbObj; queryObj; .opened is one of fields in NotificationSchema
    }

    
    Notification.find(selectObj)
    .populate('fromUser')
    .sort({updatedAt:-1}) //{createdAt:-1}
    .then(notifications=>{return res.status(200).send(notifications)}) //then(notfks=>res.ok(notfks))
    .catch(error=>{
        //console.log(error)
        res.sendStatus(400)
        return 
    })
    
})

router.put('/:id/markAsOpened',async(req,res,next)=>{ 
    Notification.findByIdAndUpdate(req.params.id,{opened:true})
    .then(()=>{res.sendStatus(204)})
    .catch(error=>{console.log(error);res.sendStatus(400)})
    
})

router.put('/markAsOpened',async(req,res,next)=>{ 
    Notification.updateMany({toUser:req.session.user},{opened:true}) 
    //or toUser:req.session.user._id or mongoose.Types.ObjectId(req.session.user._id) should be ok
    .then(()=>{res.sendStatus(204)})
    .catch(error=>{console.log(error);res.sendStatus(400)})
    
})


router.get('/latest',async(req,res,next)=>{
    Notification.findOne({toUser:req.session.user})
     .populate('fromUser')
     .sort({updatedAt:-1}) //{createdAt:-1} //#notificationList stack
     .then(latestNote=>{
         var temp={latestNote,size:0};latestNote=temp;latestNote.size=5;return latestNote
     })
     .then(latestNote=>res.status(200).send(latestNote)) 
     .catch(error=>{
         console.log(error)
         res.sendStatus(400)
         return
     })
     
 })

module.exports=router
