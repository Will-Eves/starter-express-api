const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const dir = path.join(__dirname, 'app');

app.use(express.static(dir));

httpserver.listen(3000);
console.log('Status Update: Server On');

const allowed = 'abcdefghijklmnopqrstuvwxyz1234567890        ';

let prev_text = '';

for(let i = 0; i < 400; i++) prev_text += allowed[Math.floor(Math.random() * allowed.length)];

let current_users = {};

// manage socket connections
io.on('connection', function(socket){
    socket.on('join', function(e){
        let cID = socket.id;

        current_users[cID] = ['', socket];

        socket.emit('join', { id: cID, data: prev_text });
    });
  
    socket.on('send', function(vote){
        // delete vote if cID doesn't exist in cID array.
        
        if(current_users[vote.cID] == null){
            socket.emit('confail', {});
            return;
        }

        if(vote.vote.length > 1 || !allowed.includes(vote.vote.toLowerCase())){
            socket.emit('confail', {});
            return;
        }

        current_users[vote.cID][0] = vote.vote.toLowerCase();
    });
});

const emit_data = () => {
    let votes = [];

    for (const [key, value] of Object.entries(current_users)) {
        if(value[0] != '') votes.push(value[0]);
        value[0] = '';
    }

    if(votes.length != 0) prev_text += votes[Math.floor(Math.random() * votes.length)];
    else prev_text += allowed[Math.floor(Math.random() * allowed.length)];

    if(prev_text.length > 400) prev_text = prev_text.slice(20);

    io.emit('recieve', prev_text);
};

setInterval(() => {
    console.log('Status Update: Displaying Data\n');
    emit_data();
}, 5000);