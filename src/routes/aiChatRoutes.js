
const express = require("express");
const router = express.Router();

const {
    sendChatMessage
} = require("../controllers/aiChatController");

router.post("/message", sendChatMessage);

module.exports = router;
