const axios = require("axios")
const cheerio = require("cheerio")

module.exports = async function(url){

 const encodedUrl = encodeURIComponent(url)

 const fullUrl =
 `https://www.savepin.app/download.php?url=${encodedUrl}&lang=en&type=redirect`

 const response = await axios.get(fullUrl,{
  headers:{
   "User-Agent":
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36",
   Referer:"https://www.savepin.app/"
  }
 })

 const $ = cheerio.load(response.data)

 const title = $("h1").first().text().trim()

 const thumbnail =
 $(".image-container img").attr("src")

 const downloads = []

 $("tbody tr").each((_,el)=>{

  const quality=$(el).find(".video-quality").text().trim()

  const format=$(el).find("td:nth-child(2)").text().trim()

  const href=$(el).find("a").attr("href")

  const directUrl =
  decodeURIComponent(href?.split("url=")[1] || "")

  if(directUrl){

   downloads.push({
    quality: quality || "Default",
    format: format || "MP4",
    url: directUrl
   })

  }

 })

 if(downloads.length===0 && thumbnail){

  downloads.push({
   quality:"Image",
   format:"JPG",
   url:thumbnail
  })

 }

 return{
  title,
  thumbnail,
  downloads
 }

}
