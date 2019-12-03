require('dotenv').config()

const http = require('http');
const express = require('express');
const app = express();

app.get("/", (request, response) => {
    response.sendStatus(200);
  });
app.listen(process.env.PORT);

setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Like = require('./LikeBOT')
const client = new Like({
    autoReconnect: true,
    messageCacheMaxSize: 2024,
    fetchAllMembers: true,
    disabledEvents: ['typingStart', 'typingStop', 'guildMemberSpeaking'],
    messageCacheLifetime: 1680,
    disableEveryone: false,
    messageSweepInterval: 1680
})

client.login(process.env.token)