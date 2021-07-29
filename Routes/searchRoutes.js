const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')

router.get('/',middleware.requireLogin,(req,res,next)=>{  
    var payload=createPayload(req.session.user) //non-mongoDB Obj
    res.status(200).render('searchPage',payload) 
})
router.get('/:selectedTab',middleware.requireLogin,(req,res,next)=>{  
    var payload=createPayload(req.session.user)
    payload.selectedTab=req.params.selectedTab
    res.status(200).render('searchPage',payload) 
})

function createPayload(userLoggedIn){ //if (userLoggedIn_search) 
    return {
        pageTitle:'Search',
        userLoggedIn_search:userLoggedIn,  //then userLoggedIn_search,
        userLoggedInJs_search:JSON.stringify(userLoggedIn)
    }
}

module.exports=router;
