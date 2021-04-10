const express=require('express');
const router=express.Router();

const bodyParser=require('body-parser');

//app.set("view engine",'pug'); app.set("views",`${__dirname}/webViews`) //opt //  "./webViews" , "webViews"
router.use(bodyParser.urlencoded({extended:false}))//opt*2
//router.use(express.urlencoded({extended:false}));//opt

const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')

/*
router.get('/',(req,res,next)=>{  //or restful api router.route('/'),get(cb fn rr or rrn); not router/route.use('/').get(cb)
    var payload={
        pageTitle:'Register'
    }
    res.status(200).render('register',payload)
})
router.post('/',(req,res,next)=>{  //or restful api router.route('/'),get(cb fn rr or rrn); not router/route.use('/').get(cb)
    var payload={
        pageTitle:'Register'
    }
    res.status(200).render('register',payload)
})*/ //next opt due to res

router.route('/')
.get((req,res)=>{ 
    var payload={
        pageTitle:'Register'
    }
    res.status(200).render('register',payload)
})
.post(async(req,res)=>{ 
    console.log(req.body); //output the name in the form
    //value = fistName lastName username email (the name value) in register.pug
    const {firstName,lastName,username,email,password}=req.body;
    const first_name=firstName.trim();
    const last_name=lastName.trim();
    const user_name=username.trim();
    const user_email=email.trim();

    //const payload=req.body; //all fields & no trimmed i/p data //remain untrimmed values in the fields that have 'value' in register.pug
    const payload={firstName,lastName,username,email} //select some fields; none trimmed ////remain untrimmed values in the fields that have 'value' in register.pug
    //const payload={first_name,last_name,user_name,user_email} //select & trim some fields //all blank no values after submit unless chaning in register.pug value=firstName to `${first_name}`
    //const payload={firstName:first_name,lastName:last_name,username:user_name,email:user_email} //remain trimmed values in the fields that have 'value' in register.pug
    

/*
    var {firstName,lastName,username,email,password}=req.body;
    firstName=firstName.trim();lastName=lastName.trim(); username=username.trim();email=email.trim();
    //const payload=req.body; //remain untrimmed values in the fields that have 'value' in register.pug
    const payload={firstName,lastName,username,email} ////remain trimmed values in the fields that have 'value' in register.pug
    //const payload={fn:firstName,ln:lastName,un:username,e:email}//all blank in the input fields undefined/null values unless chaning in register.pug value=firstName to `${fn}`
*/


    //if(firstName&&lastName&&username&&email&&password){ //trimmed values apart from password
    if(first_name&&last_name&&user_name&&user_email&&password){ //trimmed values apart from password
        const user=await User.findOne({
            $or:[{username},{email}]
        })
        .catch(error=>{
            console.log(error)
            payload.errorMessage="Something went wrong "+error.errorMessage
            res.status(200).render('register',payload)
        })

        if(user==null){
            //no user found
            const pwd=await bcrypt.hash(password,10)
            User.create({fName:first_name,lName:last_name,username:user_name,email:user_email,password:pwd})
            .then(newuser=>{console.log(newuser);req.session.user=newuser;return res.redirect('/')}) //root level of site '/' -> render home page app.js
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