const { fetchPinterestMedia } = require("../services/pinterestService");
const axios = require("axios");

// Purana function: Links fetch karne ke liye
async function handlePinterestDownload(req, res) {
  const { url } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, error: "Missing 'url' query parameter." });
  }

  try {
    const data = await fetchPinterestMedia(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Naya function: File ko FORCE download karwane ke liye
async function handleProxyDownload(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    const contentType = response.headers["content-type"];
    const extension = contentType.includes("video") ? "mp4" : "jpg";
    const filename = `pinterest_${Date.now()}.${extension}`;

    // Ye headers browser ko majboor karenge file save karne ke liye
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);

    // File stream ko client (browser) ki taraf bhej rahe hain
    response.data.pipe(res);
  } catch (err) {
    console.error("Proxy Error:", err.message);
    res.status(500).send("Could not download file.");
  }
}

module.exports = { handlePinterestDownload, handleProxyDownload };
