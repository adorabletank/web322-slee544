const express = require('express');
const router = express.Router();
const rentals = require("../models/rentals-db.js");

router.get('/list', (req, res, next) => {
    if (req.session.user && req.session.user.role === 'dataClerk') {
      res.render('rentals', {rentals: rentals.getRentals()});
    } else {
      res.status(401).send('You are not authorized to view this page.');
    }
  });
  
  module.exports = router;
