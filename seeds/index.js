const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp")
    .then(() => {
        console.log("Mongo is Connected!");
    })
    .catch((err) => {
        console.log(err)
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const campPrice = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "62f839a90d770c2ab92bc831",
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dehadt57g/image/upload/v1661232095/YelpCamp/cuwv37bniuqcv41usobn.jpg',
                    filename: 'YelpCamp/cuwv37bniuqcv41usobn.jpg',
                },
                {
                    url: 'https://res.cloudinary.com/dehadt57g/image/upload/v1660977794/YelpCamp/tent-camping-at-sunset_zzs3kh.jpg',
                    filename: 'YelpCamp/tent-camping-at-sunset_zzs3kh',
                }
            ],
            description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nisi quasi cupiditate veritatis nemo ipsum culpa assumenda ex eum, accusamus facere placeat ab sequi nesciunt esse ad odio quidem, asperiores debitis!",
            price: campPrice,
            timeCreated: Date.now()
        });
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })