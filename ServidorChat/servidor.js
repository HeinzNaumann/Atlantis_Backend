const express = require('express');
const http = require('http');
const app = express();
const servidor = http.createServer(app)

const {getUserWithFav} = require('./chatDataService.cjs')


const socketio = require('socket.io');
const { CLIENT_RENEG_LIMIT } = require('tls');
const io = socketio(servidor,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})




let onlineUser=[];
const addNewUser =(username,socketId)=>{
    console.log("onlineUser",onlineUser)
    !onlineUser.some(user=>user.username === username) && 
        onlineUser.push({username,socketId});
}
const removeUser = (socketId)=>{
    onlineUser= onlineUser.filter(user=>user.socketId !== socketId)
    console.log(socketId, "Desconectado")
}
const getUser =(username)=>{
    return onlineUser.find(user => user.username === username)
}

io.on('connection', socket =>{
     
        socket.on('conectado', (nomb)=>{
            addNewUser(nomb,socket.id);
            console.log(onlineUser)
            let nombre;
       // nombre=nomb;
        //socket.broadcast.emit("mensajes", {nombre:nombre, mensaje:`${nombre} esta conectado`})
        console.log("Usuario conectado");
        })
        socket.on('sendNotification',({senderName,recieverName,article,article_name,type})=>{
            //Buscar art en fav de usuarios de usuarios y notificar
            //console.log("Article",article) 
            getUserWithFav(article).then(response=>{
                const arrayUsersFav= response.data.result;
                if(arrayUsersFav.length>0){
                   arrayUsersFav.forEach(user=>{
                       const recep= getUser(user.nombre);
                       if(recep){// si esta conectado el usuario
                           io.to(recep.socketId).emit("getNotification",{
                               article_name,
                               type,
                           })
                           console.log("Entra en Noti")
                       }else{
                           //enviar mail
                          // sendMail(article_name,user.email)
                       }
                   })
               }  
            })
              
                
                     
        })


        socket.on('mensaje', (nombre,mensaje,id)=>{
              io.emit("mensajes",{nombre,mensaje,id})
         })


         socket.on('logout',(id)=>{
              removeUser(id);
         })
         socket.on('disconnect', ()=>{
       // removeUser(socket.id);
        //io.emit("mensajes",{servidor:"Servidor",mensaje:`${nombre} se ha desconectado`})
        })

});

servidor.listen(3005, ()=> console.log("Servidor inicializado"));