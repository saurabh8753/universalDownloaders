const { fetchPinterestMedia } = require("../services/pinterestService");

async function handlePinterestDownload(req, res) {

  try {

    const { url } = req.query;

    if (!url) {

      return res.status(400).json({
        success:false,
        error:"Missing url parameter"
      });

    }

    const data = await fetchPinterestMedia(url);

    res.json({
      success:true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      error:"Server error"
    });

  }

}

module.exports = { handlePinterestDownload };
