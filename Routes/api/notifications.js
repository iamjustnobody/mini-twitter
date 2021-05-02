const express=require('express');
const router=express.Router();
const User=require('../../ModelSchema/UserSchema') // Routes/api->Routes  directory->root directory
const Post=require('../../ModelSchema/PostSchema') //Routes/api->Routes  directory->root directory
const Chat=require('../../ModelSchema/ChatSchema') //Routes/api->Routes  directory->root directory
const Message=require('../../ModelSchema/MessageSchema') 
const Notification=require('../../ModelSchema/NotificationSchema') 


//const middleware=require('../../middleware'); router.use(middleware.requireLogin) //opt //better to have


router.get('/',async(req,res,next)=>{ 
   // Notification.find({toUser:req.session.user,notificationType:{$ne:"newMessage"}})
   //.xxx
    //req.session.user._id(string) ok or req.session.user(obj)
    //above ok but now need to add options to count the unread/unseen messages badges
    var selectObj={toUser:req.session.user,notificationType:{$ne:"newMessage"}} 
    if(req.query.unreadOnly!=undefined && req.query.unreadOnly=='true'){
        selectObj.opened=false; //selectObj not mongodbObj; queryObj; .opened is one of fields in NotificationSchema
    }

    
    Notification.find(selectObj)
    .populate('fromUser')
    .sort({updatedAt:-1}) //{createdAt:-1}
    .then(notifications=>{return res.status(200).send(notifications)}) //return opt=>{res.status(200).send(notifications)}
    // =>{return xx} <=> =>xx; =>{yy;return} <=> =>yy ; =>{zz;} <=> =>zz 
    .catch(error=>{
        console.log(error)
        res.sendStatus(400)
        return //return opt
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
         //var temp={latestNote,size:0};temp.size=3;return temp
         var temp={latestNote,size:0};latestNote=temp;latestNote.size=5;return latestNote
         //[return;] is like if there's no [return;](opt)
         //-> will continue next then but argument in next then is undefined as no return val from this then
     })
     //.then(latestNote=>{console.log(latestNote.size);return res.status(200).send(latestNote)}) //ok
     //=>{return res.status(200).send(latestNote)} return opt, (unlike if(){return res} return res)
     //i.e.=>{res.status(200).send(latestNote)}; or =>{res.status(200).send(latestNote);return}
     // =>{return xx} <=> =>xx; =>{yy;return} <=> =>yy ; =>{zz;} <=> =>zz 
     .then(latestNote=>res.status(200).send(latestNote)) //ok
     .catch(error=>{
         console.log(error)
         res.sendStatus(400)
         return //return opt
     })
     
 })

module.exports=router