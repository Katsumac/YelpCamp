const mongoose = require("mongoose");

const { Schema } = mongoose;

const reviewSchema = new Schema({
    body: {
        type: String
    },
    rating: {
        type: Number
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    timeCreated: {
        type: Date
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: "Campground"
    }
});

module.exports = mongoose.model("Review", reviewSchema);