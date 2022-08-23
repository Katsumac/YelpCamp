const mongoose = require("mongoose");
const {Schema} = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("profilePhoto").get(function() {
    return this.url.replace("/upload", "/upload/w_300,h_300")
})

ImageSchema.virtual("reviewPhoto").get(function() {
    return this.url.replace("/upload", "/upload/w_50,h_50")
})

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: [ImageSchema]
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);