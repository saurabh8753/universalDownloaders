// 🔥 FULL COOKIE (IMPORTANT)
const COOKIE = `
sessionid=74567981697%3ACwQ0cGrHFmKPew%3A12%3AAYg53ltcW0vDeE40A7rCtWGQiYZC1lQA0_zcRS2bWg;
ds_user_id=74567981697;
csrftoken=nOJIQChHG4T8ZLbT4KM0qQ;
mid=abpxWQABAAGnOOvPaDblMNk7uurQ;
`;

// 🔥 FETCH SYSTEM (ANTI BLOCK)
async function fetchInstagram(url){

  const res = await fetch(url,{
    headers:{
      "user-agent":
        "Instagram 155.0.0.37.107 Android (30/11; 420dpi; 1080x1920; Xiaomi; Redmi; en_US)",

      "cookie": COOKIE,
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "x-ig-app-id": "936619743392459"
    }
  });

  const text = await res.text();

  // ❌ Instagram block detection
  if(text.includes("<!DOCTYPE html>")){
    throw new Error("Instagram blocked (try new cookie)");
  }

  try{
    return JSON.parse(text);
  }catch{
    throw new Error("Invalid JSON response");
  }
}

// 🔍 helpers
function extractShortcode(url){
  const match = url.match(/instagram\.com\/(reel|p)\/([^\/]+)/);
  return match ? match[2] : null;
}

function extractUsername(url){
  const match = url.match(/instagram\.com\/stories\/([^\/]+)/);
  return match ? match[1] : null;
}

// 🚀 MAIN SERVICE
async function facebookInsta(url){

  if(!url) throw new Error("URL missing");

  // =======================
  // 📲 STORY
  // =======================
  if(url.includes("/stories/")){

    const username = extractUsername(url);
    if(!username) throw new Error("Invalid story URL");

    const api = `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${username}`;

    const data = await fetchInstagram(api);

    const items = data?.reels_media?.[0]?.items || [];

    return items.map(item=>{
      if(item.video_versions){
        return {
          type:"video",
          url:item.video_versions[0].url
        };
      }

      return {
        type:"image",
        url:item.image_versions2?.candidates?.[0]?.url
      };
    });
  }

  // =======================
  // 🎬 POST / REEL
  // =======================
  if(url.includes("instagram.com")){

    const shortcode = extractShortcode(url);
    if(!shortcode) throw new Error("Invalid Instagram URL");

    const api = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;

    const data = await fetchInstagram(api);

    const media = data?.graphql?.shortcode_media;

    if(!media) throw new Error("Media not found");

    // 🎬 video
    if(media.is_video){
      return [{
        type:"video",
        url:media.video_url
      }];
    }

    // 📦 carousel
    if(media.edge_sidecar_to_children){
      return media.edge_sidecar_to_children.edges.map(edge=>{
        const node = edge.node;

        if(node.is_video){
          return {
            type:"video",
            url:node.video_url
          };
        }

        return {
          type:"image",
          url:node.display_url
        };
      });
    }

    // 📸 image
    return [{
      type:"image",
      url:media.display_url
    }];
  }

  // ❌ unsupported
  throw new Error("Unsupported URL");
}

module.exports = facebookInsta;
