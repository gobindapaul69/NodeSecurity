//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

console.log(process.env.API_KEY);

/***DB setup */
const dbName = "useDB";
mongoose.connect("mongodb://localhost:27017/"+dbName, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on("connected", 
()=>{console.log("Mongoose is connected");    
});
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//const secret = "Thisorlittlesecret.";
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const UserModel = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){

    const newUser = new UserModel({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets");
        }
    });

});

app.post("/login", function(req, res){

    const username = req.body.username;
    const passwrd = req.body.password;

    UserModel.findOne({email:username}, function(err, foundUser){
        if(err){
            console.log(err);
            res.render("login");
        }else{
            if(foundUser){
                if(foundUser.password===passwrd){
                    res.render("secrets");
                }
            }
        }
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});