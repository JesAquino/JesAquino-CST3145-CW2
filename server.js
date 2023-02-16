const express = require('express');

const cors = require('cors');

const dotenv = require('dotenv');

const morgan = require("morgan");

const path = require('path');

const MongoClient = require('mongodb').MongoClient;

const app = express();

dotenv.config({
	path: './config.env',
});

const uri = process.env.MONGO_URI;

const port = 3000;

MongoClient.connect('mongodb+srv://Jesuael:Password1@cluster0.fpmtkba.mongodb.net/lessons?retryWrites=true&w=majority')
	.then((client) => {
		console.log('Connected to MongoDB server');

		const db = client.db('lessondb');
		const lessons = db.collection('lessons');
        const orders = db.collection('orders');

		app.use(cors());
		app.use(express.json());
        app.use(morgan("short"));
        var fs = require("fs");

		app.get('/', (req, res) => {
			res.send('database conected!'.red);
		});

		// GET to get all lessons from the collection
		app.get('/lessons', (req, res) => {
			lessons
				.find({})
				.toArray()
				.then((result) => {
					res.status(200).json({
						success: true,
						data: result,
					});
				});
		});

        // GET to get all orders from the collection
		app.get('/orders', (req, res) => {
			orders
				.find({})
				.toArray()
				.then((result) => {
					res.status(200).json({
						success: true,
						data: result,
					});
				});
		});

        // POST for creating new lessons in lesson collection
		app.post('/lessons', (req, res) => {
			lessons
				.insertOne(req.body)
				.then((result) => {
					res.status(201).json({
						success: true,
						data: result,
					});
				})
				.catch((error) => {
					res.status(500).json({
						success: false,
						message: error.message,
					});
				});
		});

        // POST for creating new orders in orders collection
		app.post('/orders', (req, res) => {
			orders
				.insertOne(req.body)
				.then((result) => {
					res.status(201).json({
						success: true,
						data: result,
					});
				})
				.catch((error) => {
					res.status(500).json({
						success: false,
						message: error.message,
					});
				});
		});
		// PUT to udpate lesson in the collection
		app.put('/lessons', (req, res) => {
			lessons
				.findOneAndUpdate(
					{ name: req.body.name },
					{
						$set: {
							duration: req.body.duration,
						},
					},
					{ upsert: true }
				)
				.then((result) => {
					res.status(200).json({
						success: true,
						data: result,
					});
				})
				.catch((err) => {
					res.status(500).json({
						success: false,
						message: err.message,
					});
				});
		});
        // PUT to udpate orders in the collection
		app.put('/orders', (req, res) => {
			orders
				.findOneAndUpdate(
					{ name: req.body.name },
					{
						$set: {
							duration: req.body.duration,
						},
					},
					{ upsert: true }
				)
				.then((result) => {
					res.status(200).json({
						success: true,
						data: result,
					});
				})
				.catch((err) => {
					res.status(500).json({
						success: false,
						message: err.message,
					});
				});
		});
		// DELETE to delete a lesson

		app.delete('/lessons', (req, res) => {
			lessons
				.deleteOne({ name: req.body.name })
				.then((result) => {
					res.status(200).json({
						success: true,
					});
				})  
				.catch((error) => {
					res.status(500).json({
						success: false,
						message: error.message,
					});
				});
		});
        // DELETE to delete an order in the orders collection
		app.delete('/lessons', (req, res) => {
			orders
				.deleteOne({ name: req.body.name })
				.then((result) => {
					res.status(200).json({
						success: true,
					});
				})  
				.catch((error) => {
					res.status(500).json({
						success: false,
						message: error.message,
					});
				});
		});
        
        // Search functionality in lessons
    app.get('/lessons', function(req, res, next){

    req.collection.find({ subjectName: { $regex: req.params.search, $options: 'i' }}).toArray(function(err, results){
        if(err){
            return next(err);
        }
        res.send(results);
    });
    });

    // /collections/lessons/1:limit/subjectName/desc
    app.get("lessons/:max/:sortAspect/:sortAscDesc", function(req, res, next){
        
        var max = parseInt(req.params.max, 10);
        
        let sortDirection = 1;
        if (req.params.sortAscDesc === "desc"){
            sortDirection = -1;
        }

        req.collection.find({}, 
            {limit: max, sort: [[req.params.sortAspect, sortDirection]]})
            .toArray(function(err, results){
            if(err){
                return next(err);
            }
            res.send(results);
        });

    });

    

		app.listen(port, () => console.log('listening on port ' + port));
	})
	.catch(console.error);