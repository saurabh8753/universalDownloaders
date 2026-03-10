const workerpool = require("workerpool")
const cache = require("../utils/cache")

const pool = workerpool.pool(
 __dirname + "/../workers/pinterestWorker.js"
)

async function fetchPinterestMedia(url){

 const cached = cache.get(url)

 if(cached){

  return cached

 }

 const result = await pool.exec("default",[url])

 cache.set(url,result)

 return result

}

module.exports = { fetchPinterestMedia }
