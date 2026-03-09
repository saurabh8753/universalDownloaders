const axios = require("axios");
const cheerio = require("cheerio");

async function fetchPinterestMedia(url) {

  try {

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text();

    const thumbnail =
      $('meta[property="og:image"]').attr("content");

    const downloads = [];

    // Extract script JSON data
    const scripts = $("script");

    scripts.each((i, el) => {

      const text = $(el).html();

      if (text && text.includes("video_list")) {

        try {

          const jsonMatch = text.match(/\{.*"video_list".*\}/s);

          if (!jsonMatch) return;

          const json = JSON.parse(jsonMatch[0]);

          const videos = json.video_list;

          Object.keys(videos).forEach((key) => {

            downloads.push({
              quality: key,
              format: "MP4",
              url: videos[key].url,
            });

          });

        } catch (e) {}

      }

    });

    // Image extraction
    if (downloads.length === 0 && thumbnail) {

      downloads.push({
        quality: "Original",
        format: "JPG",
        url: thumbnail,
      });

    }

    return {
      title,
      thumbnail,
      downloads,
    };

  } catch (error) {

    throw new Error("Pinterest extraction failed");

  }
}

module.exports = { fetchPinterestMedia };
