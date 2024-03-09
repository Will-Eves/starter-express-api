const ConnectionManager = {
    socket: 0,
    recieveCallbacks: [(function(data){return;})],
    Init(){
        this.socket = io();

        this.socket.emit('join', 0);

        this.socket.on('join', function(data){
            ConnectionManager.cID = data.id;
            display_data(data.data);
        });

        this.socket.on('recieve', function(data){
            // Get A Message
            for(let func of ConnectionManager.recieveCallbacks){
                func(data);
            }
        });
    },
    SendVote(char=' '){
        this.socket.emit('send', {
            vote: char,
            cID: ConnectionManager.cID
        });
    },
    AddRecieveCallback(callback){
        this.recieveCallbacks.push(callback);
    }
};

const init_socket = () => {
    ConnectionManager.Init();

    ConnectionManager.AddRecieveCallback(display_data);
}

const display_data = (data) => {
    let txt = data;

    let new_txt = '';

    for(let i = 1; i < txt.length+1; i++){
        new_txt += txt[i-1];
        if(i % 20 == 0) new_txt += '\n';
    }

    paper_text.innerText = new_txt;
};

window.addEventListener('keydown', (e) => {
    if(e.key.length > 1 || !'abcdefghijklmnopqrstuvwxyz1234567890 '.includes(e.key.toLowerCase())) return;

    console.log('voting ' + e.key.toLowerCase() + '!');

    ConnectionManager.SendVote(e.key.toLowerCase());
});