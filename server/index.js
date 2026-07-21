import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'

import { Server } from 'socket.io'

import authRoutes from './routes/authRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import userRoutes from './routes/users.js'

import { initSocket } from './socket/socketHandler.js'

dotenv.config();
connectDB()

const app = express();
const server = http.createServer(app);

//socket io
const io = new Server(server,{
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    },
    transports: ['websocket', 'polling'] 
// this means use websockets initially if browser supports, if sockets fails use polling to maintain connnection, in polling clent repeatedly asks server for any data
})
initSocket(io)

app.use(cors({ origin: process.env.CLIENT_URL , credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/users', userRoutes)

app.get('/', (req,res) => {
    res.send('API running')
})

server.listen(5000, () => console.log('Server runnig on port 5000'));