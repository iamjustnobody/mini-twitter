const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const chatSchema=new Schema({
    chatName:{type: String,trim:true},
    isGroupChat:{type:Boolean},//only one; wont add other users
    users:[{type:Schema.Types.ObjectId,ref:"User"}],
    latestMessage:{type:Schema.Types.ObjectId,ref:"Message"} 
    //what the latest Msg was + which chats were teh last ones to be modified
    //the chat list is ordered by the most recently active chat first (otherwise ordered by the details of another collection)
    //send Msg-> added to Msg collection; not the chat collection we're creating here so chat collection wont be affected
    //keep track of latestMsg, timestamp also updated then ordered by the most recently updated 

},{timestamps:true})


module.exports=mongoose.model('Chat',chatSchema);

