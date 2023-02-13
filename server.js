//Import dependencies modules:
const bodyParser = require(body-parser)
const express = require('express')


//Create and Express.js instance
const app = express();

// config Express.js
app.use(express.json())
app.set('port',3000)
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
})

//connect to MongoDB
const MongoClient = require ('mongodb').MongoClient;