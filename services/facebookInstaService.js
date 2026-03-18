const fetch = require("node-fetch");

// 🔥 COOKIE POOL (env से लो)
const cookies = [
  process.env.IG_COOKIE_1,
  process.env.IG_COOKIE_2
];

// random cookie
function getCookie(){
  return cookies[Math.floor(Math.random()*cookies.length)];
}

// fetch system
async function fetchInstagram(url){

  const res = await fetch(url,{
    headers:{
      "user-agent":"Instagram 155.0.0.37.107 Android",
      "cookie":getCookie()
    }
  });

  const text = await res.text();

  try{
    return JSON.parse(text);
  }catch{
    throw new Error("Invalid Instagram response");
  }
}

// extract shortcode
function extractShortcode(url){
  const match = url.match(/instagram\.com\/(reel|p)\/([^\/]+)/);
  return match ? match[2] : null;
}

// extract username (story)
function extractUsername(url){
  const match = url.match(/instagram\.com\/stories\/([^\/]+)/);
  return match ? match[1] : null;
}

// 🔥 MAIN SERVICE
async function facebookInsta(url){

  // =======================
  // 📲 INSTAGRAM STORY
  // =======================
  if(url.includes("instagram.com/stories/")){

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
        url:item.image_versions2.candidates[0].url
      };
    });
  }

  // =======================
  // 🎬 INSTAGRAM POST / REEL
  // =======================
  if(url.includes("instagram.com")){

    const shortcode = extractShortcode(url);

    if(!shortcode) throw new Error("Invalid Instagram URL");

    const api = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;

    const data = await fetchInstagram(api);

    const media = data?.graphql?.shortcode_media;

    if(!media) throw new Error("Media not found");

    // video
    if(media.is_video){
      return [{
        type:"video",
        url:media.video_url
      }];
    }

    // carousel
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

    // image
    return [{
      type:"image",
      url:media.display_url
    }];
  }

  // =======================
  // 📘 FACEBOOK (fallback)
  // =======================
  const snapsave = require("metadownloader");

  try{
    const result = await snapsave(url);
    return result;
  }catch(err){
    throw new Error("Facebook fetch failed");
  }
}

module.exports = facebookInsta;
