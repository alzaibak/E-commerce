const jsonWebToken = require("jsonwebtoken");

// token verification function
const tokenVerfication = (req,res,next)=>{
    const authHeader = req.headers.token;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jsonWebToken.verify(token, process.env.JWT_SECRET_KEY,(err,user)=>{
            if (err) res.status(403).json("Wrong token");
            req.user = user;
            next();
        })
    } else {
        return res.status(401).json("You are not authenticated")
    }
}

//user token with id verfication before updating the personal info in inheriting the previous function
const tokenVerificationAndAuthorization = (req,res,next) =>{
    tokenVerfication(req,res,()=>{
        if (req.user._id === req.params[':id'] || req.user._isAdmin) {
            next();
        }else{ res.status(403).json("You are not allowed to do that")}
    })
}

// admin token verfication before adding or deleting products 
//const tokenVerificationAndAdmin = (req,res,next) =>{
   // console.log(req.user)
   /// tokenVerfication(req,res,()=>{
     //   if (req.user.isAdmin) {
     //       next();
     ///   }else{ res.status(403).json("You are not admin")}
  //  })
//}

module.exports = {tokenVerfication, tokenVerificationAndAuthorization};