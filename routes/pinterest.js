const express = require("express");
const router = express.Router();
const axios = require("axios");

const { handlePinterestDownload } = require("../controllers/pinterestController");

router.get("/download", handlePinterestDownload);


// FORCE DOWNLOAD ROUTE
router.get("/file", async (req, res) => {

  try {

    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success:false,
        error:"Missing url parameter"
      });
    }

    const response = await axios.get(url, {
      responseType: "stream"
    });

    const fileName = url.split("/").pop().split("?")[0];

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    res.setHeader(
      "Content-Type",
      response.headers["content-type"]
    );

    response.data.pipe(res);

  }

  catch(err){

    res.status(500).json({
      success:false,
      error:"Download failed"
    });

  }

});

module.exports = router;
