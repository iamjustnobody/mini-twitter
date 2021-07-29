const express=require('express');
const app=express();
const port=3002;
const middleware=require('./middleware')

const mongoose=require('./database')


const server=app.listen(port,()=>{//console.log("server listenning on port"+port)
                                 return;})

const io=require('socket.io')(server,{pingTimeout:60000})
//create instance; {options}


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
const notificationRoute=require('./Routes/notificationRoutes');


//api routes
const postsApiRoute=require('./Routes/api/posts');
const { type } = require('os');
const usersApiRoute=require('./Routes/api/users');
const chatsApiRoute=require('./Routes/api/chats');
const messagesApiRoute=require('./Routes/api/messages');
const notificationsApiRoute=require('./Routes/api/notifications');



//app.use(middleware.requireLogin);


app.use("/login",loginRoute)
//app.get('/login',loginRoute) //incorrect as not merge routes paths afterwards
app.use("/register",registerRoute)
app.use("/logout",logoutRoute)
app.use("/post",postRoute)
app.use("/profile",middleware.requireLogin,profileRoute)
app.use("/uploads",uploadRoute) //"/uploads" part of filePath
app.use("/search",searchRoute) 
app.use("/messages",messagesRoute) 
app.use("/notification",notificationRoute) 


app.use("/api/posts",postsApiRoute)
app.use("/api/users",usersApiRoute)
app.use("/api/chats",chatsApiRoute)
app.use("/api/messages",messagesApiRoute)
app.use("/api/notifications",notificationsApiRoute)


app.get('/',middleware.requireLogin,(req,res,next)=>{ 
var stringify=JSON.stringify(req.session.user)
    var payload={
        pageTitle:'Home',
        userLoggedIn:req.session.user, 
        userLoggedInJs:JSON.stringify(req.session.user) 
    } 
    res.status(200).render('home',payload) 
})


io.on('connection',(clientsocket)=>{ 
    clientsocket.on("setup",userData=>{ //receive 'setup' event from frontend clientSocket.js
        
        clientsocket.join(userData._id) 
        clientsocket.emit("connected")
    })

    clientsocket.on("join room",chatRoom=> clientsocket.join(chatRoom)) 

    clientsocket.on("typing",chatRoom=> clientsocket.in(chatRoom).emit("typing")) //when user's typing in the chatroom
 
    clientsocket.on("stop typing",chatRoom=> clientsocket.in(chatRoom).emit("stop typing")) //when user stops typing in the chatroom
    
    clientsocket.on("new message",newMsg=> { 
        var chat=newMsg.chat
       // if(!chat.users) return console.log('Chat.users not defined/populated') //equals to {console.log;return;}
        chat.users.forEach(user=>{ 

            if(user._id==newMsg.sender._id) return 
            clientsocket.in(user._id).emit("message received",newMsg) 
        })
    })

    clientsocket.on("notification received",userRoom=> {
        clientsocket.in(userRoom).emit("notification received")
    })
})
