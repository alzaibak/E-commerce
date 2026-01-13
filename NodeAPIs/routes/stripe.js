const router  = require ("express").Router();
const express = require('express');
//app.use(express.static('public'));
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
const Order = require("../models/Order");

// This is your test secret API key.

const YOUR_DOMAIN = 'http://localhost:3000';

// Stripe payment API
router.post('/create-checkout-session', async (req, res) => {
  const products = JSON.stringify(req.body.cartItems);
  const customer = await stripe.customers.create({
   // metadata:{
      //userId: req.body.userId.toString(),
   // }
  }) 
  const line_items = req.body.cartItems.map(item=>{
    return{
      price_data: {
        currency:'EUR',
        product_data:{
          name: `${item.title} , ${item.color} , ${item.size}`,
          description: item.dec,
          images: [item.img],
        },
        unit_amount:item.price*100,
      },
      quantity: item.quantity,
    }
  })
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    shipping_address_collection: {allowed_countries: ['FR']},
    line_items,
    phone_number_collection: {
      enabled: true,
    },
    customer: customer.id,
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/cart`,
  });
  res.send({url: session.url});
  const endpointSecret = "whsec_3ac2a7fd580e1469ed8cd41594b935a5adb96d1cd67c849596f5ee3a5c923082";
//let endpointSecret;
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const payload = req.body;
  const payloadString = JSON.stringify(payload, null, 2);
  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: endpointSecret,
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
    //console.log(`Webhook Verified: `, event);
  } catch (err) {
    console.log(`Webhook Error: err.message}`);
    res.status(400).send(`Webhook Error: ${(err).message}`);
    return;
  }
  data = event.data.object;
 
  //Handle the event
  if (event.type === "payment_intent.succeeded") {
     // Create order on database
  const createOrder = async (customer,data)=>{
    const items = JSON.parse(products);
    const newOrder = new Order({
      //userId: customer.metadata.userId,
      customerId: data.customer,
      paymentIntentId : data.payment_intent,
      products:items,
      amount: data.amount,
      address: data.customer_details,
      paymentStatus: data.payment_status,
    }) 
    try {
      const savedOrder = await newOrder.save();
      //console.log(savedOrder);
    } catch (err) {
      console.log(err)
    }
  }
  
    console.log(data);
    stripe.customers.retrieve(data.customer).then((customer)=>
    {createOrder(customer,data),
      console.log("data", data);
      //console.log(customer)
  })
    .catch((err)=>console.log(err.message))
  }
  
  res.send().end();
});


});



//Strip order adding webHook

module.exports = router;