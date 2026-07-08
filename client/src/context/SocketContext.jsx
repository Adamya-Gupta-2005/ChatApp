import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import socket from '../socket/socket.js'


const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();

    useEffect(() => {

        if(user) {
            socket.connect()
            socket.on('connect', () => {
                socket.emit('user_connected', user._id)
            })
        }

        //clean-up function
        return () => {
            if(user) {
                socket.off('connect')
                socket.disconnect()
            }
        }
    },[user]) //user is dependancy - useer changes - reloads useEffect

    return <SocketContext.Provider value={{socket}}>
        {children}
    </SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)