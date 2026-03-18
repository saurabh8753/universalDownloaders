const fetch = require("node-fetch");

// 🔥 COOKIE POOL (env से लेना better)
const accounts = [
  { cookie: process.env.IG_COOKIE_1, health: 100 },
  { cookie: process.env.IG_COOKIE_2, health: 100 }
];

// delay
function delay(ms){
  return new Promise(res => setTimeout(res, ms));
}

// get healthy account
function getAccount(){
  const active = accounts.filter(acc => acc.health > 20);
  if(!active.length) throw new Error("All accounts dead");
  return active[Math.floor(Math.random() * active.length)];
}

// main fetch
async function fetchInstagram(url){

  for(let i=0;i<accounts.length;i++){

    const acc = getAccount();

    try{

      const res = await fetch(url,{
        headers:{
          "user-agent":"Instagram 155.0.0.37.107 Android",
          "cookie":acc.cookie
        }
      });

      if(res.status === 429){
        acc.health -= 50;
        continue;
      }

      const json = await res.json();

      if(json.message === "login_required"){
        acc.health -= 40;
        continue;
      }

      return json;

    }catch(e){
      acc.health -= 20;
    }

    await delay(800);
  }

  throw new Error("All accounts failed");
}

module.exports = { fetchInstagram };
