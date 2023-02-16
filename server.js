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

		const loggerPath = path.join(__dirname, 'logger');
    var staticPath = path.resolve(__dirname, "static");
    app.use("/images", express.static(staticPath));

app.use(cors());

app.use(morgan("short"));

app.use(express.json());

app.param('collectionName', function(req, res, next, collectionName){
    req.collection = db.collection(collectionName);
    return next();
});


app.use(function(req, res, next){
    console.log("Incoming request: " + req.url);
    next();
});

app.get("/", function(req, res){
    res.send("select a collection e.g., /collections/lessons");
});


// All Lessons
app.get("/collections/:collectionName", function(req, res, next){
    req.collection.find({}).toArray(function(err, results){
        if(err){
            return next(err);
        }
        res.send(results);
    });
});

// Search Lessons
app.get("/collections/:collectionName/search/:search", function(req, res, next){

    req.collection.find({ subjectName: { $regex: req.params.search, $options: 'i' }}).toArray(function(err, results){
        if(err){
            return next(err);
        }
        res.send(results);
    });
});

// /collections/lessons/1:limit/subjectName/desc
app.get("/collections/:collectionName/:max/:sortAspect/:sortAscDesc", function(req, res, next){
    
    var max = parseInt(req.params.max, 10);
    
    let sortDirection = 1;
    if (req.params.sortAscDesc === "desc"){
        sortDirection = -1;
    }

    req.collection.find({}, {limit: max, sort: [[req.params.sortAspect, sortDirection]]}).toArray(function(err, results){
        if(err){
            return next(err);
        }
        res.send(results);
    });

});

// const ObjectId = require('mongodb').ObjectId;
app.get("/collections/:collectionName/:id", function(req, res, next){
    
    var id = parseInt(req.params.id, 10);

    req.collection.findOne({ id: id}, function(err, results){
    // req.collection.findOne({ id: new ObjectId(req.params.id)}, function(err, results){
        if(err){
            return next(err);
        }
        res.send(results);
    });
});

// Inserting Lesson - Api POST Methods
app.post("/collections/:collectionName", function(req, res, next){
    // req.body
    req.collection.insertOne(req.body, function(err, results){
    if(err){
        return next(err);
    }
    res.send(results);
    });
});

// Delete By new ObjectId(req.params.id) ID - Api
const ObjectId = require('mongodb').ObjectId;
app.delete("/collections/:collectionName/:id", function(req, res, next){
    req.collection.deleteOne(
        { _id: new ObjectId(req.params.id)}, function(err, result){
        if(err){
            return next(err);
        }else{
            res.send((result.deletedCount = 1) ? {msg: "success!!"} : {msg: "error"});    
        }
    });
});

// Delete Api
app.delete("/collections/:collectionName/lesson/:id", function(req, res, next){

    var id = parseInt(req.params.id, 10);

    req.collection.deleteOne(
        { id: id}, function(err, result){
        if(err){
            return next(err);
        }else{
            res.send((result.deletedCount = 1) ? {msg: "success!!"} : {msg: "error"});    
        }
    });
});

// Update
app.put("/collections/:collectionName/:id", function(req, res, next){
    var id = parseInt(req.params.id, 10);
    req.collection.updateOne({id: id},
    {$set: req.body},
    {safe: true, multi: false}, function(err, result){
    if(err){
        return next(err);
    }
    res.send((result.matchedCount === 1) ? {msg: "Updated Lesson"} : {msg: "error"});    
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




if (!fs.existsSync(loggerPath)) {
  fs.mkdirSync(loggerPath);
}

const loggingRequests = fs.createWriteStream(path.join(loggerPath, 'server_logs'), { flags: 'a' });

app.use( morgan( 'combined' , { stream: loggingRequests }) );

    

		app.listen(port, () => console.log('listening on port ' + port));
	})
	.catch(console.error);