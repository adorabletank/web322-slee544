/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Seungmoon Lee
* Student ID    : 164830218
* Course/Section: WEB322 NCC
*
**************************************************************************************/

const path = require("path");
const express = require("express");
const exphbs = require('express-handlebars');
const { dirname } = require("path");
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const rentals = require("./models/rentals-db.js")
const mongoose = require("mongoose");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');
// Require controllers
const generalController = require('./controller/generalController');
const rentalsController = require('./controller/rentalsController');
// const saltRounds = 10;
// mongoose.createConnection("mongodb+srv://seung:Eurekarenton92@atlascluster.zeem57y.mongodb.net/web322_week8", { useNewUrlParser: true }, { useUnifiedTopology: true });

const signup_Schema = new mongoose.Schema({
        
    "fn": String,
    "ln": String,
    "pass": String,
    "email": { "type": String }
});

mongoose.connect("mongodb+srv://seung:Eurekarenton92@atlascluster.zeem57y.mongodb.net/web322_week8", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB: " + err));

// signup_Schema.pre('save', function(next) {
//     let user = this;
//     if (!user.isModified('pass')) return next();
//     bcrypt.genSalt(saltRounds, function(err, salt) {
//         if (err) return next(err);
//         bcrypt.hash(user.pass, salt, function(err, hash) {
//             if (err) return next(err);
//             user.pass = hash;
//             next();
//         });
//     });
// });

const signup = mongoose.model("signup", signup_Schema );

    // Add session middleware
    app.use(session({
        secret: 'mySecretKey',
        resave: false,
        saveUninitialized: false
    }));
  
  // Middleware to check if user is logged in
  const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      return res.status(401).send('You are not authorized to view this page.');
    }
   };

    app.engine('.hbs', exphbs.engine({ 
        extname: ".hbs",
        defaultLayout: "main" 
    }));
    app.set('view engine', '.hbs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());




app.use(express.static(path.join(__dirname,"/assets")));

// Add your routes here
// e.g. app.get() { ... } 

app.get("/",(req,res)=>{
    var featured_rentals = rentals.getFeaturedRentals();
    res.render('home',{
        data: featured_rentals
    });
})


app.get("/rentals",(req,res)=>{
    const headers = req.rentals;
    var grouped_rental = rentals.getRentalsByCityAndProvince();
    res.render('rentals', {
        data: grouped_rental
    });
})



app.get("/sign-up",(req,res)=>{
    res.render('sign-up', {errorMessage: null});
})

app.post("/sign-up", async function(req, res){
    const { fn, ln, email, pass } = req.body;

    // Check for nulls or empty values
    if(req.body.fn == "" || ln == "" || email == "" || pass == "")
    {
        var regiError = "The field with * should be entered!!!";
        res.render("sign-up", { regiError});
        return;
    }

    // Check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.email && !emailRegex.test(req.body.email)) {
        var Eerror = "Email format is wrong"
        res.render("sign-up", {Eerror});
    }else{

        // Check if email already exists
        const existingUser = await signup.findOne({ email });
        if (existingUser) {
            // User already exists
            console.log("Email already exists:", email);
            res.render('sign-up', { errorMessage: ['Email already exists.']});
            return;
        }

        // Create new signup document
        const newSignup = new signup({
            fn,
            ln,
            pass,
            email
        });
    
        // Save to database
        newSignup.save()
        .then(result => {
            console.log("Signup saved successfully to database.");
            const message = {
                to: email,
                from: 'slee544@myseneca.ca',
                subject: 'Welcome to My App',
                text: `Hello ${fn}, welcome to My App!`,
            };
            sgMail.send(message)
            .then(() => {
                console.log(`Email sent to ${email}`);
                res.redirect('/welcome');
            })
            .catch(error => {
                console.error(`Error sending email to ${email}: ${error}`);
                res.redirect('/welcome');
            });
        })
        .catch(err => {
            console.log("Error saving signup to database:", err);
            res.render('sign-up', {errorMessage: ['Error saving signup to database.']});
        });
    }
});



app.get("/log-in",(req,res)=>{
   
    res.render('log-in');
})

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/login");
  });

app.post("/log-in", function(req, res){

    var loginData = {
        usr: req.body.email,
        pss: req.body.pass
    }

    if(loginData.usr == "" || loginData.pss == "" )
    {
        var loginError = "The username and the password should be entered!!!";
        res.render("log-in", { loginError: loginError, data: loginData, layout: false });
    }
    else
    {
        signup.findOne({ email: loginData.usr}, [ "email", "pass"]).exec().then((data) =>{
            if(data) {
                bcrypt.compare(loginData.pass, data.pass).then((result) => {
                    // result === true
                    console.log(result);
                    if(result == true) {
                        if(req.body.role === "data-entry-clerk" ) 
                        {
                            req.session.admData = {
                                username: loginData.usr,
                                password: loginData.pss
                            }
                            res.render("/layouts/cart");
                        }
                        else //user session
                        {
                            req.session.userData = {
                                username: loginData.usr,
                                password: loginData.pss
                            }
                            res.render("/rentals/list");
                        }
                    }
                    else
                    {
                        var userError = "Sorry, you entered the wrong username and/or password";
                        res.render("log-in");
                    }
                });
            }
            else {
                var userError = "Sorry, the user does not exist";
                res.render("log-in", {userError: userError, data: loginData, layout: false});
            }
        });
    }

});



app.get('/welcome', (req, res) => {
    const headers = req.welcome;
    res.render('welcome');
});

// Add protection to routes
app.get('/cart', isLoggedIn, customerController.showCart);
app.get('/rentals/list', isLoggedIn, dataClerkController.showRentalList);

// Only allow customers to access cart
app.use('/cart', isLoggedIn, (req, res, next) => {
  if (req.session && req.session.user.type === 'customer') {
    return next();
  } else {
    return res.status(401).send('You are not authorized to view this page.');
  }
});

// Only allow data clerks to access rental list
app.use('/rentals/list', isLoggedIn, (req, res, next) => {
  if (req.session && req.session.user.type === 'dataClerk') {
    return next();
  } else {
    return res.status(401).send('You are not authorized to view this page.');
  }
});



// // Set base URLs for controllers
// app.use('/', generalController);
// app.use('/rentals', rentalsController);


// *** DO NOT MODIFY THE LINES BELOW ***

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("Something broke!")
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
  
// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);




