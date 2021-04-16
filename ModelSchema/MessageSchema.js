const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const messageSchema=new Schema({
    sender:{type:Schema.Types.ObjectId,ref:"User"},
    msgContent:{type: String,trim:true},
    chat: {type:Schema.Types.ObjectId,ref:"Chat"},
    seenBy:[{type:Schema.Types.ObjectId,ref:"User"}]

},{timestamps:true})


module.exports=mongoose.model('Message',messageSchema);

