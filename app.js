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
//app.get('/login',loginRoute) //incorrect as not merge routes paths afterwards //get need path & cb fn w 2-3 arguments (rathen an obj
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



//app.use('/').get(middleware.requireLogin,(req,res,next)=>{ //wrong 
//app.route('/').get(middleware.requireLogin,(req,res,next)=>{ //restful - use '/' get cb -> in router & in app
app.get('/',middleware.requireLogin,(req,res,next)=>{ 
//res.status(200).send("hello")
console.log("req.sessoin.user",req.session.user,typeof req.session.user); //obj {a:'x',b:['y','z'],f:[],_id:'dd',createdAt:'tt'}
var stringify=JSON.stringify(req.session.user)
console.log("stringified user",stringify,typeof stringify);//string {"a":"x","b":["c","e"],"timeAt":"time","_id":"66fb"}
    var payload={
        pageTitle:'Home',
        userLoggedIn:req.session.user,  //for pug
        userLoggedInJs:JSON.stringify(req.session.user) //for frontend (coomon.js) client use //for pug & javascript: 
        //app.js get'/' -> main-layouts/home -> common.js/home.js
    } //payload can be replaced by res.locals in middelware & changed correspondingly in home.pug
    //payload & res.locals used in rendered 'home' page/pug
    res.status(200).render('home',payload) //base pug/page for ajax call post.js APIs & home.js (loading page) & using common.js for btn click/sbm
})


io.on('connection',(clientsocket)=>{ //cb fn
    clientsocket.on("setup",userData=>{ //receive 'setup' event from frontend clientSocket.js
        console.log('socketio setup',userData._id,typeof userData,typeof userData._id,typeof userData.id) //objId/obj string undefined
        clientsocket.join(userData._id) //user id;user joins user's own room where user will already be part of
        clientsocket.emit("connected")//send events or emit things; emit events to these rooms then everyone joins this room receives notification
        //send/emit evnet back to clientSocket.js
    })
    //clientsocket.on("join room",chatRoom=> return socket.join(chatRoom)) //from frontend chatPage.js ducment ready
    clientsocket.on("join room",chatRoom=> clientsocket.join(chatRoom)) //join new room when user's on chatpage
    //clientsocket.on("join room",chatRoom=> {socket.join(chatRoom)})
    //clientsocket.on("join room",chatRoom=> {socket.join(chatRoom);return})

    clientsocket.on("typing",chatRoom=> clientsocket.in(chatRoom).emit("typing")) //when user's typing in the chatroom
    //received from $('.inputTextbox').keydown updateTyping from chatPage.js & send back to chatPage.js onDocumentReady
    clientsocket.on("stop typing",chatRoom=> clientsocket.in(chatRoom).emit("stop typing")) //when user stops typing in the chatroom
    
    clientsocket.on("new message",newMsg=> { //chatMsg //1a&1a2; argument depending on what passed onto from sendMessage fn from chatPage frontendJs
        /*
        console.log('new message sent back from frontend chatPageJs', newMsg.chat,newMsg.chat.users) 
        //{users:['x','y'],_id:'z',lastMessage:'u'} when chat.users not populated
        //when chat.users populated {users:[{see bwlow},{see below}],_id:'z',lastMessage:'u'}
        //or {_id:'jj',updatedAt:'time',isgroup:true,a:'',users:[{a:'x',b:[],c:[Array],_id:'zz',updatedAt:'tt'},{}]}
        //when chat.users populated: [{a:'x',_id:'y',b:['z','zb'],updatedAt:'t'},{see left}] or //[{a:'x',b:['cc','dd'],f:[],createdAt:'t',_id:'6fb'},{}] arrayobj of obj
        console.log(typeof newMsg.chat,typeof newMsg.chat.users) //obj; arrayObj of string ['x','y'] when chat.users not populated
        //when chat.users populated: obj,arrayObj of obj
        console.log('chatid',newMsg.chat._id,typeof newMsg.chat._id,newMsg.chat.id,typeof newMsg.chat.id) //z string undefined undefined
        console.log('userobj',newMsg.chat.users[0],typeof newMsg.chat.users[0]) //x or y string when chat.users not populated
        //when chat.users populated, {a:'x',_id:'y',b:['z','zb'],updatedAt:'t',f:[]} obj
        console.log('userid',newMsg.chat.users[0]._id,typeof newMsg.chat.users[0]._id,newMsg.chat.users[0].id,typeof newMsg.chat.users[0].id) 
        //all4undefined when chat.users not populated//y string undefined undefined when chat.users populated
        
        console.log('senderobj',newMsg.sender,typeof newMsg.sender) //sender populated {a:'x',b:['y','z'],c:[],_id:'666fb',updatedAt:'A'} obj
        console.log('senderid',newMsg.sender._id,typeof newMsg.sender._id,newMsg.sender.id,typeof newMsg.sender.id) ///666fb string undefined undefined
        //see difference in consol o/p of newMsg in messagesJs chatPageJs appJs
        */
       //const newMsg=chatMsg.newMsg; //1a//if passed in chatMsg from sendMessage fn in chatPageJs
        var chat=newMsg.chat
        //console.log("chatid in appJs socket",chat._id,typeof chat._id,chat.id,typeof chat.id)//string undefined undefined
        if(!chat.users) return console.log('Chat.users not defined/populated') //equals to {console.log;return;}
        chat.users.forEach(user=>{ console.log("userx",user._id,typeof user._id)
            //clientsocket.in(chatMsg.chatID).emit("message received & read",newMsg) 

            if(user._id==newMsg.sender._id) return 
             //self'msg already as htmlelement appended/added onto the chat page
             //opt for in(user._id) as emit from server (from frontJs sender) not sending back to initiator/starter/sender
            //must for being in chatRoom //1a&1b; otherwise executing messageReceivedAndRead fn in clientSOcket frontendJs twice if 2users in the chatRm

            //clientsocket.in(chatMsg.chatID).emit("message received & read",chatMsg)//1a2
            //clientsocket.in(chatMsg.chatID).emit("message received & read",newMsg)//1a ok or below 1b//for all users in the chatRoom
            //clientsocket.in(chat._id).emit("message received & read",newMsg) //1b;for all users in the chatRoom
            //chatRm first (to markallmsgasRead & refreshchatbadge first) then useridRm below
            //clientsocket.in(user._id).emit("message received",chatMsg)//1a2
            clientsocket.in(user._id).emit("message received",newMsg) //1a,1b&2//for all users except the one who send msg emitting 
            //self's msg (htmlElement) also shows in or added onto other users' chat page immediately
            //details in performing 'message received' action in common clientSocketJs
        })
    })

    clientsocket.on("notification received",userRoom=> {
        console.log('usroom ',userRoom, typeof userRoom) //toUser's id string
        clientsocket.in(userRoom).emit("notification received")
    })
})
//server: installed & set up //client: make connections to soket io