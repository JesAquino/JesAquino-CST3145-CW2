const express = require('express');

const cors = require('cors');

const dotenv = require('dotenv');

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

		app.use(cors());
		app.use(express.json());

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

        // save lesson into collection
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

		// udpate on lesson
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

		// delete a lesson

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

		app.listen(port, () => console.log('listening on port ' + port));
	})
	.catch(console.error);