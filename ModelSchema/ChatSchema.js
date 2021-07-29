const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const chatSchema=new Schema({
    chatName:{type: String,trim:true},
    isGroupChat:{type:Boolean},//only one; wont add other users
    users:[{type:Schema.Types.ObjectId,ref:"User"}],
    latestMessage:{type:Schema.Types.ObjectId,ref:"Message"}  

},{timestamps:true})


module.exports=mongoose.model('Chat',chatSchema);

