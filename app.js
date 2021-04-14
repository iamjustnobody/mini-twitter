const express=require('express');
const app=express();
const port=3002;
const middleware=require('./middleware')
/*
const mongoose=require('mongoose')
mongoose.connect("mongodb+srv://TwitterCloneClusterDBsAdminUsers:TwitterCloneClusterDBsPassWord@twitterclonecluster.r01y0.mongodb.net/myFirstTwitterCloneDatabase?retryWrites=true&w=majority")
.then(con=>{ //console.log(con.connections)
    console.log("DB connection succeed");
}) //username:TwitterCloneClusterDBsAdminUsers
.catch(err=>{console.log("db connection failed",err.message);}) //wrong pwd mongo atlas error authentic error
*/ //move to seperate file class
const mongoose=require('./database')

const server=app.listen(port,()=>{console.log("server listenning on port"+port)})


const path=require('path');

app.set("view engine",'pug')
//app.set("views",`${__dirname}/webViews`) //ok//  "/webViews" wrong, "webViews" or "./webViews" , `${__dirname}/webViews` or path join
app.set("views",path.join(__dirname,'webViews'));

app.use(express.static(path.join(__dirname,'public')));
//app.use(express.static(`${__dirname}/public`));//or 'public' or './public' (NOT '/public')

const bodyParser=require('body-parser');
//app.use(bodyParser.urlencoded({extended:false})) //opt
//app.use(express.urlencoded({extended:false})); //for submitting the form action method 
//could be placed in here or in loginRoutes & registerRoutes


const session=require('express-session')
app.use(session({
    secret:"my-super-long-super-secure-secret",
    resave:true, //force the session to be saved even when the session was not modified during the service request
    //save the session back to storage even when no session mods during request
    saveUninitialized:false //prevent it from saving the session as an initialised or taking up space
})); //then MW requiredLogin



//Routes
const loginRoute=require('./Routes/loginRoutes');
const registerRoute=require('./Routes/registerRoutes');
const logoutRoute=require('./Routes/logoutRoutes');
const postRoute=require('./Routes/postRoutes');
const profileRoute=require('./Routes/profileRoutes');
const uploadRoute=require('./Routes/uploadRoutes');
const searchRoute=require('./Routes/searchRoutes');
const messagesRoute=require('./Routes/messagesRoutes');

//api routes
const postsApiRoute=require('./Routes/api/posts');
const { type } = require('os');
const usersApiRoute=require('./Routes/api/users');
const chatsApiRoute=require('./Routes/api/chats');


//app.use(middleware.requireLogin);


app.use("/login",loginRoute)
//app.get('/login',loginRoute) //incorrect as not merge routes paths afterwards //get need path & cb fn w 2-3 arguments (rathen an obj
app.use("/register",registerRoute)
app.use("/logout",logoutRoute)
app.use("/post",postRoute)
app.use("/profile",middleware.requireLogin,profileRoute)
app.use("/uploads",uploadRoute) //"/uploads" part of filePath
app.use("/search",searchRoute) 
app.use("/messages",messagesRoute) 


app.use("/api/posts",postsApiRoute)
app.use("/api/users",usersApiRoute)
app.use("/api/chats",chatsApiRoute)



//app.use('/').get(middleware.requireLogin,(req,res,next)=>{ //wrong 
//app.route('/').get(middleware.requireLogin,(req,res,next)=>{ //restful - use '/' get cb -> in router & in app
app.get('/',middleware.requireLogin,(req,res,next)=>{ 
//res.status(200).send("hello")
console.log("req.sessoin.user",req.session.user,typeof req.session.user); //obj
var stringify=JSON.stringify(req.session.user)
console.log("stringified user",stringify,typeof stringify);//string
    var payload={
        pageTitle:'Home',
        userLoggedIn:req.session.user,  //for pug
        userLoggedInJs:JSON.stringify(req.session.user) //for frontend (coomon.js) client use //for pug & javascript: 
        //app.js get'/' -> main-layouts/home -> common.js/home.js
    } //payload can be replaced by res.locals in middelware & changed correspondingly in home.pug
    //payload & res.locals used in rendered 'home' page/pug
    res.status(200).render('home',payload) //base pug/page for ajax call post.js APIs & home.js (loading page) & using common.js for btn click/sbm
})