const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
var fs = require("fs");
const MongoClient = require('mongodb').MongoClient;
const morgan = require("morgan");

const app = express();

dotenv.config({
	path: './config.env',
});
app.use(express.json());
app.use(morgan("short"));
const loggerPath = path.join(__dirname, 'logger');
var staticPath = path.resolve(__dirname, "static");

const url = process.env.MONGO_URI;

const port = 3000;

    MongoClient.connect("mongodb+srv://Jesuael:Password1@cluster0.fpmtkba.mongodb.net/?retryWrites=true&w=majority")
	.then((client) => {
		console.log('connected to mongodb server');

        app.param('collectionName', function(req, res, next, collectionName){
            req.collection = db.collection(collectionName);
            return next();
        });

		const db = client.db('MyStore');
		const lessons = db.collection('lessons');

		app.use(cors());
		app.use(express.json());

		app.get('/', (req, res) => {
			res.send('database conected!'.red);
		});

        app.use(function(req, res, next){
            console.log("Incoming request: " + req.url);
            next();
        });
        
        app.get("/", function(req, res){
            res.send("select a collection e.g., /collections/lessons");
        });
/////////////////////////////////CRUD/////////////////////////////////////////////////
        // get all lessons from collection
		app.get("/collections/:collectionName", function(req, res, next){

            var collection = db.collection(String(req.params.collectionName));
          //  collection.find().toArray
            (function(err, docs) {
            console.log(JSON.stringify(docs));
            });
            collection.find({})
            .toArray()
            .then((result) => {
            res.status(200).json({
            success: true,
            data: result,
            });
            });
            });
        //Search Lessons
        app.get("/collections/:collectionName/search/:search", function(req, res, next){

            req.collection.find({ subjectName: { $regex: req.params.search, $options: 'i' }}).toArray(function(err, results){
                if(err){
                    return next(err);
                }
                res.send(results);
            });
        });
		// Create a lesson into collection
		app.post("/collections/:collectionName", (req, res) => {
			var collection = db.collection(String(req.params.collectionName));
                collection
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
		
		// udpate on lesson spaces if order is submitted
		app.put("/collections/orders/:id", async function(req, res, next){
            var collection = db.collection("orders");
            var lessonCollection = db.collection("lessons");
            // var aid = parseInt(req.params.id, 10);
            orderFlag = {"Status":"APPROVED"}
            let order = await collection.findOneAndUpdate({ _id: new ObjectId(req.params.id) },{"$set":orderFlag},{upsert:true})
                .then((ans) => {
                    console.log(ans)
                    return ans;})
                .catch((err) => {
                console.log(err);
                })
            let lesson = await lessonCollection.findOneAndUpdate({id:order.value.id},{ $inc:{ spaces: -order.value.spaces } },{upsert:true}).then((result)=>{return result;})
            console.log(lesson);
            if(lesson.lastErrorObject.n==1){
                res.status(200).json({
                    success: true,
                    data: "Avaiable Spaces are "+lesson.value.spaces,
                });
            }
            else{
                res.status(500).json({
                    success: false,
                    message: error.message,
                    });
            }
        });
				
				
      
// Delete object
app.delete('/collection/:collectionName/:id', (req,res,next)=>{
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)},
        (e,results) => {
        if (e) return next(e)
        res.send(results ? {msg: 'sucess'} : {msg: 'error'})
    })
})

// Search object
app.get('/collection/:collectionName/search/:keyword', (req, res,next) => {
    let {keyword} = req.params
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err)
        let filteredList = results.filter((lesson) => {
            return lesson.Subject.toLowerCase().match(keyword.toLowerCase()) || lesson.Location.toLowerCase().match(keyword.toLowerCase())
        });  
        res.send(filteredList)
    })
})
  
  

// File middleware
app.use(function(req,res,next) {
    var filePath = path.join(__dirname, "images", req.url);
    fs.stat(filePath, function(err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath);
        }
        else {
            next();
        }
    });
});
        app.put("/", function(req, res){
            res.send("Okay, let's update an element.");
        });
        
        app.delete("/", function(req, res){
            res.send("Are your sure? to delete an element.");
        });
        
        app.use(function(req, res){
            res.status(404).send("Resource not found!");
        });
        

		app.listen(port, () => console.log('listening on port ' + port));

        if (!fs.existsSync(loggerPath)) {
            fs.mkdirSync(loggerPath);
          }
        const loggingRequests = fs.createWriteStream(path.join(loggerPath, 'server_logs'), { flags: 'a' });

        app.use( morgan( 'combined' , { stream: loggingRequests }) );
	})
	.catch(console.error);