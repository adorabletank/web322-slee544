var rentals = [
    {
        headline: "Cozy house",
        numSleeps: 1,
        numBedrooms: 2,
        numBathrooms: 3,
        pricePerNight: 553.89,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "image/house1.jpg",
        featuredRental: true,
    },
    {
        headline: "wow house",
        numSleeps: 2,
        numBedrooms: 3,
        numBathrooms: 4,
        pricePerNight: 300.00,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "image/house2.jpg",
        featuredRental: true,
    },
    {
        headline: "Beautiful house",
        numSleeps: 3,
        numBedrooms: 4,
        numBathrooms: 5,
        pricePerNight: 400.00,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "image/house3.jpg",
        featuredRental: true,
    },
    {
        headline: "Yes house",
        numSleeps: 4,
        numBedrooms: 5,
        numBathrooms: 6,
        pricePerNight: 180.00,
        city: "Queen",
        province: "Ontario",
        imageUrl: "image/house4.jpg",
        featuredRental: false,
    },
    {
        headline: "No house",
        numSleeps: 1,
        numBedrooms: 2,
        numBathrooms: 3,
        pricePerNight: 120.00,
        city: "Newnham",
        province: "Ontario",
        imageUrl: "image/house5.jpg",
        featuredRental: true,
    },
    {
        headline: "Ok house",
        numSleeps: 2,
        numBedrooms: 3,
        numBathrooms: 4,
        pricePerNight: 250.00,
        city: "Newnham",
        province: "Ontario",
        imageUrl: "image/house6.jpg",
        featuredRental: false,
    }
]

module.exports.getFeaturedRentals = function () {
    let filtered = [];

    for (let i = 0; i < rentals.length; i++) {
        if (rentals[i].featuredRental) {
            filtered.push(rentals[i]);
        }
    }
    return filtered;
}

module.exports.getRentalsByCityAndProvince = function () {
    var result = [];
    var rentalsByCity = {};

    for (var i = 0; i < rentals.length; i++) {
        var rental = rentals[i];
        var cityProvince = rental.city + ', ' + rental.province;

        if (!rentalsByCity[cityProvince]) {
            rentalsByCity[cityProvince] = [];
        }
        rentalsByCity[cityProvince].push(rental);
    }

    for (var cityProvince in rentalsByCity) {
        result.push({
            cityProvince: cityProvince,
            rentals: rentalsByCity[cityProvince]
        });
    }

    return result;
}

