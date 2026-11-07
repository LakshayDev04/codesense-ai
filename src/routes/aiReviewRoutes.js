
const express = require("express");
const router = express.Router();

const {
    generateAIReview
} = require("../controllers/aiReviewController");

router.post("/review", generateAIReview);

module.exports = router;

