import { io, connect } from 'socket.io-client'
import { Client } from '../src/client/client'



const c:Client = new Client((msg) => {console.log(msg)}, (msg) => {console.log(msg)})
c.Init().then(() => {
    setTimeout(() => {
        const socket = connect("wss://127.0.0.1:12080/", { transports: ['websocket'], secure: true, rejectUnauthorized: false })
        socket.io.on('close', (reason) => console.log("reason"))
        socket.io.on('error', (err) => console.log(err.message))
    }, 3000)
})


