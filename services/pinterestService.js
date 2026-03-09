const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPinterestMedia(url) {

  const encodedUrl = encodeURIComponent(url);

  const requestUrl =
    `https://www.savepin.app/download.php?url=${encodedUrl}&lang=en&type=redirect`;

  try {

    const response = await axios.get(requestUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Referer: "https://www.savepin.app/"
      }
    });

    const $ = cheerio.load(response.data);

    const title = $("h1").first().text().trim();

    const thumbnail =
      $(".image-container img").attr("src") ||
      $("meta[property='og:image']").attr("content");

    const downloads = [];

    $("tbody tr").each((i, el) => {

      const quality = $(el).find(".video-quality").text().trim();

      const format = $(el).find("td:nth-child(2)").text().trim();

      const href = $(el).find("a").attr("href");

      if (!href) return;

      const match = href.match(/url=(.*)/);

      const directUrl = match ? decodeURIComponent(match[1]) : null;

      if (directUrl) {

        downloads.push({
          quality: quality || "Default",
          format: format || "MP4",
          url: directUrl
        });

      }

    });

    if (downloads.length === 0) {
      throw new Error("No downloadable media found.");
    }

    return {
      title,
      thumbnail,
      downloads
    };

  } catch (err) {

    throw new Error("Pinterest extraction failed");

  }

}

module.exports = { fetchPinterestMedia };
