const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const passport = require("passport");
const users = require("../controllers/users");

const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage: storage, limits: {fileSize: 1000000}});

router.route("/register")
    .get(users.renderRegistrationForm)
    .post(catchAsync(users.register))

router.route("/login")
    .get(users.renderLogin)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }), users.login)

router.get("/logout", users.logout);

router.route("/:userId/userProfile")
    .get(isLoggedIn, catchAsync(users.renderUserProfile))
    .patch(isLoggedIn, upload.single("image"), catchAsync(users.updateProfilePhoto))

module.exports = router;