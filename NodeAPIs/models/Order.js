const moongose = require("mongoose");

const CartSchema = moongose.Schema (
    {
        userId: {type:String},
        customerId: {type:String},
        paymentIntentId: {type:String},
        products:[
            {
                productId: {type:String},
                title: {type:String},
                color: {type:String},
                size: {type:String},
                price: {type:String},
                quantity: {type:String},
                quantity: {type:Number, default:1,}
            }
        ],
        amount: {type:Number, require:true},
        address: {type:Object},
        status: {type:String,default:"En cours"},
        paymentStatus: {type:String}

},
    { timestamps:true},
);

module.exports = moongose.model('order', CartSchema);