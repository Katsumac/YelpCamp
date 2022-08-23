const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken })

module.exports.index = async (req, res) => {
    if (!req.query.page) {
        const campgrounds = await Campground.paginate({});
        const allCampgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds, allCampgrounds });
    } else {
        const { page } = req.query;
        const campgrounds = await Campground.paginate({}, {
            page
        });
        res.status(200).json(campgrounds);
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    newCampground.author = req.user._id
    newCampground.timeCreated = Date.now();
    await newCampground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${newCampground.id}`);
}

module.exports.displayCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!campground) {
        req.flash("error", "That campground does not exist!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}

module.exports.updateCampgroundInfo = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (req.files.length + camp.images.length > 10) {
        for (let file of req.files) {
            await cloudinary.uploader.destroy(file.filename);
        }
        req.flash("success", "Successfully updated campground!");
        req.flash("error", `Sorry, you can only upload ${10 - camp.images.length} more photos. Delete some to get more space.`);
        return res.redirect(`/campgrounds/${id}`);
    }
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }));
    camp.images.push(...imgs);
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    for (let image of campground.images) {
        if (image.filename !== "YelpCamp/cuwv37bniuqcv41usobn.jpg" && image.filename !== "YelpCamp/tent-camping-at-sunset_zzs3kh") {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "That campground does not exist!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.uploadImages = async (req, res) => {
    const { id } = req.params;
    if (req.files.length === 0) {
        req.flash("error", "You have not selected any images to upload.");
        return res.redirect(`/campgrounds/${id}`);
    }

    const campground = await Campground.findById(id);

    if (req.files.length + campground.images.length > 10) {
        for (let file of req.files) {
            await cloudinary.uploader.destroy(file.filename);
        }
        req.flash("error", `Sorry, you can only upload ${10 - campground.images.length} more photos. Delete some to get more space.`);
        return res.redirect(`/campgrounds/${id}`);
    }

    for (let file of req.files) {
        campground.images.push({ url: file.path, filename: file.filename });
    }
    await campground.save();
    req.flash("success", "Successfully added image(s)!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.searchCamp = async (req, res) => {
    const { camp } = req.body.search;
    if (!camp || camp.replace(/\s/g, "") === "") {
        req.flash("error", "Invalid search input.");
        res.redirect("/campgrounds");
    }
    const campgrounds = await Campground.find({ title: { $regex: camp, $options: "i" } });
    res.render("campgrounds/searchResults", { campgrounds, camp });
}