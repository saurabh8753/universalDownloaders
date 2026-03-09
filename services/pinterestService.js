const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPinterestMedia(url) {

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36",
    },
  });

  const $ = cheerio.load(data);

  const title =
    $('meta[property="og:title"]').attr("content") || "";

  const thumbnail =
    $('meta[property="og:image"]').attr("content") || "";

  const downloads = [];

  // Extract JSON state
  $("script").each((i, el) => {

    const text = $(el).html();

    if (text && text.includes("video_list")) {

      try {

        const match = text.match(/"video_list":({.*?})/);

        if (!match) return;

        const json = JSON.parse(match[1]);

        Object.keys(json).forEach((key) => {

          downloads.push({
            quality: key,
            format: "MP4",
            url: json[key].url,
          });

        });

      } catch {}

    }

  });

  // fallback image
  if (downloads.length === 0 && thumbnail) {

    downloads.push({
      quality: "Image",
      format: "JPG",
      url: thumbnail,
    });

  }

  return {
    title,
    thumbnail,
    downloads,
  };
}

module.exports = { fetchPinterestMedia };
