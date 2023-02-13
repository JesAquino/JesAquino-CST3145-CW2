const express = require('express');
//Create an Express.js instance
const app = express();

app.get('/', (req,res)=>{
    res.send("Hello");
});


app.get('/employees',(req,res)=>{
    res.send('Employees')
})

app.listen(3000);

