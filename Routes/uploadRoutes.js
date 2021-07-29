const express=require('express');
const router=express.Router();
const User=require('../ModelSchema/UserSchema')
const bcrypt=require('bcrypt')
const middleware=require('../middleware')

const path=require('path')

router.get('/images/:path',(req,res,next)=>{ 
    res.sendFile(path.join(__dirname,`../uploads/images/${req.params.path}`))//path to image
})
// res.sendFile(path.join(__dirname,"../uploads/images/" + req.params.path))
//filePath -> targetPath in users.js; also path in mongo db
router.get('/coverPhotos/:path',(req,res,next)=>{ 
    res.sendFile(path.join(__dirname,`../uploads/coverPhotos/${req.params.path}`))//path to image
})
module.exports=router;
