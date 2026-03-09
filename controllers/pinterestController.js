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
      responseType: "arraybuffer", // Vercel stability ke liye
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const timestamp = Date.now();
    const contentType = response.headers["content-type"] || "video/mp4";
    const extension = contentType.includes("video") ? "mp4" : "jpg";
    const filename = `pin_download_${timestamp}.${extension}`;

    // FORCE DOWNLOAD HEADERS
    res.setHeader('Content-Type', 'application/octet-stream'); // Browser player ko bypass karne ke liye
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', response.data.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("Download Error:", err.message);
    res.status(500).send("Server Error: Download failed.");
  }
}

module.exports = { handlePinterestDownload, handleProxyDownload };
