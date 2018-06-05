/*
 * Author: itssme
 * desc: Serves files with express js
 *       and handles events with socket.io
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function config_array_to_string(config_array) {
    config_string = "[[" + config_array[0] + "]";
    for (let i = 1; i < config_array.length; i++) {
        config_string += ", [" + config_array[i] + "]";
    }
    config_string += "]";
    return config_string;
}

var blus_upgrades = [];
// 0 number of bought items, blus per turn, cost, cost for unlock, disk space usage, name
blus_upgrades.push([0, 0.1, 20, 100, 1, '"Tag"']);
blus_upgrades.push([0, 1, 50, 500, 15, '"Comment"']);
blus_upgrades.push([0, 15, 200, 5000, 20, '"Funny Comment"']);
blus_upgrades.push([0, 100, 5000, 30000, 30, '"Top Comment"']);

var diskspace_upgrades = [];
// number of bought items, disk space (in kb), cost, unlock cost, name
diskspace_upgrades.push([0, 10, 50 ,100, '"Magnetband"']);
diskspace_upgrades.push([0, 50, 750, 25000, '"Floppy-Disk"']);
diskspace_upgrades.push([0, 200, 12000, 50000, '"USB-Stick"']);

var minus_upgrades = [];
// 0 number of bought items, minus per turn, cost, cost for unlock, disk space usage, name
minus_upgrades.push([0, 1, 500, 15000, 15, '"Hate Comment"']);
minus_upgrades.push([0, 15, 7500, 42500, 50, '"Downvote Spam"']);

cross_per_turn = -1;
total_disk_space = 10;

blus_upgrades_str = config_array_to_string(blus_upgrades);
diskspace_upgrades_str = config_array_to_string(diskspace_upgrades);
minus_upgrades_str = config_array_to_string(minus_upgrades);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/js/functions.js', function(req, res){
    res.sendFile(__dirname + '/js/functions.js');
});

app.get('/resources/schmuserkadser.png', function(req, res) {
    res.sendFile(__dirname + '/resources/schmuserkadser.png');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

var users = Array();
var user_id_counter = 0;
io.on('connection', function(socket){
    let username = "";
    user_id_counter += 1;
    let user_id = user_id_counter
    console.log('a schmuser connected with id: ' + user_id);
    socket.emit('config_miners', '{"miner": ' + blus_upgrades_str + ', "cross_per_turn": ' + cross_per_turn + '}');
    socket.emit('config_diskspace', '{"disks": ' + diskspace_upgrades_str + ', "total_disk_space": ' + total_disk_space + '}');
    socket.emit('config_minus', '{"minus": ' + minus_upgrades_str + '}');

    socket.on('username', function (msg) {
        username = JSON.parse(msg)["username"];
        users.push({"id": user_id, "username": username, "blus": 0})
        console.log("user id: " + user_id_counter + " set name: " + username);
        socket.emit('user_id', '{"user_id": "' + user_id + '"}');
    });

    socket.on('disconnect', function() {
        console.log("Username: " + username + " ID: " + user_id + " disconnected");
    });

    socket.on('sync', function (msg) {
        user_update = JSON.parse(msg)
        users.forEach(function (user) {
            if (user.id == user_update["id"]) {
                user.blus = user_update["blus"];
            }
        });
        socket.emit('user_update', JSON.stringify(users));
    })
});
