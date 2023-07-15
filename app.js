const express = require('express');
const mongoose = require('mongoose');

const {CONNECTION_URL} = require("./keys");



const app = express();
const PORT =  5000 




mongoose.connect(CONNECTION_URL, 
    {useNewUrlParser: true,
     useUnifiedTopology: true
    })
    mongoose.connection.on('connected',()=>{
        console.log("connected to mongoDB")
    })

    mongoose.connection.on('error',()=>{
        console.log("error connecting",error)
    })
    
require('./models/user');
require('./models/post');


app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))


app.listen(PORT, ()=> {
    console.log("server is running on", PORT)
})