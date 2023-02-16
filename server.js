const express = require('express');

const dotenv = require ('dotenv');

const cors = require ('cors');

const path = require('path');

const MongoClient = require ('mongodb').MongoClient;

dotenv.config({
    path: './config.env',
})


//Create an Express.js instance
const app = express();

const PORT = process.env.PORT || 5000;



//Connecting to the MongoDB
const uri = process.env.MONGO_URI;

MongoClient.connect(url)
.then(client=>{
    console.log('Connected to MongoDB');

    //Selecting the Database and Collections
    const db = client.db('CW_2');
    const lesson_information = db.collection('lesson_information');

    
    app.use(cors())
    app.use(express.json())

    app.listen(PORT,()=>console.log('Server listening in port:'+PORT));
    })


    //POST or Creating records for for lesson
    app.post('lesson_information',(req,res)=>{
       CW_2.insertOne(req.body)
       .then(result=>{
        res.status(201).json({
            success:true,
        })
       })
        .catch(err=>{
            res.status(500).json({
                success:false,
            })
        })
    })

    //GET for getting all lesson information
    app.get('/lesson_information', (req, res) => {
        lesson_information
        .find({})
        .toArray()
        .then((results)=>{
            res.status(200).json({
                success:true,
                data:results,
            });
        });
    })

    .catch(error=>{
        console.log(error.mesasge);
    })
    
    


