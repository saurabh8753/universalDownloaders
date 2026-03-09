const { fetchPinterestMedia } = require("../services/pinterestService");

async function handlePinterestDownload(req, res) {

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "Missing 'url' query parameter"
    });
  }

  try {

    const data = await fetchPinterestMedia(url);

    res.json({
      success: true,
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

}

module.exports = { handlePinterestDownload };
