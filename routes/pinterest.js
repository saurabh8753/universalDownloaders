const express = require("express");
const router = express.Router();
const {
  handlePinterestDownload,
  handleProxyDownload, // Ise import karein
} = require("../controllers/pinterestController");

router.get("/download", handlePinterestDownload);
router.get("/proxy-file", handleProxyDownload); // Naya endpoint

module.exports = router;
