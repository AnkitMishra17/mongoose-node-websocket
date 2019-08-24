const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const socket = require('socket.io');
const timestamps = require('mongoose-timestamp');

const app = express();
const port = process.env.PORT || 3000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const viewsPath = path.join(__dirname, "/views");

const mongoURI = "mongodb://ankit:test123@ds347367.mlab.com:47367/task-2/";

mongoose.connect(mongoURI, {useNewUrlParser: true },()=>{
    console.log("Connected to database successful.");
});

let Randomtext = new mongoose.Schema({
  word: String,
  location: Number
});

Randomtext.plugin(timestamps);

let text = mongoose.model('text', Randomtext);

app.set('view engine', 'ejs')
app.set("views", viewsPath)

app.use('/public',express.static(path.join(__dirname, "../public")));

app.get('/', (req,res) =>{
    res.render('form');
});

app.post('/', (req,res) =>{
        res.redirect('/output');
    });

app.get('/output', (req,res) =>{
    text.find({}, (err,data)=>{
        if (err) throw err;
        res.render('output',{Output:data});
      })
});

const server = app.listen(port, (req, res) => {
    console.log(`Server started at port ${port}..`)
  });

const io = socket(server);

io.on('connection',(socket)=>{
    console.log('Socket Connection Successful',socket.id);

    socket.on('clicked', function(data){
        console.log(data);
         let newrandom = text({word: data.random, location: data.locfromstart}).save((err,data)=>{
            if (err) throw err;
            io.sockets.emit('clicked',data);
        });
    });
});
