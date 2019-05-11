const http = require('http')
require('dotenv').config()
const path = require('path')
const port = process.env.PORT || 6868
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    //
    socket.on('join', (options, callback) => {

        const {error, user} = addUser({id : socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room) // join chính xác tên đã chọn và chỉ những ng join room này mới thấy message

        // sending event to client
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`)) // broadcast là báo tin đến cho những client đã connect
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to(room).emit, socket.broadcast.to(room).emit chỉ send chính xác messages cho client trong room đó
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUserInRoom(user.room)
        })

        callback()
    })

    //
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    //
    socket.on('sendLocation', (latitude,longitude, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('shareLocation', generateLocationMessage(user.username,`https://www.google.com/maps?q=${latitude},${longitude}`) )
        callback('Was share location')
    })

    //
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUserInRoom(user.room)
            })
        }
    } )
})


server.listen(port, (error) => {
    if(error){
        console.log("Can't Open Server") 
    }
    console.log("Server Open in port " + port)
})