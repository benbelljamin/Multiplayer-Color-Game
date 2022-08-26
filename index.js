const http = require("http");
const app = require("express")();
app.get("/", (req,res) => res.sendFile(__dirname + "/index.html"))
app.listen(9091, ()=>console.log("listening on http port 9091"))
const { connection } = require("websocket");

const websocketServer = require("websocket").server;
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("listening on 9090"));

//hashmap clients
const clients = {};
const games = {};



const wsServer = new websocketServer({
    "httpServer": httpServer
})
wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);

    connection.on("open", () => console.log("Opened!"))
    connection.on("close", () => console.log("Closed!"))
    connection.on("message", message =>{
    const result = JSON.parse(message.utf8Data)
        
        //User wants to create a new game
        if (result.method === "create") {
            const clientId = result.clientId
            const gameId = S4()
            games[gameId] = {
                "id": gameId,
                "balls": 20,
                "clients": []
            }


            const payLoad = {
                "method": "create",
                "game": games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad))
        }

        //User wants to join a game
        if (result.method === "join") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            if (game.clients.length >= 3)
            {
                //max players
                return;
            }
            const color = {"0": "Red", "1": "Green", "2": "Blue"}[game.clients.length]
            game.clients.push({
                "clientId": clientId,
                "color": color
            })

            if (game.clients.length === 3) updateGameState();
            const payLoad = {
                "method": "join",
                "game": game
            }

            //loop through all clients
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })
        }
        
        //When user plays
        if (result.method === "play") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const ballId = result.ballId;
            const color = result.color

            let state = games[gameId].state;
            if (!state)
                state = {}

            state[ballId] = color;
            games[gameId].state = state

            const game = games[gameId]

            const payLoad = {
                "method": "play",
                "game": game
            }

            //loop through all clients
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            })
        }
    //I have received a message from the client 

    })

    //generate a new clientId
    const clientID = S4();
    clients[clientID] = {
    "connection": connection
    }

    const payLoad = {
        "method": "connect",
        "clientID": clientID
    }

    //Send back the client connect
    connection.send(JSON.stringify(payLoad))
})

function updateGameState(){
    for (const g of Object.keys(games)) {

        const game = games[g]
        const payLoad = {
            "method": "update",
            "game": game
        }


        games[g].clients.forEach(c => {
            clients[c.clientId].connection.send(JSON.stringify(payLoad))
        })
    }

    setTimeout(updateGameState, 500);
}


connection.send

function S4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

const GUID = S4();
