const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const UserSchema=new Schema({
    fName:{ type:String, required:[true,"first name is required"],trim:true},
    lName:{ type:String, required:[true,"last name is required"],trim:true},
    username:{ type:String, required:[true,"username is required"],trim:true,unique:true},
    email:{ type:String, required:[true,"email is required"],trim:true,unique:true},
    password:{ type:String, required:[true,"password is required"]},
    profilePic:{ type:String, default:"/images/default.jpeg"}, //inside public folder (for static files; app.use (express.static))

    coverPhoto:{ type:String},

    likes:[{type:Schema.Types.ObjectId,ref:"Post"}],
    retweets:[{type:Schema.Types.ObjectId,ref:"Post"}],
    following:[{type:Schema.Types.ObjectId,ref:"User"}],
    followers:[{type:Schema.Types.ObjectId,ref:"User"}]
},{timestamps:true})

const User=mongoose.model('User',UserSchema);
module.exports=User

