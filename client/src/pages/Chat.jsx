import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import Sidebar from '../components/Sidebar.jsx'
import InfoPanel from '../components/InfoPanel.jsx'

const Chat = () => {

    const { user } = useAuth()
    const { socket } = useSocket()

    const [rooms, setRooms] = useState([])
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [activeRoom, setActiveRoom] = useState(null)
    const [activeDM, setActiveDM] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsRes, usersRes] = await Promise.all([
                    //promise make both request together othrwise it cause it finishes room and user one by one
                    axios.get(`${backendUrl}/api/rooms`, { withCredentials: true }),
                    axios.get(`${backendUrl}/api/users`, { withCredentials: true })
                ])

                setRooms(roomsRes.data.rooms);
                setUsers(usersRes.data.users);
            } catch (error) {
                console.log(error)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (!socket) return;

        //room messages
        socket.on('room-history', (history) => setMessages(history))
        socket.on('recieve_room_message', (message) => {
            setMessages(prev => [...prev, message])
        })

        //dm messages
        socket.on('recieve_dm', (message) => {
            setMessages(prev => [...prev, message])
        })

        //online Status
        socket.on('user_status', ({ userId, isOnline }) => {
            setOnlineUsers(prev => isOnline ? [...new Set([...prev, userId])] : prev.filter(id => id !== userId))
        })

        //cleanup
        return () => {
            socket.off('room_history')
            socket.off('recieve_room_message')
            socket.off('recieve_dm')
            socket.off('user_status')
        }
    }, [socket])

    //join room via socket
    const handleRoomSelect = (room) => {
        if (activeRoom) socket.emit('leave_room', activeRoom._id);
        setActiveDM(null)
        setActiveRoom(room)
        setMessages([])
        socket.emit('join_room', room._id)
    }

    //join dm via socket
    const handleDMSelect = (selectedUser) => {
        if (activeRoom) socket.emit('leave_room', activeRoom._id);
        setActiveDM(selectedUser)
        setActiveRoom(null)
        setMessages([])
        socket.emit('join_dm', { myId: user._id, otherId: selectedUser._id })
    }


    return (
        <div className='chat-layout'>
            <Sidebar
                rooms={rooms}
                users={users}
                onlineUsers={onlineUsers}
                onRoomSelect={handleRoomSelect}
                onDMSelect={handleDMSelect}
                activeRoom={activeRoom}
                activeDM={activeDM}
            />
            <ChatWindow
                messages={messages}
                activeRoom={activeRoom}
                activeDM={activeDM}
                socket={socket}
                currentUser={user}
            />
            <InfoPanel
                activeRoom={activeRoom}
                activeDM={activeDM}
                onlineUsers={onlineUsers}
                users={users}
            />
        </div>
    )
}

export default Chat
