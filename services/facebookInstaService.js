const { snapsave } = require("snapsave-media-downloader");

async function facebookInsta(url) {
  try {
    const result = await snapsave(url, { retry: 3, retryDelay: 500 });

    if (!result?.success || !result?.data?.media?.length) {
      throw new Error("no downloadable media found in response");
    }

    return result.data;
  } catch (error) {
    throw new Error("Error fetching media: " + error.message);
  }
}

module.exports = facebookInsta;
