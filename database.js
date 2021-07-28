const mongoose=require('mongoose')
mongoose.set('useNewUrlParser',true)
mongoose.set('useUnifiedTopology',true)
mongoose.set('useFindAndModify',false)

class MongoDBTwitterClone{
    constructor(){
        this.connect();
    }
    connect(){
        mongoose.connect("mongodb+srv://TwitterCloneClusterDBsAdminUsers:TwitterCloneClusterDBsPassWord@twitterclonecluster.r01y0.mongodb.net/myFirstTwitterCloneDatabase?retryWrites=true&w=majority")
                .then(con=>{ //console.log(con.connections)
                    console.log("hi DB connection succeed");
                }) //username:TwitterCloneClusterDBsAdminUsers
                .catch(err=>{console.log("db connection failed",err.message);}) //wrong pwd mongo atlas error authentic error

    }
}

module.exports=new MongoDBTwitterClone();


