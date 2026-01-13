
const router = require("express").Router();
const Product = require("../models/Product");
const CryptoJS = require("crypto-js");
const { tokenVerificationAndAuthorization} = require("./tokenVerfication");


// Create new product an add it to the database
router.post("/", async (req,res)=>{
    const addNewProduct = new Product(req.body)
    try {
        const newAddedProduct = await addNewProduct.save();
        res.status(200).json(newAddedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
})

// Identification admin ID at the routes and updating product
router.put("/:id", async (req,res)=>{
    if (req.body.password) {
        req.body.password =  CryptoJS.AES.encrypt( req.body.password, process.env.SECRET_PASSWORD).toString();

    }
    //update product information
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,{
          $set: req.body
        },{new:true})
        res.status(200).json(updatedProduct)
    } catch (error) {
        res.status(500).json(error)
    }
})

// product deleting by admin
router.delete("/:id",async(req,res)=>{
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Your product is deleted")
    } catch (error) {
        res.status(500).json(error)
    }
})


// Get one product information by everyone
router.get("/find/:id",  async (req,res)=>{
    const productInfo = await Product.findById(req.params.id);
     try {
        res.status(200).json(productInfo)  

    } catch (err) {
        res.status(500).json(err) }
})

// Get all products by everyone
    router.get("/" , async (req,res)=>{
        const queryNew = req.query.new;
        const queryCategory = req.query.category;
        let allProducts;
        try {
            if (queryNew) {
                allProducts = await Product.find().sort({createdAt: -1}).limit(5);
            }else if (queryCategory){
                allProducts = await Product.find({
                    categories: {$in:[queryCategory],
                },
                })
            }else {
                allProducts = await Product.find();
            }
            //res.status(200);
            res.status(200).json(allProducts);
        } catch (err) {
            res.status(500).json(err);
        }


})


module.exports = router;