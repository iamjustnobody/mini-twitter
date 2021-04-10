const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')

//app.set("view engine",'pug'); app.set("views",`${__dirname}/webViews`) //opt //  "./webViews" , "webViews"
//app.use parser opt
//router.use(bodyParser.urlencoded({extended:false})) //opt
router.use(express.urlencoded({extended:false}))

router.get('/',(req,res,next)=>{  
    var payload={
        pageTitle:'Login'
    }
    res.status(200).render('login',payload)
})

router.post('/',async(req,res,next)=>{  
    const {logUserName,logPassword}=req.body;
    const payload={logUserName,logPassword}; //payload=req.body or payload={logUsername:req.body.logUsername,logPassword:req.body.logPassword}; 
    if(req.body.logUserName&&req.body.logPassword){//just like updateUserData in viewsController.js in INtouresting (w/o api login pug form - they need pug for submit-user-data route 
        //but they re-use account page with /submit-user-data route instead of /me route)
        //loginController/model-prehooks inside loginRoutes here
        const user=await User.findOne({
            $or:[{username:req.body.logUserName},{email:req.body.logUserName}]
        })
    /*    .then(()=>{
            console.log("Iam going to throw an error") //running
            throw new Error("iam the new error"); //carry errors through 2 to 3 (like fall to 3) or throught 2 & 3b (if no3) to catch 4 (like fall to 4)
            console.log("new error thrown") //not running
        })//1
        .then(()=>{console.log("iam still runningB")}) //2 //not running if error; running if no error
        .then(()=>{console.log("iam still runningC")},(err)=>{console.log("error reject oops catching error here",err.errorMessage)}) //3
        .then(()=>{console.log("iam still runningD")}) //3b //running if no err or err caught by 3 above
        */
        .catch(error=>{ console.log("catching error")
            console.log(error)
            payload.errorMessage="Something went wrong "+error.errorMessage
            return res.status(200).render('login',payload) //return opt as will still run below running2
        }) //4 
        //1 //1 2 4 // 1 3 4 // 4 // 123 vs 12
        if(user!=null){
            const compare=await bcrypt.compare(req.body.logPassword,user.password)
            if(compare===true){req.session.user=user;return res.redirect('/');}
        //    payload.errorMessage="incorrect password"; res.status(200).render('login',payload) //should keep ambiguous
        }
        console.log("iam still running2") // run after try/then/catch even if there's an error
        payload.errorMessage="login credentials incorrect"; return res.status(200).render('login',payload) //if not return then continue with below another res
    }
//    console.log("iam still running3") //same as runnning 2 if running 3 can be reached
    payload.errorMessage="Please make sure each field has a valid input"; res.status(200).render('login',payload)
})

module.exports=router//exports.module=router