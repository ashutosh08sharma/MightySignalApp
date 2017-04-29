
/**
 * Created by Ashutosh on 4/21/2017.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var  Payment = require('../routes/schema/PaymentSchema');

mongoose.connection.on('open', function (ref) {
    console.log("Connected to Mongo Server");
});

mongoose.connection.on('error', function (err) {
    console.log("Error Occured Connecting to Mongo Server: " + err);
});

// get payment method
router.get('/getPayment',function(req, res){

    var response = {};
    console.log("Fetching Data");
    Payment.find({},function(err,payments){
        if(err){
            console.log("Error occured: " + err);
            response = {
                statusCode: 500,
                data: err
            };
        }

        else {
            response ={
                statusCode :200,
                data : payments
            };
        }
        res.send(response)
    })

});


// post end point for adding payment
router.post('/add',function(req, res){
    var jsonResponse ={};
    var newPayment = new Payment(req.body);
    console.log(newPayment);
    newPayment.save(function(err){
        if(err){
            console.log("Error Occured"+ err);
            jsonResponse ={
                statusCode: 500,
                object : err
            };
        }
        else{
            jsonResponse ={
                statusCode :200,
                object : newPayment
            };
        }
        res.send(jsonResponse);
    })
});

module.exports = router;