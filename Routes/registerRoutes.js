const express=require('express');
const router=express.Router();

const bodyParser=require('body-parser');

//app.set("view engine",'pug'); app.set("views",`${__dirname}/webViews`) //opt //  "./webViews" , "webViews"
router.use(bodyParser.urlencoded({extended:false}))//opt*2
//router.use(express.urlencoded({extended:false}));//opt

const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')

router.route('/')
.get((req,res)=>{ 
    var payload={
        pageTitle:'Register'
    }
    res.status(200).render('register',payload)
})
.post(async(req,res)=>{ 
    
    const {firstName,lastName,username,email,password}=req.body;
    const first_name=firstName.trim();
    const last_name=lastName.trim();
    const user_name=username.trim();
    const user_email=email.trim();

    const payload={firstName,lastName,username,email} 

    if(first_name&&last_name&&user_name&&user_email&&password){ 
        const user=await User.findOne({
            $or:[{username},{email}]
        })
        .catch(error=>{
            //console.log(error)
            payload.errorMessage="Something went wrong "+error.errorMessage
            res.status(200).render('register',payload)
        })

        if(user==null){
            //no user found
            const pwd=await bcrypt.hash(password,10)
            User.create({fName:first_name,lName:last_name,username:user_name,email:user_email,password:pwd})
            .then(newuser=>{//console.log(newuser);
                            req.session.user=newuser;return res.redirect('/')}) //root level of site '/' -> render home page app.js
        }
        else{ //user found
            if(email===user.email){
                payload.errorMessage="Email already exists"
            }
            else {payload.errorMessage="User already exists"}
            res.status(200).render('register',payload)
        }

    }else{
        payload.errorMessage="Make sure each field has a valid value!"
        res.status(200).render('register',payload)
    }
})

module.exports=router//exports.module=router
