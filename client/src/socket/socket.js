import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL

const socket = io(backendUrl, {
    withCredentials: true,
    autoConnect: false,
    //we connect manually after login
    transports: ['websocket', 'polling']
})

export default socket