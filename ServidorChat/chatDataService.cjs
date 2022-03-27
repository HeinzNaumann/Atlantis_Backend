
const axios = require('axios');

function getUserWithFav(article){
    console.log("Articule FUNC", article);
    const url =`http://localhost:3002/api/users/users?ad=${article}`
    return axios.get(url)
}

/* async function sendMail (anuncio,email){
    // Mandar email a cada usuario
       const res=await Usuario.enviarEmail(
        "Venta de producto",
        `El anuncio, ${anuncio} que marcaste como favorito, se ha vendido`,
         email
        );
} */
/* 
let array=["Holaaa"];
function getUserWithFav(article){
    array=getUserFav(article)
   
    return array;
} */

module.exports.getUserWithFav = getUserWithFav;
//module.exports.sendMail = sendMail;
