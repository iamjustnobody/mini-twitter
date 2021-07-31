exports.requireLogin=(req,res,next)=>{
    if(req.session&&req.session.user){
    //    res.locals.userLoggedIn=req.session.user; //a
    //    res.locals.userLoggedInJs=JSON.stringify(req.session.user); //a
     //res.locals.curLoggedInUser={userLoggedIn:req.session.user,userLoggedInJs:JSON.stringify(req.session.user)} //b

        return next();
    }
    return res.redirect('/login')
}
