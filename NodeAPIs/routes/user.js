
const router = require("express").Router();
const User = require("../models/USER");
const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");
dotenv.config();
const { tokenVerificationAndAuthorization} = require("./tokenVerfication");

// Identification of users by using ID in the routes and updating his information
router.put("/:id", tokenVerificationAndAuthorization, async (req,res)=>{
    if (req.body.password) {
        req.body.password =  CryptoJS.AES.encrypt( req.body.password, process.env.SECRET_PASSWORD).toString();

    }

    //update user information (username, email, password)
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id,{
          $set: req.body  
        },{new:true})
        res.status(200).json(updatedUser)
    } catch (error) {
        res.status(500).json(error)
    }
})

// User account deleting
router.delete("/:id", tokenVerificationAndAuthorization,async(req,res)=>{
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Your account is deleted")
    } catch (error) {
        res.status(500).json(error)
    }
})


// Get one user information by Admin only
// req.user.isAdmin not working ?????????????????
router.get("/find/:id" ,tokenVerificationAndAuthorization, async (req,res)=>{
    const userInfo = await User.findById(req.params.id);
    if (userInfo.isAdmin == true) {
        res.status(200).json(userInfo)  
    }else{res.status(500).json("you are not admin") } 
    
})

// Get all users information by Admin only
// req.user.isAdmin not working ?????????????????
    router.get("/" , async (req,res)=>{
        const newQuery = req.query.new;
    try {
        const users = newQuery 
        ? await User.find().sort({_id:-1}).limit(5)
        : await User.find();
        res.status(200).json(users)  
    } catch (error) {
        res.status(500).json(error) 
    } 
})

// Get user states by Admin only (mongodb aggregate method)
// req.user.isAdmin not working ?????????????????

router.get("/stats", async (req,res)=>{
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear()-1));
    try {
       const lastYearUsers =  await User.aggregate([
            { $match: { createdAt: {$gte:lastYear}}},
            { $project:
                 { month: {$month: "$createdAt"},
                },
            },
            { $group: { _id: "$month", totalQuantity: { $sum: 1 },
            }},
        ]);
        res.status(200).json(lastYearUsers);
    } catch (err) {
        res.status(500).json(err)
        
    }
})
module.exports = router;