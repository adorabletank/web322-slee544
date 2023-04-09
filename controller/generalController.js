const express = require('express');
const path = require("path");
const router = express.Router();
const userModel = require(path.join(__dirname,'../models/userModel'));

router.get('/', (req, res, next) => {
  res.render('home', { title: 'Home' });
});

router.get('/cart', (req, res, next) => {
  if (req.session.user && req.session.user.role === 'customer') {
    res.send('Welcome to your shopping cart!');
  } else {
    res.status(401).send('You are not authorized to view this page.');
  }
});

router.get('/sign-up', (req, res) => {
  res.render('sign-up');
});

router.post('/sign-up', async (req, res) => {
    const { fn, ln, email, pass, role } = req.body;
  
    try {
      const user = new userModel({
        fn,
        ln,
        email,
        pass,
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


