# Minecraft User Panel API

  Routes have own time block period so they can be run once in a time thanks to firebase. Every time user connects to route it creates new rcon connection in case of server restarts.
  
  ### React App that is using it: [Minecraft User Panel](https://github.com/snoh666/react-mc-user-panel)

## Packages installed
  - Express
  - cors (for no-cors prevention)
  - firebase (database managing and connection)
  - rcon (minecraft server connection sending commands and etc)
  - dotenv (securing rcon connection parametrs)
  - nodemon (automating server reload)

## Why did i need it?

 We maked minecraft server with SkinRestorer plugin for friends. So only few people have premium then rest of us couldnt have a skin. That is why this API have been created in main focus it is to give user control over his own skin.

## How tu use
1. Input Firebase and Rcon setup into .env file.
1. Install dependencies
    ````console
      npm install
    ````
1. Start API using nodemon on 80 port
    ````console
      npm start
    ````
