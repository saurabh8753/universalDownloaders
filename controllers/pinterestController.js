const { fetchPinterestMedia } = require("../services/pinterestService");
const axios = require("axios");

async function handlePinterestDownload(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: "URL missing" });
  try {
    const data = await fetchPinterestMedia(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function handleProxyDownload(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("URL is required");

  try {
    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // Content-Type se extension decide karein
    const contentType = response.headers["content-type"] || "";
    let extension = "jpg"; // Default extension
    
    if (contentType.includes("video/mp4") || url.includes(".mp4")) {
      extension = "mp4";
    } else if (contentType.includes("image/gif")) {
      extension = "gif";
    } else if (contentType.includes("image/png")) {
      extension = "png";
    }

    const filename = `pinterest_${Date.now()}.${extension}`;

    // Browser ko attachment force karne ke headers
    res.setHeader('Content-Type', 'application/octet-stream'); 
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', response.data.length);
    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS fix

    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("Proxy Error:", err.message);
    res.status(500).send("Download failed.");
  }
}

module.exports = { handlePinterestDownload, handleProxyDownload };
