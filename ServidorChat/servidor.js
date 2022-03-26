const express = require('express');
const http = require('http');
const app = express();
const servidor = http.createServer(app)

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
        socket.on('sendNotification',({senderName,recieverName,type})=>{
            const recep= getUser(recieverName);
            if(recep){ // si esta conectado el usuario
                io.to(recep.socketId).emit("getNotification",{
                    senderName,
                    type,
                })

            }
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