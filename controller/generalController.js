const express = require('express');
const path = require("path");
const router = express.Router();
const userModel = require(path.join(__dirname,'../models/userModel'));

router.get('/', (req, res) => {
    var featured_rentals = rentals.getFeaturedRentals();
    res.render('home', {
        data: featured_rentals
    });
});

router.post('/sign-up', async (req, res) => {
    const { firstName, lastName, username, password, role } = req.body;
  
    try {
      const user = new userModel({
        firstName,
        lastName,
        username,
        password,
        role
      });
  
      await user.save();
  
      res.redirect('/welcome');
    } catch (error) {
      console.error(error);
      res.render('sign-up', { errorMessage: 'An error occurred while creating your account.' });
    }
  });

router.get('/log-in', (req, res) => {
    res.render('log-in');
});

router.get('/welcome', (req, res) => {
    res.render('welcome');
});

module.exports = router;

