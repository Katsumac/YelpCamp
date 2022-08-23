const User = require("../models/user");
const Campground = require("../models/campground");
const Review = require("../models/review");

const { cloudinary } = require("../cloudinary");

module.exports.renderRegistrationForm = (req, res) => {
    res.render("users/register");
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body.user;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register")
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "Successfully logged in. Welcome back!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
}

module.exports.renderUserProfile = async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!req.query.page) {
        const campgrounds = await Campground.paginate({author: userId});
        const allCampgrounds = await Campground.find({author: userId});
        const reviews = await Review.find({ author: userId }).populate("campground");
        res.render("users/userProfile", { user, campgrounds, allCampgrounds, reviews });
    } else {
        const { page } = req.query;
        const campgrounds = await Campground.paginate({author: userId}, {
            page
        });
        res.status(200).json(campgrounds);
    }
}

module.exports.updateProfilePhoto = async (req, res) => {
    const { userId } = req.params;
    if (!req.file) {
        req.flash("error", "You have not selected a profile photo to upload.");
        return res.redirect(`/${userId}/userProfile`);
    }
    const user = await User.findById(userId);
    if (user.image.length > 0) {
        for (let image of user.image) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
    user.image = { url: req.file.path, filename: req.file.filename };
    await user.save();
    req.flash("success", "Profile photo has been updated!");
    res.redirect(`/${userId}/userProfile`);
}