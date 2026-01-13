const moongose = require("mongoose");

const ProductSchema = moongose.Schema (
    {
        title: {type:String, require:true, unique:true},
        dec: {type: String, require:true},
        img: {type:String, require:true},
        categories: {type:Array},
        size: {type:Array},
        color: {type:Array},
        price: {type:Number, require:true},
        inStoke: {type:Boolean}
    },
    { timestamps:true},
);

module.exports = moongose.model('product', ProductSchema);