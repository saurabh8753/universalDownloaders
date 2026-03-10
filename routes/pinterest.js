const express = require("express")
const router = express.Router()

const axios = require("axios")

const {
 handlePinterestDownload
} = require("../controllers/pinterestController")

router.get("/download",handlePinterestDownload)


// FORCE DOWNLOAD PROXY

router.get("/file", async(req,res)=>{

 try{

  const {url} = req.query

  if(!url){

   return res.status(400).send("Missing url")

  }

  const response = await axios.get(url,{
   responseType:"stream"
  })

  const name = url.split("/").pop().split("?")[0]

  res.setHeader(
  "Content-Disposition",
  `attachment; filename="${name}"`
  )

  res.setHeader(
  "Content-Type",
  response.headers["content-type"]
  )

  response.data.pipe(res)

 }

 catch{

  res.status(500).send("Download failed")

 }

})

module.exports = router
