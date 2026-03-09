const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPinterestMedia(url) {

  try {

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
      },
      timeout: 10000
    });

    const html = response.data;

    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") || "Pinterest Media";

    const thumbnail =
      $('meta[property="og:image"]').attr("content");

    const downloads = [];

    $("video source").each((i, el) => {

      const src = $(el).attr("src");

      if (src) {

        downloads.push({
          quality: "HD",
          format: "MP4",
          url: src
        });

      }

    });

    if (downloads.length === 0 && thumbnail) {

      downloads.push({
        quality: "Image",
        format: "JPG",
        url: thumbnail
      });

    }

    return {
      title,
      thumbnail,
      downloads
    };

  } catch (err) {

    console.error(err);

    throw new Error("Pinterest extraction failed");

  }

}

module.exports = { fetchPinterestMedia };
