const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({storage: storage, limits: {fileSize: 1000000, files: 10}});

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);


router.route("/:id")
.get(catchAsync(campgrounds.displayCampground))
.put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampgroundInfo))
.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.patch("/:id/uploadImages", isLoggedIn, isAuthor, upload.array("image"), catchAsync(campgrounds.uploadImages));

router.route("/searchResults")
.get(catchAsync)
.post(catchAsync(campgrounds.searchCamp));

module.exports = router;