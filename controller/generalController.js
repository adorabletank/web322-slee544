const express = require('express');
const path = require("path");
const fs = require('fs');
const router = express.Router();
const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const rentals = require("../models/rentals-db.js")
const bcrypt = require('bcryptjs');
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./assets/image/",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  } else {
    return cb(new Error('Not an image! Please upload an image.', 400), false);
  }
};

const signup_Schema = new mongoose.Schema({
        
  "fn": String,
  "ln": String,
  "pass": String,
  "email": { "type": String }
});

const rentalSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  numSleeps: { type: Number, required: true },
  numBedrooms: { type: Number, required: true },
  numBathrooms: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  imageUrl: { type: String, required: true },
  featuredRental: { type: Boolean, required: true }
});

const Rental = mongoose.model('Rental', rentalSchema);


mongoose.connect("mongodb+srv://seung:Eurekarenton92@atlascluster.zeem57y.mongodb.net/web322_week8", { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("Error connecting to MongoDB: " + err));


const signup = mongoose.model("signup", signup_Schema );



// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).send('You are not authorized to view this page.');
  }
 };








// Add your routes here
// e.g. app.get() { ... } 

router.get("/",(req,res)=>{
  var featured_rentals = rentals.getFeaturedRentals();
  res.render('home',{
      data: featured_rentals
  });
})




router.get("/sign-up",(req,res)=>{
  res.render('sign-up', {errorMessage: null});
})

router.post('/sign-up', async function(req, res) {
  const { fn, ln, email, pass } = req.body;

  // Check for nulls or empty values
  if (!fn || !ln || !email || !pass) {
    const regiError = 'All fields with * should be filled';
    return res.render('sign-up', { regiError, fn, ln, email, pass });
  }

  // Check for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const Eerror = 'Email format is incorrect';
    return res.render('sign-up', { Eerror, fn, ln, email, pass });
  }

  try {
    // Check if email already exists
    const existingUser = await signup.findOne({ email });
    // if (existingUser) {
    //   console.log('Email already exists:', email);
    //   return res.render('sign-up', { errorMessage: ['Email already exists.'] });
    // }

    // Create new signup document
    const newSignup = new signup({
      fn,
      ln,
      pass,
      email,
    });

    // Save to database
    await newSignup.save();

    // Send welcome email
    sgMail.setApiKey('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');
    const msg = {
      to: email,
      from: 'slee544@myseneca.ca',
      subject: 'Welcome!',
      text: 'We are happy to see you!',
      html: '<strong>We are happy to see you!</strong>',
    };
    await sgMail.send(msg);

    console.log(`Email sent to ${email}`);
    return res.redirect('/welcome');
  } catch (error) {
    console.error(`Error occurred while signing up: ${error}`);
    return res.render('sign-up', { errorMessage: ['Error occurred while signing up.'] });
  }
});
 


router.get("/log-in",(req,res)=>{
 
  res.render('log-in');
})

router.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect("/log-in");
});


router.post("/log-in", function(req, res) {
  var loginData = {
      usr: req.body.email,
      pss: req.body.pass
  }

  if(loginData.usr == "" || loginData.pss == "" ) {
      var loginError = "Please enter both email and password."
      res.render("log-in", {loginError: loginError});
  } else {
      signup.findOne({ email: loginData.usr }, ["email", "pass"]).exec().then((data) => {
          if(data) {
              bcrypt.compare(loginData.pss, data.pass).then((result) => {
                  // result === true
                  console.log(result);
                  if(result == true) {
                      if(req.body.role === "data-entry-clerk" ) {
                          req.session.admData = {
                              email: loginData.usr,
                              pass: loginData.pss
                          }
                          res.render("/layouts/cart");
                      } else { //user session
                          req.session.userData = {
                              email: loginData.usr,
                              pass: loginData.pss
                          }
                          res.render("/rentals/list");
                      }
                  } else {
                      var userError = "Sorry, you entered the wrong username and/or password";
                      res.redirect("log-in", { userError: userError, data: loginData, layout: false });
                  }
              });
          } else {
              var userError = "Sorry, the user does not exist";
              res.redirect("log-in", { userError: userError, data: loginData, layout: false });
          }
      }).catch((loginData)=>{
        res.redirect("log-in", {
            emailError: loginData.usr,
            passwordError: loginData.pss,
            data: loginData, 
            layout: false
        });
      });
  };
});






router.get('/welcome', (req, res) => {
  const headers = req.welcome;
  res.render('welcome');
});

// Add protection to routes,cart, alist


// Only allow customers to access cart
router.use('/cart', isLoggedIn, (req, res, next) => {
if (req.session && req.session.user.type === 'customer') {
  return next();
} else {
  return res.status(401).send('You are not authorized to view this page.');
}
});

// Only allow data clerks to access rental list
router.use('/rentals/list', isLoggedIn, (req, res) => {
  Rental.find().sort('headline').exec((err, rentals) => {
    if (err) {
      console.error('Error getting rental data:', err);
      res.status(500).send('Error getting rental data');
    } else {
      // Render a template that displays the rental data along with buttons for CRUD operations
      res.render('rentals_list', { rentals });
    }
  });
});

router.get("/Add", function(req, res) {
  res.render("/add", {
      title: "Rental Add Page",
      succAdded: false,
      user: req.session.user
  });
});

const upload = multer({ storage: storage, fileFilter: imageFilter });

router.post("/Add",upload.single("photo"),(req,res)=>{
  let formD = {
    headlineholder: rental[0].headline,
    numSleepsholder: meals[0].numSleeps,
    numBedroomsholder: meals[0].numBedrooms,
    numBathrooms: meals[0].numBathrooms,
    pricePerNightholder: meals[0].pricePerNight,
    cityholder: meals[0].city,
    provinceholder: meals[0].province,
    imageUrlholder: meals[0].imageUrl
};
  try{
      req.body.img = req.file.filename;
  } catch(err) {
      res.render("/add", {
          title: "Rental Add Page",
          succAdded: false,
          imgError: "This field is required",
          formD: formD,
          user: req.session.user
      });
      return;
  }
  db.validateMealAdd(req.body).then((data)=>{
      db.addMeal(data).then((meal)=>{
          res.render("/add", {
              title: "Rental Add Page",
              succAdded: true,
              user: req.session.user
          });
      }).catch((err)=>{
          console.log("Error adding Rental: " + err);
      });
  }).catch((data)=>{
      res.render("/add", {
          title: "Rental Add Page",
          succAdded: false,
          imgError: data.errors.img,
          numSleeps: data.errors.numSleeps,
          numBedrooms: data.errors.numBedrooms,
          numBathrooms: data.errors.numBathrooms,
          pricePerNight: data.errors.pricePerNight,
          city: data.errors.city,
          province: data.errors.province,
         imageUrl: data.errors.imageUrl,
          formD: formD,
          user: req.session.user
      });
  });
});

router.get("/edit", function(req, res) {
  res.render("/edit", {
      title: "Rental edit",
      user: req.session.user
  });
});

router.post("/edit", function(req, res) {
  signup.find({ headline: neededheadline })
  .exec()
  .then((returnedrental) => {
      if (returnedrental.length != 0)
          resolve(returnedrental.map(item => item.toObject()));
      else
          reject("No rental found");
  })
  .then((rental)=>{
      let formD = {
          headlineholder: rental[0].headline,
          numSleepsholder: meals[0].numSleeps,
          numBedroomsholder: meals[0].numBedrooms,
          numBathrooms: meals[0].numBathrooms,
          pricePerNightholder: meals[0].pricePerNight,
          cityholder: meals[0].city,
          provinceholder: meals[0].province,
          imageUrlholder: meals[0].imageUrl
      };
      res.render("/editInfo", {
          title: "Rental Edit Page",
          formD: formD,
          succUpdated: false,
          user: req.session.user
      });
  }).catch((err)=>{
      if(err == "No meals found") 
          res.render("/edit", {
              headline: "rental Edit Page",
              headlineholder: req.body.headline,
              headlineError: "There is no rental with such name.",
              user: req.session.user
          });
      else
          console.log(err);
  });
});

router.get('/remove', async(req, res) => {
  try {
      const rental = await Rental.findById(req.params.id);
      if (!rental) {
          return res.status(404).send('Rental not found');
      }
      res.render('remove', { rental });
  } catch (error) {
      res.status(500).send(error.message);
  }
});

router.post('/remove', async(req, res) => {
  try {
      const rental = await Rental.findById(req.params.id);
      if (!rental) {
          return res.status(404).send('Rental not found');
      }
      // Delete the rental image from your server here
      await rental.remove();
      res.redirect('/rentals');
  } catch (error) {
      res.status(500).send(error.message);
  }
});





module.exports = router;


