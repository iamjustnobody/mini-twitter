const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const NotificationSchema=new Schema({
    toUser:{type:Schema.Types.ObjectId,ref:"User"},
    fromUser:{type:Schema.Types.ObjectId,ref:"User"},
    notificationType:String,
    opened:{type:Boolean,default:false},//no default - not specify the fields - no this field exists
    entityId:Schema.Types.ObjectId
},{timestamps:true})

NotificationSchema.statics.insertNotification=async (toUser,fromUser,notificationType,entityID)=>{ 
    //static (no instance) bind to class
    var data={toUser,fromUser,notificationType,entityId:entityID}
    await Notification.deleteOne(data).catch(error=>{console.log(error)})
    const newNote=await Notification.create(data).catch(error=>console.log(error))
    console.log('NewNote.toUser',newNote.toUser,'newNote.fromUser',newNote.fromUser,'newNote.entityId',newNote.entityId)
    //could be just objId or entire obj
    console.log(typeof newNote.toUser,typeof newNote.fromUser, typeof newNote.entityId)//all obj
   return newNote
   // return Notification.create(data).catch(error=>console.log(error)) //return or return await - both ok
    //or return await Notification.create(data).catch(error=>console.log(error)) 
    //Notification is the var thats defined as const below
}

const Notification=mongoose.model('Notification',NotificationSchema);
module.exports=Notification

