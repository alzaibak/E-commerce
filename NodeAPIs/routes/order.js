
const router = require("express").Router();
const Order = require("../models/Order");
const CryptoJS = require("crypto-js");
const { tokenVerfication, tokenVerificationAndAuthorization} = require("./tokenVerfication");


// add new order to the database
router.post("/", async (req,res)=>{
    const addingToOrder = new Order(req.body)
    try {
        const savedOrder = await addingToOrder.save();
        res.status(200).json(savedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
})

// changing order by admin only
router.put("/:id", async (req,res)=>{
    if (req.body.password) {
        req.body.password =  CryptoJS.AES.encrypt( req.body.password, process.env.SECRET_PASSWORD).toString();

    }
    //update cart
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id,{
          $set: req.body
        },{new:true})
        res.status(200).json(updatedOrder)
    } catch (error) {
        res.status(500).json(error)
    }
})

// order deleting by admin only
router.delete("/:id" ,async(req,res)=>{
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Your order is deleted")
    } catch (error) {
        res.status(500).json(error)
    }
})


// Get all orders for one user
router.get("/find/:userId", tokenVerificationAndAuthorization, async (req,res)=>{
    const orderInfo = await Order.findOne({userId: req.params.userId});
     try {
        res.status(200).json(orderInfo)  

    } catch (err) {
        res.status(500).json(err) }
})

// Get all orders by admin only
    router.get("/" , async (req,res)=>{
        try {
            const orders = await Order.find();
            res.status(200).json(orders);
        } catch (err) {
            res.status(500).json(err);
        }
})

// get monthly income by admin only
router.get("/income", async (req,res)=>{
const todayDate = new Date();
const lastMonth = new Date(todayDate.setMonth(todayDate.getMonth()-1));

try {
    const income = await Order.aggregate([
        {$match: {createdAt:{$gte: lastMonth}}},
        {$project:
            {   month: {$month:"$createdAt"},
                sales: "$amount",
            },
        },
        {
            $group: {_id:"$month", totalQuantity:{$sum:"$sales"}}
        },
    ])
    res.status(200).json(income);
} catch (err) {
    res.status(500).json(err);
}

})

module.exports = router;