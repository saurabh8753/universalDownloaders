async function facebookInsta(url) {
  try {
    if (!url || typeof url !== "string") {
      return { success: false, error: "A valid url string is required" };
    }

    // Dynamic import — avoids crashing the whole function at cold-start
    // if this package is ESM-only or fails to load.
    let snapsave;
    try {
      ({ snapsave } = await import("snapsave-media-downloader"));
    } catch (importErr) {
      return {
        success: false,
        error: "Failed to load downloader module: " + importErr.message,
      };
    }

    let result;
    try {
      result = await snapsave(url, { retry: 3, retryDelay: 500 });
    } catch (fetchErr) {
      return {
        success: false,
        error: "Error fetching media: " + fetchErr.message,
      };
    }

    if (!result || result.success === false) {
      return {
        success: false,
        error: result?.message || "snapsave returned no result",
      };
    }

    const media = result?.data?.media;
    if (!Array.isArray(media) || media.length === 0) {
      return {
        success: false,
        error: "No downloadable media found for this URL",
      };
    }

    return { success: true, ...result.data };
  } catch (err) {
    // Final safety net — this function should never throw.
    return {
      success: false,
      error: "Unexpected error: " + (err?.message || String(err)),
    };
  }
}

module.exports = facebookInsta;
