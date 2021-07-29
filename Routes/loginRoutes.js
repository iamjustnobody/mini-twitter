const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')


router.use(express.urlencoded({extended:false}))

router.get('/',(req,res,next)=>{  
    var payload={
        pageTitle:'Login'
    }
    res.status(200).render('login',payload)
})

router.post('/',async(req,res,next)=>{  
    const {logUserName,logPassword}=req.body;
    const payload={logUserName,logPassword}; 
    if(req.body.logUserName&&req.body.logPassword){
        const user=await User.findOne({
            $or:[{username:req.body.logUserName},{email:req.body.logUserName}]
        })
        .catch(error=>{
            payload.errorMessage="Something went wrong "+error.errorMessage
            return res.status(200).render('login',payload) 
        }) 
        if(user!=null){
            const compare=await bcrypt.compare(req.body.logPassword,user.password)
            if(compare===true){req.session.user=user;return res.redirect('/');}
        }
        
        payload.errorMessage="login credentials incorrect"; return res.status(200).render('login',payload) 
    }
    payload.errorMessage="Please make sure each field has a valid input"; res.status(200).render('login',payload)
})

module.exports=router
