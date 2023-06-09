/*************************************************************************************
* WEB322 - 2231 Project
* I declare that this assignment is my own work in accordance with the Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Student Name  : Seungmoon Lee
* Student ID    : 164830218
* Course/Section: WEB322 NCC

//cyclic URL: https://defiant-crab-shorts.cyclic.app/
 //github URL: https://github.com/adorabletank/web322-slee544
**************************************************************************************/

const path = require("path");
const express = require("express");
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');
const rentals = require("./models/rentals-db.js")
const mongoose = require("mongoose");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Require controllers
const generalController = require('./controller/generalController');
const rentalsController = require('./controller/rentalsController');
// const saltRounds = 10;
// mongoose.createConnection("mongodb+srv://seung:Eurekarenton92@atlascluster.zeem57y.mongodb.net/web322_week8", { useNewUrlParser: true }, { useUnifiedTopology: true });

app.engine(".hbs", exphbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("assets"));

app.use("/", generalController);
app.use("/sign-up", generalController);
app.use("/log-in", generalController);
app.use("/welcome", generalController);
app.use("/rentals", rentalsController);




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
