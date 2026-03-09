const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPinterestMedia(url) {

  try {

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
      }
    });

    const $ = cheerio.load(data);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      "Pinterest Media";

    const thumbnail =
      $('meta[property="og:image"]').attr("content");

    const downloads = [];

    // VIDEO DETECTION
    $("video source").each((i, el) => {

      const src = $(el).attr("src");

      if (src && src.includes(".mp4")) {

        downloads.push({
          quality: "HD",
          format: "MP4",
          url: src
        });

      }

    });


    // GIF DETECT
    if (thumbnail && thumbnail.endsWith(".gif")) {

      downloads.push({
        quality: "GIF",
        format: "GIF",
        url: thumbnail
      });

    }


    // IMAGE SIZES (Original)
    if (thumbnail) {

      const original = thumbnail.replace("/736x/", "/originals/");

      downloads.push({
        quality: "Original",
        format: "JPG",
        url: original
      });

      downloads.push({
        quality: "736px",
        format: "JPG",
        url: thumbnail
      });

    }


    // IF NOTHING FOUND
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

  }

  catch (error) {

    throw new Error("Pinterest extraction failed");

  }

}

module.exports = { fetchPinterestMedia };
