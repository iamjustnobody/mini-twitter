const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const PostSchema=new Schema({
    content:{ type:String,trim:true}, //not required when retweet
    postedBy:{type:Schema.Types.ObjectId,ref:"User"},
    pinned:Boolean,
    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
    retweetUsers:[{type:Schema.Types.ObjectId,ref:"User"}],  //follower //like likes
    retweetData:{type:Schema.Types.ObjectId,ref:"Post"}, //should be retweetedData/Post //parentPost //like content
    commentedPost:{type:Schema.Types.ObjectId,ref:"Post"} //parentPost
},{timestamps:true})

const Post=mongoose.model('Post',PostSchema);
module.exports=Post

