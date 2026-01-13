// User login and register file 
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const user = require("../models/USER");
const JsonWebToken = require("jsonwebtoken");
// New user registration
router.post("/register", async (req, res) =>{
    const firstRegistre = new user({
        username: req.body.username,
        email: req.body.email,
        // crypting password in database
        password:  CryptoJS.AES.encrypt( req.body.password, process.env.SECRET_PASSWORD).toString(), 
 
    });
    try {
       const savedUser = await firstRegistre.save();
       res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json(error);
    }
});

// user Login (user request like typing email or username (req) server respone (res))
router.post(process.env.USER, async (req, res)=>{
    try {
                // 1. searching user in database
        const userInfo = await user.findOne({email: req.body.email});
                // 2. decrypting user password
        const decrptPAssword = CryptoJS.AES.decrypt(userInfo.password, process.env.SECRET_PASSWORD);
        const userPassword = decrptPAssword.toString(CryptoJS.enc.Utf8);
      
        if(userPassword == req.body.password && userInfo.email == req.body.email) {
            // 3. User id verification using JWT
        const verifingToken = JsonWebToken.sign(
            {
                id: user._id,
                isAdmine: user.isAdmine,
            },process.env.JWT_SECRET_KEY,{expiresIn:"3d"}
        );
        // 4. Sending user information
        res.status(200).json({userInfo, verifingToken});
        }else{
         res.status(401);
         //res.status(401).json("Wrong email or password");
        }
    } catch (error) {
        res.status(500);
        //res.status(500).json("Unexpected error produced please try again later");
    }
})

router.post(process.env.ADMIN, async (req, res)=>{
    try {
                // 1. searching user in database
        const userInfo = await user.findOne({email: req.body.email});
                // 2. decrypting user password
                if (userInfo.isAdmin === true) {
                    const decrptPAssword = CryptoJS.AES.decrypt(userInfo.password, process.env.SECRET_PASSWORD);
                    const userPassword = decrptPAssword.toString(CryptoJS.enc.Utf8);
                  
                    if(userPassword == req.body.password && userInfo.email == req.body.email) {
                        // 3. User id verification using JWT
                    const verifingToken = JsonWebToken.sign(
                        {
                            id: user._id,
                            isAdmine: user.isAdmine,
                        },process.env.JWT_SECRET_KEY,{expiresIn:"3d"}
                    );
                    // 4. Sending user information
                    res.status(200).json({userInfo, verifingToken});
                    }else{
                     res.status(401);
                     //res.status(401).json("Wrong email or password");
                    } 
                }else{
                    res.status(401).json("Your are not admin");
                }
        
    } catch (error) {
        res.status(500);
        //res.status(500).json("Unexpected error produced please try again later");
    }
})
module.exports = router;
