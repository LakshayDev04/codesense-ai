
const express = require("express");

const {
    analyzeReview
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/analyze", analyzeReview);

module.exports = router;
