exports.notFound = (req,res,next)=>{
    res.status(404).render('pageNotFound',{pageTitle:'Page Not Found N',path:'pageNotFound'});
}