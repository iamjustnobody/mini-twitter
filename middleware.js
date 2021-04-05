exports.requireLogin=(req,res,next)=>{
    if(req.session&&req.session.user){
    //    res.locals.userLoggedIn=req.session.user; //a
    //    res.locals.userLoggedInJs=JSON.stringify(req.session.user); //a
     //res.locals.curLoggedInUser={userLoggedIn:req.session.user,userLoggedInJs:JSON.stringify(req.session.user)} //b
       //a or b ok; 
       //replacing payload in nextMW (get '/') in app.js & res.locals (just like payload) used in rendered pug Home (se app.js '/' get)
        return next();
    }
    return res.redirect('/login')
}