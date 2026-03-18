const express = require("express");
const router = express.Router();

const { fetchInstagram } = require("../utils/instagramEngine");

// 🔍 helpers
function extractShortcode(url){
  const match = url.match(/instagram\.com\/(reel|p)\/([^\/]+)/);
  return match ? match[2] : null;
}

function extractUsername(url){
  const match = url.match(/instagram\.com\/stories\/([^\/]+)/);
  return match ? match[1] : null;
}

// 🎬 POST / REEL
async function getPost(shortcode){

  const api = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;

  const data = await fetchInstagram(api);

  const media = data?.graphql?.shortcode_media;

  if(!media) return [];

  // video
  if(media.is_video){
    return [{
      type: "video",
      url: media.video_url
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
        }
      }

      return {
        type:"image",
        url:node.display_url
      }
    });
  }

  // image
  return [{
    type:"image",
    url:media.display_url
  }];
}

// 📲 STORY
async function getStory(username){

  const api = `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${username}`;

  const data = await fetchInstagram(api);

  const items = data?.reels_media?.[0]?.items || [];

  return items.map(item => {

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

// 🚀 MAIN ROUTE
router.get("/download", async (req, res) => {

  try{

    const url = req.query.url;

    if(!url){
      return res.json({ success:false, message:"URL required" });
    }

    // 🔥 STORY
    if(url.includes("/stories/")){
      const username = extractUsername(url);

      const data = await getStory(username);

      return res.json({
        success:true,
        data
      });
    }

    // 🔥 POST / REEL
    const shortcode = extractShortcode(url);

    const data = await getPost(shortcode);

    return res.json({
      success:true,
      data
    });

  }catch(e){

    res.json({
      success:false,
      message:e.message
    });

  }

});

module.exports = router;
