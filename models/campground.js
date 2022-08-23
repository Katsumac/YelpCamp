const mongoose = require("mongoose");
const { reviewSchema } = require("../schemas");
const Review = require("./review");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const ImageSchema = new Schema({
        url: String, 
        filename: String
})

ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
})

ImageSchema.virtual("preview").get(function() {
    return this.url.replace("/upload", "/upload/w_407,h_250");
})

ImageSchema.virtual("carousel").get(function() {
    return this.url.replace("/upload", "/upload/w_634,h_357");
})

const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: {
        type: String,
    },
    images: [ImageSchema],
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: {
        type: Number,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    timeCreated: {
        type: Date,
    }
}, opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function() {
    return `<div class="card">
    <a href="/campgrounds/${this._id}" class="card-header" style="text-decoration:none"><h6>${this.title}</h6></a>
    <div class="card-body">
      <p class="card-text">${this.description.substring(0, 20)}...</p>
    </div>
  </div>`
})

CampgroundSchema.post("findOneAndDelete", async function (campground) {
    if (campground) {
        await Review.deleteMany({_id: {$in: campground.reviews}});
    }
})

CampgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", CampgroundSchema);
