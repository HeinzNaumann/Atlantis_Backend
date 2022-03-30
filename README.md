# MiAtlantis

## Adverts Sell and Buy App. Final Project.

Develop of a APP that runs on the server (AWS - Ubuntu - Nginx) using React App and Node JS.

The service shows a catalog of products given the user the option to register, log in, create, sell, buy, make his products reserve or sold, add favorites, chat with other users of the app, delete, delete account, system of notifications by email to inform the users and log out.  .

To access the app you can click here 📲 <http://miatlantis.com>


# WEB-API/Node.js/MongoDB

## Get Started/ 🚀

- Clone the repository:  

HTTPS FRONTEND:  
`git clone https://github.com/kikonavarro/AtlantisFrontend.git`  

SSH FRONTEND:  
`git clone git@github.com:kikonavarro/AtlantisFrontend.git`

HTTPS BACKEND:  
`git clone https://github.com/kikonavarro/AtlantisBackend.git`  

SSH BACKEND:  
`git clone git@github.com:kikonavarro/AtlantisBackend.git`

### Pre-Requirements of the Backend 📋  

Need to have installed and running:

- MongoDB  
- Node  

### Installation API Node AtlantisBackend/ 🔧

You need to be inside the folder you want to run then:

Install dependencies:  
`npm install`  

Initialize Database with 2 users.
`node install_db.js`

Start Aplication:
`npm start`  

The default port is 3002, to change it you only need to access the bin folder in the file www line 16.
`var port = normalizePort(process.env.PORT || '3002');`  

## Connection to the data base

Create a folder images/anuncios inside public.

Create a file at the root of the .env project by copying the contents of .env.example, inside .env.example replace the route that you are going to use.

If you want to make the email works you need to change the .env file:

- EMAIL_SERVICE_FROM
- EMAIL_SERVICE_NAME
- EMAIL_SERVICE_USER
- EMAIL_SERVICE_PASSWORD

To connect to the chat go to the folder "ServidorChat" , run "npm install" and then "npm start".

Run the Backend and the chat server before you start the Frontend.

# WEB-APP/React App

## Get Started/ 🚀

### Installation SPA React AtlantisFrontend/ 🔧

You need to be inside the folder atlantisfrontend (cd atlantisfrontend) then:

Install dependencies:  
`npm install`  

Start Aplication:
`npm start`  

The default port App Base Url is <http://localhost:3000>, to change it you only need to access to file .env and change the route at your desire.

## Authors ✒️

 **Heinz Naumann, Esther Fernández, Kiko Navarro, Diego Pérez and Patricia Mazuelo** 
 
- https://github.com/heinznaumann
- https://github.com/kikonavarro
- https://github.com/estherfernandezrincon
- https://github.com/PatriciaMazuelo
- https://github.com/Dgoprz
