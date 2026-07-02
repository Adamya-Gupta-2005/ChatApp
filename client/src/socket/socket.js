import { io } from 'socket.io-client'

const socket = io(process.env.BACKEND_URL, {
    withCredentials: true,
    autoConnect: false
    //we connect manually after login
})