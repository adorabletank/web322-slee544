const express = require('express');
const router = express.Router();
const Rental = require('../models/rental');

router.get('/rentals', async (req, res) => {
  // Check if user is authorized to load data
  if (!req.user || !req.user.isDataClerk) {
    res.status(401).render('error', { message: 'You are not authorized to add rentals' });
    return;
  }

  // Check if rentals already exist in the database
  const rentalsCount = await Rental.countDocuments();
  if (rentalsCount > 0) {
    res.render('message', { message: 'Rentals have already been added to the database' });
    return;
  }

  // Populate rental data
  const rentals = [
    { headline: 'Cozy house', numSleeps: 1, numBedrooms: 2, numBathrooms: 3, pricePerNight: 553.89, city: 'Toronto', province: 'Ontario', imageUrl: 'image/house1.jpg', featuredRental: true },
    { headline: 'Luxury apartment', numSleeps: 2, numBedrooms: 1, numBathrooms: 1, pricePerNight: 899.99, city: 'Toronto', province: 'Ontario', imageUrl: 'image/apartment1.jpg', featuredRental: true },
    { headline: 'Beach house', numSleeps: 4, numBedrooms: 3, numBathrooms: 2, pricePerNight: 1234.56, city: 'Vancouver', province: 'British Columbia', imageUrl: 'image/house2.jpg', featuredRental: true },
    { headline: 'Mountain cabin', numSleeps: 6, numBedrooms: 2, numBathrooms: 1, pricePerNight: 799.99, city: 'Whistler', province: 'British Columbia', imageUrl: 'image/cabin1.jpg', featuredRental: false },
    { headline: 'City apartment', numSleeps: 2, numBedrooms: 1, numBathrooms: 1, pricePerNight: 450.99, city: 'Vancouver', province: 'British Columbia', imageUrl: 'image/apartment2.jpg', featuredRental: false },
    { headline: 'Lake house', numSleeps: 8, numBedrooms: 4, numBathrooms: 3, pricePerNight: 1499.99, city: 'Muskoka', province: 'Ontario', imageUrl: 'image/house3.jpg', featuredRental: false }
  ];

  try {
    // Insert rentals into the database
    await Rental.insertMany(rentals);
    res.render('message', { message: 'Added rentals to the database' });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'An error occurred while adding rentals to the database' });
  }
});

module.exports = router;
