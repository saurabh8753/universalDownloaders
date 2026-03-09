<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Pinterest Downloader</title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Segoe UI;
}

body{

background:linear-gradient(135deg,#e60023,#ff7b00);

min-height:100vh;

display:flex;

justify-content:center;

align-items:center;

padding:20px;

}

.container{

width:100%;
max-width:700px;

background:rgba(255,255,255,0.15);

backdrop-filter:blur(20px);

border-radius:20px;

padding:30px;

border:1px solid rgba(255,255,255,0.25);

color:white;

box-shadow:0 10px 40px rgba(0,0,0,0.3);

}

.logo{

text-align:center;

font-size:28px;

font-weight:bold;

margin-bottom:25px;

}

input{

width:100%;

padding:14px;

border-radius:10px;

border:none;

font-size:16px;

margin-bottom:10px;

}

button{

width:100%;

padding:14px;

border:none;

border-radius:10px;

background:#ff003c;

color:white;

font-size:16px;

cursor:pointer;

}

button:hover{

background:#d80033;

}

.loader{

display:none;

text-align:center;

margin-top:15px;

}

.result{

display:none;

margin-top:25px;

}

.preview img,
.preview video{

width:100%;

border-radius:12px;

margin-bottom:15px;

}

.title{

font-size:18px;

margin-bottom:15px;

}

.downloads{

display:flex;

flex-direction:column;

gap:10px;

}

.download-btn{

background:#111;

border:none;

padding:12px;

border-radius:8px;

color:white;

cursor:pointer;

}

.download-btn:hover{

background:#333;

}

</style>

</head>

<body>

<div class="container">

<div class="logo">
<i class="fab fa-pinterest"></i> Pinterest Downloader
</div>

<input id="url" placeholder="Paste Pinterest link here...">

<button onclick="downloadMedia()">Download</button>

<div class="loader" id="loader">
<i class="fa fa-spinner fa-spin"></i> Fetching media...
</div>

<div class="result" id="result">

<div class="preview" id="preview"></div>

<div class="title" id="title"></div>

<div class="downloads" id="downloads"></div>

</div>

</div>

<script>

async function downloadMedia(){

let url=document.getElementById("url").value

if(!url){

alert("Paste Pinterest URL")

return

}

document.getElementById("loader").style.display="block"

document.getElementById("result").style.display="none"

let api=`https://universal-downloaders.vercel.app/api/pinterest/download?url=${encodeURIComponent(url)}`

try{

let res=await fetch(api)

let data=await res.json()

document.getElementById("loader").style.display="none"

if(!data.success){

alert("Download failed")

return

}

let info=data.data

document.getElementById("result").style.display="block"

document.getElementById("title").innerText=info.title

let preview=document.getElementById("preview")

preview.innerHTML=""

let first=info.downloads[0].url


// VIDEO DETECT
if(first.includes(".mp4") || first.includes(".m3u8")){

preview.innerHTML=`<video controls src="${first}"></video>`

}

// GIF DETECT
else if(first.includes(".gif")){

preview.innerHTML=`<img src="${first}">`

}

// IMAGE
else{

preview.innerHTML=`<img src="${info.thumbnail}">`

}

let downloads=document.getElementById("downloads")

downloads.innerHTML=""

info.downloads.forEach(d=>{

let btn=document.createElement("button")

btn.className="download-btn"

btn.innerText=`Download ${d.quality} (${d.format})`

btn.onclick=()=>downloadFile(d.url)

downloads.appendChild(btn)

})

}

catch(e){

document.getElementById("loader").style.display="none"

alert("API Error")

}

}


// DOWNLOAD FIX
function downloadFile(url){

const a=document.createElement("a")

a.href=url

a.target="_blank"

a.rel="noopener"

document.body.appendChild(a)

a.click()

document.body.removeChild(a)

}

</script>

</body>
</html>
