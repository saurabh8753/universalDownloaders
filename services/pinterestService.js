const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPinterestMedia(url) {

  try {

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    const title =
      $('meta[property="og:title"]').attr("content") || "Pinterest Media";

    const thumbnail =
      $('meta[property="og:image"]').attr("content") || "";

    const downloads = [];

    let jsonData = null;

    // Extract Pinterest JSON data
    $("script").each((i, el) => {
      const text = $(el).html();

      if (text && text.includes("__PWS_DATA__")) {
        try {
          const match = text.match(/__PWS_DATA__\s*=\s*(\{.*\});/s);
          if (match) {
            jsonData = JSON.parse(match[1]);
          }
        } catch {}
      }
    });

    if (!jsonData) {
      return {
        title,
        thumbnail,
        downloads: [
          {
            quality: "Image",
            format: "JPG",
            url: thumbnail,
          },
        ],
      };
    }

    const resources = jsonData?.props?.initialReduxState?.pins;

    if (!resources) {
      return {
        title,
        thumbnail,
        downloads: [
          {
            quality: "Image",
            format: "JPG",
            url: thumbnail,
          },
        ],
      };
    }

    Object.values(resources).forEach((pin) => {

      // VIDEO PIN
      if (pin?.videos?.video_list) {

        Object.values(pin.videos.video_list).forEach((v) => {

          downloads.push({
            quality: v.width + "x" + v.height,
            format: "MP4",
            url: v.url,
          });

        });

      }

      // GIF PIN
      if (pin?.images?.orig?.url && pin.images.orig.url.endsWith(".gif")) {

        downloads.push({
          quality: "Original GIF",
          format: "GIF",
          url: pin.images.orig.url,
        });

      }

      // IMAGE PIN (Original + sizes)
      if (pin?.images) {

        Object.values(pin.images).forEach((img) => {

          if (img.url) {

            downloads.push({
              quality: img.width + "x" + img.height,
              format: "JPG",
              url: img.url,
            });

          }

        });

      }

      // CAROUSEL PINS
      if (pin?.carousel_data?.blocks) {

        pin.carousel_data.blocks.forEach((block) => {

          const img = block?.image?.images?.orig?.url;

          if (img) {

            downloads.push({
              quality: "Carousel Image",
              format: "JPG",
              url: img,
            });

          }

        });

      }

    });

    return {
      title,
      thumbnail,
      downloads,
    };

  } catch (err) {

    throw new Error("Pinterest extraction failed");

  }

}

module.exports = { fetchPinterestMedia };
